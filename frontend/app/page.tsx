'use client';

import React from 'react';
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
  ChevronRight
} from 'lucide-react';

export default function PublicLandingPage() {
  const { user } = useAuth();

  const dashboardHref = user 
    ? (user.role === 'Worker' ? '/worker' : '/admin')
    : '/login';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col justify-between selection:bg-teal-700 selection:text-white">
      
      {/* 1. TOP NAVIGATION BAR */}
      <header className="h-16 bg-white border-b border-slate-200 px-6 lg:px-12 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-teal-700 text-white rounded-lg flex items-center justify-center font-bold text-sm shadow-xs">
            <ShieldAlert className="w-4 h-4 text-teal-100" />
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-base text-slate-900 tracking-tight">OIL SIFRA AI</span>
            <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
              OIL
            </span>
          </div>
        </div>

        {/* Anchor Links */}
        <nav className="hidden md:flex items-center space-x-8 text-xs font-semibold text-slate-600">
          <a href="#platform" className="hover:text-teal-700 transition-colors">
            Platform Capabilities
          </a>
          <a href="#how-it-works" className="hover:text-teal-700 transition-colors">
            How It Works
          </a>
          <a href="#compliance" className="hover:text-teal-700 transition-colors">
            Trust & Compliance
          </a>
        </nav>

        {/* Login / Dashboard Button */}
        <div>
          <Link
            href={dashboardHref}
            className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors inline-flex items-center space-x-1.5"
          >
            <span>{user ? 'Go to Dashboard' : 'Login'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      <main className="flex-1">
        
        {/* 2. HERO SECTION */}
        <section className="py-16 lg:py-24 px-6 lg:px-12 max-w-7xl mx-auto border-b border-slate-200">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Copy & CTAs */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center space-x-2 bg-teal-50 border border-teal-200 text-teal-800 text-[11px] font-mono font-bold px-3 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
                <span>OIL INDIA LIMITED • ENTERPRISE SAFETY PLATFORM</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                AI-Driven SIF Precursor Detection & Safety Compliance
              </h1>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Real-time Severe Injury & Fatality (SIF) risk classification powered by an XGBoost V2 machine learning model and hybrid neural RAG grounded in the 9 IOGP Life-Saving Rules for Oil India Limited (OIL) field operations.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href={dashboardHref}
                  className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-bold shadow-sm transition-colors inline-flex items-center space-x-2"
                >
                  <span>{user ? 'Open Dashboard' : 'Login to SIFRA AI'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href="#platform"
                  className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold shadow-xs transition-colors"
                >
                  Explore Architecture
                </a>
              </div>

              {/* Quick Tech Badges */}
              <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 font-mono pt-4 border-t border-slate-200">
                <span className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>XGBoost V2 (82.22% Acc)</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>FAISS + BM25 RAG</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>IOGP Report 590 Basis</span>
                </span>
              </div>
            </div>

            {/* Right Column: Static Product Visual (TrustReportView Style Mockup) */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-lg border border-slate-200 shadow-lg overflow-hidden font-sans">
                {/* Header Band */}
                <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold text-teal-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                      OIL-W-101
                    </span>
                    <span className="text-xs text-slate-300">Ramesh Kumar</span>
                  </div>
                  <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono">
                    HIGH SIF RISK (78.4%)
                  </span>
                </div>

                {/* Body Content */}
                <div className="p-4 space-y-3.5 text-xs">
                  {/* Gauge Preview */}
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Precursor Classification</span>
                      <span className="font-bold text-slate-900">High Risk of High-Consequence Incident</span>
                    </div>
                    <span className="text-lg font-bold font-mono text-rose-600">78.4%</span>
                  </div>

                  {/* Violated Rules */}
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1.5">Violated IOGP Rules</span>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="px-2 py-1 bg-amber-50 border border-amber-200 text-amber-900 text-[10px] font-semibold rounded">
                        ⚠️ Bypassing Safety Controls
                      </span>
                      <span className="px-2 py-1 bg-amber-50 border border-amber-200 text-amber-900 text-[10px] font-semibold rounded">
                        ⚠️ Line of Fire
                      </span>
                    </div>
                  </div>

                  {/* UA / UC Split */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-slate-50 rounded border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-500 block">Unsafe Act (UA-01)</span>
                      <span className="text-[11px] text-slate-700">Operating valve without LOTO isolation lock</span>
                    </div>
                    <div className="p-2 bg-slate-50 rounded border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-500 block">Unsafe Condition (UC-02)</span>
                      <span className="text-[11px] text-slate-700">Uncalibrated pressure manifold gauge</span>
                    </div>
                  </div>

                  {/* ReportLab PDF Badge */}
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>Engine: ReportLab PDF V2</span>
                    <span className="text-teal-700 font-semibold flex items-center space-x-1">
                      <FileText className="w-3 h-3" />
                      <span>Trust Report Ready</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* 3. HOW IT WORKS STRIP */}
        <section id="how-it-works" className="py-16 px-6 lg:px-12 max-w-7xl mx-auto border-b border-slate-200">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">How SIFRA AI Works</h2>
            <p className="text-xs text-slate-500 mt-2">
              An automated 4-stage pipeline translating field observations into actionable risk intelligence and worker compliance training.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Step 1 */}
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs relative space-y-3">
              <div className="w-7 h-7 bg-teal-50 text-teal-800 rounded-lg flex items-center justify-center font-bold text-xs font-mono border border-teal-200">
                01
              </div>
              <h3 className="font-bold text-sm text-slate-900">Incident & Batch Intake</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                HSM Officers file single incident notes or upload batch worker PDFs containing 5–10 multi-worker entries (<span className="font-mono">OIL-W-101</span>).
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs relative space-y-3">
              <div className="w-7 h-7 bg-teal-50 text-teal-800 rounded-lg flex items-center justify-center font-bold text-xs font-mono border border-teal-200">
                02
              </div>
              <h3 className="font-bold text-sm text-slate-900">ML Scoring & RAG Search</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                XGBoost V2 calculates SIF risk probability while dense FAISS + BM25 RAG retrieves applicable IOGP Life-Saving Rules in &lt;200ms.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs relative space-y-3">
              <div className="w-7 h-7 bg-teal-50 text-teal-800 rounded-lg flex items-center justify-center font-bold text-xs font-mono border border-teal-200">
                03
              </div>
              <h3 className="font-bold text-sm text-slate-900">Trust Report & Heatmap Update</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                System synthesizes ReportLab PDF Trust Reports, updates site risk pins on the Leaflet heatmap, and logs moderation status.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs relative space-y-3">
              <div className="w-7 h-7 bg-teal-50 text-teal-800 rounded-lg flex items-center justify-center font-bold text-xs font-mono border border-teal-200">
                04
              </div>
              <h3 className="font-bold text-sm text-slate-900">Worker Alert & Quiz Dispatch</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Target field worker receives SMS/email alert dispatches and interactive RAG-grounded safety quiz assignments (<span className="font-mono">QuizModal.tsx</span>).
              </p>
            </div>

          </div>
        </section>

        {/* 4. CORE CAPABILITIES GRID */}
        <section id="platform" className="py-16 px-6 lg:px-12 max-w-7xl mx-auto border-b border-slate-200">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Core System Capabilities</h2>
            <p className="text-xs text-slate-500 mt-2">
              Purpose-built architecture combining predictive machine learning, neural vector retrieval, and role-scoped field access.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Card 1 */}
            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs space-y-3">
              <div className="w-9 h-9 bg-slate-100 text-teal-700 rounded-lg flex items-center justify-center border border-slate-200">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">XGBoost V2 SIF Risk Model</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Trained on 216,178 real industrial records (OSHA ITA & BLS datasets) to predict SIF precursors with 82.22% Accuracy and 61.06% Recall.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs space-y-3">
              <div className="w-9 h-9 bg-slate-100 text-teal-700 rounded-lg flex items-center justify-center border border-slate-200">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Hybrid Neural RAG Grounding</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Dense FAISS + Sparse BM25 + CrossEncoder neural reranker mapped against official international safety standards (9 IOGP Life-Saving Rules).
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs space-y-3">
              <div className="w-9 h-9 bg-slate-100 text-teal-700 rounded-lg flex items-center justify-center border border-slate-200">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Downloadable PDF Trust Reports</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Automated ReportLab PDF generation producing structured executive summaries, UA/UC split analysis, failed barriers, and restoration checklists.
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs space-y-3">
              <div className="w-9 h-9 bg-slate-100 text-teal-700 rounded-lg flex items-center justify-center border border-slate-200">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Live Geo-Risk Heatmap</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Interactive Leaflet map combining density heat layers with colored site markers (<span className="font-mono">OIL-DIGBOI-01</span>, <span className="font-mono">OIL-DULIAJAN-01</span>) filtered by risk tier.
              </p>
            </div>

            {/* Card 5 */}
            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs space-y-3">
              <div className="w-9 h-9 bg-slate-100 text-teal-700 rounded-lg flex items-center justify-center border border-slate-200">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Automated Worker Safety Quizzes</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Instant RAG-grounded MCQ quiz generation (<span className="font-mono">QuizModal.tsx</span>) featuring a 70% passing threshold, retake logic, and completion history.
              </p>
            </div>

            {/* Card 6 */}
            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs space-y-3">
              <div className="w-9 h-9 bg-slate-100 text-teal-700 rounded-lg flex items-center justify-center border border-slate-200">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Strict Role-Based Access (RBAC)</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Executive Control Room for HSM Officers vs 100% read-only self-service Worker Portal ensuring zero unauthorized report creation.
              </p>
            </div>

          </div>
        </section>

        {/* 5. TRUST & COMPLIANCE STRIP */}
        <section id="compliance" className="py-12 px-6 lg:px-12 max-w-7xl mx-auto">
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-teal-700" />
                <h3 className="font-bold text-sm text-slate-900">Standardized Grounding Basis & Empirical Metrics</h3>
              </div>
              <p className="text-xs text-slate-500">
                Grounding framework built on IOGP Report 590 (9 Life-Saving Rules) and verified against 216,178 real industrial records.
              </p>
            </div>

            <div className="flex items-center space-x-6 text-xs font-mono shrink-0">
              <div className="text-center">
                <span className="block text-slate-400 text-[10px] uppercase font-sans">Accuracy</span>
                <span className="font-bold text-slate-900 text-sm">82.22%</span>
              </div>
              <div className="text-center border-l border-slate-200 pl-6">
                <span className="block text-slate-400 text-[10px] uppercase font-sans">SIF Recall</span>
                <span className="font-bold text-slate-900 text-sm">61.06%</span>
              </div>
              <div className="text-center border-l border-slate-200 pl-6">
                <span className="block text-slate-400 text-[10px] uppercase font-sans">ROC-AUC</span>
                <span className="font-bold text-slate-900 text-sm">0.8100</span>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* 6. FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-8 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-teal-700 text-white rounded flex items-center justify-center font-bold text-[10px]">
              <ShieldAlert className="w-3 h-3 text-teal-100" />
            </div>
            <span className="font-bold text-slate-900">OIL SIFRA AI</span>
            <span>&bull;</span>
            <span>Oil India Limited Enterprise Safety Platform</span>
          </div>

          <div className="flex items-center space-x-6">
            <Link href="/login" className="hover:text-teal-700 font-semibold transition-colors">
              Login Portal
            </Link>
            <span>&bull;</span>
            <span>Safety, Health & Environment (SHE) Division</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
