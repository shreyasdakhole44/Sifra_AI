'use client';

import React from 'react';
import { TrustReportView } from './TrustReportView';

interface StructuredSections {
  incident_summary?: string;
  ml_risk_estimate?: string;
  ua_uc_analysis?: string;
  relevant_hazards?: string;
  critical_barriers?: string;
  safety_observations?: string;
  limitations?: string;
}

interface StructuredAnalysisProps {
  prediction: string; // "YES" / "NO"
  probability: number;
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  sections: StructuredSections;
  ragSources?: Array<{ 
    text: string; 
    source: string; 
    page: number; 
    rerank_score?: number; 
    similarity?: number;
    iogp_rules?: string[];
  }>;
}

export const StructuredAnalysisCards: React.FC<StructuredAnalysisProps> = ({
  prediction,
  probability,
  riskLevel,
  sections,
  ragSources = []
}) => {
  const reportAdapter = {
    worker_id: 'OIL-W-101',
    worker_name: 'Ramesh Kumar (Worker)',
    site_id: 'OIL-DIGBOI-01',
    timestamp: new Date().toISOString(),
    ml_prediction: prediction,
    ml_probability: probability,
    risk_level: riskLevel,
    incident_text: sections.incident_summary || 'No written description provided.',
    structured_sections: sections,
    rag_context_sources: ragSources,
    quiz_completed: false
  };

  return <TrustReportView report={reportAdapter} />;
};
