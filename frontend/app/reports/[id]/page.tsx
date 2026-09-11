'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { reportsApi, quizApi } from '@/lib/api';
import { useAuth } from '@/lib/authContext';
import { StructuredAnalysisCards } from '@/components/StructuredAnalysisCards';
import { QuizModal } from '@/components/QuizModal';
import { ArrowLeft, Award, Calendar, User, Building2, Download } from 'lucide-react';
import Link from 'next/link';

export default function ReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const reportId = params?.id as string;
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [showQuiz, setShowQuiz] = useState(false);
  const [quizData, setQuizData] = useState<any>(null);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  useEffect(() => {
    if (reportId) {
      loadReport();
    }
  }, [reportId]);

  const loadReport = async () => {
    setLoading(true);
    try {
      const data = await reportsApi.getById(reportId);
      setReport(data);
    } catch (e) {
      console.error('Error loading report detail:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!reportId) return;
    setDownloadingPdf(true);
    try {
      await reportsApi.downloadPdf(reportId);
    } catch (e) {
      alert('Error downloading PDF Trust Report.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleLaunchQuiz = async () => {
    setLoadingQuiz(true);
    try {
      const quiz = await quizApi.generate(reportId);
      setQuizData(quiz);
      setShowQuiz(true);
    } catch (e) {
      alert('Could not generate quiz. Please try again.');
    } finally {
      setLoadingQuiz(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      await reportsApi.updateStatus(reportId, newStatus);
      loadReport();
    } catch (e) {
      alert('Error updating status.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center space-x-3 text-slate-500 font-medium text-xs">
          <div className="w-4 h-4 border-2 border-teal-700 border-t-transparent rounded-full animate-spin" />
          <span>Loading Incident Evaluation Detail...</span>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-16 bg-white rounded-lg border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800">Report Not Found</h3>
        <p className="text-xs text-slate-500 mt-1">The requested report ID could not be retrieved from the database.</p>
        <Link href="/worker" className="text-xs text-teal-700 font-semibold mt-3 inline-block hover:underline">
          ← Back to Incident Portal
        </Link>
      </div>
    );
  }

  const isAdminOrHse = user?.role === 'Admin' || user?.role === 'HSE Officer' || user?.role === 'HSC Officer';

  return (
    <div className="space-y-6">
      
      {/* Navigation & Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Overview</span>
        </button>

        <div className="flex items-center space-x-3">
          {isAdminOrHse && (
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-500">Moderation Status:</span>
              <select
                value={report.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-700 shadow-sm"
              >
                <option value="Pending Review">Pending Review</option>
                <option value="Under Investigation">Under Investigation</option>
                <option value="Action Required">Action Required</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          )}

          <button
            onClick={handleDownloadPdf}
            disabled={downloadingPdf}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 border border-slate-300 text-slate-800 font-semibold rounded-lg text-xs hover:bg-slate-200 disabled:opacity-50 transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-teal-700" />
            <span>{downloadingPdf ? 'Downloading...' : 'Download PDF Trust Report'}</span>
          </button>

          <button
            onClick={handleLaunchQuiz}
            disabled={loadingQuiz}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-teal-700 text-white font-semibold rounded-lg text-xs shadow-sm hover:bg-teal-800 disabled:opacity-50 transition-colors"
          >
            <Award className="w-3.5 h-3.5" />
            <span>{loadingQuiz ? 'Generating Quiz...' : 'Take Safety Quiz'}</span>
          </button>
        </div>
      </div>

      {/* Incident Header Info Card */}
      <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
              ID: {report.id}
            </span>
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded ${
              report.risk_level === 'HIGH' 
                ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}>
              {report.risk_level} RISK LEVEL
            </span>
          </div>

          <div className="flex items-center space-x-4 text-xs text-slate-500">
            <div className="flex items-center space-x-1 font-mono">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>{report.worker_id || 'Worker'}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>{report.site_id || 'OIL-DULIAJAN'}</span>
            </div>
            <div className="flex items-center space-x-1 font-mono text-[11px]">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{new Date(report.timestamp).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
            Submitted Incident Description
          </span>
          <h2 className="text-sm font-semibold text-slate-900 leading-relaxed bg-slate-50 p-3 rounded border border-slate-200 font-sans">
            "{report.incident_text}"
          </h2>
        </div>
      </div>

      {/* Structured Analysis Cards Component */}
      <StructuredAnalysisCards
        prediction={report.ml_prediction}
        probability={report.ml_probability}
        riskLevel={report.risk_level}
        sections={report.structured_sections || {}}
        ragSources={report.rag_context_sources || []}
      />

      {/* Quiz Modal Render */}
      {showQuiz && quizData && (
        <QuizModal
          reportId={quizData.report_id}
          quizTitle={quizData.quiz_title}
          questions={quizData.questions || []}
          onClose={() => setShowQuiz(false)}
        />
      )}

    </div>
  );
}
