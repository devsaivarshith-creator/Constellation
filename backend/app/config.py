import os
from pathlib import Path
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent.parent

class Settings(BaseSettings):
    # App
    APP_NAME: str = "Constellation Intelligence Platform"
    APP_VERSION: str = "1.0.0-phase1"
    DEBUG: bool = True
    
    # Neo4j Graph Database
    NEO4J_URI: str = "bolt://localhost:7687"
    NEO4J_USER: str = "neo4j"
    NEO4J_PASSWORD: str = "constellation_secure_2026"
    
    # SQLite
    SQLITE_DB_PATH: str = str(BASE_DIR / "constellation.db")
    
    # Evidence Store
    EVIDENCE_STORE_DIR: str = str(BASE_DIR / "evidence_store")
    
    # Auth & JWT
    JWT_SECRET_KEY: str = "constellation_super_secret_jwt_key_investigator_2026"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    
    # HMAC Audit Ledger
    HMAC_SECRET_KEY: str = "constellation_hmac_tamper_evident_key_2026"
    
    # LLM (NVIDIA NIM)
    NVIDIA_API_KEY: str = ""
    NVIDIA_BASE_URL: str = "https://integrate.api.nvidia.com/v1"
    NVIDIA_MODEL: str = "meta/llama-3.3-70b-instruct"
    
    # Ingestion / NER
    SPACY_MODEL: str = "en_core_web_sm"

    class Config:
        env_file = str(BASE_DIR / ".env")
        extra = "ignore"

settings = Settings()

# Ensure evidence storage dir exists
Path(settings.EVIDENCE_STORE_DIR).mkdir(parents=True, exist_ok=True)
