import io
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT

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

    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=16,
        leading=20,
        textColor=colors.HexColor('#0F766E'),
        alignment=TA_LEFT
    )

    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#475569'),
        alignment=TA_LEFT
    )

    heading_style = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=colors.HexColor('#0F172A'),
        spaceBefore=10,
        spaceAfter=6
    )

    body_style = ParagraphStyle(
        'BodyTextCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#1E293B')
    )

    meta_label = ParagraphStyle(
        'MetaLabel',
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
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
            Paragraph("<b>OIL INDIA LIMITED</b><br/><font size=7.5 color='#0F766E'>HEALTH, SAFETY & ENVIRONMENT DIVISION</font>", title_style),
            Paragraph(f"<b>SIFRA AI TRUST REPORT</b><br/><font size=7.5 color='#64748B'>Report ID: {report.get('id', 'N/A')}</font>", ParagraphStyle('RightHead', parent=subtitle_style, alignment=TA_RIGHT))
        ]
    ]
    header_table = Table(header_data, colWidths=[320, 220])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6)
    ]))
    story.append(header_table)
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#0F766E'), spaceBefore=4, spaceAfter=12))

    # 2. Metadata Grid Table
    prob = report.get('ml_probability', 0.0)
    risk_level = report.get('risk_level', 'LOW')
    risk_color = colors.HexColor('#E11D48') if risk_level == 'HIGH' else colors.HexColor('#059669')

    meta_data = [
        [
            Paragraph("WORKER ID & NAME", meta_label),
            Paragraph("FACILITY / SITE", meta_label),
            Paragraph("DATE & TIME LOGGED", meta_label),
            Paragraph("FATALITY RISK SCORE", meta_label)
        ],
        [
            Paragraph(f"<b>{report.get('worker_id', 'N/A')}</b><br/>{report.get('worker_name', 'Worker')}", meta_val),
            Paragraph(f"<b>{report.get('site_id', 'OIL-DULIAJAN')}</b>", meta_val),
            Paragraph(f"{str(report.get('timestamp', datetime.now().isoformat()))[:19].replace('T', ' ')}", meta_val),
            Paragraph(f"<font color='{risk_color.hexval()}'><b>{risk_level} ({prob:.1f}%)</b></font>", meta_val)
        ]
    ]

    meta_table = Table(meta_data, colWidths=[135, 135, 140, 130])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8FAFC')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 10))

    # 3. Incident Description Box
    story.append(Paragraph("SUBMITTED SAFETY OBSERVATION / INCIDENT TEXT", heading_style))
    incident_box_data = [[Paragraph(f"<i>\"{report.get('incident_text', 'No text provided.')}\"</i>", body_style)]]
    incident_table = Table(incident_box_data, colWidths=[540])
    incident_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F1F5F9')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
        ('PADDING', (0, 0), (-1, -1), 8)
    ]))
    story.append(incident_table)
    story.append(Spacer(1, 10))

    # 4. Grounded RAG Analysis & Reasoning
    sections = report.get('structured_sections', {})
    story.append(Paragraph("EXPLAINABLE AI RISK REASONING & IOGP RULE GROUNDING", heading_style))

    reasoning_data = [
        [Paragraph("<b>Evaluated Barrier / Rule</b>", meta_label), Paragraph("<b>Grounded Findings & Technical Reasoning</b>", meta_label)],
        [
            Paragraph("Violated IOGP Rules", meta_val),
            Paragraph(str(sections.get('violated_rules', 'None identified')), body_style)
        ],
        [
            Paragraph("Failed Safety Barriers", meta_val),
            Paragraph(str(sections.get('failed_barriers', 'None identified')), body_style)
        ],
        [
            Paragraph("Root Cause Analysis", meta_val),
            Paragraph(str(sections.get('root_causes', 'Under investigation')), body_style)
        ],
        [
            Paragraph("Recommended Actions", meta_val),
            Paragraph(str(sections.get('recommendations', 'Maintain standard safety protocols')), body_style)
        ],
        [
            Paragraph("Audit Conclusion", meta_val),
            Paragraph(str(sections.get('audit_conclusion', 'Observation recorded in HSE register')), body_style)
        ]
    ]

    reasoning_table = Table(reasoning_data, colWidths=[150, 390])
    reasoning_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#E2E8F0')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('PADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(reasoning_table)
    story.append(Spacer(1, 10))

    # 5. Cited Policy Documents (RAG Grounding Citations)
    rag_sources = report.get('rag_context_sources', [])
    if rag_sources:
        story.append(Paragraph("TRACEABLE SAFETY DOCUMENT CITATIONS (RAG)", heading_style))
        source_rows = [[Paragraph("<b>Doc ID / Source</b>", meta_label), Paragraph("<b>Matched Policy Context Excerpt</b>", meta_label)]]
        for src in rag_sources[:4]:
            doc_name = src.get('file_name', src.get('source', 'IOGP Safety Policy'))
            snippet = str(src.get('snippet', src.get('content', 'Context excerpt')))[:150] + "..."
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
        story.append(sources_table)
        story.append(Spacer(1, 12))

    # 6. Sign-off Footer
    footer_text = f"Official Document generated by SIFRA AI Platform for Oil India Limited (OIL). Verified on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}."
    story.append(Paragraph(footer_text, ParagraphStyle('Footer', fontName='Helvetica-Oblique', fontSize=7.5, leading=10, textColor=colors.HexColor('#94A3B8'), alignment=TA_CENTER)))

    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes
