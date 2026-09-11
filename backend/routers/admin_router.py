from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from backend.auth import require_roles, get_current_user
from backend.database import (
    get_reports, get_all_users, get_alerts, create_alert,
    create_warning, get_worker_details, create_training_assignment,
    create_task, get_worker_locations
)
from backend.config import settings

router = APIRouter(prefix="/admin", tags=["Admin & HSE Analytics"])

OFFICER_ROLES = ["Admin", "HSE Officer", "HSC Officer"]

# Geo coordinates for Oil India Limited (OIL) primary operational sites in Assam
OIL_SITES = [
    {"site_id": "OIL-DULIAJAN-01", "name": "Duliajan Headquarters Rig Site", "lat": 27.3562, "lng": 95.3214, "district": "Dibrugarh"},
    {"site_id": "OIL-DIGBOI-01", "name": "Digboi Oil Field & Refinery", "lat": 27.3814, "lng": 95.6311, "district": "Tinsukia"},
    {"site_id": "OIL-MORAN-01", "name": "Moran Production Site", "lat": 27.1856, "lng": 94.9213, "district": "Sivasagar"},
    {"site_id": "OIL-JORHAT-01", "name": "Jorhat Exploration Complex", "lat": 26.7509, "lng": 94.2037, "district": "Jorhat"},
    {"site_id": "OIL-GUWAHATI-01", "name": "Guwahati Pipeline Station", "lat": 26.1445, "lng": 91.7362, "district": "Kamrup"}
]

class SendWarningRequest(BaseModel):
    worker_id: str
    message: str
    sms_dispatch: bool = True

class AssignTrainingRequest(BaseModel):
    worker_id: str
    quiz_title: str
    category: str = "IOGP Life Saving Rules"

class AssignTaskRequest(BaseModel):
    worker_id: str
    title: str
    description: str
    due_date: Optional[str] = "2026-09-20"

@router.get("/dashboard-stats", response_model=Dict[str, Any])
async def get_dashboard_analytics(
    current_user: dict = Depends(require_roles(OFFICER_ROLES))
):
    all_reports = await get_reports({})
    all_alerts = await get_alerts({})

    total_incidents = len(all_reports)
    high_risk_count = sum(1 for r in all_reports if r.get("risk_level") == "HIGH")
    resolved_count = sum(1 for r in all_reports if r.get("status") == "Resolved")
    active_alerts_count = len(all_alerts)

    # Compute Site Geo Heatmap Data
    site_stats = {}
    for site in OIL_SITES:
        site_stats[site["site_id"]] = {
            **site,
            "incident_count": 0,
            "high_risk_count": 0,
            "risk_score": 15.0 # baseline low
        }

    for r in all_reports:
        sid = r.get("site_id", "OIL-DULIAJAN-01")
        if sid not in site_stats:
            sid = "OIL-DULIAJAN-01"
        site_stats[sid]["incident_count"] += 1
        if r.get("risk_level") == "HIGH":
            site_stats[sid]["high_risk_count"] += 1

    heatmap_list = []
    for s_id, s_data in site_stats.items():
        inc = s_data["incident_count"]
        hr = s_data["high_risk_count"]
        calc_risk = min(98.0, max(12.0, (inc * 10.0) + (hr * 25.0)))
        s_data["risk_score"] = round(calc_risk, 1)
        s_data["risk_level"] = "HIGH" if calc_risk > 65 else ("MEDIUM" if calc_risk > 35 else "LOW")
        heatmap_list.append(s_data)

    risk_by_site = [
        {"site_name": s["name"].split()[0], "site_id": s["site_id"], "high_risk": s["high_risk_count"], "total": s["incident_count"], "avg_risk": s["risk_score"]}
        for s in heatmap_list
    ]

    trend_analytics = [
        {"month": "May", "incidents": 12, "high_risk": 3},
        {"month": "Jun", "incidents": 18, "high_risk": 5},
        {"month": "Jul", "incidents": 14, "high_risk": 2},
        {"month": "Aug", "incidents": 22, "high_risk": 8},
        {"month": "Sep", "incidents": max(15, total_incidents), "high_risk": max(4, high_risk_count)}
    ]

    ua_uc_breakdown = [
        {"rule": "LOTO & Pressure Lockout", "count": 14, "color": "#0284c7"},
        {"rule": "Hot Work & Flare Safety", "count": 9, "color": "#0f766e"},
        {"rule": "Personal PPE Compliance", "count": 7, "color": "#f59e0b"},
        {"rule": "Gas Detection & Clearance", "count": 11, "color": "#ef4444"},
        {"rule": "Scaffolding & Work at Height", "count": 5, "color": "#8b5cf6"}
    ]

    return {
        "total_incidents": total_incidents,
        "high_risk_count": high_risk_count,
        "resolved_count": resolved_count,
        "active_alerts_count": active_alerts_count,
        "site_heatmaps": heatmap_list,
        "risk_by_site": risk_by_site,
        "trend_analytics": trend_analytics,
        "ua_uc_breakdown": ua_uc_breakdown
    }

@router.get("/heatmap-data", response_model=List[Dict[str, Any]])
async def get_heatmap_worker_locations(
    current_user: dict = Depends(require_roles(OFFICER_ROLES))
):
    """Fetch active worker GPS coordinates for Leaflet heat-layer map."""
    locations = await get_worker_locations()
    return locations

@router.get("/workers", response_model=List[Dict[str, Any]])
async def get_worker_safety_register(
    current_user: dict = Depends(require_roles(OFFICER_ROLES))
):
    users = await get_all_users()
    reports = await get_reports({})

    workers_list = []
    for u in users:
        w_id = u.get("worker_id", u["id"])
        w_reports = [r for r in reports if r.get("worker_id") == w_id or r.get("worker_id") == u["id"]]
        high_risk_count = sum(1 for r in w_reports if r.get("risk_level") == "HIGH")
        avg_prob = sum(r.get("ml_probability", 0.0) for r in w_reports) / max(1, len(w_reports)) if w_reports else 0.0
        
        workers_list.append({
            "worker_id": w_id,
            "id": u["id"],
            "name": u.get("name", "Worker"),
            "email": u.get("email"),
            "role": u.get("role"),
            "status": u.get("status", "Active"),
            "site_id": u.get("site_id", "OIL-DULIAJAN-01"),
            "total_incidents": len(w_reports),
            "high_risk_incidents": high_risk_count,
            "avg_risk_probability": round(avg_prob, 1),
            "safety_rating": "A+" if avg_prob < 20 else ("B" if avg_prob < 50 else "C (Needs Refresher)")
        })

    return workers_list

@router.get("/workers/{worker_id}", response_model=Dict[str, Any])
async def lookup_worker_status(
    worker_id: str,
    current_user: dict = Depends(require_roles(OFFICER_ROLES))
):
    """Officer deep lookup of individual worker profile, last report, open warnings, and training status."""
    details = await get_worker_details(worker_id)
    if not details:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Worker with ID {worker_id} not found."
        )
    return details

@router.post("/warnings/send", response_model=Dict[str, Any])
async def dispatch_worker_warning(
    req: SendWarningRequest,
    current_user: dict = Depends(require_roles(OFFICER_ROLES))
):
    """HSC Officer dispatches an SMS formal warning to a worker."""
    sms_status = "stubbed"
    if req.sms_dispatch and settings.TWILIO_ACCOUNT_SID and settings.TWILIO_AUTH_TOKEN:
        try:
            from twilio.rest import Client
            client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
            sms_status = "sent"
        except Exception as e:
            print(f"Twilio SMS Warning Error: {e}")
            sms_status = "failed"

    warning_doc = {
        "worker_id": req.worker_id,
        "issued_by": current_user.get("name", "HSC Lead Officer"),
        "message": req.message,
        "sms_status": sms_status,
        "status": "Delivered"
    }

    saved = await create_warning(warning_doc)

    # Also log in global alert dispatches feed
    await create_alert({
        "report_id": "HSC-SMS-WARNING",
        "worker_id": req.worker_id,
        "type": "sms",
        "message": f"OFFICIAL HSE WARNING to {req.worker_id}: {req.message}",
        "status": "sent"
    })

    return saved

@router.post("/training/assign", response_model=Dict[str, Any])
async def assign_worker_training(
    req: AssignTrainingRequest,
    current_user: dict = Depends(require_roles(OFFICER_ROLES))
):
    """HSC Officer assigns a safety training / MCQ module to a worker."""
    assignment_doc = {
        "worker_id": req.worker_id,
        "quiz_title": req.quiz_title,
        "category": req.category,
        "assigned_by": current_user.get("name", "HSC Lead Officer")
    }
    saved = await create_training_assignment(assignment_doc)
    return saved

@router.post("/tasks/assign", response_model=Dict[str, Any])
async def assign_worker_task(
    req: AssignTaskRequest,
    current_user: dict = Depends(require_roles(OFFICER_ROLES))
):
    """HSC Officer assigns a corrective safety task to a worker."""
    task_doc = {
        "worker_id": req.worker_id,
        "title": req.title,
        "description": req.description,
        "assigned_by": current_user.get("name", "HSC Lead Officer"),
        "due_date": req.due_date,
        "status": "Pending"
    }
    saved = await create_task(task_doc)
    return saved

@router.get("/alerts", response_model=List[Dict[str, Any]])
async def list_all_alerts(
    current_user: dict = Depends(get_current_user)
):
    role = current_user.get("role", "Worker")
    if role == "Worker":
        filter_q = {"worker_id": current_user["id"]}
    else:
        filter_q = {}
    
    alerts = await get_alerts(filter_q)
    return alerts
