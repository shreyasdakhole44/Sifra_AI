import re
import os
import math
import json
from typing import Dict, Any, List
from sifra_final_ai import (
    predict_fatality,
    search_documents,
    create_rag_context,
    generate_sifra_response,
    get_groq_client
)

def extract_section_bullets(text: str, section_headers: List[str]) -> List[str]:
    """Helper to extract bullet points from text under specific section headers."""
    if not text:
        return []
    
    bullets = []
    lines = text.splitlines()
    capturing = False
    
    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue
        
        # Check if line matches any target header
        if any(re.search(rf'^\s*(?:\d+[\.\)]\s*)?{re.escape(hdr)}', stripped, re.IGNORECASE) for hdr in section_headers):
            capturing = True
            continue
        elif capturing and re.match(r'^\s*(?:\d+[\.\)]\s*)?[A-Z0-9\s]{3,}:?', stripped) and not stripped.startswith(('•', '-', '*')):
            # Reached a new section header
            capturing = False
            
        if capturing:
            clean_bullet = re.sub(r'^[•\-\*\s]+', '', stripped).strip()
            if clean_bullet and len(clean_bullet) > 3:
                bullets.append(clean_bullet)
                
    return bullets

def analyze_incident_pipeline(incident_text: str, establishment_info: Dict[str, Any] = None) -> Dict[str, Any]:
    raw_text = incident_text.strip() if incident_text else ""
    text_lower = raw_text.lower()
    info = establishment_info or {}

    print(f"\n[2] EXTRACTED INCIDENT TEXT: len={len(raw_text)} char(s)")
    print(f"Narrative Excerpt: \"{raw_text[:160]}...\"")

    ml_status = "success"
    rag_status = "success"

    # -------------------------------------------------------------
    # 1. EXECUTE REAL XGBOOST MODEL (TABULAR PRIOR PROBABILITY)
    # -------------------------------------------------------------
    try:
        xgb_pred, xgb_prob = predict_fatality(
            employees=float(info.get("employees", 100)),
            hours_worked=float(info.get("hours_worked", 200000)),
            naics_code=float(info.get("naics_code", 211111)),
            industry=info.get("industry", "Oil and Gas Extraction"),
            establishment_type=info.get("establishment_type", "Operating"),
            size=info.get("size", "100 to 249"),
            state=info.get("state", "TX")
        )
    except Exception as e:
        print(f"Error running XGBoost model: {e}")
        ml_status = "ML analysis unavailable"
        xgb_pred, xgb_prob = "NO", 17.27

    # -------------------------------------------------------------
    # 2. DYNAMIC NLP HAZARD FEATURE VECTORIZER & LOGIT ENSEMBLE MATH
    # -------------------------------------------------------------
    # Clean text to prevent false positives from negated phrases like 'no high pressure' or 'no gas leak'
    clean_text = re.sub(r'\bno\s+(?:high\s+)?(?:pressure|gas|leak|loto|spill|hazard|issue)\b', '', text_lower)

    # High potential fatality / severity signals
    high_pot_signals = ["fatality", "fatal", "loss of containment", "high energy release", "stored pressure", "explosion", "fire", "hydrocarbon release", "line-of-fire", "loto verification was not confirmed", "unisolated"]
    high_pot_score = sum(0.5 for sig in high_pot_signals if sig in clean_text)

    # Hazard dimension keyword intensity evaluation
    p_press = sum(0.4 for k in ["pressurized", "pressure", "hydrocarbon", "gas surge", "bleed", "manifold", "valve", "containment", "pipe"] if k in clean_text)
    p_loto = sum(0.45 for k in ["loto", "lockout", "tagout", "isolation", "unisolated", "isolation point", "zero-energy"] if k in clean_text)
    p_height = sum(0.4 for k in ["height", "pipe rack", "harness", "lanyard", "anchor", "elevated", "fall", "derrick", "scaffold"] if k in clean_text)
    p_confined = sum(0.45 for k in ["confined", "mud pit", "pit", "vessel", "tank entry", "attendant", "hole watch", "o2", "h2s", "gas clearance"] if k in clean_text)
    p_hotwork = sum(0.4 for k in ["hot work", "grinding", "welding", "spark", "gas test", "separator", "ignition", "flammable"] if k in clean_text)
    p_electrical = sum(0.4 for k in ["electrical", "wiring", "junction", "panel", "arc flash", "substation", "exposed"] if k in clean_text)
    p_crane = sum(0.4 for k in ["crane", "suspended load", "rigging", "tagline", "lifting", "underneath"] if k in clean_text)
    p_vehicle = sum(0.3 for k in ["vehicle", "speed", "seatbelt", "crossing", "driving"] if k in clean_text)

    # Low hazard / housekeeping mitigation signals
    low_hazard_signals = ["clean floor", "organized", "toolbox", "no spill", "routine inspection", "minor drip tray", "housekeeping"]
    low_hazard_score = sum(0.5 for k in low_hazard_signals if k in text_lower)

    total_nlp_score = high_pot_score + p_press + p_loto + p_height + p_confined + p_hotwork + p_electrical + p_crane + p_vehicle - low_hazard_score

    print(f"[3] NLP FEATURES: high_pot={high_pot_score:.2f}, hazard_dim_sum={(p_press+p_loto+p_height+p_confined+p_hotwork+p_electrical+p_crane+p_vehicle):.2f}, low_mitigation={low_hazard_score:.2f}, total_nlp_score={total_nlp_score:.2f}")

    # Convert XGBoost prior probability to logit space and add NLP hazard intensity score
    p_prior = max(0.01, min(0.99, (xgb_prob / 100.0)))
    prior_logit = math.log(p_prior / (1.0 - p_prior))
    combined_logit = prior_logit + total_nlp_score

    # Calibrated probability in percentage [5.0%, 95.0%]
    if ml_status == "success":
        probability = round(min(95.0, max(5.0, (1.0 / (1.0 + math.exp(-combined_logit))) * 100.0)), 1)
        prediction = "YES" if probability >= 50.0 else "NO"
        risk_level = "HIGH" if probability >= 50.0 else ("MEDIUM" if probability >= 30.0 else "LOW")
    else:
        probability = 0.0
        prediction = "NO"
        risk_level = "LOW"

    print(f"[7] SIF PROBABILITY: {probability:.1f}% (Prior XGBoost: {xgb_prob:.1f}%, Logit Shift: {total_nlp_score:+.2f})")
    print(f"[8] RISK BAND: {risk_level} (Fatality Flag: {prediction})")

    # -------------------------------------------------------------
    # 3. DYNAMIC PARSING / EXTRACTION OF UA, UC, IOGP RULES & BARRIERS
    # -------------------------------------------------------------
    # First attempt to extract explicit sections from document (e.g. PDF text)
    ua_extracted = extract_section_bullets(raw_text, ["UNSAFE ACTS", "UNSAFE ACTS (UA)", "UNSAFE ACT"])
    uc_extracted = extract_section_bullets(raw_text, ["UNSAFE CONDITIONS", "UNSAFE CONDITIONS (UC)", "UNSAFE CONDITION", "IMMEDIATE HAZARD"])
    iogp_extracted = extract_section_bullets(raw_text, ["POTENTIAL IOGP LIFE-SAVING RULES", "IOGP LIFE-SAVING RULES", "IOGP RULES"])
    barriers_extracted = extract_section_bullets(raw_text, ["CRITICAL SAFETY BARRIERS INVOLVED", "CRITICAL BARRIERS", "RECOMMENDED ACTIONS"])

    # Fallback / Dynamic mapping based on NLP hazard intensity
    unsafe_acts = ua_extracted
    unsafe_conditions = uc_extracted
    critical_barriers = barriers_extracted
    iogp_rules = []

    if not unsafe_acts:
        if p_loto > 0 or p_press > 0:
            unsafe_acts.append("Attempting valve operation before positive isolation and LOTO verification.")
            unsafe_acts.append("Entering/working close to a potential line-of-fire zone before controls were confirmed.")
        elif p_height > 0:
            unsafe_acts.append("Working on elevated pipe rack at height without 100% safety harness tie-off.")
        elif p_hotwork > 0:
            unsafe_acts.append("Executing grinding spark work near hydrocarbon vessel without prior gas clearance testing.")
        elif p_confined > 0:
            unsafe_acts.append("Attempting entry into vessel/pit prior to obtaining Confined Space Permit and hole watch.")
        elif p_electrical > 0:
            unsafe_acts.append("Leaving electrical junction box cover detached without warning barricades.")
        elif p_crane > 0:
            unsafe_acts.append("Walking underneath suspended crane load during tagline repositioning.")
        elif low_hazard_score > 0:
            unsafe_acts.append("Minor housekeeping delay in stowing hand tools after shift completion.")
        else:
            unsafe_acts.append(f"Observed operational act: '{raw_text[:120]}'")

    if not unsafe_conditions:
        if p_loto > 0 or p_press > 0:
            unsafe_conditions.append("LOTO verification was not confirmed at the isolation point.")
            unsafe_conditions.append("Incomplete exclusion barrier around pressurized line work area.")
            unsafe_conditions.append("Potential stored pressure remained in process line.")
        elif p_height > 0:
            unsafe_conditions.append("Absence of certified overhead lifeline along elevated work route.")
        elif p_hotwork > 0:
            unsafe_conditions.append("Unmonitored LEL hydrocarbon gas concentration near separator tank.")
        elif p_confined > 0:
            unsafe_conditions.append("Unmonitored confined space atmospheric gas clearance.")
        elif p_electrical > 0:
            unsafe_conditions.append("Exposed live electrical terminals inside junction box panel.")
        elif p_crane > 0:
            unsafe_conditions.append("Inadequate exclusion zone barricades around crane swing radius.")
        elif low_hazard_score > 0:
            unsafe_conditions.append("Worksite floor requires routine cleaning and tool sorting.")
        else:
            unsafe_conditions.append("Uncontrolled operational hazard at work site.")

    # IOGP Rules mapping
    if iogp_extracted:
        for r_name in iogp_extracted:
            iogp_rules.append({"id": r_name.lower().replace(" ", "_"), "name": r_name, "desc": f"Mandatory compliance rule: {r_name}"})
    else:
        if p_loto > 0 or p_press > 0:
            iogp_rules.append({"id": "loto", "name": "Energy Isolation / LOTO", "desc": "Verify mechanical isolation and discharge stored pressure before work."})
            iogp_rules.append({"id": "lineoffire", "name": "Line of Fire", "desc": "Keep clear of moving machinery, stored energy, and pressurized release paths."})
            iogp_rules.append({"id": "bypass", "name": "Bypassing Safety Controls", "desc": "Obtain authorization before overriding safety critical equipment."})
        elif p_height > 0:
            iogp_rules.append({"id": "height", "name": "Working at Height", "desc": "Use fall protection when working outside protected areas at 1.8m height or above."})
        elif p_hotwork > 0:
            iogp_rules.append({"id": "hotwork", "name": "Hot Work & Ignition Control", "desc": "Identify hazardous atmosphere and clear flammable materials before spark work."})
        elif p_confined > 0:
            iogp_rules.append({"id": "confined", "name": "Confined Space Entry", "desc": "Confirm gas testing, entry permit, and attendant before entering tanks/pits."})
        elif p_electrical > 0:
            iogp_rules.append({"id": "electrical", "name": "Electrical Safety & LOTO", "desc": "Verify electrical isolation and protective enclosure shielding."})
        elif p_crane > 0:
            iogp_rules.append({"id": "lifting", "name": "Safe Mechanical Lifting", "desc": "Verify lifting gear, load capacity, and exclusion zone before lifting."})
        else:
            iogp_rules.append({"id": "env", "name": "Environmental & Worksite Housekeeping", "desc": "Maintain clean worksite conditions and inspect equipment regularly."})

    if not critical_barriers:
        if p_loto > 0 or p_press > 0:
            critical_barriers = [
                "Positive Energy Isolation / Lock-Out-Tag-Out (LOTO) verification.",
                "Pressure bleed-off and zero-energy verification before line operation.",
                "Line-of-fire exclusion zone and physical barricading.",
                "Gas detection and emergency shutdown readiness."
            ]
        elif p_height > 0:
            critical_barriers = ["Certified Anchor Points & Overhead Lifeline Systems", "100% Tie-Off Safety Harness Connection"]
        elif p_hotwork > 0:
            critical_barriers = ["Calibrated Gas Testing & LEL Monitoring", "Hot Work Permitting & Fire Watch Coverage"]
        else:
            critical_barriers = ["Mandatory Pre-Job Hazard Analysis (JHA)", "Site Supervisor Clearance Sign-off"]

    failed_barriers = ["Pre-work hazard identification & LOTO verification", "Exclusion zone barricade setup"]
    relevant_hazards = unsafe_conditions

    # -------------------------------------------------------------
    # 4. HYBRID RAG RETRIEVAL (FAISS + BM25 + CROSS-ENCODER)
    # -------------------------------------------------------------
    try:
        rag_results = search_documents(raw_text, top_k=3)
        rag_context = create_rag_context(rag_results)
    except Exception as e:
        print(f"Notice: Hybrid RAG error: {e}")
        rag_status = "Knowledge-base analysis unavailable"
        rag_results = []
        rag_context = ""

    print(f"[9] RAG RESULTS: retrieved_chunks={len(rag_results)}, rag_status='{rag_status}'")

    # -------------------------------------------------------------
    # 5. GROQ LLM SYNTHESIS & STRUCTURED SECTION PARSING
    # -------------------------------------------------------------
    llm_analysis_raw = generate_sifra_response(
        incident=raw_text,
        prediction=prediction,
        probability=probability,
        rag_context=rag_context
    )

    structured_sections = {
        "incident_summary": f"Observed Incident Narrative: \"{raw_text}\". The event occurred at an Oil India Limited operational site.",
        "ml_risk_estimate": f"Fatality Flag: {prediction} | Probability: {probability:.1f}% | Risk Level: {risk_level} SIF FATALITY RISK",
        "ua_uc_analysis": "\n".join([f"- UA: {ua}" for ua in unsafe_acts] + [f"- UC: {uc}" for uc in unsafe_conditions]),
        "relevant_hazards": "\n".join([f"- {h}" for h in relevant_hazards]),
        "critical_barriers": "\n".join([f"- {b}" for b in critical_barriers]),
        "safety_observations": rag_context if rag_context.strip() else "Grounding against IOGP Life-Saving Rules & OIL HSE standards.",
        "limitations": "SIFRA AI fatality probabilities are statistical XGBoost risk estimates derived from historical OSHA/BLS datasets. All AI predictions must be paired with physical on-site HSE inspection."
    }

    return {
        "ml_status": ml_status,
        "rag_status": rag_status,
        "ml_prediction": prediction,
        "ml_probability": probability,
        "risk_level": risk_level,
        "rag_results": rag_results,
        "rag_context": rag_context,
        "llm_analysis_raw": llm_analysis_raw,
        "structured_sections": structured_sections,
        "unsafe_acts": unsafe_acts,
        "unsafe_conditions": unsafe_conditions,
        "iogp_rules": iogp_rules,
        "failed_barriers": failed_barriers,
        "critical_barriers": critical_barriers,
        "relevant_hazards": relevant_hazards
    }

def generate_quiz_from_rag(incident_text: str, rag_context: str) -> List[Dict[str, Any]]:
    client = get_groq_client()
    if client:
        prompt = f"""
You are an expert safety training instructor for Oil India Limited (OIL).
Based on the following incident description and retrieved safety knowledge base context, generate 3 high-quality multiple choice questions (MCQs) for worker safety training.

INCIDENT:
{incident_text}

RETRIEVED SAFETY CONTEXT:
{rag_context}

Output ONLY valid JSON matching this structure:
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
            if content.startswith("```json"):
                content = content[7:]
            if content.startswith("```"):
                content = content[3:]
            if content.endswith("```"):
                content = content[:-3]
            return json.loads(content.strip())
        except Exception as e:
            print(f"Notice: Groq quiz generation fallback: {e}")

    # Fallback dynamic quiz generator based on incident text
    text_l = incident_text.lower() if incident_text else ""
    if "loto" in text_l or "valve" in text_l or "manifold" in text_l:
        return [
            {
                "id": 1,
                "question": "What is the mandatory procedure before operating wellhead manifold valves?",
                "options": [
                    "Verify mechanical Lockout/Tagout (LOTO) isolation and zero residual pressure",
                    "Bypass isolation tags and open valve immediately",
                    "Operate valve without personal protective equipment (PPE)",
                    "Wait 2 hours without checking pressure gauges"
                ],
                "correct_index": 0,
                "explanation": "LOTO verification and zero-energy pressure bleeding are mandatory under IOGP Energy Isolation rules."
            },
            {
                "id": 2,
                "question": "What does a missing LOTO tag on an isolation point indicate?",
                "options": [
                    "Unconfirmed isolation state — do not operate until isolation is re-verified and tagged",
                    "The system is safe to operate without checking",
                    "Isolation is optional for routine maintenance",
                    "Pressure is automatically zero"
                ],
                "correct_index": 0,
                "explanation": "No work may proceed on isolation points lacking visible LOTO verification tags."
            }
        ]
    elif "height" in text_l or "rack" in text_l or "harness" in text_l:
        return [
            {
                "id": 1,
                "question": "What is required when working on elevated pipe racks above 1.8m height?",
                "options": [
                    "Wear a safety harness and clip lanyard to a certified anchor point (100% tie-off)",
                    "Work without a harness if the task takes less than 10 minutes",
                    "Anchor lanyard to non-certified loose piping",
                    "Disconnect lanyard while walking along pipe racks"
                ],
                "correct_index": 0,
                "explanation": "100% tie-off to certified anchor points is mandatory under IOGP Working at Height rules."
            }
        ]
    elif "hot work" in text_l or "grinding" in text_l or "gas test" in text_l:
        return [
            {
                "id": 1,
                "question": "What must be completed prior to executing grinding or hot spark work near hydrocarbon tanks?",
                "options": [
                    "Obtain an authorized Hot Work Permit and record continuous LEL gas test readings",
                    "Start grinding immediately if no supervisor is watching",
                    "Cover gas sensors to prevent alarm triggers",
                    "Ignore hydrocarbon gas odor"
                ],
                "correct_index": 0,
                "explanation": "Hot Work permits and gas clearance testing prevent explosive hydrocarbon gas ignition."
            }
        ]
    else:
        return [
            {
                "id": 1,
                "question": "What is the first step when observing an unsafe act or condition at an Oil India worksite?",
                "options": [
                    "Stop work immediately and notify the Shift HSE Officer",
                    "Ignore the observation and continue working",
                    "Wait until end of shift before reporting",
                    "Bypass the safety barrier"
                ],
                "correct_index": 0,
                "explanation": "Empowerment to Stop Unsafe Work is a core OIL safety rule."
            }
        ]
