import re
import os
import json
from typing import Dict, Any, List
from sifra_final_ai import (
    predict_fatality,
    search_documents,
    create_rag_context,
    generate_sifra_response,
    get_groq_client
)

def parse_7_sections(llm_text: str) -> Dict[str, str]:
    """
    Parses the 7-section LLM markdown text into clean key-value dictionary items.
    Sections expected:
    1. INCIDENT SUMMARY
    2. ML RISK ESTIMATE
    3. UA / UC ANALYSIS
    4. RELEVANT HAZARDS
    5. CRITICAL BARRIERS
    6. SAFETY OBSERVATIONS FROM KNOWLEDGE BASE
    7. LIMITATIONS
    """
    sections = {
        "incident_summary": "",
        "ml_risk_estimate": "",
        "ua_uc_analysis": "",
        "relevant_hazards": "",
        "critical_barriers": "",
        "safety_observations": "",
        "limitations": ""
    }
    
    patterns = [
        ("incident_summary", r"1\.\s*INCIDENT SUMMARY[:\s]*(.*?)(?=2\.\s*ML RISK ESTIMATE|$)"),
        ("ml_risk_estimate", r"2\.\s*ML RISK ESTIMATE[:\s]*(.*?)(?=3\.\s*UA\s*/\s*UC ANALYSIS|$)"),
        ("ua_uc_analysis", r"3\.\s*UA\s*/\s*UC ANALYSIS[:\s]*(.*?)(?=4\.\s*RELEVANT HAZARDS|$)"),
        ("relevant_hazards", r"4\.\s*RELEVANT HAZARDS[:\s]*(.*?)(?=5\.\s*CRITICAL BARRIERS|$)"),
        ("critical_barriers", r"5\.\s*CRITICAL BARRIERS[:\s]*(.*?)(?=6\.\s*SAFETY OBSERVATIONS FROM KNOWLEDGE BASE|$)"),
        ("safety_observations", r"6\.\s*SAFETY OBSERVATIONS FROM KNOWLEDGE BASE[:\s]*(.*?)(?=7\.\s*LIMITATIONS|$)"),
        ("limitations", r"7\.\s*LIMITATIONS[:\s]*(.*)")
    ]
    
    for key, pattern in patterns:
        match = re.search(pattern, llm_text, re.DOTALL | re.IGNORECASE)
        if match:
            sections[key] = match.group(1).strip()
    
    # Fallback if parsing fails to match exact numbers
    if not sections["incident_summary"]:
        sections["incident_summary"] = llm_text
        
    return sections

def analyze_incident_pipeline(incident_text: str, establishment_info: Dict[str, Any] = None) -> Dict[str, Any]:
    info = establishment_info or {}
    employees = float(info.get("employees", 100))
    hours_worked = float(info.get("hours_worked", 200000))
    naics_code = float(info.get("naics_code", 211111))
    industry = info.get("industry", "Oil and Gas Extraction")
    establishment_type = info.get("establishment_type", "Operating")
    size = info.get("size", "100 to 249")
    state = info.get("state", "TX")

    # 1. ML Prediction
    prediction, probability = predict_fatality(
        employees=employees,
        hours_worked=hours_worked,
        naics_code=naics_code,
        industry=industry,
        establishment_type=establishment_type,
        size=size,
        state=state
    )

    # 2. RAG Context Retrieval
    rag_results = search_documents(incident_text, top_k=3)
    rag_context = create_rag_context(rag_results)

    # 3. Groq LLM Synthesis
    llm_analysis_raw = generate_sifra_response(
        incident=incident_text,
        prediction=prediction,
        probability=probability,
        rag_context=rag_context
    )

    # Parse sections for clean frontend rendering
    structured_sections = parse_7_sections(llm_analysis_raw)

    risk_level = "HIGH" if (probability >= 50.0 or prediction == "YES") else ("MEDIUM" if probability >= 20.0 else "LOW")

    return {
        "ml_prediction": prediction,
        "ml_probability": probability,
        "risk_level": risk_level,
        "rag_results": rag_results,
        "rag_context": rag_context,
        "llm_analysis_raw": llm_analysis_raw,
        "structured_sections": structured_sections
    }

def generate_quiz_from_rag(incident_text: str, rag_context: str) -> List[Dict[str, Any]]:
    client = get_groq_client()
    prompt = f"""
You are an expert safety training instructor for Oil India Limited (OIL).
Based on the following incident description and retrieved safety knowledge base context, generate 4 high-quality multiple choice questions (MCQs) for worker safety training.

INCIDENT:
{incident_text}

RETRIEVED SAFETY CONTEXT:
{rag_context}

Output ONLY valid JSON matching this structure without any conversational text or markdown wrap other than valid JSON:
[
  {{
    "id": 1,
    "question": "What is the primary hazard described in this scenario?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_index": 0,
    "explanation": "Brief explanation of why this option is correct."
  }}
]
"""
    model_name = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
    try:
        response = client.chat.completions.create(
            model=model_name,
            messages=[
                {"role": "system", "content": "You are a JSON quiz generator for industrial safety compliance."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=1000
        )
        content = response.choices[0].message.content.strip()
        # Clean any markdown json fences
        if content.startswith("```json"):
            content = content[7:]
        if content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
        
        return json.loads(content.strip())
    except Exception as e:
        print(f"Error generating quiz via Groq: {e}")
        # Return fallback quiz questions if LLM fails
        return [
            {
                "id": 1,
                "question": "What is the required procedure before operating high-pressure valve lines?",
                "options": [
                    "Verify lock-out/tag-out (LOTO) and bleed residual pressure",
                    "Bypass the pressure gauge and open valve quickly",
                    "Operate without personal protective equipment (PPE)",
                    "Wait 24 hours without checking system pressure"
                ],
                "correct_index": 0,
                "explanation": "LOTO and depressurization are standard critical safety barriers for high-pressure operations."
            },
            {
                "id": 2,
                "question": "Which safety barrier prevents gas accumulation at wellhead sites?",
                "options": [
                    "Continuous gas detectors and mandatory ventilation",
                    "Turning off main site lighting",
                    "Ignoring mild smell of hydrocarbon vapors",
                    "Disabling emergency shutdown valves (ESD)"
                ],
                "correct_index": 0,
                "explanation": "Continuous hydrocarbon gas monitoring alerts personnel to explosive or toxic vapor build-up."
            },
            {
                "id": 3,
                "question": "What must be completed prior to executing hot work (welding/grinding) near storage tanks?",
                "options": [
                    "Obtain a valid Hot Work Permit and gas clearance test",
                    "Start work immediately if supervisor is absent",
                    "Cover gas sensors with tape",
                    "Use ungrounded electrical tools"
                ],
                "correct_index": 0,
                "explanation": "Hot work permits ensure explosive atmospheres are cleared before ignition sources are introduced."
            }
        ]
