import os
import shutil
import uuid
from fastapi import APIRouter, HTTPException, status, Depends, Response, UploadFile, File
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from backend.auth import get_current_user, require_roles
from backend.database import (
    create_report, get_reports, get_report_by_id, update_report_status,
    create_alert, add_report_attachment, parse_batch_worker_entries, update_report_fields
)
from backend.pipeline import analyze_incident_pipeline, generate_quiz_from_rag
from backend.config import settings
from backend.pdf_generator import generate_trust_report_pdf
from backend.notifications import send_worker_alert

router = APIRouter(prefix="/reports", tags=["Incident Reports"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads", "reports")
os.makedirs(UPLOAD_DIR, exist_ok=True)

def extract_pdf_text(file_bytes: bytes) -> str:
    try:
        import io
        import pypdf
        reader = pypdf.PdfReader(io.BytesIO(file_bytes))
        pages = [page.extract_text() for page in reader.pages if page.extract_text()]
        return "\n".join(pages).strip()
    except Exception as e:
        print(f"Warning extracting PDF text: {e}")
        return ""

class EstablishmentInfo(BaseModel):
    employees: float = 100.0
    hours_worked: float = 200000.0
    naics_code: float = 211111.0
    industry: str = "Oil and Gas Extraction"
    establishment_type: str = "Operating"
    size: str = "100 to 249"
    state: str = "TX"

class CreateReportRequest(BaseModel):
    worker_id: Optional[str] = "OIL-W-101"
    incident_text: Optional[str] = ""
    establishment_info: Optional[EstablishmentInfo] = None
    site_id: Optional[str] = None
    has_files: Optional[bool] = False

class BatchEntry(BaseModel):
    worker_id: str
    site_id: Optional[str] = "OIL-DULIAJAN-01"
    incident_text: Optional[str] = ""

class BatchReportRequest(BaseModel):
    entries: List[BatchEntry]

class StatusUpdateRequest(BaseModel):
    status: str # Pending Review, Under Investigation, Action Required, Resolved

@router.post("", response_model=Dict[str, Any])
async def submit_incident_report(
    req: CreateReportRequest,
    current_user: dict = Depends(get_current_user)
):
    print(f"\n[1] RAW REQUEST: worker_id={req.worker_id}, site_id={req.site_id}, has_files={req.has_files}, text_len={len(req.incident_text or '')}")
    has_text = bool(req.incident_text and len(req.incident_text.strip()) > 0)
    if not has_text and not req.has_files:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Add a description, attach at least one evidence file, or both, to submit."
        )

    raw_text = req.incident_text.strip() if has_text else "No written description provided — see attached evidence for assessment."
    target_worker_id = (req.worker_id or current_user.get("worker_id", current_user.get("id", "OIL-W-101"))).strip()
    site_id = req.site_id or current_user.get("site_id", "OIL-DULIAJAN-01")

    # If the officer pasted or uploaded a batch document containing multiple worker entries:
    parsed_batch = parse_batch_worker_entries(raw_text)
    if len(parsed_batch) > 1:
        matched = None
        for b_entry in parsed_batch:
            if b_entry["worker_id"].upper() == target_worker_id.upper():
                matched = b_entry
                break
        if matched:
            raw_text = matched["incident_text"]
            site_id = matched.get("site_id", site_id)

    info_dict = req.establishment_info.dict() if req.establishment_info else {}
    analysis = analyze_incident_pipeline(raw_text, info_dict)

    report_document = {
        "worker_id": target_worker_id,
        "worker_name": f"Worker ({target_worker_id})",
        "incident_text": raw_text,
        "establishment_info": info_dict,
        "ml_status": analysis.get("ml_status", "success"),
        "rag_status": analysis.get("rag_status", "success"),
        "ml_prediction": analysis["ml_prediction"],
        "ml_probability": analysis["ml_probability"],
        "risk_level": analysis["risk_level"],
        "rag_context_sources": analysis["rag_results"],
        "llm_analysis": analysis["llm_analysis_raw"],
        "structured_sections": analysis["structured_sections"],
        "unsafe_acts": analysis.get("unsafe_acts", []),
        "unsafe_conditions": analysis.get("unsafe_conditions", []),
        "iogp_rules": analysis.get("iogp_rules", []),
        "failed_barriers": analysis.get("failed_barriers", []),
        "critical_barriers": analysis.get("critical_barriers", []),
        "relevant_hazards": analysis.get("relevant_hazards", []),
        "attachments": [],
        "site_id": site_id,
        "status": "Pending Review" if analysis["risk_level"] == "HIGH" else "Resolved",
        "flagged": analysis["risk_level"] == "HIGH",
        "quiz_generated": True
    }

    saved_report = await create_report(report_document)

    prob = analysis.get("ml_probability", 0.0)
    prob_pct = prob if prob > 1.0 else (prob * 100.0)
    alert_msg = f"NEW HSE REPORT FILED ({analysis['risk_level']} Risk, {prob_pct:.1f}%): Site {site_id}. Summary: {raw_text[:120]}..."
    await send_worker_alert(
        worker_id=target_worker_id,
        message=alert_msg,
        channel="both"
    )

    print(f"[10] FINAL API RESPONSE: report_id={saved_report['id']}, risk_level={saved_report['risk_level']}, probability={saved_report['ml_probability']}%\n")
    return saved_report

@router.post("/batch", response_model=List[Dict[str, Any]])
async def submit_batch_reports(
    req: BatchReportRequest,
    current_user: dict = Depends(require_roles(["Admin", "HSE Officer", "HSC Officer"]))
):
    """
    HSC Officer batch intake: Processes 5-10 worker entries independently,
    creates one report per worker, auto-generates quiz, logs worker alert.
    """
    results = []
    for entry in req.entries:
        w_id = entry.worker_id.strip() if entry.worker_id else "OIL-W-101"
        s_id = entry.site_id or "OIL-DULIAJAN-01"
        inc_text = entry.incident_text.strip() if entry.incident_text else f"Near-miss observation logged for worker {w_id}."

        analysis = analyze_incident_pipeline(inc_text, {})
        report_doc = {
            "worker_id": w_id,
            "worker_name": f"Worker ({w_id})",
            "incident_text": inc_text,
            "establishment_info": {},
            "ml_prediction": analysis["ml_prediction"],
            "ml_probability": analysis["ml_probability"],
            "risk_level": analysis["risk_level"],
            "rag_context_sources": analysis["rag_results"],
            "llm_analysis": analysis["llm_analysis_raw"],
            "structured_sections": analysis["structured_sections"],
            "unsafe_acts": analysis.get("unsafe_acts", []),
            "unsafe_conditions": analysis.get("unsafe_conditions", []),
            "iogp_rules": analysis.get("iogp_rules", []),
            "failed_barriers": analysis.get("failed_barriers", []),
            "critical_barriers": analysis.get("critical_barriers", []),
            "relevant_hazards": analysis.get("relevant_hazards", []),
            "attachments": [],
            "site_id": s_id,
            "status": "Pending Review" if analysis["risk_level"] == "HIGH" else "Resolved",
            "flagged": analysis["risk_level"] == "HIGH",
            "quiz_generated": True
        }

        saved = await create_report(report_doc)
        
        prob = analysis.get("ml_probability", 0.0)
        prob_pct = prob if prob > 1.0 else (prob * 100.0)
        alert_msg = f"NEW BATCH REPORT FILED ({analysis['risk_level']} SIF, {prob_pct:.1f}% risk): Site {s_id}. Summary: {inc_text[:100]}..."
        await send_worker_alert(
            worker_id=w_id,
            message=alert_msg,
            channel="both"
        )
        
        results.append(saved)

    return results

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

@router.post("/{report_id}/attachments", response_model=Dict[str, Any])
async def upload_report_attachments(
    report_id: str,
    files: List[UploadFile] = File(...),
    current_user: dict = Depends(get_current_user)
):
    """Upload multipart evidence attachments (images, PDFs, voice notes)."""
    report = await get_report_by_id(report_id)
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident report not found for attachment upload."
        )

    if len(files) > 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum 5 files allowed per upload request."
        )

    report_upload_dir = os.path.join(UPLOAD_DIR, report_id)
    os.makedirs(report_upload_dir, exist_ok=True)

    allowed_prefixes = ("image/", "application/pdf", "audio/")
    extracted_pdf_narrative = ""

    for file in files:
        if not file.content_type or not any(file.content_type.startswith(p) for p in allowed_prefixes):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid file type '{file.content_type}'. Only Images, PDFs, and Audio files are allowed."
            )

        # Read contents to validate max 10MB size
        content = await file.read()
        if len(content) > 10 * 1024 * 1024:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File '{file.filename}' exceeds maximum allowed size of 10MB."
            )

        # If PDF uploaded, extract narrative text from PDF
        if file.content_type == "application/pdf" or file.filename.lower().endswith(".pdf"):
            pdf_txt = extract_pdf_text(content)
            if pdf_txt and len(pdf_txt.strip()) > 20:
                extracted_pdf_narrative = pdf_txt.strip()
                print(f"[2] EXTRACTED INCIDENT TEXT FROM PDF ({file.filename}): len={len(extracted_pdf_narrative)} char(s)")

        file_id = str(uuid.uuid4())[:8]
        safe_filename = f"{file_id}_{file.filename.replace(' ', '_')}"
        file_path = os.path.join(report_upload_dir, safe_filename)

        with open(file_path, "wb") as f:
            f.write(content)

        attachment_meta = {
            "id": file_id,
            "name": file.filename,
            "type": file.content_type,
            "size": len(content),
            "url": f"/uploads/reports/{report_id}/{safe_filename}",
            "uploaded_by": current_user.get("worker_id", current_user["id"])
        }

        await add_report_attachment(report_id, attachment_meta)

    # Re-evaluate SIF analysis if PDF narrative was extracted
    if extracted_pdf_narrative:
        info_dict = report.get("establishment_info", {})
        analysis = analyze_incident_pipeline(extracted_pdf_narrative, info_dict)
        
        update_fields = {
            "incident_text": extracted_pdf_narrative,
            "ml_status": analysis.get("ml_status", "success"),
            "rag_status": analysis.get("rag_status", "success"),
            "ml_prediction": analysis["ml_prediction"],
            "ml_probability": analysis["ml_probability"],
            "risk_level": analysis["risk_level"],
            "rag_context_sources": analysis["rag_results"],
            "llm_analysis": analysis["llm_analysis_raw"],
            "structured_sections": analysis["structured_sections"],
            "unsafe_acts": analysis.get("unsafe_acts", []),
            "unsafe_conditions": analysis.get("unsafe_conditions", []),
            "iogp_rules": analysis.get("iogp_rules", []),
            "failed_barriers": analysis.get("failed_barriers", []),
            "critical_barriers": analysis.get("critical_barriers", []),
            "relevant_hazards": analysis.get("relevant_hazards", []),
            "status": "Pending Review" if analysis["risk_level"] == "HIGH" else "Resolved",
            "flagged": analysis["risk_level"] == "HIGH"
        }
        await update_report_fields(report_id, update_fields)
        print(f"[10] FINAL API RESPONSE (POST-ATTACHMENT): report_id={report_id}, risk_level={analysis['risk_level']}, probability={analysis['ml_probability']}%\n")

    updated_report = await get_report_by_id(report_id)
    return updated_report or {}

@router.get("/{report_id}/attachments", response_model=List[Dict[str, Any]])
async def get_report_attachments(
    report_id: str,
    current_user: dict = Depends(get_current_user)
):
    report = await get_report_by_id(report_id)
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident report not found."
        )
    return report.get("attachments", [])

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
