import logging

import httpx


logger = logging.getLogger(__name__)


async def call_n8n_webhook(webhook_url: str | None, user_text: str, session_id: str) -> str:
    if not webhook_url:
        return "Webhook N8N non configurato per questo agente demo."

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                webhook_url,
                json={"text": user_text, "session_id": session_id},
                timeout=30.0,
            )
            response.raise_for_status()
    except Exception as exc:
        logger.error("Error calling N8N webhook: %s", exc)
        return "Scusa, in questo momento il workflow di prenotazione non e raggiungibile."

    try:
        data = response.json()
        if isinstance(data, dict):
            return str(data.get("response") or data.get("text") or data)
        return str(data)
    except Exception as exc:
        logger.warning("N8N response was not JSON, falling back to raw text: %s", exc)
        raw_text = response.text.strip()
        if raw_text.startswith("<html") or raw_text.startswith("<!DOCTYPE"):
            return "Scusa, il server ha risposto con una pagina non valida."
        return raw_text or "Scusa, non ho ricevuto alcuna risposta."
