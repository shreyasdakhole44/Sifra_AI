from fastapi import APIRouter, HTTPException, status, Depends, Response
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from backend.auth import get_current_user, require_roles
from backend.database import create_report, get_reports, get_report_by_id, update_report_status, create_alert
from backend.pipeline import analyze_incident_pipeline
from backend.config import settings
from backend.pdf_generator import generate_trust_report_pdf

router = APIRouter(prefix="/reports", tags=["Incident Reports"])

class EstablishmentInfo(BaseModel):
    employees: float = 100.0
    hours_worked: float = 200000.0
    naics_code: float = 211111.0
    industry: str = "Oil and Gas Extraction"
    establishment_type: str = "Operating"
    size: str = "100 to 249"
    state: str = "TX"

class CreateReportRequest(BaseModel):
    incident_text: str
    establishment_info: Optional[EstablishmentInfo] = None
    site_id: Optional[str] = None

class StatusUpdateRequest(BaseModel):
    status: str # Pending Review, Under Investigation, Action Required, Resolved

def trigger_alert_notification(report_id: str, worker_id: str, worker_name: str, incident_text: str, risk_level: str, probability: float):
    alert_msg = f"HIGH RISK SIF FLAG ({probability:.1f}%): Incident reported by {worker_name}. Summary: {incident_text[:100]}..."
    
    sms_status = "stubbed"
    if settings.TWILIO_ACCOUNT_SID and settings.TWILIO_AUTH_TOKEN:
        try:
            from twilio.rest import Client
            client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
            sms_status = "sent"
        except Exception as e:
            print(f"Twilio SMS Error: {e}")
            sms_status = "failed"
            
    email_status = "stubbed"
    if settings.SENDGRID_API_KEY:
        try:
            import sendgrid
            sg = sendgrid.SendGridAPIClient(api_key=settings.SENDGRID_API_KEY)
            email_status = "sent"
        except Exception as e:
            print(f"SendGrid Email Error: {e}")
            email_status = "failed"

    return {
        "report_id": report_id,
        "worker_id": worker_id,
        "type": "sms/email",
        "message": alert_msg,
        "sms_status": sms_status,
        "email_status": email_status,
        "status": "sent" if (sms_status == "sent" or email_status == "sent") else "stubbed"
    }

@router.post("", response_model=Dict[str, Any])
async def submit_incident_report(
    req: CreateReportRequest,
    current_user: dict = Depends(get_current_user)
):
    if not req.incident_text or len(req.incident_text.strip()) < 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incident description must be at least 5 characters long."
        )

    info_dict = req.establishment_info.dict() if req.establishment_info else {}
    analysis = analyze_incident_pipeline(req.incident_text, info_dict)
    
    site_id = req.site_id or current_user.get("site_id", "OIL-DULIAJAN-01")

    report_document = {
        "worker_id": current_user.get("worker_id", current_user["id"]),
        "worker_name": current_user.get("name", "Unknown Worker"),
        "incident_text": req.incident_text,
        "establishment_info": info_dict,
        "ml_prediction": analysis["ml_prediction"],
        "ml_probability": analysis["ml_probability"],
        "risk_level": analysis["risk_level"],
        "rag_context_sources": analysis["rag_results"],
        "llm_analysis": analysis["llm_analysis_raw"],
        "structured_sections": analysis["structured_sections"],
        "site_id": site_id,
        "status": "Pending Review" if analysis["risk_level"] == "HIGH" else "Resolved",
        "flagged": analysis["risk_level"] == "HIGH"
    }

    saved_report = await create_report(report_document)

    if analysis["risk_level"] == "HIGH":
        alert_info = trigger_alert_notification(
            report_id=saved_report["id"],
            worker_id=current_user.get("worker_id", current_user["id"]),
            worker_name=current_user.get("name", "Worker"),
            incident_text=req.incident_text,
            risk_level=analysis["risk_level"],
            probability=analysis["ml_probability"]
        )
        await create_alert(alert_info)

    return saved_report

@router.get("", response_model=List[Dict[str, Any]])
async def list_incident_reports(
    current_user: dict = Depends(get_current_user)
):
    role = current_user.get("role", "Worker")
    if role == "Worker":
        w_id = current_user.get("worker_id", current_user["id"])
        filter_q = {"worker_id": w_id}
    else:
        filter_q = {}
    
    reports = await get_reports(filter_q)
    return reports

@router.get("/{report_id}", response_model=Dict[str, Any])
async def get_report_details(
    report_id: str,
    current_user: dict = Depends(get_current_user)
):
    report = await get_report_by_id(report_id)
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident report not found."
        )
    return report

@router.get("/{report_id}/pdf")
async def download_trust_report_pdf(
    report_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Generates and streams a downloadable Trust Report PDF summarizing ML scores, RAG reasoning, and recommendations."""
    report = await get_report_by_id(report_id)
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident report not found for PDF generation."
        )

    # RBAC check: Workers can only download their own report
    if current_user.get("role") == "Worker":
        w_id = current_user.get("worker_id", current_user["id"])
        if report.get("worker_id") != w_id and report.get("worker_id") != current_user["id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only download PDF reports for your own submitted incidents."
            )

    pdf_bytes = generate_trust_report_pdf(report)
    filename = f"Trust_Report_{report_id[:8]}.pdf"
    
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    )

@router.patch("/{report_id}/status", response_model=Dict[str, Any])
async def update_report_status_endpoint(
    report_id: str,
    req: StatusUpdateRequest,
    current_user: dict = Depends(require_roles(["Admin", "HSE Officer", "HSC Officer"]))
):
    updated = await update_report_status(report_id, req.status)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found for status update."
        )
    return updated
