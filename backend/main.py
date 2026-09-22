import sys
import os
import gc

# Limit PyTorch / OpenMP thread allocation to prevent high RAM allocation on 512MB instances
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"
os.environ["OPENBLAS_NUM_THREADS"] = "1"
os.environ["VECLIB_MAXIMUM_THREADS"] = "1"
os.environ["NUMEXPR_NUM_THREADS"] = "1"
os.environ["TOKENIZERS_PARALLELISM"] = "false"

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
    print("Starting SIFRA-AI FastAPI Service (Low-Memory Mode)...")
    await init_db()
    # Light ML model loading (XGBoost classifier ~5MB)
    try:
        from sifra_final_ai import load_resources
        # Only load ML model at startup to ensure server opens port instantly
        model_to_load = os.path.join(BASE_DIR, "sifra_model_v2.pkl")
        if os.path.exists(model_to_load):
            import pickle
            import sifra_final_ai
            with open(model_to_load, "rb") as f:
                sifra_final_ai.ml_model = pickle.load(f)
            print("SIFRA XGBoost ML Model loaded successfully!")
    except Exception as e:
        print(f"Notice: ML model loading deferred: {e}")
    
    gc.collect()
    yield
    # Shutdown actions
    print("Shutting down SIFRA-AI FastAPI Service...")

app = FastAPI(
    title="SIFRA AI - Safety Incident Analysis API",
    description="Industrial Safety Incident Analysis Platform for Oil India Limited (OIL)",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for Next.js frontend (explicit origins + regex for netlify/vercel)
cors_origins = [
    "https://sifraai.netlify.app",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

env_origins = os.getenv("CORS_ORIGINS")
if env_origins:
    cors_origins.extend([o.strip() for o in env_origins.split(",") if o.strip()])

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_origin_regex=r"https://.*\.netlify\.app|https://.*\.onrender\.com|http://localhost:\d+",
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
