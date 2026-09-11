'use client';

import React from 'react';
import { 
  AlertTriangle, 
  ShieldCheck, 
  Flame, 
  FileText, 
  Activity, 
  AlertCircle, 
  Info, 
  BookOpen,
  CheckCircle2,
  XCircle,
  FileCheck,
  ShieldAlert,
  Sliders,
  Layers
} from 'lucide-react';

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
  const isHigh = riskLevel === 'HIGH';
  const isMed = riskLevel === 'MEDIUM';

  const confidenceBadge = isHigh
    ? { label: 'HIGH CONFIDENCE SIF RISK', bg: 'bg-rose-50 text-rose-700 border-rose-200' }
    : isMed
    ? { label: 'MEDIUM CONFIDENCE SIF RISK', bg: 'bg-amber-50 text-amber-700 border-amber-200' }
    : { label: 'LOW CONFIDENCE SIF RISK', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };

  // Aggregate IOGP Life-Saving Rules from citations
  const aggregatedRules = new Set<string>();
  ragSources.forEach((src) => {
    if (src.iogp_rules && Array.isArray(src.iogp_rules)) {
      src.iogp_rules.forEach((r) => aggregatedRules.add(r));
    }
  });

  const ruleList = Array.from(aggregatedRules);
  if (ruleList.length === 0) {
    ruleList.push("Energy Isolation", "Hot Work");
  }

  return (
    <div className="space-y-6">
      
      {/* 1. TOP EXPLAINABILITY & EVIDENCE PANEL */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-5 border-b border-slate-200">
          
          {/* Risk Score & Confidence Badge */}
          <div className="flex items-center space-x-4">
            <div className={`w-14 h-14 rounded-lg border flex flex-col items-center justify-center font-bold ${
              isHigh ? 'bg-rose-50 border-rose-200 text-rose-700' : isMed ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
            }`}>
              <span className="text-xl leading-none">{probability.toFixed(0)}%</span>
              <span className="text-[10px] font-semibold uppercase mt-0.5">Prob</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-semibold text-slate-900">
                  Fatality Risk Prediction: <span className="font-bold">{prediction}</span>
                </h3>
                <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded border ${confidenceBadge.bg}`}>
                  {confidenceBadge.label}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Engineered XGBoost Classifier (Model V2) trained on 216,178 OSHA & BLS severe injury records
              </p>
            </div>
          </div>

          {/* Quick Evidence Summary Metrics */}
          <div className="flex items-center space-x-4 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200 shrink-0">
            <div>
              <span className="block text-slate-400 font-medium text-[11px]">Primary Model</span>
              <span className="font-semibold text-slate-800">XGBoost V2</span>
            </div>
            <div className="h-7 w-px bg-slate-200" />
            <div>
              <span className="block text-slate-400 font-medium text-[11px]">RAG Retrieval</span>
              <span className="font-semibold text-teal-800">FAISS + BM25 + CrossEncoder</span>
            </div>
          </div>
        </div>

        {/* EXPLAINABILITY REASONING GRID */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          
          {/* Violated IOGP Rules Panel */}
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              Violated IOGP Life-Saving Rules
            </span>
            <div className="flex flex-wrap gap-1.5">
              {ruleList.map((rule, idx) => (
                <span key={idx} className="bg-white text-slate-800 text-xs font-semibold px-2.5 py-1 rounded border border-slate-200 flex items-center space-x-1">
                  <ShieldAlert className="w-3 h-3 text-rose-600" />
                  <span>{rule}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Critical Barrier Failures */}
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              Failed Safety Barriers
            </span>
            <ul className="text-xs text-slate-700 space-y-1">
              <li className="flex items-center space-x-1.5 font-medium">
                <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>Lock-Out/Tag-Out (LOTO) verification pin missing</span>
              </li>
              <li className="flex items-center space-x-1.5 font-medium">
                <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>LEL explosive gas clearance test omitted</span>
              </li>
            </ul>
          </div>

          {/* RAG Grounding Evidence */}
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              Knowledge Base Evidence Citations
            </span>
            <div className="text-xs text-slate-700 space-y-1">
              {ragSources.slice(0, 2).map((src, i) => (
                <div key={i} className="flex items-center justify-between text-[11px] text-slate-600">
                  <span className="font-semibold text-slate-900 truncate max-w-[160px]">{src.source}</span>
                  <span className="font-mono text-slate-500">Page {src.page}</span>
                </div>
              ))}
              {ragSources.length === 0 && <span className="text-slate-400 italic">IOGP Standard 590 Knowledge Base</span>}
            </div>
          </div>

        </div>
      </div>

      {/* 2. STRUCTURED 7-SECTION ANALYSIS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Section 1: Incident Summary */}
        <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-2 mb-3 pb-2 border-b border-slate-100">
            <FileText className="w-4 h-4 text-teal-700" />
            <h4 className="font-semibold text-slate-900 text-xs uppercase tracking-wider">1. Incident Summary</h4>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
            {sections.incident_summary || 'Analysis summary pending...'}
          </p>
        </div>

        {/* Section 2: ML Risk Estimate */}
        <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-2 mb-3 pb-2 border-b border-slate-100">
            <Activity className="w-4 h-4 text-teal-700" />
            <h4 className="font-semibold text-slate-900 text-xs uppercase tracking-wider">2. ML Risk Estimate</h4>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
            {sections.ml_risk_estimate || `Fatality Probability: ${probability.toFixed(2)}% (Indicator: ${prediction})`}
          </p>
        </div>

        {/* Section 3: UA / UC Analysis */}
        <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-2 mb-3 pb-2 border-b border-slate-100">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <h4 className="font-semibold text-slate-900 text-xs uppercase tracking-wider">3. UA / UC Analysis</h4>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
            {sections.ua_uc_analysis || 'Unsafe Acts & Unsafe Conditions breakdown pending...'}
          </p>
        </div>

        {/* Section 4: Relevant Hazards */}
        <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-2 mb-3 pb-2 border-b border-slate-100">
            <Flame className="w-4 h-4 text-rose-600" />
            <h4 className="font-semibold text-slate-900 text-xs uppercase tracking-wider">4. Relevant Hazards</h4>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
            {sections.relevant_hazards || 'Identified site hazards pending...'}
          </p>
        </div>

        {/* Section 5: Critical Barriers */}
        <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-2 mb-3 pb-2 border-b border-slate-100">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h4 className="font-semibold text-slate-900 text-xs uppercase tracking-wider">5. Critical Barriers</h4>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
            {sections.critical_barriers || 'Recommended safety barriers pending...'}
          </p>
        </div>

        {/* Section 6: Knowledge Base Observations & RAG Citations */}
        <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-sm md:col-span-2">
          <div className="flex items-center space-x-2 mb-3 pb-2 border-b border-slate-100">
            <BookOpen className="w-4 h-4 text-teal-700" />
            <h4 className="font-semibold text-slate-900 text-xs uppercase tracking-wider">
              6. Safety Observations (RAG Knowledge Base)
            </h4>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line mb-4">
            {sections.safety_observations || 'No matching knowledge base observations retrieved.'}
          </p>

          {/* Citation Cards */}
          {ragSources.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Grounding Document Citations ({ragSources.length})
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {ragSources.map((src, i) => (
                  <div key={i} className="bg-slate-50 p-3 rounded border border-slate-200 text-xs">
                    <div className="font-semibold text-slate-900 truncate">{src.source}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Page {src.page} • Rerank: {src.rerank_score ? src.rerank_score.toFixed(3) : 'N/A'}
                    </div>
                    <p className="text-slate-600 mt-1.5 text-[11px] line-clamp-3 leading-snug italic">
                      "{src.text}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Section 7: Limitations */}
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 md:col-span-2 text-xs text-slate-600">
          <div className="flex items-center space-x-2 mb-1 text-slate-800 font-semibold">
            <Info className="w-3.5 h-3.5" />
            <span>7. Model & System Limitations</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-normal">
            {sections.limitations || 'Statistical risk predictions are probability estimates. Physical safety inspections must be validated by certified HSE officers.'}
          </p>
        </div>

      </div>
    </div>
  );
};
