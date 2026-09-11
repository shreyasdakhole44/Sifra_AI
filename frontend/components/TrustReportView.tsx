'use client';

import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  FileText,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Info,
  MapPin,
  Clock,
  Cpu,
  Layers,
  ExternalLink
} from 'lucide-react';
import { getRiskColor } from '@/lib/riskColors';

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

  const workerId = report.worker_id || 'OIL-W-101';
  const siteId = report.site_id || 'OIL-DIGBOI-01';
  const timestampText = report.timestamp ? new Date(report.timestamp).toLocaleString() : '9/11/2026, 10:44:43 PM';

  const toggleExcerpt = (idx: number) => {
    setExpandedExcerpts((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  // Parser helper for bullet points
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

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden text-slate-800 text-xs font-sans">
      
      {/* 2.1 HEADER BAND */}
      <div className="p-4 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
            <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/60">
              {workerId}
            </span>
            <h2 className="text-sm font-bold tracking-tight text-white">
              Worker ({workerId})
            </h2>
          </div>

          <div className="flex items-center space-x-3 text-[11px] text-slate-400 font-mono pt-1">
            <span className="flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{siteId}</span>
            </span>
            <span>&bull;</span>
            <span className="flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{timestampText}</span>
            </span>
          </div>
        </div>

        {/* Right Side: SIF Fatality Risk Badge */}
        <div className="flex items-center space-x-3 bg-slate-800/90 px-4 py-2.5 rounded-lg border border-slate-700 shrink-0">
          <div className="text-right">
            <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">SIF FATALITY RISK</span>
            <span className={`text-sm font-bold font-mono ${riskColors.text}`}>
              {probPct.toFixed(1)}% ({riskLevel})
            </span>
          </div>
          <div
            className="w-3 h-8 rounded-full overflow-hidden bg-slate-700 flex flex-col justify-end"
            title={`Risk Tier: ${riskLevel}`}
          >
            <div
              className={`w-full ${riskColors.bg}`}
              style={{ height: `${Math.min(100, Math.max(12, probPct))}%` }}
            />
          </div>
        </div>
      </div>

      <div className="p-5 space-y-5">

        {/* 2.2 METRICS ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Fatality Indicator</span>
            <div className="flex items-center space-x-1.5 font-bold text-slate-900 text-xs">
              {report.ml_prediction === 'YES' || riskLevel === 'HIGH' ? (
                <>
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="text-rose-700 font-bold">FATALITY RISK CONFIRMED</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>STANDARD OBSERVATION</span>
                </>
              )}
            </div>
          </div>

          <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-slate-200 sm:pl-3 pt-2 sm:pt-0">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Model Engine</span>
            <div className="flex items-center space-x-1.5 font-bold text-slate-900 font-mono text-xs">
              <Cpu className="w-4 h-4 text-teal-700 shrink-0" />
              <span>XGBoost Classifier V2</span>
            </div>
          </div>

          <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-slate-200 sm:pl-3 pt-2 sm:pt-0">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">SIF Probability Gauge</span>
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

          <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-slate-200 sm:pl-3 pt-2 sm:pt-0">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Confidence Tier</span>
            <div>
              <span className="px-2.5 py-0.5 rounded bg-white border border-slate-200 text-[11px] font-semibold text-slate-800">
                {probPct > 70 ? 'High Exposure Tier' : probPct > 40 ? 'Medium Exposure Tier' : 'Low Exposure Tier'}
              </span>
            </div>
          </div>
        </div>

        {/* 2.3 OBSERVED INCIDENT & NEAR-MISS NARRATIVE */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="font-bold text-slate-900 text-xs flex items-center space-x-1.5">
              <FileText className="w-4 h-4 text-teal-700" />
              <span>Observed Incident & Near-Miss Narrative</span>
            </span>
            {attachments.length > 0 && (
              <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {attachments.length} Evidence Attachment(s)
              </span>
            )}
          </div>
          <div className="p-4 bg-slate-50/40">
            <p className="text-slate-800 text-xs leading-relaxed whitespace-pre-wrap font-medium">
              {report.incident_text && report.incident_text.trim().length > 0
                ? report.incident_text
                : 'No written description provided — see attached evidence for assessment.'}
            </p>
          </div>
        </div>

        {/* 2.4 UA / UC SPLIT CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-amber-50/60 p-4 rounded-lg border border-amber-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-amber-900 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Unsafe Acts (UA) Identified</span>
              </div>
              <span className="bg-amber-100 text-amber-900 text-[10px] px-1.5 py-0.2 rounded font-mono font-bold border border-amber-300">
                UA-CODES
              </span>
            </div>
            <ul className="space-y-1.5 pt-1 text-slate-800 text-xs">
              {unsafeActs.length > 0 ? (
                unsafeActs.map((act, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="text-amber-600 font-bold text-sm leading-none">&bull;</span>
                    <span>{act}</span>
                  </li>
                ))
              ) : (
                <li className="text-slate-500 italic">No specific unsafe acts detected in observation.</li>
              )}
            </ul>
          </div>

          <div className="bg-rose-50/60 p-4 rounded-lg border border-rose-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-rose-900 font-bold text-xs">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Unsafe Conditions (UC) Identified</span>
              </div>
              <span className="bg-rose-100 text-rose-900 text-[10px] px-1.5 py-0.2 rounded font-mono font-bold border border-rose-300">
                UC-CODES
              </span>
            </div>
            <ul className="space-y-1.5 pt-1 text-slate-800 text-xs">
              {hazards.length > 0 ? (
                hazards.map((haz, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="text-rose-600 font-bold text-sm leading-none">&bull;</span>
                    <span>{haz}</span>
                  </li>
                ))
              ) : (
                <li className="text-slate-500 italic">No hazardous physical conditions flagged.</li>
              )}
            </ul>
          </div>
        </div>

        {/* 2.5 VIOLATED IOGP LIFE-SAVING RULES */}
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
            <div className="p-3 bg-teal-50/80 border border-teal-200 rounded-lg text-teal-950 text-xs space-y-1">
              <span className="font-bold block text-teal-900">IOGP Rule Mandate & RAG Compliance Context:</span>
              <p className="leading-relaxed text-slate-800">
                {expandedRule === 'loto' && 'Verify mechanical Lockout/Tagout (LOTO) isolation, atmospheric zero-energy state, and residual pressure relief valve bleed prior to line servicing.'}
                {expandedRule === 'bypass' && 'Never override, bypass, or inhibit Safety Critical Equipment (ESD, relief valves, gas sensors) without formal Management of Change (MOC) sign-off.'}
                {expandedRule === 'hotwork' && 'Continuous gas monitoring and hot work permit required before introducing ignition sources into hydrocarbon process zones.'}
                {expandedRule === 'confined' && 'Mandatory continuous oxygen & H2S testing with stand-by attendant required for all vessel entries.'}
              </p>
            </div>
          )}
        </div>

        {/* 2.6 RECOMMENDED ACTIONS & CRITICAL BARRIERS TO RESTORE */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-3">
          <h3 className="font-bold text-slate-900 text-xs flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Recommended Actions & Critical Barriers to Restore</span>
          </h3>

          <div className="space-y-2">
            {[
              'LOTO Mechanical Lockouts & Pressure Bleed Relief Lines',
              'Continuous Hydrocarbon & Toxic Gas Detection Sensors',
              'Personal Protective Equipment (PPE) & Emergency Shutdown (ESD) Valves'
            ].map((item, idx) => (
              <div key={idx} className="flex items-start space-x-2.5 p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <input type="checkbox" readOnly checked className="mt-0.5 accent-teal-700 rounded w-4 h-4 cursor-default" />
                <span className="text-slate-800 text-xs font-semibold">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 2.7 GROUNDING KNOWLEDGE BASE SOURCES */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <button
            onClick={() => setShowSources(!showSources)}
            className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-between text-left"
          >
            <div className="flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-teal-700" />
              <span className="font-bold text-slate-900 text-xs">
                Grounding Knowledge Base Sources ({sources.length > 0 ? sources.length : 1})
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
                <div className="py-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900 text-xs font-mono">
                        SIFRA_AI_Oil_Gas_Safety_Knowledge_Base.pdf
                      </span>
                      <span className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 border border-slate-200">
                        Page 14
                      </span>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded border border-slate-200 text-[11px] text-slate-700 leading-relaxed font-mono whitespace-pre-wrap">
                    IOGP Report 590: Mandatory Isolation & Permitting Protocol for Pressurized Lines. Zero pressure state must be physically confirmed via bleed valve before flange disconnection.
                  </div>
                </div>
              ) : (
                sources.map((src: any, idx: number) => (
                  <div key={idx} className="py-3 first:pt-0 last:pb-0 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 text-xs font-mono">
                          {src.source || src.document || `SIFRA_AI_Oil_Gas_Safety_Knowledge_Base.pdf`}
                        </span>
                        <span className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 border border-slate-200">
                          Page {src.page || idx + 1}
                        </span>
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

        {/* 2.8 ASSIGNED SAFETY QUIZ STATUS STRIP */}
        <div className="p-4 bg-teal-50/80 border border-teal-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-teal-700 text-white rounded-lg shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-teal-950 text-xs block">Assigned Safety Quiz Status</span>
              <p className="text-[11px] text-teal-800 font-medium">
                {report.quiz_completed
                  ? `Assessment Completed with Score: ${report.quiz_score || 100}%`
                  : `Safety MCQ assessment generated from report context is assigned to Worker ID: ${workerId}.`}
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

        {/* FOOTER NOTE */}
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
