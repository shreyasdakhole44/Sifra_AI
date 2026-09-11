from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from typing import Dict, Any, List
from backend.auth import get_current_user
from backend.database import get_report_by_id, create_training_record, get_user_training_history
from backend.pipeline import generate_quiz_from_rag

router = APIRouter(prefix="/quiz", tags=["Safety Quiz & Training"])

class QuizSubmitRequest(BaseModel):
    report_id: str
    quiz_title: str = "Safety MCQ Assessment"
    score: int
    total_questions: int

@router.post("/generate/{report_id}", response_model=Dict[str, Any])
async def generate_quiz_for_report(
    report_id: str,
    current_user: dict = Depends(get_current_user)
):
    report = await get_report_by_id(report_id)
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found."
        )
    
    incident_text = report.get("incident_text", "")
    rag_context = report.get("rag_context_sources", [])
    formatted_context = ""
    if isinstance(rag_context, list):
        for idx, src in enumerate(rag_context, 1):
            formatted_context += f"Source {idx}: {src.get('text', '')}\n"
    else:
        formatted_context = str(rag_context)

    questions = generate_quiz_from_rag(incident_text, formatted_context)

    return {
        "report_id": report_id,
        "quiz_title": f"Safety Assessment: {incident_text[:40]}...",
        "questions": questions
    }

@router.post("/submit", response_model=Dict[str, Any])
async def submit_quiz_score(
    req: QuizSubmitRequest,
    current_user: dict = Depends(get_current_user)
):
    record = {
        "worker_id": current_user["id"],
        "worker_name": current_user.get("name", "Worker"),
        "report_id": req.report_id,
        "quiz_title": req.quiz_title,
        "score": req.score,
        "total_questions": req.total_questions,
        "percentage": round((req.score / max(1, req.total_questions)) * 100, 1)
    }

    saved = await create_training_record(record)
    return saved

@router.get("/history", response_model=List[Dict[str, Any]])
async def get_training_history_endpoint(
    worker_id: str = None,
    current_user: dict = Depends(get_current_user)
):
    role = current_user.get("role", "Worker")
    target_id = current_user["id"]
    if role in ["Admin", "HSE Officer"] and worker_id:
        target_id = worker_id
        
    history = await get_user_training_history(target_id)
    return history
