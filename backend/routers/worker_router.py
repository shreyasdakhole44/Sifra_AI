from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from backend.auth import get_current_user
from backend.database import (
    get_warnings, get_tasks, update_task_status, get_training_assignments,
    create_ar_training_result, get_ar_training_results
)

router = APIRouter(prefix="/worker", tags=["Worker Dashboard"])

class UpdateTaskStatusRequest(BaseModel):
    status: str # Pending, In Progress, Completed

@router.get("/warnings", response_model=List[Dict[str, Any]])
async def get_my_warnings(
    current_user: dict = Depends(get_current_user)
):
    """Fetch formal warnings issued specifically to current worker."""
    warnings = await get_warnings({"worker_id": current_user["id"]})
    return warnings

@router.get("/tasks", response_model=List[Dict[str, Any]])
async def get_my_tasks(
    current_user: dict = Depends(get_current_user)
):
    """Fetch corrective tasks assigned specifically to current worker."""
    tasks = await get_tasks({"worker_id": current_user["id"]})
    return tasks

@router.patch("/tasks/{task_id}/status", response_model=Dict[str, Any])
async def update_my_task_status(
    task_id: str,
    req: UpdateTaskStatusRequest,
    current_user: dict = Depends(get_current_user)
):
    """Worker updates the completion status of an assigned task."""
    updated = await update_task_status(task_id, req.status)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found."
        )
    return updated

@router.get("/training", response_model=List[Dict[str, Any]])
async def get_my_assigned_training(
    current_user: dict = Depends(get_current_user)
):
    """Fetch training modules assigned by HSC officer to current worker."""
    assignments = await get_training_assignments(worker_id=current_user["id"])
    return assignments

class ARTrainingSubmitRequest(BaseModel):
    rule_id: int
    points_earned: int
    attempt_number: int
    step_results: Optional[List[Dict[str, Any]]] = None

@router.post("/ar-training", response_model=Dict[str, Any])
async def submit_ar_training(
    req: ARTrainingSubmitRequest,
    current_user: dict = Depends(get_current_user)
):
    """Submit a completed AR/VR module attempt."""
    record = {
        "worker_id": current_user["id"],
        "rule_id": req.rule_id,
        "points_earned": req.points_earned,
        "attempt_number": req.attempt_number,
        "step_results": req.step_results or []
    }
    result = await create_ar_training_result(record)
    return result

@router.get("/ar-training", response_model=List[Dict[str, Any]])
async def get_my_ar_training(
    current_user: dict = Depends(get_current_user)
):
    """Fetch AR/VR module completions for the worker."""
    results = await get_ar_training_results(worker_id=current_user["id"])
    return results
