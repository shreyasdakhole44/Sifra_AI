'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { reportsApi, quizApi, workerApi } from '@/lib/api';
import { TrustReportView } from '@/components/TrustReportView';
import { QuizModal } from '@/components/QuizModal';
import {
  ShieldCheck,
  ClipboardList,
  Bell,
  BookOpenCheck,
  Trophy,
  Medal,
  Eye,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  RefreshCw,
  UserRound,
  FileText,
  ArrowRight
} from 'lucide-react';
import { getRiskColor } from '@/lib/riskColors';

export function WorkerDashboard({ initialTab = 'reports' }: { initialTab?: string }) {
  const { user } = useAuth();
  const workerId = user?.worker_id || user?.id || 'OIL-W-101';
  const workerName = user?.name || 'Ramesh Kumar';
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
      <div className="bg-slate-900 text-white p-5 sm:p-6 rounded-xl border border-slate-800 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          
          <div className="flex items-start sm:items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-teal-700 text-white flex items-center justify-center font-bold text-lg border-2 border-teal-500 shrink-0">
              {workerName.charAt(0).toUpperCase()}
            </div>
            
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">{workerName}</h1>
                <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-950/80 border border-emerald-800/90 px-2.5 py-0.5 rounded-full font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Safety Profile Active</span>
                </span>
              </div>
              
              <div className="text-sm text-slate-300 font-normal">Field Operations Worker</div>
              
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="font-mono text-xs text-slate-300 bg-slate-800 px-2.5 py-0.5 rounded border border-slate-700 font-medium">
                  {workerId}
                </span>
                <span className="font-mono text-xs text-slate-400 bg-slate-800 px-2.5 py-0.5 rounded border border-slate-700 font-medium flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span>Site: {siteId}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-800/90 p-3 sm:p-4 rounded-xl border border-slate-700/80 shrink-0">
            <div className="pr-4 border-r border-slate-700">
              <span className="block text-xs uppercase font-bold text-slate-400 tracking-wider">Safety Index Score</span>
              <span className="text-xl font-bold text-emerald-400 font-mono">{safetyScore} / 100</span>
            </div>
            <div className="pl-1">
              <span className="block text-xs uppercase font-bold text-slate-400 tracking-wider">Quizzes Completed</span>
              <span className="text-xl font-bold text-teal-400 font-mono">{completedQuizzesCount} Passed</span>
            </div>
          </div>

        </div>
      </div>

      {/* 2. NAVIGATION TABS */}
      <div className="border-b border-slate-200 flex items-center justify-between gap-4">
        <nav className="flex space-x-2 sm:space-x-4 overflow-x-auto whitespace-nowrap no-scrollbar py-1">
          
          <button
            onClick={() => setActiveTab('reports')}
            className={`min-h-[44px] px-4 flex items-center space-x-2 border-b-2 text-sm font-medium transition-colors ${
              activeTab === 'reports'
                ? 'border-teal-700 text-teal-800 font-semibold bg-teal-50/50 rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ClipboardList className="w-4 h-4 text-teal-700" />
            <span>Safety History ({myReports.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('alerts')}
            className={`min-h-[44px] px-4 flex items-center space-x-2 border-b-2 text-sm font-medium transition-colors ${
              activeTab === 'alerts'
                ? 'border-teal-700 text-teal-800 font-semibold bg-teal-50/50 rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bell className="w-4 h-4 text-amber-600" />
            <span>Alerts & Notifications ({myWarnings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('quizzes')}
            className={`min-h-[44px] px-4 flex items-center space-x-2 border-b-2 text-sm font-medium transition-colors ${
              activeTab === 'quizzes'
                ? 'border-teal-700 text-teal-800 font-semibold bg-teal-50/50 rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpenCheck className="w-4 h-4 text-teal-700" />
            <span>Assigned Quizzes ({myAssignedTraining.length + myReports.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`min-h-[44px] px-4 flex items-center space-x-2 border-b-2 text-sm font-medium transition-colors ${
              activeTab === 'leaderboard'
                ? 'border-teal-700 text-teal-800 font-semibold bg-teal-50/50 rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Safety Leaderboard</span>
          </button>
        </nav>

        <button
          onClick={() => fetchWorkerData()}
          className="p-2 min-h-[44px] min-w-[44px] bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors flex items-center justify-center shrink-0"
          title="Refresh Safety Data"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* TAB 1: SAFETY HISTORY */}
      {activeTab === 'reports' && (
        <div className="space-y-5">
          
          {/* Stat Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">Total Reports Filed</span>
              <span className="text-2xl font-bold text-slate-900 font-mono">{myReports.length}</span>
            </div>
            
            <div className="bg-rose-50/70 p-4 rounded-xl border border-rose-200/90 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-700 block mb-1">High SIF Incidents</span>
              <span className="text-2xl font-bold text-rose-700 font-mono">{highRiskCount}</span>
            </div>
            
            <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200/90 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 block mb-1">Medium SIF Incidents</span>
              <span className="text-2xl font-bold text-amber-700 font-mono">{medRiskCount}</span>
            </div>
            
            <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200/90 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 block mb-1">Low Risk Observations</span>
              <span className="text-2xl font-bold text-emerald-700 font-mono">{lowRiskCount}</span>
            </div>
          </div>

          {/* Incident & Near-Miss History List */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold text-slate-900 text-sm flex items-center space-x-2">
                <ClipboardList className="w-4 h-4 text-teal-700" />
                <span>Incident & Near-Miss History</span>
              </h3>
              <span className="text-xs text-slate-500 font-mono">Official Record Log</span>
            </div>

            {myReports.length === 0 ? (
              <div className="text-center py-16 px-4 space-y-2">
                <ShieldCheck className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="text-sm font-semibold text-slate-700">No safety reports yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Your submitted near-miss and safety observations will appear here once they are recorded.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {myReports.map((rep) => {
                  const riskLevel = (rep.risk_level || 'LOW').toUpperCase();
                  const riskColors = getRiskColor(riskLevel);

                  return (
                    <div
                      key={rep.id || rep._id}
                      className="p-4 sm:p-5 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-2 max-w-2xl">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold ${riskColors.badge}`}>
                            {riskLevel} RISK ({rep.ml_probability?.toFixed(0) || '0'}%)
                          </span>
                          <span className="text-xs font-mono text-slate-500">
                            {rep.site_id || 'OIL-DIGBOI-01'}
                          </span>
                          <span className="text-slate-300">&bull;</span>
                          <span className="text-xs text-slate-500 font-mono">
                            {rep.timestamp ? new Date(rep.timestamp).toLocaleDateString() : 'Recent'}
                          </span>
                        </div>
                        <p className="text-sm text-slate-800 font-medium line-clamp-2 leading-relaxed">
                          {rep.incident_text}
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
                        <button
                          onClick={() => setSelectedReport(rep)}
                          className="min-h-[44px] px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors flex items-center justify-center space-x-1.5 shadow-xs"
                        >
                          <Eye className="w-4 h-4 text-slate-500" />
                          <span>View Trust Report</span>
                        </button>
                        <button
                          onClick={() => openQuizForReport(rep)}
                          className="min-h-[44px] px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center space-x-1.5 shadow-xs"
                        >
                          <BookOpenCheck className="w-4 h-4" />
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
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 text-sm flex items-center space-x-2">
              <Bell className="w-4 h-4 text-amber-600" />
              <span>Safety Notifications & Corrective Actions</span>
            </h3>
            <span className="text-xs text-slate-500 font-mono">{myWarnings.length} Dispatches</span>
          </div>

          {myWarnings.length === 0 ? (
            <div className="text-center py-16 px-4 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h4 className="text-sm font-semibold text-slate-700">No safety notifications</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                You have no pending safety alerts or non-compliance notices assigned to your profile.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {myWarnings.map((warn) => (
                <div key={warn.id} className="p-4 sm:p-5 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start space-x-3.5">
                    <div className="p-2.5 bg-amber-50 text-amber-700 rounded-lg border border-amber-200 shrink-0 mt-0.5">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-slate-900 text-xs">OFFICIAL SAFETY DISPATCH</span>
                        <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600 border border-slate-200 font-medium">
                          {warn.issued_by || 'HSE Lead Officer'}
                        </span>
                      </div>
                      <p className="text-sm text-slate-800 font-medium leading-relaxed">{warn.message}</p>
                      <span className="text-xs text-slate-400 block font-mono">
                        Dispatched: {new Date(warn.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center justify-end">
                    {warn.acknowledged ? (
                      <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Acknowledged</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleAcknowledgeWarning(warn.id)}
                        className="min-h-[44px] px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
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
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 text-sm flex items-center space-x-2">
              <BookOpenCheck className="w-4 h-4 text-teal-700" />
              <span>Assigned Safety Assessments & Refresher Quizzes</span>
            </h3>
          </div>

          {myReports.length === 0 ? (
            <div className="text-center py-16 px-4 space-y-2">
              <BookOpenCheck className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="text-sm font-semibold text-slate-700">No assessments assigned</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Assigned safety assessments will appear here when your HSE officer dispatches them.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {myReports.map((rep) => (
                <div key={rep.id || rep._id} className="p-4 sm:p-5 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="font-semibold text-slate-900 text-sm block">
                      Refresher Quiz: {rep.incident_text?.slice(0, 60)}...
                    </span>
                    <span className="text-xs text-slate-500 font-mono block">
                      Ref Report: {rep.id?.slice(0, 8)} &bull; Site: {rep.site_id || 'OIL-DIGBOI-01'}
                    </span>
                  </div>

                  <button
                    onClick={() => openQuizForReport(rep)}
                    className="min-h-[44px] px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs flex items-center justify-center space-x-1.5 shrink-0"
                  >
                    <BookOpenCheck className="w-4 h-4" />
                    <span>Start Assessment</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: SAFETY LEADERBOARD */}
      {activeTab === 'leaderboard' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 text-sm flex items-center space-x-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Operational Site Safety Leaderboard</span>
            </h3>
            <span className="text-xs text-slate-500 font-mono">Current Standings</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200 text-xs tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">Rank</th>
                  <th className="px-4 py-3.5">Worker Name & ID</th>
                  <th className="px-4 py-3.5">Operational Site</th>
                  <th className="px-4 py-3.5">Quizzes Passed</th>
                  <th className="px-4 py-3.5 text-right">Safety Index</th>
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
                    <tr key={row.id} className={isMe ? 'bg-teal-50/80 border-l-4 border-teal-700 font-semibold' : 'hover:bg-slate-50'}>
                      <td className="px-4 py-3.5 font-mono font-bold text-sm">
                        {row.rank === 1 ? (
                          <span className="inline-flex items-center gap-1 text-amber-600">
                            <Trophy className="w-4 h-4 text-amber-500 fill-amber-400" />
                            <span>#1</span>
                          </span>
                        ) : row.rank === 2 ? (
                          <span className="inline-flex items-center gap-1 text-slate-600">
                            <Medal className="w-4 h-4 text-slate-400" />
                            <span>#2</span>
                          </span>
                        ) : row.rank === 3 ? (
                          <span className="inline-flex items-center gap-1 text-amber-700">
                            <Medal className="w-4 h-4 text-amber-700" />
                            <span>#3</span>
                          </span>
                        ) : (
                          <span className="text-slate-500">#{row.rank}</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-900 text-sm">{row.name}</div>
                        <div className="text-xs font-mono text-slate-500">{row.id}</div>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-slate-600">{row.site}</td>
                      <td className="px-4 py-3.5 font-mono font-semibold text-teal-800">{row.quizzes} Modules</td>
                      <td className="px-4 py-3.5 text-right font-mono font-bold text-emerald-700 text-sm">{row.score} / 100</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* READ-ONLY TRUST REPORT MODAL */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-4xl w-full my-8 overflow-hidden">
            <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <span className="font-semibold text-sm flex items-center space-x-2">
                <FileText className="w-4 h-4 text-teal-400" />
                <span>AI Trust Report View (Read-Only)</span>
              </span>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-slate-400 hover:text-white px-3 py-1.5 text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors"
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
