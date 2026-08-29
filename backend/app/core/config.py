from functools import lru_cache
from typing import List

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    APP_NAME: str = "Criminal Network Intelligence Platform"
    API_VERSION: str = "0.1.0"
    API_PREFIX: str = "/api/v1"
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"

    CORS_ORIGINS: List[str] = Field(default_factory=lambda: ["http://localhost:5173", "http://localhost:8080"])

    DATABASE_URL: str = "postgresql+psycopg://intel:change-me@postgres:5432/intel"
    NEO4J_URI: str = "bolt://neo4j:7687"
    NEO4J_USER: str = "neo4j"
    NEO4J_PASSWORD: str = "change-me"
    REDIS_URL: str = "redis://redis:6379/0"

    JWT_SECRET_KEY: str = "dev-only-replace-me"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_MINUTES: int = 30

    NLP_MODEL_NAME: str = "heuristic-demo-ner"
    EMBEDDING_MODEL_NAME: str = "sentence-transformers/all-MiniLM-L6-v2"
    DEMO_DATA_PATH: str = "data/demo/synthetic_case.json"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
