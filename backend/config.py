import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    
    
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://user:password@localhost:5432/inventory_db"
    )
    
    API_TITLE: str = "Inventory & Order Management API"
    API_VERSION: str = "1.0.0"
    API_DESCRIPTION: str = "FastAPI backend for inventory and order management system"
    
    CORS_ORIGINS: list = [
        "http://localhost:3000",
        "http://localhost:8000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8000",
    ]
    
    DEFAULT_PAGE_SIZE: int = 50
    MAX_PAGE_SIZE: int = 1000
    
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-key-change-in-production-2024")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
    
    class Config:
        case_sensitive = True

settings = Settings()
