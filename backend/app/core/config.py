from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """App configuration. Override any field via environment variables (or a .env file)."""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Database
    database_url: str = "sqlite:///./laundry.db"

    # Auth / JWT
    jwt_secret: str = "dev-secret-change-me"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24  # 1 day

    # Vision ingest contract: the CV client (phone) must send this key.
    vision_api_key: str = "dev-vision-key"

    # Queue: minutes a user has to claim a machine after being notified.
    claim_hold_minutes: int = 5

    # CORS: allowed frontend origins.
    cors_origins: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]


settings = Settings()
