import os
from dotenv import load_dotenv

# Load .env file from root directory
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(BASE_DIR, ".env"))

class Settings:
    MONGODB_URI: str = os.getenv("MONGODB_URI", "")
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "sifra_ai_secret_jwt_key_oil_india_2026")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    
    TWILIO_ACCOUNT_SID: str = os.getenv("TWILIO_ACCOUNT_SID", "")
    TWILIO_AUTH_TOKEN: str = os.getenv("TWILIO_AUTH_TOKEN", "")
    TWILIO_PHONE_NUMBER: str = os.getenv("TWILIO_PHONE_NUMBER", "+15005550006")
    
    SENDGRID_API_KEY: str = os.getenv("SENDGRID_API_KEY", "")
    SENDER_EMAIL: str = os.getenv("SENDER_EMAIL", "safety@oilindia.in")

settings = Settings()
