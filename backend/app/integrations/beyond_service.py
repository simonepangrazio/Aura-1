import logging

import httpx

from app.core.config import settings


logger = logging.getLogger(__name__)


def create_speech_to_video_session(
    api_key: str | None,
    *,
    avatar_id: str | None,
    livekit_url: str,
    livekit_token: str,
) -> dict:
    if not api_key or not avatar_id:
        logger.info("Beyond Presence session skipped; API key or avatar_id missing.")
        return {
            "started": False,
            "session": None,
            "error": {
                "code": "missing_config",
                "detail": "Beyond Presence API key or avatar ID missing.",
            },
        }

    try:
        response = httpx.post(
            f"{settings.BEYOND_API_BASE_URL}/sessions",
            headers={"x-api-key": api_key, "Content-Type": "application/json"},
            json={
                "avatar_id": avatar_id,
                "url": livekit_url,
                "token": livekit_token,
                "transport": "livekit",
            },
            timeout=12.0,
        )
        response.raise_for_status()
        return {"started": True, "session": response.json(), "error": None}
    except httpx.HTTPStatusError as exc:
        detail = exc.response.text[:500] if exc.response is not None else str(exc)
        status_code = exc.response.status_code if exc.response is not None else None
        logger.error("Beyond Presence returned an error: %s", detail)
        return {
            "started": False,
            "session": None,
            "error": {
                "code": "http_error",
                "status_code": status_code,
                "detail": detail,
            },
        }
    except Exception as exc:
        logger.error("Error creating Beyond Presence session: %s", exc)
        return {
            "started": False,
            "session": None,
            "error": {
                "code": "request_error",
                "detail": str(exc),
            },
        }


async def send_avatar_text(api_key: str | None, text: str, room_name: str) -> bool:
    if not api_key:
        logger.info("Beyond Presence key missing; skipping avatar call for room %s", room_name)
        return False

    logger.info("Beyond Presence avatar would speak in room %s: %s", room_name, text)
    return True
