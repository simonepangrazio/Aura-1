from uuid import UUID

from fastapi import Depends, FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.api import router as api_router
from app.core.config import settings
from app.core.database import get_db
from app.services.session_service import handle_session_websocket


app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router.router, prefix=settings.API_V1_STR)


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.websocket("/ws/session/{session_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    session_id: UUID,
    device_id: UUID | None = None,
    device_token: str | None = None,
    db: Session = Depends(get_db),
):
    await handle_session_websocket(websocket, session_id, db, device_id=device_id, device_token=device_token)
