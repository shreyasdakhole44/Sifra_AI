import sys
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Ensure parent directory (SIFRA-AI root) is in Python path for sifra_final_ai import
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from backend.database import init_db
from backend.routers import auth_router, reports_router, quiz_router, admin_router, worker_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup actions
    print("Starting SIFRA-AI FastAPI Service...")
    await init_db()
    try:
        from sifra_final_ai import load_resources
        load_resources()
        print("ML + RAG pipeline pre-loaded successfully!")
    except Exception as e:
        print(f"Warning: ML/RAG pre-loading deferred or encountered error: {e}")
    yield
    # Shutdown actions
    print("Shutting down SIFRA-AI FastAPI Service...")

app = FastAPI(
    title="SIFRA AI - Safety Incident Analysis API",
    description="Industrial Safety Incident Analysis Platform for Oil India Limited (OIL)",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router.router, prefix="/api")
app.include_router(reports_router.router, prefix="/api")
app.include_router(quiz_router.router, prefix="/api")
app.include_router(admin_router.router, prefix="/api")
app.include_router(worker_router.router, prefix="/api")

@app.get("/")
def read_root():
    return {
        "status": "online",
        "app": "SIFRA AI Safety Platform",
        "organization": "Oil India Limited (OIL)",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
