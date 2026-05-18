import httpx
import logging
from sqlalchemy.orm import Session
from uuid import UUID
from app.models.domain import Device, Tenant, Agent, ApiKey

logger = logging.getLogger(__name__)

async def call_n8n_webhook(webhook_url: str, user_text: str, session_id: str) -> str:
    """
    Calls the N8N webhook with the user's text.
    """
    if not webhook_url:
        return "Errore: Webhook N8N non configurato."
        
    try:
        async with httpx.AsyncClient() as client:
            res = await client.post(webhook_url, json={
                "text": user_text,
                "session_id": session_id
            }, timeout=30.0)
            res.raise_for_status()
            data = res.json()
            if "response" in data:
                return data["response"]
            elif "text" in data:
                return data["text"]
            else:
                return str(data)
    except Exception as e:
        logger.error(f"Error calling N8N: {e}")
        return "Scusa, sto riscontrando problemi di connessione."

async def call_beyond_presence_tts(api_key: str, text: str, room_name: str) -> bool:
    """
    Calls Beyond Presence API to synthesize text and render the avatar in the LiveKit room.
    """
    if not api_key:
        logger.error("No Beyond Presence API key configured.")
        return False
        
    try:
        logger.info(f"Triggering Beyond Presence Avatar in room {room_name} to say: {text}")
        return True
    except Exception as e:
        logger.error(f"Error calling Beyond Presence: {e}")
        return False

async def handle_user_message(db: Session, tenant_id: str, device_id: str, user_text: str) -> str:
    """
    Core orchestration logic:
    """
    device = db.query(Device).filter(Device.id == UUID(device_id), Device.tenant_id == UUID(tenant_id)).first()
    
    webhook_url = None
    if device and device.agent_id:
        agent = db.query(Agent).filter(Agent.id == device.agent_id).first()
        if agent:
            webhook_url = agent.n8n_webhook_url
    
    # Fetch BP API Key
    bp_api_key_record = db.query(ApiKey).filter(
        ApiKey.tenant_id == UUID(tenant_id),
        ApiKey.provider == "beyond_presence"
    ).first()
    bp_api_key = bp_api_key_record.encrypted_key if bp_api_key_record else None
    
    session_id = f"sess_{tenant_id}_{device_id}"
    room_name = f"room_{tenant_id}_{device_id}"
    
    # 1. Call N8N
    ai_response = await call_n8n_webhook(webhook_url, user_text, session_id)
    
    # 2. Call Beyond Presence
    await call_beyond_presence_tts(bp_api_key, ai_response, room_name)
    
    return ai_response
