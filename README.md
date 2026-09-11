# SIFRA AI — Industrial Safety Incident Analysis Platform
**Oil India Limited (OIL)**

SIFRA AI is an end-to-end industrial safety incident analysis platform built for Oil India Limited (OIL). It integrates a trained Random Forest fatality-risk classifier (`sifra_first_model.pkl`), a FAISS vector database over safety manuals (`vector_database/`), and Groq LLM synthesis to perform automated SIF (Serious Injury or Fatality) risk prediction, 7-section structured analysis, auto MCQ quiz generation, and real-time HSE alerting.

---

## Key Features

1. **Worker Safety Portal**:
   - Incident report submission with **Voice-to-Text** support (Web Speech API).
   - Instant SIF Fatality Risk Score (ML model) and structured 7-section AI breakdown (Incident Summary, ML Risk Estimate, UA/UC Analysis, Relevant Hazards, Critical Barriers, Knowledge Base Observations, Limitations).
   - **Auto MCQ Quiz Generator**: Dynamically generates 3-5 multiple-choice questions from the retrieved RAG context using Groq LLM.
   - Training History & Scores tracking.
   - Dispatched Alerts Inbox.

2. **Admin & HSE Officer Dashboard**:
   - **Real-Time Geo-Risk Heatmap**: Interactive map visualizing Oil India Limited operational sites (Duliajan HQ, Digboi Refinery, Moran Production, Jorhat Complex, Guwahati Station) with dynamic risk level pins.
   - **Recharts Analytics**: Trend over time, risk comparison by site (Bar chart), and UA/UC rule violation breakdown (Donut chart).
   - **Worker Safety Register**: Tracks individual incident count, average risk probability, and safety compliance ratings.
   - **Moderation Queue**: Review flagged incidents and update status (`Pending Review` → `Under Investigation` → `Action Required` → `Resolved`).

3. **Notification System**:
   - Automated Twilio SMS and SendGrid email dispatches triggered when an incident is flagged as **HIGH** risk (&gt;50% SIF probability).

---

## Tech Stack

- **Backend**: Python 3.10+, FastAPI, PyYAML, Pydantic, PyJWT, Passlib (Bcrypt)
- **ML & RAG**: Random Forest Classifier (`scikit-learn`), `faiss-cpu`, `sentence-transformers` (`all-MiniLM-L6-v2`), Groq LLM API (`llama-3.3-70b-versatile`)
- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS, Recharts, Lucide Icons
- **Database**: MongoDB (Motor async driver with fallback in-memory datastore)
- **Auth**: JWT-based Authentication with Role-Based Access Control (`Admin`, `HSE Officer`, `Worker`)

---

## Quick Start & Installation Guide

### Prerequisites
- Python 3.10+
- Node.js v18+ & `npm`
- MongoDB (optional, in-memory store acts as local fallback if URI is omitted)

### 1. Environment Setup

Copy `.env.example` to `.env` in the root folder:

```bash
cp .env.example .env
```

Set your `GROQ_API_KEY` in `.env`:
```env
GROQ_API_KEY=your_actual_groq_api_key
MONGODB_URI=mongodb://localhost:27017/sifra_ai
JWT_SECRET=sifra_ai_super_secret_key_2026
```

### 2. Start the Backend API

Install python dependencies and launch FastAPI with Uvicorn:

```bash
# Install python requirements
pip install -r backend/requirements.txt

# Run FastAPI server
python -m uvicorn backend.main:app --reload --port 8000
```

FastAPI interactive Swagger docs will be available at: `http://localhost:8000/docs`

### 3. Start the Next.js Frontend

Navigate to the `frontend` folder, install npm packages, and start dev server:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000` in your web browser.

---

## Default Demo Accounts

| Role | Email | Password |
|---|---|---|
| **Worker** | `worker@oilindia.in` | `worker123` |
| **Admin / HSE Lead** | `admin@oilindia.in` | `admin123` |

---

## Database Schemas (MongoDB)

- **`users`**: `_id`, `name`, `email`, `hashed_password`, `role` (`Admin`, `HSE Officer`, `Worker`), `site_id`, `created_at`
- **`reports`**: `_id`, `worker_id`, `worker_name`, `incident_text`, `establishment_info`, `ml_prediction` (`YES`/`NO`), `ml_probability` (float), `rag_context_sources`, `llm_analysis`, `structured_sections`, `risk_level` (`HIGH`/`MEDIUM`/`LOW`), `timestamp`, `site_id`, `status`, `flagged`
- **`training_history`**: `_id`, `worker_id`, `report_id`, `quiz_title`, `score`, `total_questions`, `percentage`, `completed_at`
- **`alerts`**: `_id`, `report_id`, `worker_id`, `type`, `message`, `sent_at`, `status`

---

## Verification & Testing

To verify the Random Forest ML classifier and FAISS RAG document retrieval pipeline standalone, run:

```bash
python test_backend_standalone.py
```

This verifies `predict_fatality()` and `search_documents()` execute cleanly without errors.