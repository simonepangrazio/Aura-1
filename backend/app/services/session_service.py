from datetime import datetime
from uuid import UUID, uuid4

from fastapi import HTTPException, WebSocket
from sqlalchemy.orm import Session

from app.auth.service import is_super_admin
from app.core.config import settings
from app.integrations.beyond_service import create_speech_to_video_session
from app.integrations.n8n_service import call_n8n_webhook
from app.integrations.tts_service import publish_pcm_to_livekit, synthesize_tts_pcm
from app.models.domain import Agent, ApiKey, Device, Message, Session as DbSession, SessionEvent, User, Widget
from app.schemas import domain_schemas as schemas
from app.schemas.domain_schemas import SessionStartRequest
from app.services.livekit_service import create_client_token


TTS_KEY_PROVIDERS = {"openai", "gemini"}
LIVEKIT_PLACEHOLDERS = {
    "url": {"", "wss://your-livekit-url"},
    "api_key": {"", "devkey"},
    "api_secret": {"", "dev_livekit_secret_change_me_32_chars"},
}
RUNTIME_LABELS = {
    "agent": "Agent",
    "agent_active": "Agent attivo",
    "beyond_avatar_configured": "Beyond Avatar ID",
    "beyond_api_key_configured": "API key Beyond",
    "livekit_configured": "LiveKit",
    "n8n_configured": "Webhook N8N",
    "tts_api_key_configured": "API key TTS",
}


def create_event(db: Session, session_id: UUID, event_type: str, payload: dict | None = None) -> SessionEvent:
    event = SessionEvent(session_id=session_id, event_type=event_type, payload=payload or {})
    db.add(event)
    return event


def create_message(
    db: Session,
    session_id: UUID,
    role: str,
    message: str,
    tokens_used: int | None = None,
) -> Message:
    db_message = Message(
        session_id=session_id,
        role=role,
        message=message,
        tokens_used=tokens_used,
    )
    db.add(db_message)
    return db_message


def _api_key_value(db: Session, tenant_id: UUID, provider: str | None) -> str | None:
    if not provider:
        return None
    api_key = (
        db.query(ApiKey)
        .filter(ApiKey.tenant_id == tenant_id, ApiKey.provider == provider.strip().lower())
        .first()
    )
    return api_key.encrypted_key if api_key else None


def _is_real_api_key(value: str | None) -> bool:
    cleaned = (value or "").strip()
    return bool(cleaned) and not cleaned.lower().startswith("demo_")


def _is_livekit_configured() -> bool:
    livekit_url = (settings.LIVEKIT_URL or "").strip()
    livekit_api_key = (settings.LIVEKIT_API_KEY or "").strip()
    livekit_api_secret = (settings.LIVEKIT_API_SECRET or "").strip()
    return (
        livekit_url not in LIVEKIT_PLACEHOLDERS["url"]
        and livekit_api_key not in LIVEKIT_PLACEHOLDERS["api_key"]
        and livekit_api_secret not in LIVEKIT_PLACEHOLDERS["api_secret"]
    )


def runtime_error_message(runtime_status: dict) -> str:
    missing = runtime_status.get("blocking_missing") or runtime_status.get("missing") or []
    if missing:
        labels = [RUNTIME_LABELS.get(item, str(item)) for item in missing]
        return f"Configurazione runtime incompleta: {', '.join(labels)}."
    beyond_error = runtime_status.get("beyond_session_error")
    if isinstance(beyond_error, dict) and beyond_error.get("detail"):
        return f"Avatar Beyond non avviato: {beyond_error['detail']}"
    return "Configurazione runtime incompleta."


def runtime_status_for_agent(db: Session, tenant_id: UUID, agent: Agent | None) -> dict:
    if not agent:
        return {
            "ready": False,
            "missing": ["agent"],
            "blocking_missing": ["agent"],
            "warnings": [],
            "can_start_kiosk": False,
        }

    tts_provider = (agent.voice_provider or "").strip().lower()
    tts_requires_key = tts_provider in TTS_KEY_PROVIDERS
    tts_key_configured = _is_real_api_key(_api_key_value(db, tenant_id, tts_provider)) if tts_requires_key else True
    status = {
        "ready": True,
        "missing": [],
        "blocking_missing": [],
        "warnings": [],
        "agent_active": bool(agent.is_active),
        "beyond_avatar_configured": bool(agent.beyond_avatar_id),
        "beyond_api_key_configured": _is_real_api_key(_api_key_value(db, tenant_id, "beyond_presence")),
        "livekit_configured": _is_livekit_configured(),
        "n8n_configured": bool(agent.n8n_webhook_url),
        "stt_provider": agent.stt_provider or "browser",
        "stt_model": agent.stt_model,
        "tts_provider": tts_provider or None,
        "tts_model": agent.tts_model,
        "tts_api_key_configured": tts_key_configured,
        "can_start_kiosk": True,
    }
    for key in (
        "agent_active",
        "beyond_avatar_configured",
        "beyond_api_key_configured",
        "livekit_configured",
        "n8n_configured",
    ):
        if not status[key]:
            status["missing"].append(key)
            status["blocking_missing"].append(key)
    if tts_requires_key and not tts_key_configured:
        status["missing"].append("tts_api_key_configured")
        status["blocking_missing"].append("tts_api_key_configured")
    status["ready"] = len(status["missing"]) == 0
    status["can_start_kiosk"] = len(status["blocking_missing"]) == 0
    return status


def list_sessions(db: Session, current_user: User) -> list[DbSession]:
    query = db.query(DbSession)
    if not is_super_admin(current_user):
        query = query.filter(DbSession.tenant_id == current_user.tenant_id)
    return query.order_by(DbSession.created_at.desc()).all()


def get_session_for_user(db: Session, session_id: UUID, current_user: User) -> DbSession:
    query = db.query(DbSession).filter(DbSession.id == session_id)
    if not is_super_admin(current_user):
        query = query.filter(DbSession.tenant_id == current_user.tenant_id)
    db_session = query.first()
    if not db_session:
        raise HTTPException(status_code=404, detail="Session not found")
    return db_session


def get_session_detail_for_user(db: Session, session_id: UUID, current_user: User) -> schemas.SessionDetail:
    db_session = get_session_for_user(db, session_id, current_user)
    duration_seconds = None
    if db_session.started_at:
        end_time = db_session.ended_at or datetime.utcnow()
        duration_seconds = max(0, int((end_time - db_session.started_at).total_seconds()))

    base = schemas.SessionRead.model_validate(db_session).model_dump()
    base.update(
        {
            "duration_seconds": duration_seconds,
            "tenant": {"id": str(db_session.tenant.id), "name": db_session.tenant.name} if db_session.tenant else None,
            "agent": {"id": str(db_session.agent.id), "name": db_session.agent.name} if db_session.agent else None,
            "device": {"id": str(db_session.device.id), "name": db_session.device.name} if db_session.device else None,
            "widget": {"id": str(db_session.widget.id), "name": db_session.widget.name} if db_session.widget else None,
            "messages": [
                schemas.MessageRead.model_validate(message).model_dump()
                for message in sorted(db_session.messages, key=lambda item: item.created_at)
            ],
            "events": [
                schemas.SessionEventRead.model_validate(event).model_dump()
                for event in sorted(db_session.session_events, key=lambda item: item.created_at)
            ],
        }
    )
    return schemas.SessionDetail(**base)


def _resolve_start_context(
    db: Session,
    request: SessionStartRequest,
    current_user: User | None,
) -> tuple[UUID, Agent, Device | None, Widget | None]:
    if request.device_id:
        if not current_user and not request.device_token:
            raise HTTPException(status_code=401, detail="device_token is required")
        device_query = db.query(Device).filter(Device.id == request.device_id)
        if request.device_token:
            device_query = device_query.filter(Device.device_token == request.device_token)
        if current_user and not is_super_admin(current_user):
            device_query = device_query.filter(Device.tenant_id == current_user.tenant_id)
        device = device_query.first()
        if not device:
            raise HTTPException(status_code=404, detail="Device not found")
        agent = db.query(Agent).filter(Agent.id == device.agent_id, Agent.tenant_id == device.tenant_id).first()
        if not agent:
            raise HTTPException(status_code=404, detail="Agent not found for device")
        return device.tenant_id, agent, device, None

    if request.widget_id:
        if not current_user and not request.public_token:
            raise HTTPException(status_code=401, detail="public_token is required")
        widget_query = db.query(Widget).filter(Widget.id == request.widget_id, Widget.is_active.is_(True))
        if request.public_token:
            widget_query = widget_query.filter(Widget.public_token == request.public_token)
        if current_user and not is_super_admin(current_user):
            widget_query = widget_query.filter(Widget.tenant_id == current_user.tenant_id)
        widget = widget_query.first()
        if not widget:
            raise HTTPException(status_code=404, detail="Widget not found")
        agent = db.query(Agent).filter(Agent.id == widget.agent_id, Agent.tenant_id == widget.tenant_id).first()
        if not agent:
            raise HTTPException(status_code=404, detail="Agent not found for widget")
        return widget.tenant_id, agent, None, widget

    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    if not request.agent_id:
        raise HTTPException(status_code=422, detail="agent_id is required")

    agent_query = db.query(Agent).filter(Agent.id == request.agent_id)
    if not is_super_admin(current_user):
        agent_query = agent_query.filter(Agent.tenant_id == current_user.tenant_id)
    agent = agent_query.first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent.tenant_id, agent, None, None


def start_session(
    db: Session,
    request: SessionStartRequest,
    current_user: User | None,
) -> tuple[DbSession, str, str, str, dict]:
    tenant_id, agent, device, widget = _resolve_start_context(db, request, current_user)
    runtime_status = runtime_status_for_agent(db, tenant_id, agent)
    if device and request.session_type == "kiosk" and not runtime_status.get("can_start_kiosk"):
        raise HTTPException(
            status_code=422,
            detail={
                "message": runtime_error_message(runtime_status),
                "runtime_status": runtime_status,
            },
        )

    session_id = uuid4()
    room_name = f"session_{session_id}"

    db_session = DbSession(
        id=session_id,
        tenant_id=tenant_id,
        agent_id=agent.id,
        device_id=device.id if device else None,
        widget_id=widget.id if widget else None,
        session_type=request.session_type,
        status="starting",
        started_at=datetime.utcnow(),
        user_connected_at=datetime.utcnow(),
        livekit_room_name=room_name,
    )
    db.add(db_session)
    if device:
        device.status = "busy"
        device.last_seen = datetime.utcnow()
    create_event(
        db,
        session_id,
        "session_started",
        {
            "session_type": request.session_type,
            "agent_id": str(agent.id),
            "device_id": str(device.id) if device else None,
            "widget_id": str(widget.id) if widget else None,
        },
    )
    db.commit()
    db.refresh(db_session)

    token = "dev_token"
    avatar_token = None
    try:
        token = create_client_token(room_name, f"user_{session_id}")
        avatar_token = create_client_token(room_name, f"beyond_avatar_{session_id}")
    except Exception as exc:
        runtime_status["livekit_token_error"] = str(exc)
        runtime_status["beyond_session_started"] = False
        runtime_status["beyond_session_error"] = {
            "code": "livekit_token_error",
            "detail": "LiveKit token generation failed.",
        }
        create_event(db, session_id, "livekit_token_error", {"message": str(exc)})
        db.commit()

    beyond_result = {
        "started": False,
        "session": None,
        "error": runtime_status.get("beyond_session_error"),
    }
    if avatar_token:
        beyond_result = create_speech_to_video_session(
            _api_key_value(db, tenant_id, "beyond_presence"),
            avatar_id=agent.beyond_avatar_id,
            livekit_url=settings.LIVEKIT_URL,
            livekit_token=avatar_token,
        )
    beyond_session = beyond_result.get("session")
    if beyond_result.get("started") and beyond_session:
        runtime_status["beyond_session_started"] = True
        runtime_status["beyond_session_id"] = beyond_session.get("id")
        create_event(
            db,
            session_id,
            "beyond_session_started",
            {
                "beyond_session_id": beyond_session.get("id"),
                "avatar_id": beyond_session.get("avatar_id") or agent.beyond_avatar_id,
            },
        )
    else:
        runtime_status["beyond_session_started"] = False
        runtime_status["beyond_session_id"] = None
        runtime_status["beyond_session_error"] = beyond_result.get("error") or {
            "code": "unknown",
            "detail": "Beyond Presence did not start the avatar session.",
        }
        create_event(
            db,
            session_id,
            "beyond_session_failed",
            {
                "avatar_id": agent.beyond_avatar_id,
                "has_beyond_key": _is_real_api_key(_api_key_value(db, tenant_id, "beyond_presence")),
                "error": runtime_status["beyond_session_error"],
            },
        )
        if device and request.session_type == "kiosk":
            db_session.status = "error"
            db_session.ended_at = datetime.utcnow()
            device.status = "online"
            device.last_seen = datetime.utcnow()
    db.commit()
    db.refresh(db_session)

    return db_session, token, settings.LIVEKIT_URL, room_name, runtime_status


def end_session(
    db: Session,
    session_id: UUID,
    current_user: User | None = None,
    device_id: UUID | None = None,
    device_token: str | None = None,
) -> DbSession:
    query = db.query(DbSession).filter(DbSession.id == session_id)
    if current_user and not is_super_admin(current_user):
        query = query.filter(DbSession.tenant_id == current_user.tenant_id)
    elif current_user and is_super_admin(current_user):
        pass
    elif device_id and device_token:
        device = (
            db.query(Device)
            .filter(Device.id == device_id, Device.device_token == device_token)
            .first()
        )
        if not device:
            raise HTTPException(status_code=401, detail="Invalid device credentials")
        query = query.filter(DbSession.device_id == device.id, DbSession.tenant_id == device.tenant_id)
    else:
        raise HTTPException(status_code=401, detail="Authentication required")

    db_session = query.first()
    if not db_session:
        raise HTTPException(status_code=404, detail="Session not found")

    db_session.status = "ended"
    db_session.ended_at = datetime.utcnow()
    if db_session.device:
        db_session.device.status = "online"
        db_session.device.last_seen = datetime.utcnow()
    create_event(db, db_session.id, "session_ended", {"ended_at": db_session.ended_at.isoformat()})
    db.commit()
    db.refresh(db_session)
    return db_session


async def process_user_message(db: Session, db_session: DbSession, user_text: str) -> str:
    create_message(db, db_session.id, "user", user_text)
    create_event(db, db_session.id, "user_spoke", {"text": user_text})

    agent = db.query(Agent).filter(Agent.id == db_session.agent_id).first()
    ai_response = await call_n8n_webhook(
        agent.n8n_webhook_url if agent else None,
        user_text,
        str(db_session.id),
    )

    db_session.status = "active"
    create_message(db, db_session.id, "assistant", ai_response)
    create_event(db, db_session.id, "assistant_responded", {"text": ai_response})
    db.commit()

    if agent:
        provider = (agent.voice_provider or "").strip().lower()
        pcm = await synthesize_tts_pcm(agent, _api_key_value(db, db_session.tenant_id, provider), ai_response)
        if pcm:
            published = await publish_pcm_to_livekit(
                room_name=db_session.livekit_room_name or f"session_{db_session.id}",
                pcm=pcm,
                participant_identity=f"assistant_tts_{db_session.id}",
            )
            create_event(
                db,
                db_session.id,
                "tts_published",
                {
                    "provider": provider,
                    "model": agent.tts_model,
                    "voice_id": agent.voice_id,
                    "published": published,
                },
            )
        else:
            create_event(
                db,
                db_session.id,
                "tts_skipped",
                {
                    "provider": provider,
                    "model": agent.tts_model,
                    "reason": "missing_api_key_or_unsupported_provider",
                },
            )
        db.commit()
    return ai_response


async def handle_session_websocket(
    websocket: WebSocket,
    session_id: UUID,
    db: Session,
    device_id: UUID | None = None,
    device_token: str | None = None,
) -> None:
    db_session = db.query(DbSession).filter(DbSession.id == session_id).first()
    if not db_session:
        await websocket.close(code=4404)
        return
    if db_session.device_id:
        if not device_id or not device_token or device_id != db_session.device_id:
            await websocket.close(code=4401)
            return
        device = (
            db.query(Device)
            .filter(Device.id == device_id, Device.device_token == device_token)
            .first()
        )
        if not device:
            await websocket.close(code=4401)
            return

    await websocket.accept()
    try:
        while True:
            user_text = await websocket.receive_text()
            ai_response = await process_user_message(db, db_session, user_text)
            await websocket.send_text(ai_response)
    except Exception:
        create_event(db, db_session.id, "error", {"message": "websocket disconnected"})
        db.commit()
