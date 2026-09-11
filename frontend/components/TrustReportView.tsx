'use client';

import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  FileText,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  BookOpen,
  Info,
  User,
  MapPin,
  Clock,
  Cpu,
  Layers,
  HelpCircle
} from 'lucide-react';
import { getRiskColor, RISK_HEX } from '@/lib/riskColors';

interface TrustReportViewProps {
  report: any;
  onTakeQuiz?: () => void;
  isWorkerReadOnly?: boolean;
}

export const TrustReportView: React.FC<TrustReportViewProps> = ({
  report,
  onTakeQuiz,
  isWorkerReadOnly = false
}) => {
  const [expandedRule, setExpandedRule] = useState<string | null>(null);
  const [showSources, setShowSources] = useState(false);
  const [expandedExcerpts, setExpandedExcerpts] = useState<Record<number, boolean>>({});

  if (!report) return null;

  const prob = report.ml_probability ?? 0;
  const probPct = prob > 1.0 ? prob : prob * 100;
  const riskLevel = (report.risk_level || 'LOW').toUpperCase();
  const riskColors = getRiskColor(riskLevel);

  const structured = report.structured_sections || {};
  const sources = report.rag_context_sources || [];
  const attachments = report.attachments || [];

  const toggleExcerpt = (idx: number) => {
    setExpandedExcerpts((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  // Helper parser for bullet points
  const parseBullets = (text: string) => {
    if (!text) return [];
    return text
      .split('\n')
      .map((l) => l.trim().replace(/^[-*•]\s*/, ''))
      .filter((l) => l.length > 0);
  };

  const unsafeActs = parseBullets(structured.ua_uc_analysis || '');
  const hazards = parseBullets(structured.relevant_hazards || '');
  const barriers = parseBullets(structured.critical_barriers || '');
  const observations = parseBullets(structured.safety_observations || '');

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden text-slate-800 text-xs">
      {/* 1. HEADER BAND */}
      <div className="p-4 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
            <span className="font-mono text-sm font-bold text-teal-400 bg-teal-950/80 px-2.5 py-0.5 rounded border border-teal-800/80">
              {report.worker_id || 'OIL-W-101'}
            </span>
            <h2 className="text-sm font-bold tracking-tight text-white">
              {report.worker_name || `Worker (${report.worker_id || 'OIL-W-101'})`}
            </h2>
          </div>

          <div className="flex items-center space-x-4 text-[11px] text-slate-400 font-mono pt-1">
            <span className="flex items-center space-x-1">
              <MapPin className="w-3 h-3 text-slate-400" />
              <span>{report.site_id || 'OIL-DULIAJAN-01'}</span>
            </span>
            <span>&bull;</span>
            <span className="flex items-center space-x-1">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>{report.timestamp ? new Date(report.timestamp).toLocaleString() : 'Recent'}</span>
            </span>
          </div>
        </div>

        {/* Prominent Risk Badge */}
        <div className="flex items-center space-x-3 bg-slate-800/80 px-3.5 py-2 rounded-lg border border-slate-700 shrink-0">
          <div className="text-right">
            <span className="block text-[10px] uppercase font-bold text-slate-400">SIF Fatality Risk</span>
            <span className={`text-sm font-bold font-mono ${riskColors.text}`}>
              {probPct.toFixed(1)}% ({riskLevel})
            </span>
          </div>
          <div
            className="w-3 h-8 rounded-full overflow-hidden bg-slate-700 flex flex-col justify-end"
            title={`Risk Level: ${riskLevel}`}
          >
            <div
              className={`w-full ${riskColors.bg}`}
              style={{ height: `${Math.min(100, Math.max(10, probPct))}%` }}
            />
          </div>
        </div>
      </div>

      <div className="p-5 space-y-6">
        {/* 2. RISK SUMMARY CARD */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500">Fatality Indicator</span>
            <div className="flex items-center space-x-1.5 font-bold text-slate-900">
              {report.ml_prediction === 'YES' || riskLevel === 'HIGH' ? (
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              )}
              <span>{report.ml_prediction === 'YES' ? 'SIF FLAGGED' : 'STANDARD OBSERVATION'}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500">Model Engine</span>
            <div className="flex items-center space-x-1.5 font-bold text-slate-900 font-mono">
              <Cpu className="w-4 h-4 text-teal-700 shrink-0" />
              <span>XGBoost Classifier V2</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500">SIF Probability Gauge</span>
            <div className="space-y-1">
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full ${riskColors.bg}`}
                  style={{ width: `${Math.min(100, probPct)}%` }}
                />
              </div>
              <span className="text-[10px] font-mono text-slate-600 block text-right font-bold">
                {probPct.toFixed(1)}% Risk Score
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500">Confidence Tier</span>
            <div className="font-semibold text-slate-900">
              <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[11px]">
                {probPct > 70 ? 'High Risk Tier' : probPct > 40 ? 'Moderate Risk Tier' : 'Low Exposure Tier'}
              </span>
            </div>
          </div>
        </div>

        {/* 3. INCIDENT DESCRIPTION CARD */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="font-bold text-slate-900 text-xs flex items-center space-x-1.5">
              <FileText className="w-3.5 h-3.5 text-teal-700" />
              <span>Observed Incident & Near-Miss Narrative</span>
            </span>
            {attachments.length > 0 && (
              <span className="text-[11px] font-mono text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                {attachments.length} Evidence Attachment(s)
              </span>
            )}
          </div>
          <div className="p-4 bg-slate-50/40">
            <p className="text-slate-800 text-xs leading-relaxed whitespace-pre-wrap font-medium">
              {report.incident_text || 'No written description provided — evidence-based assessment.'}
            </p>
          </div>
        </div>

        {/* 4. UA / UC ANALYSIS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-amber-50/50 p-4 rounded-lg border border-amber-200/80 space-y-2">
            <div className="flex items-center space-x-2 text-amber-900 font-bold text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Unsafe Acts (UA) Identified</span>
              <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.2 rounded font-mono border border-amber-300">
                UA-CODES
              </span>
            </div>
            <ul className="space-y-1.5 pt-1 text-slate-700 text-xs">
              {unsafeActs.length > 0 ? (
                unsafeActs.map((act, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="text-amber-600 font-bold text-sm leading-none">&bull;</span>
                    <span>{act}</span>
                  </li>
                ))
              ) : (
                <li className="text-slate-500 italic">No specific unsafe acts detected in report.</li>
              )}
            </ul>
          </div>

          <div className="bg-rose-50/50 p-4 rounded-lg border border-rose-200/80 space-y-2">
            <div className="flex items-center space-x-2 text-rose-900 font-bold text-xs">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>Unsafe Conditions (UC) Identified</span>
              <span className="bg-rose-100 text-rose-800 text-[10px] px-1.5 py-0.2 rounded font-mono border border-rose-300">
                UC-CODES
              </span>
            </div>
            <ul className="space-y-1.5 pt-1 text-slate-700 text-xs">
              {hazards.length > 0 ? (
                hazards.map((haz, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="text-rose-600 font-bold text-sm leading-none">&bull;</span>
                    <span>{haz}</span>
                  </li>
                ))
              ) : (
                <li className="text-slate-500 italic">No hazardous conditions flagged.</li>
              )}
            </ul>
          </div>
        </div>

        {/* 5. VIOLATED IOGP LIFE-SAVING RULES */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-xs flex items-center space-x-1.5">
              <Layers className="w-4 h-4 text-teal-700" />
              <span>Violated IOGP Life-Saving Rules</span>
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">Click rule chip to view compliance details</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { id: 'loto', name: 'Energy Isolation / LOTO', desc: 'Verify isolation and discharge stored energy before starting work.' },
              { id: 'bypass', name: 'Bypassing Safety Controls', desc: 'Obtain authorization before overriding or disabling safety critical equipment.' },
              { id: 'hotwork', name: 'Hot Work & Ignition Control', desc: 'Identify hazardous atmosphere and clear flammable materials before spark work.' },
              { id: 'confined', name: 'Confined Space Entry', desc: 'Confirm gas testing and emergency response plan before entering tanks/vessels.' }
            ].map((rule) => {
              const isSelected = expandedRule === rule.id;
              return (
                <button
                  key={rule.id}
                  onClick={() => setExpandedRule(isSelected ? null : rule.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center space-x-1.5 ${
                    isSelected
                      ? 'bg-teal-700 text-white border-teal-800 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>{rule.name}</span>
                  {isSelected ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                </button>
              );
            })}
          </div>

          {expandedRule && (
            <div className="p-3 bg-teal-50/60 border border-teal-200 rounded-lg text-teal-950 text-xs space-y-1">
              <span className="font-bold block">IOGP Rule Mandate:</span>
              <p className="leading-relaxed">
                {expandedRule === 'loto' && 'Verify mechanical Lockout/Tagout (LOTO) isolation, atmospheric zero-energy state, and residual pressure relief valve bleed prior to line servicing.'}
                {expandedRule === 'bypass' && 'Never override, bypass, or inhibit Safety Critical Equipment (ESD, relief valves, gas sensors) without formal Management of Change (MOC) sign-off.'}
                {expandedRule === 'hotwork' && 'Continuous gas monitoring and hot work permit required before introducing ignition sources into hydrocarbon process zones.'}
                {expandedRule === 'confined' && 'Mandatory continuous oxygen & H2S testing with stand-by attendant required for all vessel entries.'}
              </p>
            </div>
          )}
        </div>

        {/* 6. CRITICAL BARRIERS & RESTORATION ACTIONS */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-3">
          <h3 className="font-bold text-slate-900 text-xs flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Recommended Actions & Critical Barriers to Restore</span>
          </h3>

          <div className="space-y-2">
            {barriers.length > 0 ? (
              barriers.map((barr, idx) => (
                <div key={idx} className="flex items-start space-x-2 p-2 bg-slate-50 rounded border border-slate-100">
                  <input type="checkbox" readOnly checked className="mt-0.5 accent-teal-700 rounded" />
                  <span className="text-slate-800 text-xs font-medium">{barr}</span>
                </div>
              ))
            ) : (
              <div className="p-3 bg-slate-50 rounded border border-slate-200 text-slate-600 text-xs">
                Inspect site LOTO isolation locks, confirm gas clearance certificate, and review safety barrier audit logs with site supervisor.
              </div>
            )}
          </div>
        </div>

        {/* 7. KNOWLEDGE BASE EVIDENCE CITATIONS */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <button
            onClick={() => setShowSources(!showSources)}
            className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-between text-left"
          >
            <div className="flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-teal-700" />
              <span className="font-bold text-slate-900 text-xs">
                Grounding Knowledge Base Sources ({sources.length})
              </span>
            </div>
            <div className="flex items-center space-x-2 text-slate-500 text-xs font-medium">
              <span>{showSources ? 'Collapse' : 'Expand Sources'}</span>
              {showSources ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>

          {showSources && (
            <div className="p-4 divide-y divide-slate-200 bg-white">
              {sources.length === 0 ? (
                <div className="py-4 text-center text-slate-400 text-xs">
                  No explicit context citations stored for this record.
                </div>
              ) : (
                sources.map((src: any, idx: number) => (
                  <div key={idx} className="py-3 first:pt-0 last:pb-0 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 text-xs">
                          {src.source || src.document || `Source Document #${idx + 1}`}
                        </span>
                        {src.page && (
                          <span className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 border border-slate-200">
                            Page {src.page}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => toggleExcerpt(idx)}
                        className="text-[11px] font-semibold text-teal-700 hover:text-teal-900 flex items-center space-x-1"
                      >
                        <span>{expandedExcerpts[idx] ? 'Hide Excerpt' : 'View Excerpt'}</span>
                        {expandedExcerpts[idx] ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    </div>

                    {expandedExcerpts[idx] && (
                      <div className="p-3 bg-slate-50 rounded border border-slate-200 text-[11px] text-slate-700 leading-relaxed font-mono whitespace-pre-wrap">
                        {src.text || src.content || 'Excerpt unavailable.'}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* 8. QUIZ STATUS STRIP & CTA */}
        <div className="p-4 bg-teal-50/80 border border-teal-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-teal-700 text-white rounded-lg shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-teal-950 text-xs block">Assigned Safety Quiz Status</span>
              <p className="text-[11px] text-teal-800">
                {report.quiz_completed
                  ? `Completed with Score: ${report.quiz_score || 100}%`
                  : 'Safety MCQ assessment generated from this report context is ready for evaluation.'}
              </p>
            </div>
          </div>

          {onTakeQuiz && (
            <button
              onClick={onTakeQuiz}
              className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg font-semibold text-xs transition-colors shadow-xs shrink-0 flex items-center space-x-1.5"
            >
              <span>{report.quiz_completed ? 'Review Quiz Score' : 'Take Safety Quiz Now'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* 9. MODEL & SYSTEM LIMITATIONS FOOTER */}
        <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 flex items-center space-x-1.5">
          <Info className="w-3.5 h-3.5 shrink-0 text-slate-400" />
          <p>
            SIFRA AI fatality probabilities are statistical XGBoost risk estimates derived from OSHA/BLS datasets. All AI predictions must be paired with physical on-site HSE inspection.
          </p>
        </div>
      </div>
    </div>
  );
};
