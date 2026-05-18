from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Platform Realtime MVP"
    API_V1_STR: str = "/api/v1"
    
    # DB
    POSTGRES_USER: str = "admin"
    POSTGRES_PASSWORD: str = "admin"
    POSTGRES_DB: str = "ai_platform"
    DATABASE_URL: Optional[str] = None
    
    # Auth
    JWT_SECRET: str = "your-secret-key"
    JWT_ALGORITHM: str = "HS256"
    # LiveKit
    LIVEKIT_URL: str = "wss://your-livekit-url"
    LIVEKIT_API_KEY: str = "devkey"
    LIVEKIT_API_SECRET: str = "dev_livekit_secret_change_me_32_chars"
    BEYOND_API_BASE_URL: str = "https://api.bey.dev/v1"
    OPENAI_API_BASE_URL: str = "https://api.openai.com/v1"
    GEMINI_API_BASE_URL: str = "https://generativelanguage.googleapis.com/v1beta"
    
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)

    def get_database_url(self) -> str:
        if self.DATABASE_URL:
            return self.DATABASE_URL
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@localhost:5432/{self.POSTGRES_DB}"

settings = Settings()
