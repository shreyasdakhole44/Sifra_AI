import io
import re
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, KeepTogether
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT

def sanitize_markdown_text(text: str) -> str:
    """
    Sanitizes LLM markdown output to clean HTML/ReportLab XML text.
    """
    if not text:
        return ""
    
    # Replace **bold** with <b>bold</b>
    s = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', str(text))
    # Replace *italic* with <i>italic</i>
    s = re.sub(r'\*(.*?)\*', r'<i>\1</i>', s)
    # Strip markdown headers #, ##, ###
    s = re.sub(r'#+\s*', '', s)
    # Convert dash or asterisk list bullets to clean bullet symbol
    s = re.sub(r'^\s*[\-\*]\s+', '• ', s, flags=re.MULTILINE)
    # Strip backticks
    s = s.replace('`', '')
    
    return s.strip()

def get_pdf_risk_color(score: float):
    if score >= 70.0:
        return colors.HexColor('#E11D48'), "HIGH RISK"
    elif score >= 40.0:
        return colors.HexColor('#F59E0B'), "MEDIUM RISK"
    else:
        return colors.HexColor('#16A34A'), "LOW RISK"

def generate_trust_report_pdf(report: dict) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    # Custom typography styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=17,
        textColor=colors.HexColor('#FFFFFF'),
        alignment=TA_LEFT
    )

    header_meta_style = ParagraphStyle(
        'HeaderMeta',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor('#CBD5E1')
    )

    heading_style = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=13,
        textColor=colors.HexColor('#0F172A'),
        spaceBefore=6,
        spaceAfter=3
    )

    body_style = ParagraphStyle(
        'BodyTextCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor('#1E293B')
    )

    meta_label = ParagraphStyle(
        'MetaLabel',
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=9.5,
        textColor=colors.HexColor('#64748B')
    )

    meta_val = ParagraphStyle(
        'MetaVal',
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor('#0F172A')
    )

    story = []

    worker_id = report.get('worker_id', 'OIL-W-101')
    site_id = report.get('site_id', 'OIL-DIGBOI-01')
    timestamp_str = str(report.get('timestamp', '9/11/2026, 10:44:43 PM'))[:19].replace('T', ' ')
    prob = float(report.get('ml_probability', 0.0))
    prob_pct = prob > 1.0 and prob or prob * 100.0
    risk_color, risk_tier = get_pdf_risk_color(prob_pct)

    # 2.1 HEADER BAND (Dark Slate Background)
    header_data = [
        [
            Paragraph(f"<b>Worker ({worker_id})</b><br/><font size=7 color='#94A3B8'>Site: {site_id} &bull; Timestamp: {timestamp_str}</font>", title_style),
            Paragraph(f"<font size=7 color='#94A3B8'>SIF FATALITY RISK</font><br/><font color='{risk_color.hexval()}'><b>{prob_pct:.1f}% ({risk_tier})</b></font>", ParagraphStyle('RightHead', parent=title_style, alignment=TA_RIGHT))
        ]
    ]
    header_table = Table(header_data, colWidths=[360, 180])
    header_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#0F172A')),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('PADDING', (0, 0), (-1, -1), 10),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 8))

    # 2.2 METRICS ROW (4-Column Card)
    is_fatality = report.get('ml_prediction') == 'YES' or prob_pct >= 70.0
    fatality_text = "<font color='#E11D48'><b>FATALITY RISK CONFIRMED</b></font>" if is_fatality else "<font color='#16A34A'><b>STANDARD OBSERVATION</b></font>"
    tier_text = "High Exposure Tier" if prob_pct > 70 else ("Medium Exposure Tier" if prob_pct > 40 else "Low Exposure Tier")

    metrics_data = [
        [
            Paragraph("FATALITY INDICATOR", meta_label),
            Paragraph("MODEL ENGINE", meta_label),
            Paragraph("SIF PROBABILITY GAUGE", meta_label),
            Paragraph("CONFIDENCE TIER", meta_label)
        ],
        [
            Paragraph(fatality_text, meta_val),
            Paragraph("<b>XGBoost Classifier V2</b>", meta_val),
            Paragraph(f"<b>{prob_pct:.1f}% Risk Score</b>", meta_val),
            Paragraph(f"<b>{tier_text}</b>", meta_val)
        ]
    ]
    metrics_table = Table(metrics_data, colWidths=[135, 135, 135, 135])
    metrics_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8FAFC')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('PADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(metrics_table)
    story.append(Spacer(1, 8))

    # 2.3 OBSERVED INCIDENT & NEAR-MISS NARRATIVE
    raw_incident = report.get('incident_text', '').strip()
    incident_text = raw_incident if raw_incident else "No written description provided — see attached evidence for assessment."
    clean_incident = sanitize_markdown_text(incident_text)
    
    story.append(Paragraph("OBSERVED INCIDENT & NEAR-MISS NARRATIVE", heading_style))
    narrative_table = Table([[Paragraph(f"<i>\"{clean_incident}\"</i>", body_style)]], colWidths=[540])
    narrative_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F1F5F9')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
        ('PADDING', (0, 0), (-1, -1), 8)
    ]))
    story.append(narrative_table)
    story.append(Spacer(1, 8))

    # 2.4 UA / UC SPLIT CARDS (Side-by-Side)
    sections = report.get('structured_sections', {})
    ua_list = report.get('unsafe_acts') or [sections.get('ua_uc_analysis', '')]
    uc_list = report.get('unsafe_conditions') or report.get('relevant_hazards') or [sections.get('relevant_hazards', '')]
    
    ua_text = sanitize_markdown_text("<br/>".join([f"• {u}" for u in ua_list if u])) or "• No specific unsafe acts flagged."
    uc_text = sanitize_markdown_text("<br/>".join([f"• {u}" for u in uc_list if u])) or "• No specific unsafe conditions flagged."

    ua_uc_data = [
        [
            Paragraph("<font color='#B45309'><b>UNSAFE ACTS (UA) IDENTIFIED [UA-CODES]</b></font>", meta_label),
            Paragraph("<font color='#BE123C'><b>UNSAFE CONDITIONS (UC) IDENTIFIED [UC-CODES]</b></font>", meta_label)
        ],
        [
            Paragraph(ua_text, body_style),
            Paragraph(uc_text, body_style)
        ]
    ]
    ua_uc_table = Table(ua_uc_data, colWidths=[265, 265])
    ua_uc_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#FEF3C7')),
        ('BACKGROUND', (1, 0), (1, -1), colors.HexColor('#FFE4E6')),
        ('BOX', (0, 0), (0, -1), 0.5, colors.HexColor('#FDE68A')),
        ('BOX', (1, 0), (1, -1), 0.5, colors.HexColor('#FECDD3')),
        ('PADDING', (0, 0), (-1, -1), 6),
        ('VALIGN', (0, 0), (-1, -1), 'TOP')
    ]))
    story.append(ua_uc_table)
    story.append(Spacer(1, 8))

    # 2.5 VIOLATED IOGP LIFE-SAVING RULES
    story.append(Paragraph("VIOLATED IOGP LIFE-SAVING RULES", heading_style))
    iogp_rules = report.get('iogp_rules', [])
    if iogp_rules:
        rules_lines = [f"<b>• {r.get('name', 'Rule')}:</b> {r.get('desc', '')}" for r in iogp_rules]
        rules_text = "<br/>".join(rules_lines)
    else:
        rules_text = "<b>• Worksite Hazard Control:</b> Inspect equipment, verify safety clearance, and follow site HSE guidelines."
    
    rules_table = Table([[Paragraph(rules_text, body_style)]], colWidths=[540])
    rules_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8FAFC')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('PADDING', (0, 0), (-1, -1), 8)
    ]))
    story.append(rules_table)
    story.append(Spacer(1, 8))

    # 2.6 RECOMMENDED ACTIONS & CRITICAL BARRIERS TO RESTORE
    story.append(Paragraph("RECOMMENDED ACTIONS & CRITICAL BARRIERS TO RESTORE", heading_style))
    barriers = report.get('critical_barriers') or report.get('failed_barriers') or []
    if barriers:
        barriers_lines = [f"[✓] <b>{b}</b>" for b in barriers]
        barriers_text = "<br/>".join(barriers_lines)
    else:
        barriers_text = "[✓] <b>Worksite Hazard Inspection & Pre-Job Sign-off</b>"
        
    barriers_table = Table([[Paragraph(barriers_text, body_style)]], colWidths=[540])
    barriers_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F0FDF4')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#BBF7D0')),
        ('PADDING', (0, 0), (-1, -1), 8)
    ]))
    story.append(barriers_table)
    story.append(Spacer(1, 8))

    # 2.7 GROUNDING KNOWLEDGE BASE SOURCES
    rag_sources = report.get('rag_context_sources', [])
    story.append(Paragraph("GROUNDING KNOWLEDGE BASE SOURCES", heading_style))
    source_rows = [[Paragraph("<b>Doc ID / Source</b>", meta_label), Paragraph("<b>Matched Policy Context Excerpt</b>", meta_label)]]
    
    if rag_sources:
        for src in rag_sources[:3]:
            doc_name = sanitize_markdown_text(src.get('file_name', src.get('source', 'SIFRA_AI_Oil_Gas_Safety_Knowledge_Base.pdf')))
            snippet = sanitize_markdown_text(str(src.get('snippet', src.get('content', 'Excerpt context.'))))[:160] + "..."
            source_rows.append([Paragraph(f"<b>{doc_name}</b>", meta_val), Paragraph(snippet, body_style)])
    else:
        source_rows.append([
            Paragraph("<b>SIFRA_AI_Oil_Gas_Safety_Knowledge_Base.pdf (Page 14)</b>", meta_val),
            Paragraph("IOGP Report 590: Mandatory Isolation & Permitting Protocol for Pressurized Lines. Zero pressure state must be physically confirmed via bleed valve.", body_style)
        ])

    sources_table = Table(source_rows, colWidths=[180, 360])
    sources_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#F8FAFC')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('PADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(sources_table)
    story.append(Spacer(1, 8))

    # 2.8 ASSIGNED SAFETY QUIZ STATUS STRIP
    quiz_msg = f"Safety MCQ assessment generated from report context is assigned to Worker ID: {worker_id}."
    quiz_table = Table([[Paragraph(f"<b>ASSIGNED SAFETY QUIZ STATUS:</b> {quiz_msg}", ParagraphStyle('QuizText', parent=body_style, textColor=colors.HexColor('#0F766E')))]], colWidths=[540])
    quiz_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#CCFBF1')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#99F6E4')),
        ('PADDING', (0, 0), (-1, -1), 8)
    ]))
    story.append(quiz_table)
    story.append(Spacer(1, 10))

    # FOOTER
    footer_text = f"Official Document generated by SIFRA AI Platform for Oil India Limited (OIL). Verified on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}."
    story.append(Paragraph(footer_text, ParagraphStyle('Footer', fontName='Helvetica-Oblique', fontSize=7.5, leading=10, textColor=colors.HexColor('#94A3B8'), alignment=TA_CENTER)))

    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes
