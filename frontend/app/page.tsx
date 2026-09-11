'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/authContext';
import {
  ShieldAlert,
  Activity,
  FileText,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Lock,
  Database,
  Cpu,
  Layers,
  Users,
  Building2,
  ExternalLink,
  ChevronRight,
  Menu,
  X,
  ShieldCheck,
  Zap,
  Sliders,
  Award,
  Sparkles,
  RefreshCw,
  Search
} from 'lucide-react';

export default function PublicLandingPage() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSampleIndex, setActiveSampleIndex] = useState(0);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [ragExpanded, setRagExpanded] = useState(true);

  const dashboardHref = user
    ? (user.role === 'Worker' ? '/worker' : '/admin')
    : '/login';

  // Demo Incident Samples for Section 3 Showcase
  const sampleIncidents = [
    {
      id: 'OIL-W-101',
      title: 'Wellhead LOTO Breach',
      site: 'OIL-DIGBOI-01',
      timestamp: 'Today, 08:15 hrs',
      riskScore: 78.4,
      riskLevel: 'HIGH',
      narrative: 'High pressure gas surge detected on rig manifold valve. Worker attempted manual valve clearance without prior mechanical Lockout/Tagout (LOTO) isolation verification.',
      unsafeActs: ['Attempting valve clearance before positive LOTO isolation', 'Entering line-of-fire zone near pressurized manifold'],
      unsafeConditions: ['LOTO tag unconfirmed at isolation point', 'Incomplete exclusion barrier around pressurized work area'],
      iogpRules: [
        { id: 'loto', name: 'Energy Isolation / LOTO', desc: 'Verify isolation and zero energy state before starting work.' },
        { id: 'lineoffire', name: 'Line of Fire', desc: 'Position yourself away from pressurized release paths.' }
      ],
      ragSource: 'IOGP Report 590, Section 4.2: Mechanical Isolation Verification & Depressurization Guidelines'
    },
    {
      id: 'OIL-W-102',
      title: 'Elevated Derrick Pipe Rack',
      site: 'OIL-DULIAJAN-01',
      timestamp: 'Today, 09:40 hrs',
      riskScore: 84.1,
      riskLevel: 'HIGH',
      narrative: 'Worker observed walking along elevated pipe rack at 4.5m height without clipping safety harness lanyard to overhead lifeline anchor point.',
      unsafeActs: ['Working at height without 100% safety harness tie-off', 'Walking along unbarricaded pipe rack elevated route'],
      unsafeConditions: ['Absence of temporary lifeline anchor overhead', 'Slippery oil residue on elevated structural beam'],
      iogpRules: [
        { id: 'height', name: 'Working at Height', desc: 'Use fall protection when working outside protected areas at 1.8m or above.' }
      ],
      ragSource: 'OIL Safe Work Practice Manual (SWP-04): Working at Elevated Pipe Racks & Lifeline Anchor Standards'
    },
    {
      id: 'OIL-W-103',
      title: 'Separator Hot Work & Grinding',
      site: 'OIL-MORAN-01',
      timestamp: 'Today, 10:05 hrs',
      riskScore: 42.1,
      riskLevel: 'MEDIUM',
      narrative: 'Spark grinding work initiated near hydrocarbon separator vessel prior to logging continuous LEL gas test clearance readings.',
      unsafeActs: ['Executing spark work before completing gas test sign-off', 'Positioning grinding equipment within 3m of vessel flange'],
      unsafeConditions: ['Unmonitored LEL gas concentration near separator tank', 'Fire blanket shield insufficiently draped around spark line'],
      iogpRules: [
        { id: 'hotwork', name: 'Hot Work & Ignition Control', desc: 'Identify hazardous atmosphere and clear flammables before spark work.' }
      ],
      ragSource: 'IOGP Report 590, Section 6.1: Flammable Atmosphere Testing & Hot Work Clearance Requirements'
    }
  ];

  const currentSample = sampleIncidents[activeSampleIndex];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col justify-between selection:bg-teal-700 selection:text-white">
      
      {/* 1. STICKY GLASSMORPHIC NAVIGATION */}
      <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-12 flex items-center justify-between sticky top-0 z-50 shadow-xs">
        
        {/* Brand Logo & Tag */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-teal-700 text-white rounded-lg flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
            <ShieldAlert className="w-5 h-5 text-teal-100" />
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">SIFRA AI</span>
            <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200 font-semibold hidden sm:inline-block">
              OIL HSE CORP
            </span>
          </div>
        </div>

        {/* Center Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center space-x-6 lg:space-x-8 text-sm font-medium text-slate-600">
          <a href="#platform" className="hover:text-teal-700 transition-colors">
            Platform Architecture
          </a>
          <a href="#rules" className="hover:text-teal-700 transition-colors">
            Life-Saving Rules
          </a>
          <a href="#trust-report" className="hover:text-teal-700 transition-colors">
            Live Trust Report
          </a>
          <a href="#worker-experience" className="hover:text-teal-700 transition-colors">
            Worker Portal
          </a>
        </nav>

        {/* Right CTA Group (Desktop) */}
        <div className="hidden md:flex items-center space-x-3">
          <Link
            href="/login"
            className="text-sm font-medium text-slate-700 hover:text-teal-700 px-3 py-1.5 transition-colors"
          >
            Worker Portal
          </Link>
          <Link
            href={dashboardHref}
            className="bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-sm transition-colors flex items-center space-x-1.5"
          >
            <span>Officer Portal</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="md:hidden flex items-center space-x-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 min-h-[44px] min-w-[44px] text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 flex items-center justify-center"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Sheet Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-16 z-40 bg-white border-b border-slate-200 p-4 space-y-3 shadow-lg animate-in slide-in-from-top-2">
          <nav className="flex flex-col space-y-2 text-sm font-semibold text-slate-700">
            <a
              href="#platform"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Platform Architecture
            </a>
            <a
              href="#rules"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Life-Saving Rules
            </a>
            <a
              href="#trust-report"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Live Trust Report Showcase
            </a>
            <a
              href="#worker-experience"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Worker Mobile Experience
            </a>
          </nav>
          <div className="pt-3 border-t border-slate-100 flex flex-col space-y-2">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2.5 min-h-[44px] text-center bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg text-xs transition-colors flex items-center justify-center"
            >
              Worker Sign-In
            </Link>
            <Link
              href={dashboardHref}
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2.5 min-h-[44px] text-center bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-lg text-xs transition-colors flex items-center justify-center space-x-1.5"
            >
              <span>Launch Officer Control Room</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      <main className="flex-1">
        
        {/* 2. ENTERPRISE HERO SECTION */}
        <section className="py-12 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto border-b border-slate-200">
          <div className="space-y-6 text-center max-w-4xl mx-auto">
            
            {/* Status Badge */}
            <div className="inline-flex items-center gap-1.5 bg-teal-50 text-teal-800 border border-teal-200 font-mono text-xs px-3.5 py-1.5 rounded-full shadow-xs">
              <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
              <span>OIL INDIA LIMITED • CRITICAL SIF MITIGATION PLATFORM</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Predict Industrial Severe Injuries & Fatalities Before Loss of Containment.
            </h1>

            {/* Narrative Subtitle */}
            <p className="text-sm sm:text-base lg:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
              Real-time near-miss log vectorization, ML-driven SIF probability modeling, and automated IOGP safety barrier verification engineered for active operational complexes.
            </p>

            {/* Action Group */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Link
                href={dashboardHref}
                className="w-full sm:w-auto h-11 px-6 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-sm rounded-lg shadow-sm transition-colors flex items-center justify-center space-x-2"
              >
                <span>Launch Officer Control Room</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                onClick={() => setShowBatchModal(true)}
                className="w-full sm:w-auto h-11 px-6 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-lg shadow-xs transition-colors flex items-center justify-center space-x-2"
              >
                <Sparkles className="w-4 h-4 text-teal-700" />
                <span>Simulate Incident Batch</span>
              </button>
            </div>

            {/* Metric Verification Band */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto mt-10 text-left">
              <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">82.22%</div>
                <div className="text-xs font-semibold text-slate-600 mt-1">Tabular ML Accuracy</div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">XGBoost V2 Model</div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
                <div className="text-2xl sm:text-3xl font-extrabold text-teal-700 font-mono">9 Rules</div>
                <div className="text-xs font-semibold text-slate-600 mt-1">IOGP Life-Saving Rules</div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">Verified In Real-Time</div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">&lt;200ms</div>
                <div className="text-xs font-semibold text-slate-600 mt-1">Neural RAG Retrieval</div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">FAISS + BM25 Search</div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 font-mono">100%</div>
                <div className="text-xs font-semibold text-slate-600 mt-1">Audit Trail Grounding</div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">IOGP 590 Citation Basis</div>
              </div>
            </div>

          </div>
        </section>

        {/* 3. INTERACTIVE LIVE AI TRUST REPORT SHOWCASE */}
        <section id="trust-report" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto border-b border-slate-200">
          <div className="space-y-8">
            
            {/* Section Header */}
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-mono font-bold text-teal-800 uppercase tracking-wider bg-teal-50 px-2.5 py-1 rounded border border-teal-200">
                Interactive Product Demonstration
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Live AI Trust Report Showcase
              </h2>
              <p className="text-sm text-slate-600">
                Select an operational incident scenario below to inspect how SIFRA AI extracts precursors, calculates probability, and grounds recommendations.
              </p>
            </div>

            {/* Interactive Scenario Selector Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto">
              {sampleIncidents.map((sample, idx) => (
                <button
                  key={sample.id}
                  onClick={() => setActiveSampleIndex(idx)}
                  className={`px-4 py-2.5 rounded-lg text-xs font-semibold transition-all min-h-[44px] flex items-center space-x-2 border ${
                    activeSampleIndex === idx
                      ? 'bg-teal-700 text-white border-teal-700 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${activeSampleIndex === idx ? 'bg-emerald-300' : 'bg-slate-400'}`} />
                  <span>{sample.title}</span>
                  <span className="font-mono text-[11px] opacity-80">({sample.id})</span>
                </button>
              ))}
            </div>

            {/* Live Trust Report Card Preview */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden max-w-4xl mx-auto">
              
              {/* Card Header Band */}
              <div className="p-4 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800">
                <div className="flex items-center space-x-3">
                  <span className="font-mono text-xs font-bold text-teal-400 bg-slate-800 px-2.5 py-1 rounded border border-slate-700">
                    {currentSample.id}
                  </span>
                  <span className="text-xs font-semibold text-slate-200">
                    Site: {currentSample.site} &bull; {currentSample.timestamp}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold uppercase ${
                    currentSample.riskLevel === 'HIGH'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}>
                    {currentSample.riskLevel} SIF RISK ({currentSample.riskScore}%)
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 sm:p-6 space-y-5">
                
                {/* Incident Narrative Callout */}
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">
                    Observed Field Narrative
                  </h4>
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                    "{currentSample.narrative}"
                  </div>
                </div>

                {/* Precursors Grid: UA & UC */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 bg-rose-50/50 border border-rose-200 rounded-lg space-y-2">
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-rose-700">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                      <span>Unsafe Acts (UA)</span>
                    </div>
                    <ul className="space-y-1 text-xs text-slate-700">
                      {currentSample.unsafeActs.map((act, i) => (
                        <li key={i} className="flex items-start space-x-1.5">
                          <span className="font-mono text-rose-600 font-bold shrink-0">&bull;</span>
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3.5 bg-amber-50/50 border border-amber-200 rounded-lg space-y-2">
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-700">
                      <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600" />
                      <span>Unsafe Conditions (UC)</span>
                    </div>
                    <ul className="space-y-1 text-xs text-slate-700">
                      {currentSample.unsafeConditions.map((cond, i) => (
                        <li key={i} className="flex items-start space-x-1.5">
                          <span className="font-mono text-amber-600 font-bold shrink-0">&bull;</span>
                          <span>{cond}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* IOGP Rules Chips */}
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">
                    IOGP Life-Saving Rules Violated / Relevant
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {currentSample.iogpRules.map((rule) => (
                      <div
                        key={rule.id}
                        className="p-2.5 bg-teal-50 border border-teal-200 rounded-lg text-xs flex items-start space-x-2"
                      >
                        <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-teal-900 block">{rule.name}</span>
                          <span className="text-[11px] text-slate-600">{rule.desc}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* RAG Grounding Citation Box */}
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setRagExpanded(!ragExpanded)}
                    className="w-full p-3 bg-slate-50 flex items-center justify-between text-xs font-semibold text-slate-800 hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <BookOpen className="w-4 h-4 text-teal-700" />
                      <span>Neural RAG Reference Citation</span>
                    </div>
                    <span className="text-[11px] font-mono text-teal-700 font-bold">
                      {ragExpanded ? 'Collapse ▲' : 'Expand Citation ▼'}
                    </span>
                  </button>

                  {ragExpanded && (
                    <div className="p-3.5 bg-white text-xs text-slate-700 space-y-1.5 border-t border-slate-200 font-mono">
                      <div className="text-[11px] text-slate-500 font-bold uppercase">Primary Document Match:</div>
                      <div className="p-2 bg-slate-50 rounded border border-slate-200 text-slate-800 font-sans leading-relaxed">
                        "{currentSample.ragSource}"
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>

          </div>
        </section>

        {/* 4. CAPABILITY SECTION & PROCESS TIMELINE */}
        <section id="platform" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto border-b border-slate-200">
          <div className="space-y-12">
            
            {/* Header */}
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-mono font-bold text-teal-800 uppercase tracking-wider bg-teal-50 px-2.5 py-1 rounded border border-teal-200">
                Core Safety Architecture
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Safety Intelligence Built for Field Operations
              </h2>
              <p className="text-sm text-slate-600">
                Engineered specifically to solve severe hazard detection gaps across oil fields, rigs, and refineries.
              </p>
            </div>

            {/* 4 Capability Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-3 hover:border-teal-300 transition-colors">
                <div className="w-10 h-10 bg-teal-50 text-teal-700 rounded-lg flex items-center justify-center font-bold">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-slate-900">SIF Precursor Detection</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Identify serious-injury and fatality precursors from field observations and near-miss reports in real time.
                </p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-3 hover:border-teal-300 transition-colors">
                <div className="w-10 h-10 bg-teal-50 text-teal-700 rounded-lg flex items-center justify-center font-bold">
                  <Activity className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-slate-900">Dynamic Risk Intelligence</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Transform operational safety signals into calibrated probability scores using ensemble XGBoost models.
                </p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-3 hover:border-teal-300 transition-colors">
                <div className="w-10 h-10 bg-teal-50 text-teal-700 rounded-lg flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-slate-900">IOGP Life-Saving Rules</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Automatically map observed hazards against international oil & gas safety standards and critical barriers.
                </p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-3 hover:border-teal-300 transition-colors">
                <div className="w-10 h-10 bg-teal-50 text-teal-700 rounded-lg flex items-center justify-center font-bold">
                  <Database className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-slate-900">Grounded Trust Reports</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Provide evidence-backed safety intelligence grounded in official OIL manuals and IOGP Report 590.
                </p>
              </div>
            </div>

            {/* 5-Step Process Timeline */}
            <div id="rules" className="pt-6">
              <h3 className="text-center font-extrabold text-lg text-slate-900 mb-8">
                From Field Observation to Safety Action
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
                {[
                  { step: '01', title: 'Capture', desc: 'Single report or batch PDF upload from HSE field rounds.', icon: FileText },
                  { step: '02', title: 'Analyze', desc: 'NLP hazard extraction & XGBoost fatality probability scoring.', icon: Cpu },
                  { step: '03', title: 'Assess', desc: 'IOGP Life-Saving Rules & barrier failure classification.', icon: ShieldAlert },
                  { step: '04', title: 'Ground', desc: 'FAISS + BM25 RAG neural citation matching.', icon: Database },
                  { step: '05', title: 'Act', desc: 'Dispatches 10-question quiz & updates worker leaderboard.', icon: Award }
                ].map((item) => {
                  const IconComp = item.icon;
                  return (
                    <div key={item.step} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs relative flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-mono font-extrabold text-xs text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                            {item.step}
                          </span>
                          <IconComp className="w-4 h-4 text-slate-400" />
                        </div>
                        <h4 className="font-bold text-xs text-slate-900 mb-1">{item.title}</h4>
                        <p className="text-[11px] text-slate-600 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </section>

        {/* 5. ARCHITECTURE BENTO GRID */}
        <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto border-b border-slate-200">
          <div className="space-y-8">
            
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-mono font-bold text-teal-800 uppercase tracking-wider bg-teal-50 px-2.5 py-1 rounded border border-teal-200">
                System Engineering
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Enterprise AI Pipeline Infrastructure
              </h2>
            </div>

            {/* Bento Grid: 3-column desktop / 1-column mobile */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Bento 1: Multi-Worker Ingestion */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3 md:col-span-2">
                <div className="flex items-center space-x-2 text-teal-700">
                  <FileText className="w-5 h-5" />
                  <span className="font-mono text-xs font-bold uppercase">Module 01</span>
                </div>
                <h3 className="font-bold text-base text-slate-900">Multi-Worker Ingestion Engine</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Automated boundary parsing extracts individual worker observations from multi-page batch PDF logs, attaching exact worker IDs to distinct SIF evaluations.
                </p>
              </div>

              {/* Bento 2: XGBoost V2 Model */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center space-x-2 text-teal-700">
                  <Cpu className="w-5 h-5" />
                  <span className="font-mono text-xs font-bold uppercase">Module 02</span>
                </div>
                <h3 className="font-bold text-base text-slate-900">XGBoost V2 Risk Engine</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Evaluates 216k+ industrial incidents to calculate prior fatality probabilities shifted dynamically by NLP hazard intensity.
                </p>
              </div>

              {/* Bento 3: Hybrid RAG */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center space-x-2 text-teal-700">
                  <Database className="w-5 h-5" />
                  <span className="font-mono text-xs font-bold uppercase">Module 03</span>
                </div>
                <h3 className="font-bold text-base text-slate-900">Hybrid Neural RAG</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Combines FAISS dense vector search with BM25 sparse keyword matching and CrossEncoder reranking.
                </p>
              </div>

              {/* Bento 4: IOGP Rules */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center space-x-2 text-teal-700">
                  <ShieldCheck className="w-5 h-5" />
                  <span className="font-mono text-xs font-bold uppercase">Module 04</span>
                </div>
                <h3 className="font-bold text-base text-slate-900">IOGP 9 Life-Saving Rules</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Automated barrier mapping aligns near-miss observations with international oil & gas safety compliance rules.
                </p>
              </div>

              {/* Bento 5: Worker Training */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center space-x-2 text-teal-700">
                  <Award className="w-5 h-5" />
                  <span className="font-mono text-xs font-bold uppercase">Module 05</span>
                </div>
                <h3 className="font-bold text-base text-slate-900">10-Question LLM Micro-Training</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Synthesizes custom 10-question MCQ safety quizzes dispatched immediately to field technicians on mobile.
                </p>
              </div>

            </div>

          </div>
        </section>

        {/* 6. FIELD WORKER EXPERIENCE SHOWCASE */}
        <section id="worker-experience" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto border-b border-slate-200">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            
            {/* Left: Officer Operations Console */}
            <div className="space-y-4">
              <span className="text-xs font-mono font-bold text-teal-800 uppercase tracking-wider bg-teal-50 px-2.5 py-1 rounded border border-teal-200">
                Officer Operations Console
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Centralized HSE Control & Worker Dispatch
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                HSE Officers gain complete operational oversight across field complexes. Review automated SIF probability scores, issue official safety notices, and track worker training completion in real time.
              </p>

              <div className="space-y-2 pt-2 text-xs text-slate-700">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0" />
                  <span>Real-Time Multi-Site Heatmap (Digboi, Duliajan, Moran, Jorhat)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0" />
                  <span>Automated SIF Risk Flagging (&gt;50% Fatality Probability)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0" />
                  <span>Official Warning Dispatch with One-Click Worker Acknowledgment</span>
                </div>
              </div>
            </div>

            {/* Right: Worker Mobile Interface Preview Container */}
            <div className="bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-800 shadow-xl max-w-md mx-auto w-full text-white">
              <div className="border border-slate-800 bg-slate-950 rounded-xl p-4 space-y-4 font-sans text-xs">
                
                {/* Mobile Phone Mock Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 bg-teal-700 rounded-md flex items-center justify-center font-bold text-xs">
                      R
                    </div>
                    <div>
                      <span className="font-bold text-white block">Ramesh Kumar</span>
                      <span className="text-[10px] font-mono text-teal-400">OIL-W-101 &bull; Digboi Site</span>
                    </div>
                  </div>
                  <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                    Score: 91/100
                  </span>
                </div>

                {/* Mobile Alert Banner */}
                <div className="p-3 bg-amber-950/60 border border-amber-800/80 rounded-lg space-y-1">
                  <div className="flex items-center space-x-1.5 text-amber-400 font-bold text-[11px]">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>SAFETY NOTICE DISPATCHED</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Verify LOTO tag isolation before wellhead valve operation.
                  </p>
                </div>

                {/* Mobile Quiz Module Preview */}
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-teal-400">Refresher Quiz #4</span>
                    <span className="text-slate-400 font-mono">10 Questions</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug">
                    Q1. What is mandatory before operating pressurized manifold valves?
                  </p>
                  <div className="p-2 bg-teal-950/80 border border-teal-700/60 rounded text-[11px] text-teal-200 font-semibold flex items-center justify-between">
                    <span>[A] Verify LOTO isolation & zero pressure</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                  </div>
                </div>

                {/* Leaderboard Position */}
                <div className="flex items-center justify-between text-[11px] pt-1">
                  <span className="text-slate-400">Leaderboard Position:</span>
                  <span className="font-bold text-amber-400 font-mono">🥈 #2 Out of 48 Workers</span>
                </div>

              </div>
            </div>

          </div>
        </section>

        {/* 7. AI ANALYSIS TRACE / DARK EXPLAINABILITY SECTION */}
        <section className="py-12 sm:py-16 bg-slate-900 text-white border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-mono font-bold text-teal-400 uppercase tracking-wider bg-teal-950 px-2.5 py-1 rounded border border-teal-800">
                Transparent Explainability
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                AI Analysis Trace & Neural Grounding
              </h2>
              <p className="text-sm text-slate-400">
                Every calculation is auditable, evidence-backed, and grounded in official Oil India compliance standards.
              </p>
            </div>

            {/* Trace Flow */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-center text-xs font-mono">
              {[
                'Field Observation',
                'Hazard Extraction',
                'XGBoost + NLP Shift',
                'IOGP Rule Mapping',
                'Neural RAG Citation',
                'Dispatched Action'
              ].map((step, i) => (
                <div key={i} className="p-3 bg-slate-800/80 rounded-lg border border-slate-700 space-y-1">
                  <span className="text-[10px] text-teal-400 font-bold block">STEP 0{i + 1}</span>
                  <span className="font-semibold text-slate-200 block text-[11px]">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 8. CORPORATE CTA & FOOTER */}
        <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Ready to Deploy SIFRA AI Across Operational Field Sites?
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href={dashboardHref}
              className="w-full sm:w-auto h-11 px-6 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-sm rounded-lg shadow-sm transition-colors flex items-center justify-center space-x-2"
            >
              <span>Launch Officer Control Room</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto h-11 px-6 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-lg shadow-xs transition-colors flex items-center justify-center"
            >
              Worker Portal Login
            </Link>
          </div>
        </section>

      </main>

      {/* CORPORATE INDUSTRIAL FOOTER */}
      <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 py-10 px-4 sm:px-6 lg:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-white font-extrabold text-base">
              <ShieldAlert className="w-5 h-5 text-teal-400" />
              <span>SIFRA AI</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">
              Severe Injury & Fatality Risk Assessment AI engineered for Oil India Limited (OIL) field operations.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white mb-2 uppercase text-[11px] font-mono">Operational Complexes</h4>
            <ul className="space-y-1 text-[11px]">
              <li>OIL Digboi Field & Refinery</li>
              <li>OIL Duliajan Headquarters Rig Site</li>
              <li>OIL Moran Production Site</li>
              <li>OIL Jorhat Exploration Sector</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-2 uppercase text-[11px] font-mono">Navigation Links</h4>
            <ul className="space-y-1 text-[11px]">
              <li><a href="#platform" className="hover:text-white">Platform Architecture</a></li>
              <li><a href="#rules" className="hover:text-white">IOGP Life-Saving Rules</a></li>
              <li><a href="#trust-report" className="hover:text-white">Live Trust Report</a></li>
              <li><Link href="/login" className="hover:text-white">Worker & Officer Sign-In</Link></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase text-[11px] font-mono">System Health</h4>
            <div className="p-2.5 bg-slate-950 rounded border border-slate-800 inline-flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-emerald-400 text-[11px]">Platform Interface Ready</span>
            </div>
            <p className="text-[10px] text-slate-500 font-mono">
              © 2026 Oil India Limited. Enterprise Compliance System.
            </p>
          </div>

        </div>
      </footer>

      {/* BATCH SIMULATION MODAL DEMO */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 relative overflow-hidden space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-teal-700" />
                <h3 className="font-bold text-sm text-slate-900">Simulate Multi-Worker Batch Processing</h3>
              </div>
              <button
                onClick={() => setShowBatchModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              This demo simulates how SIFRA AI parses a multi-worker PDF log file into separate worker hazard reports.
            </p>

            <div className="space-y-2">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1 font-mono">
                <span className="font-bold text-teal-800 block">ENTRY 1: OIL-W-101</span>
                <p className="text-slate-700 font-sans">High pressure gas surge manifold valve LOTO safety check.</p>
                <span className="inline-block px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold text-[10px]">
                  HIGH SIF RISK (78.4%)
                </span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1 font-mono">
                <span className="font-bold text-teal-800 block">ENTRY 2: OIL-W-104</span>
                <p className="text-slate-700 font-sans">Minor oil drip tray housekeeping required near workshop floor.</p>
                <span className="inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                  LOW RISK (11.2%)
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Link
                href={dashboardHref}
                onClick={() => setShowBatchModal(false)}
                className="px-4 py-2 bg-teal-700 text-white rounded-lg text-xs font-semibold hover:bg-teal-800 flex items-center space-x-1.5"
              >
                <span>Go to Real Officer Portal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
