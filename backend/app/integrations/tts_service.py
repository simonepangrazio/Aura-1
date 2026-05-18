import asyncio
import base64
import logging

import httpx
from livekit import rtc

from app.core.config import settings
from app.models.domain import Agent
from app.services.livekit_service import create_client_token


logger = logging.getLogger(__name__)

DEFAULT_OPENAI_TTS_MODEL = "gpt-4o-mini-tts"
DEFAULT_OPENAI_VOICE = "alloy"
DEFAULT_GEMINI_TTS_MODEL = "gemini-2.5-flash-preview-tts"
DEFAULT_GEMINI_VOICE = "Kore"
PCM_SAMPLE_RATE = 24000
PCM_CHANNELS = 1


async def synthesize_tts_pcm(agent: Agent, api_key: str | None, text: str) -> bytes | None:
    provider = (agent.voice_provider or "").strip().lower()
    if not api_key:
        logger.info("TTS key missing for provider %s; skipping speech synthesis.", provider or "-")
        return None

    if provider == "openai":
        return await _openai_tts(api_key, agent, text)
    if provider == "gemini":
        return await _gemini_tts(api_key, agent, text)

    logger.info("TTS provider %s does not generate backend audio in this MVP.", provider or "-")
    return None


async def _openai_tts(api_key: str, agent: Agent, text: str) -> bytes | None:
    payload = {
        "model": agent.tts_model or DEFAULT_OPENAI_TTS_MODEL,
        "input": text,
        "voice": agent.voice_id or DEFAULT_OPENAI_VOICE,
        "response_format": "pcm",
    }
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{settings.OPENAI_API_BASE_URL}/audio/speech",
                headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                json=payload,
            )
            response.raise_for_status()
            return response.content
    except Exception as exc:
        logger.error("OpenAI TTS failed: %s", exc)
        return None


async def _gemini_tts(api_key: str, agent: Agent, text: str) -> bytes | None:
    model = agent.tts_model or DEFAULT_GEMINI_TTS_MODEL
    voice_name = agent.voice_id or DEFAULT_GEMINI_VOICE
    payload = {
        "contents": [{"parts": [{"text": text}]}],
        "generationConfig": {
            "responseModalities": ["AUDIO"],
            "speechConfig": {
                "voiceConfig": {
                    "prebuiltVoiceConfig": {
                        "voiceName": voice_name,
                    }
                }
            },
        },
    }
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{settings.GEMINI_API_BASE_URL}/models/{model}:generateContent",
                headers={"x-goog-api-key": api_key, "Content-Type": "application/json"},
                json=payload,
            )
            response.raise_for_status()
            data = response.json()
    except Exception as exc:
        logger.error("Gemini TTS failed: %s", exc)
        return None

    inline_data = (
        data.get("candidates", [{}])[0]
        .get("content", {})
        .get("parts", [{}])[0]
        .get("inlineData")
    )
    if not inline_data:
        inline_data = (
            data.get("candidates", [{}])[0]
            .get("content", {})
            .get("parts", [{}])[0]
            .get("inline_data")
        )
    audio_b64 = (inline_data or {}).get("data")
    if not audio_b64:
        logger.error("Gemini TTS response did not include inline audio data.")
        return None
    return base64.b64decode(audio_b64)


async def publish_pcm_to_livekit(
    *,
    room_name: str,
    pcm: bytes,
    participant_identity: str,
    sample_rate: int = PCM_SAMPLE_RATE,
    channels: int = PCM_CHANNELS,
) -> bool:
    if not pcm:
        return False

    room = rtc.Room()
    source = rtc.AudioSource(sample_rate, channels)
    track = rtc.LocalAudioTrack.create_audio_track("assistant-tts", source)
    token = create_client_token(room_name, participant_identity)

    try:
        await room.connect(settings.LIVEKIT_URL, token)
        await room.local_participant.publish_track(track)
        samples_per_frame = sample_rate // 50
        frame_bytes = samples_per_frame * channels * 2

        for offset in range(0, len(pcm), frame_bytes):
            chunk = pcm[offset : offset + frame_bytes]
            if len(chunk) < frame_bytes:
                chunk = chunk + b"\0" * (frame_bytes - len(chunk))
            frame = rtc.AudioFrame(chunk, sample_rate, channels, samples_per_frame)
            await source.capture_frame(frame)
            await asyncio.sleep(samples_per_frame / sample_rate)

        await source.wait_for_playout()
        return True
    except Exception as exc:
        logger.error("LiveKit TTS publish failed: %s", exc)
        return False
    finally:
        await source.aclose()
        await room.disconnect()
