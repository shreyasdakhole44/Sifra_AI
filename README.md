# SIFRA AI — Industrial Safety Incident Analysis Platform
**Oil India Limited (OIL)**

SIFRA AI is an end-to-end industrial safety incident analysis platform built for Oil India Limited (OIL). It integrates a trained XGBoost fatality-risk classifier (`sifra_xgboost_v2.pkl` / `sifra_first_model.pkl`), a FAISS vector database over safety manuals (`vector_database/`), and Groq LLM synthesis to perform automated SIF (Serious Injury or Fatality) risk prediction, 7-section structured analysis, auto MCQ quiz generation, and real-time HSE alerting.

---

## 🚀 Complete Run Commands Guide

### 1. Setup & Environment Commands

```bash
# Navigate to project root directory
cd SIFRA-AI

# Create .env configuration from template
cp .env.example .env

# Install Backend Python dependencies
pip install -r backend/requirements.txt

# Install Frontend Node.js dependencies
cd frontend
npm install
cd ..
```

---

### 2. Running Application Servers

#### Start FastAPI Backend Server
```bash
# Run backend server with auto-reload (Development)
python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000

# Run backend server (Production mode)
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000
```
- **API Base URL**: `http://localhost:8000`
- **Interactive Swagger Docs**: `http://localhost:8000/docs`
- **ReDoc API Spec**: `http://localhost:8000/redoc`

#### Start Next.js Frontend Server
```bash
# Navigate to frontend directory
cd frontend

# Run development server (http://localhost:3000)
npm run dev

# Production build & start
npm run build
npm run start

# TypeScript type check
npx tsc --noEmit

# Lint frontend codebase
npm run lint
```

---

### 3. Data Processing, Vector DB & ML Model Commands

```bash
# 1. Build FAISS Vector Database from safety manuals
python create_vector_db.py

# 2. Build V2 FAISS Vector Database with enhanced chunking & embeddings
python create_vector_db_v2.py

# 3. Train / Retrain XGBoost SIF Fatality Classifier Model
python model_train.py

# 4. Fetch and parse incident dataset
python data_fetcher.py
```

---

### 4. Standalone Pipeline & RAG Testing Commands

```bash
# Test complete SIFRA AI Hybrid Pipeline (ML + RAG + Groq LLM)
python sifra_final_ai.py

# Test backend standalone pipeline execution
python test_backend_standalone.py

# Test Groq LLM API connectivity
python test_groq.py

# Test RAG Vector Database Querying
python rag_query.py

# Test Hybrid RAG Engine (Vector Search + Keyword Filter)
python rag_hybrid.py

# Test ML model & RAG integration
python test_model_rag.py
```

---

### 5. Backend API & Feature Verification Scripts

```bash
# Test POST report API endpoint
python backend/test_post_report.py
python backend/test_api_post.py

# Test ReportLab PDF generation and Role-Based Access Control (RBAC)
python backend/test_pdf_and_rbac.py

# Test full redesign feature integration and endpoints
python backend/test_redesign_features.py
```

---

### 6. Quick HTTP Health Check Commands

```bash
# Check Backend API Health (Returns 200 OK)
python -c "import urllib.request; print(urllib.request.urlopen('http://127.0.0.1:8000/docs').getcode())"

# Check Frontend Dev Server Health (Returns 200 OK)
python -c "import urllib.request; print(urllib.request.urlopen('http://127.0.0.1:3000/').getcode())"
```

---

## 🔑 Default Demo Accounts

| Role | Email | Password | Portal View |
|---|---|---|---|
| **Worker** | `worker@oilindia.in` | `worker123` | Worker Safety Portal |
| **Admin / HSE Lead** | `admin@oilindia.in` | `admin123` | HSC Officer Control Room |

---

## 🛠️ Architecture & Tech Stack

- **Backend**: Python 3.10+, FastAPI, Uvicorn, PyYAML, Pydantic, PyJWT, Passlib (Bcrypt), ReportLab (PDF Generation)
- **ML & RAG**: XGBoost Classifier (`sifra_xgboost_v2.pkl`), Random Forest Classifier (`sifra_first_model.pkl`), `faiss-cpu`, `sentence-transformers` (`all-MiniLM-L6-v2`), Groq LLM API (`llama-3.3-70b-versatile`)
- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons, Leaflet Maps, Recharts
- **Database**: MongoDB (Motor async driver with fallback in-memory datastore)