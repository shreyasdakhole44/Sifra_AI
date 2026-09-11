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
    Sanitizes LLM markdown output to clean HTML/ReportLab XML text:
    - Replaces **bold** with <b>bold</b>
    - Strips stray #, *, -, ` symbols
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
    """
    Risk color bands:
    <40%: Green (#16A34A)
    40-70%: Orange (#F59E0B)
    >70%: Red (#E11D48)
    """
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
        fontSize=15,
        leading=19,
        textColor=colors.HexColor('#0F766E'),
        alignment=TA_LEFT
    )

    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor('#475569'),
        alignment=TA_LEFT
    )

    heading_style = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=13,
        textColor=colors.HexColor('#0F172A'),
        spaceBefore=8,
        spaceAfter=4
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

    # 1. Header Banner Table
    header_data = [
        [
            Paragraph("<b>OIL INDIA LIMITED</b><br/><font size=7 color='#0F766E'>HEALTH, SAFETY & ENVIRONMENT DIVISION</font>", title_style),
            Paragraph(f"<b>SIFRA AI TRUST REPORT</b><br/><font size=7 color='#64748B'>Report ID: {report.get('id', 'N/A')}</font>", ParagraphStyle('RightHead', parent=subtitle_style, alignment=TA_RIGHT))
        ]
    ]
    header_table = Table(header_data, colWidths=[320, 220])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4)
    ]))
    story.append(header_table)
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#0F766E'), spaceBefore=2, spaceAfter=10))

    # 2. Metadata Grid Table
    prob = float(report.get('ml_probability', 0.0))
    risk_color, risk_label_text = get_pdf_risk_color(prob)

    meta_data = [
        [
            Paragraph("WORKER ID & NAME", meta_label),
            Paragraph("FACILITY / SITE", meta_label),
            Paragraph("DATE & TIME LOGGED", meta_label),
            Paragraph("FATALITY RISK SCORE", meta_label)
        ],
        [
            Paragraph(f"<b>{report.get('worker_id', 'OIL-W-101')}</b><br/>{report.get('worker_name', 'Worker')}", meta_val),
            Paragraph(f"<b>{report.get('site_id', 'OIL-DULIAJAN')}</b>", meta_val),
            Paragraph(f"{str(report.get('timestamp', datetime.now().isoformat()))[:19].replace('T', ' ')}", meta_val),
            Paragraph(f"<font color='{risk_color.hexval()}'><b>{risk_label_text} ({prob:.1f}%)</b></font>", meta_val)
        ]
    ]

    meta_table = Table(meta_data, colWidths=[135, 135, 140, 130])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8FAFC')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 10))

    # 3. Incident Description Box
    clean_incident = sanitize_markdown_text(report.get('incident_text', 'No incident description provided.'))
    story.append(Paragraph("SUBMITTED SAFETY OBSERVATION / INCIDENT TEXT", heading_style))
    incident_box_data = [[Paragraph(f"<i>\"{clean_incident}\"</i>", body_style)]]
    incident_table = Table(incident_box_data, colWidths=[540])
    incident_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F1F5F9')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
        ('PADDING', (0, 0), (-1, -1), 8)
    ]))
    story.append(incident_table)
    story.append(Spacer(1, 10))

    # 4. 7 Structured Sections (Rendered with KeepTogether)
    sections = report.get('structured_sections', {})
    
    section_map = [
        ("1. INCIDENT SUMMARY", sections.get("incident_summary")),
        ("2. ML RISK ESTIMATE", sections.get("ml_risk_estimate")),
        ("3. UA / UC ANALYSIS", sections.get("ua_uc_analysis")),
        ("4. RELEVANT HAZARDS", sections.get("relevant_hazards")),
        ("5. CRITICAL BARRIERS", sections.get("critical_barriers")),
        ("6. SAFETY OBSERVATIONS FROM KNOWLEDGE BASE", sections.get("safety_observations")),
        ("7. LIMITATIONS", sections.get("limitations"))
    ]

    for title, content in section_map:
        if content:
            clean_body = sanitize_markdown_text(content)
            sec_elements = [
                Paragraph(title, heading_style),
                Paragraph(clean_body, body_style),
                Spacer(1, 8)
            ]
            story.append(KeepTogether(sec_elements))

    # 5. Cited Policy Documents (RAG Grounding Citations)
    rag_sources = report.get('rag_context_sources', [])
    if rag_sources:
        source_rows = [[Paragraph("<b>Doc ID / Source</b>", meta_label), Paragraph("<b>Matched Policy Context Excerpt</b>", meta_label)]]
        for src in rag_sources[:4]:
            doc_name = sanitize_markdown_text(src.get('file_name', src.get('source', 'IOGP Safety Policy')))
            snippet = sanitize_markdown_text(str(src.get('snippet', src.get('content', 'Context excerpt'))))[:160] + "..."
            source_rows.append([
                Paragraph(f"<b>{doc_name}</b>", meta_val),
                Paragraph(snippet, body_style)
            ])
        
        sources_table = Table(source_rows, colWidths=[160, 380])
        sources_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#F8FAFC')),
            ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('PADDING', (0, 0), (-1, -1), 5),
        ]))
        
        citations_block = [
            Paragraph("TRACEABLE SAFETY DOCUMENT CITATIONS (RAG)", heading_style),
            sources_table,
            Spacer(1, 10)
        ]
        story.append(KeepTogether(citations_block))

    # 6. Sign-off Footer
    footer_text = f"Official Document generated by SIFRA AI Platform for Oil India Limited (OIL). Verified on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}."
    story.append(Paragraph(footer_text, ParagraphStyle('Footer', fontName='Helvetica-Oblique', fontSize=7.5, leading=10, textColor=colors.HexColor('#94A3B8'), alignment=TA_CENTER)))

    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes
