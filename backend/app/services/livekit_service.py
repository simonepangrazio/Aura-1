from livekit.api import AccessToken, VideoGrants
from app.core.config import settings

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
