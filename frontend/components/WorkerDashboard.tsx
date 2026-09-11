'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { reportsApi, quizApi, workerApi } from '@/lib/api';
import { TrustReportView } from '@/components/TrustReportView';
import { QuizModal } from '@/components/QuizModal';
import {
  ShieldAlert,
  Award,
  Clock,
  FileText,
  CheckCircle2,
  AlertTriangle,
  User,
  Bell,
  BookOpen,
  CheckSquare,
  Trophy,
  ExternalLink,
  MapPin,
  RefreshCw,
  Search,
  Eye
} from 'lucide-react';
import { getRiskColor } from '@/lib/riskColors';

export function WorkerDashboard({ initialTab = 'reports' }: { initialTab?: string }) {
  const { user } = useAuth();
  const workerId = user?.worker_id || user?.id || 'OIL-W-101';
  const workerName = user?.name || 'Ramesh Kumar (Field Worker)';
  const siteId = user?.site_id || 'OIL-DIGBOI-01';

  const [activeTab, setActiveTab] = useState<string>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  const [loading, setLoading] = useState(true);

  // Data states
  const [myReports, setMyReports] = useState<any[]>([]);
  const [myWarnings, setMyWarnings] = useState<any[]>([]);
  const [myAssignedTraining, setMyAssignedTraining] = useState<any[]>([]);
  const [quizHistory, setQuizHistory] = useState<any[]>([]);
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  
  // Selected Report Modal
  const [selectedReport, setSelectedReport] = useState<any>(null);

  // Quiz Modal State
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [activeQuizReport, setActiveQuizReport] = useState<any>(null);

  useEffect(() => {
    fetchWorkerData();
  }, []);

  const fetchWorkerData = async () => {
    setLoading(true);
    try {
      const [reportsData, warningsData, trainingData, historyData, leaderboardList] = await Promise.all([
        reportsApi.list(),
        workerApi.getWarnings(),
        workerApi.getAssignedTraining(),
        quizApi.history(),
        quizApi.leaderboard().catch(() => [])
      ]);
      
      // Filter reports specifically for this worker ID
      const userReports = (reportsData || []).filter(
        (r: any) => r.worker_id === workerId || r.worker_id === user?.id || !r.worker_id
      );

      setMyReports(userReports);
      setMyWarnings(warningsData || []);
      setMyAssignedTraining(trainingData || []);
      setQuizHistory(historyData || []);
      setLeaderboardData(leaderboardList || []);
    } catch (e) {
      console.error('Error fetching worker data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledgeWarning = async (warningId: string) => {
    try {
      await workerApi.acknowledgeWarning(warningId);
      fetchWorkerData();
    } catch (e) {
      console.error('Failed to acknowledge warning:', e);
    }
  };

  const openQuizForReport = (rep: any) => {
    setActiveQuizReport(rep);
    setShowQuizModal(true);
  };

  // Metrics
  const highRiskCount = myReports.filter((r) => (r.risk_level || '').toUpperCase() === 'HIGH').length;
  const medRiskCount = myReports.filter((r) => (r.risk_level || '').toUpperCase() === 'MEDIUM').length;
  const lowRiskCount = myReports.filter((r) => (r.risk_level || '').toUpperCase() === 'LOW').length;
  const completedQuizzesCount = quizHistory.length;
  const safetyScore = Math.max(70, 100 - highRiskCount * 8 - medRiskCount * 3 + completedQuizzesCount * 2);

  return (
    <div className="space-y-6">
      {/* 1. WORKER PROFILE HEADER */}
      <div className="bg-slate-900 text-white p-5 rounded-lg border border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-teal-700 text-white flex items-center justify-center font-bold text-lg border-2 border-teal-500 shrink-0">
              {workerName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold tracking-tight text-white">{workerName}</h1>
                <span className="bg-teal-950 text-teal-400 text-[11px] font-mono font-bold px-2 py-0.5 rounded border border-teal-800">
                  {workerId}
                </span>
              </div>
              <div className="flex items-center space-x-4 text-xs text-slate-400 pt-1 font-mono">
                <span className="flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>Site: {siteId}</span>
                </span>
                <span>&bull;</span>
                <span className="text-slate-300 font-sans">Role: Field Operations Worker</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 bg-slate-800/80 p-3 rounded-lg border border-slate-700">
            <div className="text-right pr-3 border-r border-slate-700">
              <span className="block text-[10px] uppercase font-bold text-slate-400">Safety Index Score</span>
              <span className="text-base font-bold text-emerald-400 font-mono">{safetyScore}/100</span>
            </div>
            <div className="pl-1">
              <span className="block text-[10px] uppercase font-bold text-slate-400">Quizzes Completed</span>
              <span className="text-base font-bold text-teal-400 font-mono">{completedQuizzesCount} Passed</span>
            </div>
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="border-b border-slate-200 flex items-center justify-between">
        <nav className="flex space-x-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('reports')}
            className={`pb-3 flex items-center space-x-2 border-b-2 transition-all ${
              activeTab === 'reports'
                ? 'border-teal-700 text-teal-900 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>My Safety Reports ({myReports.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('alerts')}
            className={`pb-3 flex items-center space-x-2 border-b-2 transition-all ${
              activeTab === 'alerts'
                ? 'border-teal-700 text-teal-900 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Bell className="w-4 h-4 text-amber-600" />
            <span>Alerts & Notifications ({myWarnings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('quizzes')}
            className={`pb-3 flex items-center space-x-2 border-b-2 transition-all ${
              activeTab === 'quizzes'
                ? 'border-teal-700 text-teal-900 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4 text-teal-700" />
            <span>Assigned Quizzes ({myAssignedTraining.length + myReports.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`pb-3 flex items-center space-x-2 border-b-2 transition-all ${
              activeTab === 'leaderboard'
                ? 'border-teal-700 text-teal-900 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Safety Leaderboard</span>
          </button>
        </nav>

        <button
          onClick={() => fetchWorkerData()}
          className="p-1.5 bg-white border border-slate-200 rounded text-slate-500 hover:text-slate-800 transition-colors"
          title="Refresh Data"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* TAB 1: MY REPORTS HISTORY (READ-ONLY) */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          {/* Stat Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Reports Filed</span>
              <span className="text-base font-bold text-slate-900 font-mono">{myReports.length}</span>
            </div>
            <div className="bg-rose-50/60 p-3.5 rounded-lg border border-rose-200 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-rose-700 block">High SIF Incidents</span>
              <span className="text-base font-bold text-rose-700 font-mono">{highRiskCount}</span>
            </div>
            <div className="bg-amber-50/60 p-3.5 rounded-lg border border-amber-200 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-amber-700 block">Medium SIF Incidents</span>
              <span className="text-base font-bold text-amber-700 font-mono">{medRiskCount}</span>
            </div>
            <div className="bg-emerald-50/60 p-3.5 rounded-lg border border-emerald-200 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-emerald-700 block">Low Risk Observations</span>
              <span className="text-base font-bold text-emerald-700 font-mono">{lowRiskCount}</span>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-xs flex items-center space-x-1.5">
                <FileText className="w-4 h-4 text-teal-700" />
                <span>Incident & Near-Miss History (Filed by HSC Lead Officer)</span>
              </h3>
              <span className="text-[11px] text-slate-500 font-mono">Read-Only History Register</span>
            </div>

            {myReports.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No safety incident or near-miss reports recorded for your Worker ID ({workerId}) yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {myReports.map((rep) => {
                  const riskLevel = (rep.risk_level || 'LOW').toUpperCase();
                  const riskColors = getRiskColor(riskLevel);

                  return (
                    <div
                      key={rep.id || rep._id}
                      className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 max-w-xl">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${riskColors.badge}`}>
                            {riskLevel} RISK ({rep.ml_probability?.toFixed(0)}%)
                          </span>
                          <span className="text-[11px] font-mono text-slate-500">
                            {rep.site_id || 'OIL-DIGBOI-01'}
                          </span>
                          <span>&bull;</span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {rep.timestamp ? new Date(rep.timestamp).toLocaleDateString() : 'Recent'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-800 font-medium line-clamp-2 leading-relaxed">
                          {rep.incident_text}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <button
                          onClick={() => setSelectedReport(rep)}
                          className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors flex items-center space-x-1"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          <span>View Trust Report</span>
                        </button>
                        <button
                          onClick={() => openQuizForReport(rep)}
                          className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Take Quiz</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ALERTS & NOTIFICATIONS */}
      {activeTab === 'alerts' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-xs flex items-center space-x-1.5">
              <Bell className="w-4 h-4 text-amber-600" />
              <span>Official Safety Alerts & Non-Compliance Notices</span>
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">{myWarnings.length} Dispatches</span>
          </div>

          {myWarnings.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No active safety warnings or non-compliance notices assigned to your ID.
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {myWarnings.map((warn) => (
                <div key={warn.id} className="p-4 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-amber-50 text-amber-700 rounded border border-amber-200 shrink-0 mt-0.5">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-slate-900 text-xs">OFFICIAL SAFETY DISPATCH</span>
                        <span className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 border border-slate-200">
                          {warn.issued_by || 'HSC Lead Officer'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 mt-1 font-medium leading-relaxed">{warn.message}</p>
                      <span className="text-[11px] text-slate-400 mt-1 block font-mono">
                        Dispatched: {new Date(warn.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center space-x-2">
                    {warn.acknowledged ? (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Acknowledged</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleAcknowledgeWarning(warn.id)}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
                      >
                        Acknowledge Notice
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ASSIGNED SAFETY QUIZZES */}
      {activeTab === 'quizzes' && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-xs flex items-center space-x-1.5">
                <BookOpen className="w-4 h-4 text-teal-700" />
                <span>Assigned Refresher Quizzes & Assessment Modules</span>
              </h3>
            </div>

            <div className="divide-y divide-slate-200">
              {myReports.map((rep) => (
                <div key={rep.id || rep._id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="font-semibold text-slate-900 text-xs block">
                      Refresher Quiz: {rep.incident_text?.slice(0, 50)}...
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      Generated from report {rep.id?.slice(0, 8)} &bull; Site: {rep.site_id || 'OIL-DIGBOI-01'}
                    </span>
                  </div>

                  <button
                    onClick={() => openQuizForReport(rep)}
                    className="px-3.5 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs flex items-center space-x-1"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Launch Quiz</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SAFETY LEADERBOARD */}
      {activeTab === 'leaderboard' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-xs flex items-center space-x-1.5">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Oil India Limited — Operational Site Safety Leaderboard</span>
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">Q3 2026 Standings</span>
          </div>

          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200 text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3">Worker ID & Name</th>
                <th className="px-4 py-3">Operational Site</th>
                <th className="px-4 py-3">Quizzes Passed</th>
                <th className="px-4 py-3 text-right">Safety Index</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {(leaderboardData && leaderboardData.length > 0 ? leaderboardData : [
                { rank: 1, id: 'OIL-W-103', name: 'Biren Saikia', site: 'OIL-DULIAJAN-01', quizzes: 12, score: 98 },
                { rank: 2, id: workerId, name: workerName, site: siteId, quizzes: completedQuizzesCount + 4, score: safetyScore },
                { rank: 3, id: 'OIL-W-102', name: 'Manish Gogoi', site: 'OIL-MORAN-01', quizzes: 8, score: 91 },
                { rank: 4, id: 'OIL-W-104', name: 'Dipankar Das', site: 'OIL-DIGBOI-01', quizzes: 6, score: 86 },
                { rank: 5, id: 'OIL-W-105', name: 'Anil Baruah', site: 'OIL-JORHAT-01', quizzes: 5, score: 82 }
              ]).map((row: any) => {
                const isMe = row.id === workerId || row.id === user?.id;
                return (
                  <tr key={row.id} className={isMe ? 'bg-teal-50/70 font-semibold' : 'hover:bg-slate-50'}>
                    <td className="px-4 py-3 font-mono font-bold">
                      {row.rank === 1 ? '🥇 #1' : row.rank === 2 ? '🥈 #2' : row.rank === 3 ? '🥉 #3' : `#${row.rank}`}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">{row.name}</div>
                      <div className="text-[10px] font-mono text-slate-500">{row.id}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-600">{row.site}</td>
                    <td className="px-4 py-3 font-mono font-bold text-teal-800">{row.quizzes} Modules</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-emerald-700">{row.score}/100</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* READ-ONLY TRUST REPORT MODAL */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-lg border border-slate-200 shadow-2xl max-w-4xl w-full my-8 overflow-hidden">
            <div className="p-3 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <span className="font-bold text-xs flex items-center space-x-2">
                <FileText className="w-4 h-4 text-teal-400" />
                <span>AI Trust Report View (Read-Only)</span>
              </span>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-slate-400 hover:text-white px-2 py-1 text-xs font-bold"
              >
                ✕ Close
              </button>
            </div>
            <div className="p-4 max-h-[80vh] overflow-y-auto">
              <TrustReportView
                report={selectedReport}
                onTakeQuiz={() => {
                  const rep = selectedReport;
                  setSelectedReport(null);
                  openQuizForReport(rep);
                }}
                isWorkerReadOnly={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* QUIZ MODAL */}
      {showQuizModal && activeQuizReport && (
        <QuizModal
          reportId={activeQuizReport.id || activeQuizReport._id}
          incidentText={activeQuizReport.incident_text}
          onClose={() => {
            setShowQuizModal(false);
            fetchWorkerData();
          }}
        />
      )}
    </div>
  );
}
