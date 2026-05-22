import logging
from livekit import api
from livekit.api import AccessToken, VideoGrants
from app.core.config import settings

logger = logging.getLogger(__name__)

def create_client_token(room_name: str, participant_identity: str) -> str:
    grant = VideoGrants(room_join=True, room=room_name)
    access_token = AccessToken(
        settings.LIVEKIT_API_KEY,
        settings.LIVEKIT_API_SECRET
    )
    access_token.with_grants(grant)
    access_token.with_identity(participant_identity)
    # The token needs to be signed
    return access_token.to_jwt()

async def delete_livekit_room(room_name: str) -> bool:
    try:
        ws_url = settings.LIVEKIT_URL or ""
        http_url = ws_url.replace("wss://", "https://").replace("ws://", "http://")
        
        async with api.LiveKitAPI(
            url=http_url,
            api_key=settings.LIVEKIT_API_KEY,
            api_secret=settings.LIVEKIT_API_SECRET
        ) as lkapi:
            await lkapi.room.delete_room(
                api.DeleteRoomRequest(room=room_name)
            )
        logger.info("Successfully deleted LiveKit room: %s", room_name)
        return True
    except Exception as exc:
        logger.error("Failed to delete LiveKit room %s: %s", room_name, exc)
        return False
