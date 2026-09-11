'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { adminApi, reportsApi } from '@/lib/api';
import { GeoHeatmap } from '@/components/GeoHeatmap';
import { AnalyticsCharts } from '@/components/AnalyticsCharts';
import { 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Users, 
  Activity, 
  ExternalLink,
  RefreshCw,
  FileText,
  Download,
  Send,
  Plus,
  BookOpen,
  ListTodo,
  X,
  User,
  Clock
} from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  const { user } = useAuth();
  
  const [stats, setStats] = useState<any>(null);
  const [workers, setWorkers] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'overview' | 'moderation' | 'workers'>('overview');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Modals & Drawers State
  const [selectedWorkerDetail, setSelectedWorkerDetail] = useState<any>(null);
  const [loadingWorkerDetail, setLoadingWorkerDetail] = useState(false);

  const [showWarningModal, setShowWarningModal] = useState(false);
  const [targetWorkerId, setTargetWorkerId] = useState('');
  const [warningMessage, setWarningMessage] = useState('');
  const [sendingWarning, setSendingWarning] = useState(false);

  const [showAssignTaskModal, setShowAssignTaskModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [assigningTask, setAssigningTask] = useState(false);

  const [showAssignTrainingModal, setShowAssignTrainingModal] = useState(false);
  const [trainingTitle, setTrainingTitle] = useState('IOGP Life Saving Rules Refresher');
  const [assigningTraining, setAssigningTraining] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsData, workersData, reportsData] = await Promise.all([
        adminApi.getStats(),
        adminApi.getWorkers(),
        reportsApi.list()
      ]);
      setStats(statsData);
      setWorkers(workersData);
      setReports(reportsData);
    } catch (e) {
      console.error('Error loading dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (reportId: string, newStatus: string) => {
    setUpdatingId(reportId);
    try {
      await reportsApi.updateStatus(reportId, newStatus);
      loadDashboardData();
    } catch (e) {
      alert('Error updating report status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDownloadPdf = async (reportId: string) => {
    try {
      await reportsApi.downloadPdf(reportId);
    } catch (e) {
      alert('Could not download PDF Trust Report.');
    }
  };

  const handleOpenWorkerDetail = async (workerId: string) => {
    setLoadingWorkerDetail(true);
    try {
      const detail = await adminApi.getWorkerDetail(workerId);
      setSelectedWorkerDetail(detail);
    } catch (e) {
      alert('Could not load worker detail.');
    } finally {
      setLoadingWorkerDetail(false);
    }
  };

  const handleSendWarningSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetWorkerId || !warningMessage) return;

    setSendingWarning(true);
    try {
      await adminApi.sendWarning(targetWorkerId, warningMessage, true);
      alert(`SMS Formal Warning dispatched to Worker ID: ${targetWorkerId}`);
      setShowWarningModal(false);
      setWarningMessage('');
      loadDashboardData();
    } catch (e) {
      alert('Error sending SMS warning.');
    } finally {
      setSendingWarning(false);
    }
  };

  const handleAssignTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetWorkerId || !taskTitle) return;

    setAssigningTask(true);
    try {
      await adminApi.assignTask(targetWorkerId, taskTitle, taskDesc);
      alert(`Safety task assigned to Worker ID: ${targetWorkerId}`);
      setShowAssignTaskModal(false);
      setTaskTitle('');
      setTaskDesc('');
      loadDashboardData();
    } catch (e) {
      alert('Error assigning task.');
    } finally {
      setAssigningTask(false);
    }
  };

  const handleAssignTrainingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetWorkerId) return;

    setAssigningTraining(true);
    try {
      await adminApi.assignTraining(targetWorkerId, trainingTitle);
      alert(`Safety training assigned to Worker ID: ${targetWorkerId}`);
      setShowAssignTrainingModal(false);
      loadDashboardData();
    } catch (e) {
      alert('Error assigning training.');
    } finally {
      setAssigningTraining(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center space-x-3 text-slate-500 font-medium text-xs">
          <div className="w-4 h-4 border-2 border-teal-700 border-t-transparent rounded-full animate-spin" />
          <span>Loading HSC Officer Executive Analytics...</span>
        </div>
      </div>
    );
  }

  const unassignedCount = reports.filter(r => r.status !== 'Resolved').length;

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">HSC Executive Safety & Compliance Dashboard</h1>
            <span className="bg-slate-100 text-slate-700 text-[11px] font-semibold px-2 py-0.5 rounded border border-slate-200">
              HSC Officer Control Room
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time geospatial SIF fatality risk tracking, barrier failure breakdown, SMS warnings dispatch, and moderation queue.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setTargetWorkerId(workers[0]?.worker_id || 'OIL-W-101');
              setShowWarningModal(true);
            }}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-rose-600 text-white hover:bg-rose-700 rounded-lg text-xs font-semibold shadow-sm transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send SMS Warning</span>
          </button>

          <button
            onClick={loadDashboardData}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold shadow-sm transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Reports</span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">{stats?.total_incidents || 0}</div>
          <div className="text-[11px] text-slate-500 mt-1">Logged across all OIL installations</div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">High SIF Flags</span>
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-600 mt-2 font-mono">{stats?.high_risk_count || 0}</div>
          <div className="text-[11px] text-rose-600 font-medium mt-1">&gt;50% Fatality Probability</div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Resolved Audits</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-2 font-mono">{stats?.resolved_count || 0}</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">Closed HSE audits</div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Alerts</span>
            <Activity className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600 mt-2 font-mono">{stats?.active_alerts_count || 0}</div>
          <div className="text-[11px] text-slate-500 mt-1">Twilio/Grid dispatches</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-all border-b-2 ${
            activeTab === 'overview'
              ? 'border-teal-700 text-teal-700 bg-teal-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          Interactive Leaflet.heat Map & Analytics
        </button>
        <button
          onClick={() => setActiveTab('moderation')}
          className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-all border-b-2 flex items-center space-x-2 ${
            activeTab === 'moderation'
              ? 'border-teal-700 text-teal-700 bg-teal-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <span>Moderation Queue</span>
          {unassignedCount > 0 && (
            <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {unassignedCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('workers')}
          className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-all border-b-2 ${
            activeTab === 'workers'
              ? 'border-teal-700 text-teal-700 bg-teal-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          Worker Safety Register & Status Lookup
        </button>
      </div>

      {/* TAB 1: OVERVIEW & INTERACTIVE MAP */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <GeoHeatmap sites={stats?.site_heatmaps || []} />
          <AnalyticsCharts
            riskBySite={stats?.risk_by_site || []}
            trendAnalytics={stats?.trend_analytics || []}
            uaUcBreakdown={stats?.ua_uc_breakdown || []}
          />
        </div>
      )}

      {/* TAB 2: MODERATION QUEUE */}
      {activeTab === 'moderation' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Incident Review & Corrective Action Queue</h3>
              <p className="text-xs text-slate-500">Review SIF predictions, download PDF Trust Reports, and set HSE investigation states.</p>
            </div>
            <div className="text-xs text-slate-500 font-mono">
              Showing {reports.length} total entries
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/70 text-slate-600 font-semibold border-b border-slate-200">
                  <th className="p-3">Incident Description</th>
                  <th className="p-3">Worker ID / Site</th>
                  <th className="p-3">SIF Risk Level</th>
                  <th className="p-3">Date Logged</th>
                  <th className="p-3">Current Status</th>
                  <th className="p-3 text-right">Actions & PDF Download</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {reports.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-400">
                      No reports found in moderation queue.
                    </td>
                  </tr>
                ) : (
                  reports.map((rep) => (
                    <tr key={rep.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 max-w-sm">
                        <div className="font-semibold text-slate-900 line-clamp-1">{rep.incident_text}</div>
                        <div className="text-[11px] font-mono text-slate-400 mt-0.5">ID: {rep.id}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-mono font-bold text-slate-800">{rep.worker_id || 'OIL-W-101'}</div>
                        <div className="text-[11px] text-slate-500">{rep.site_id || 'OIL-DULIAJAN'}</div>
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                          rep.risk_level === 'HIGH' 
                            ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {rep.risk_level} ({rep.ml_probability?.toFixed(0)}%)
                        </span>
                      </td>
                      <td className="p-3 text-slate-500 font-mono">
                        {new Date(rep.timestamp).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                          rep.status === 'Resolved'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : rep.status === 'Under Investigation'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {rep.status}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <select
                          disabled={updatingId === rep.id}
                          value={rep.status}
                          onChange={(e) => handleUpdateStatus(rep.id, e.target.value)}
                          className="px-2 py-1 bg-white border border-slate-300 rounded text-xs font-medium text-slate-800 focus:outline-none focus:border-teal-700 shadow-sm"
                        >
                          <option value="Pending Review">Pending Review</option>
                          <option value="Under Investigation">Under Investigation</option>
                          <option value="Action Required">Action Required</option>
                          <option value="Resolved">Resolved</option>
                        </select>

                        <button
                          onClick={() => handleDownloadPdf(rep.id)}
                          className="inline-flex items-center space-x-1 px-2 py-1 bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 rounded text-xs font-medium transition-colors"
                          title="Download Real PDF Trust Report"
                        >
                          <Download className="w-3 h-3 text-teal-700" />
                          <span>PDF</span>
                        </button>

                        <Link
                          href={`/reports/${rep.id}`}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 bg-teal-700 text-white rounded text-xs font-medium hover:bg-teal-800 transition-colors"
                        >
                          <span>Inspect</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: WORKER SAFETY REGISTER & DEEP LOOKUP */}
      {activeTab === 'workers' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Worker Safety Register & Status Check</h3>
              <p className="text-xs text-slate-500">Persistent unique worker IDs, assigned safety ratings, and lookup tool.</p>
            </div>
            <div className="text-xs text-slate-500 font-mono">
              {workers.length} Personnel Registered
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/70 text-slate-600 font-semibold border-b border-slate-200">
                  <th className="p-3">Persistent Worker ID</th>
                  <th className="p-3">Worker Name</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Assigned Site</th>
                  <th className="p-3">Incidents Logged</th>
                  <th className="p-3">Avg Risk Prob</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {workers.map((w) => (
                  <tr key={w.worker_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-mono font-bold text-teal-800">{w.worker_id}</td>
                    <td className="p-3 font-semibold text-slate-900">{w.name}</td>
                    <td className="p-3">
                      <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-200">
                        {w.status || 'Active'}
                      </span>
                    </td>
                    <td className="p-3 text-slate-700">{w.site_id}</td>
                    <td className="p-3 font-mono font-medium text-slate-800">{w.total_incidents}</td>
                    <td className="p-3 font-mono text-slate-700">{w.avg_risk_probability}%</td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => handleOpenWorkerDetail(w.worker_id)}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 rounded text-xs font-semibold transition-colors"
                      >
                        <User className="w-3 h-3 text-teal-700" />
                        <span>Status Check</span>
                      </button>

                      <button
                        onClick={() => {
                          setTargetWorkerId(w.worker_id);
                          setShowWarningModal(true);
                        }}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 rounded text-xs font-semibold transition-colors"
                      >
                        <Send className="w-3 h-3" />
                        <span>SMS Warning</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* WORKER STATUS CHECK DRAWER / MODAL */}
      {selectedWorkerDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl p-6 overflow-y-auto space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-teal-700" />
                  <h3 className="font-bold text-slate-900 text-base">Worker Status Detail</h3>
                </div>
                <button
                  onClick={() => setSelectedWorkerDetail(null)}
                  className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Worker Profile Card */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold bg-slate-200 text-slate-800 px-2 py-0.5 rounded">
                    ID: {selectedWorkerDetail.worker_id}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {selectedWorkerDetail.status}
                  </span>
                </div>

                <h4 className="text-base font-bold text-slate-900">{selectedWorkerDetail.name}</h4>
                <p className="text-xs text-slate-500 font-mono">{selectedWorkerDetail.email} • {selectedWorkerDetail.site_id}</p>
              </div>

              {/* Aggregated Stats Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white border border-slate-200 rounded text-center">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Training Completion</span>
                  <span className="text-lg font-bold text-teal-700 font-mono mt-0.5">{selectedWorkerDetail.training_completion_pct}%</span>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded text-center">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Avg Risk Probability</span>
                  <span className="text-lg font-bold text-rose-600 font-mono mt-0.5">{selectedWorkerDetail.avg_risk_probability}%</span>
                </div>
              </div>

              {/* Open Warnings List */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Issued Warnings ({selectedWorkerDetail.open_warnings_count})</h4>
                {selectedWorkerDetail.warnings?.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No formal warnings recorded.</p>
                ) : (
                  <div className="space-y-2 max-h-36 overflow-y-auto">
                    {selectedWorkerDetail.warnings?.map((w: any) => (
                      <div key={w.id} className="p-2.5 bg-rose-50 rounded border border-rose-200 text-xs">
                        <p className="font-semibold text-rose-900">{w.message}</p>
                        <span className="text-[10px] font-mono text-slate-400 mt-1 block">Issued by: {w.issued_by} • {new Date(w.timestamp).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex space-x-2">
              <button
                onClick={() => {
                  setTargetWorkerId(selectedWorkerDetail.worker_id);
                  setShowAssignTaskModal(true);
                }}
                className="flex-1 py-2 bg-slate-100 text-slate-800 font-semibold rounded text-xs hover:bg-slate-200"
              >
                Assign Task
              </button>
              <button
                onClick={() => {
                  setTargetWorkerId(selectedWorkerDetail.worker_id);
                  setShowAssignTrainingModal(true);
                }}
                className="flex-1 py-2 bg-teal-700 text-white font-semibold rounded text-xs hover:bg-teal-800"
              >
                Assign Training
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SMS WARNING DISPATCH MODAL */}
      {showWarningModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-lg p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <Send className="w-4 h-4 text-rose-600" />
                <h3 className="font-bold text-slate-900 text-sm">Dispatch Official SMS Warning</h3>
              </div>
              <button onClick={() => setShowWarningModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendWarningSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Worker ID</label>
                <input
                  type="text"
                  required
                  value={targetWorkerId}
                  onChange={(e) => setTargetWorkerId(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded text-xs font-mono text-slate-900 focus:outline-none focus:border-teal-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Warning Message (Twilio SMS)</label>
                <textarea
                  required
                  rows={3}
                  value={warningMessage}
                  onChange={(e) => setWarningMessage(e.target.value)}
                  placeholder="e.g. Mandatory PPE Notice: Helmet chin strap unfastened near Drill Rig #3. Correct immediately."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded text-xs text-slate-900 focus:outline-none focus:border-teal-700"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowWarningModal(false)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded text-xs font-semibold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingWarning}
                  className="px-4 py-1.5 bg-rose-600 text-white rounded text-xs font-semibold hover:bg-rose-700 disabled:opacity-50"
                >
                  {sendingWarning ? 'Sending...' : 'Dispatch SMS Warning'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ASSIGN TASK MODAL */}
      {showAssignTaskModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-lg p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm">Assign Corrective Safety Task</h3>
              <button onClick={() => setShowAssignTaskModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAssignTaskSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Worker ID</label>
                <input
                  type="text"
                  disabled
                  value={targetWorkerId}
                  className="w-full p-2 bg-slate-100 border border-slate-200 rounded text-xs font-mono text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Inspect Pressure Relief Valve V-204"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded text-xs text-slate-900 focus:outline-none focus:border-teal-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Task Instructions</label>
                <textarea
                  rows={2}
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  placeholder="Perform physical inspection and record pressure gauge reading."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded text-xs text-slate-900 focus:outline-none focus:border-teal-700"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAssignTaskModal(false)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assigningTask}
                  className="px-4 py-1.5 bg-teal-700 text-white rounded text-xs font-semibold hover:bg-teal-800 disabled:opacity-50"
                >
                  {assigningTask ? 'Assigning...' : 'Assign Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ASSIGN TRAINING MODAL */}
      {showAssignTrainingModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-lg p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm">Assign Mandatory Safety Training</h3>
              <button onClick={() => setShowAssignTrainingModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAssignTrainingSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Worker ID</label>
                <input
                  type="text"
                  disabled
                  value={targetWorkerId}
                  className="w-full p-2 bg-slate-100 border border-slate-200 rounded text-xs font-mono text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Training Course</label>
                <select
                  value={trainingTitle}
                  onChange={(e) => setTrainingTitle(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded text-xs font-semibold text-slate-900 focus:outline-none focus:border-teal-700"
                >
                  <option value="IOGP Life Saving Rules Refresher">IOGP Life Saving Rules Refresher</option>
                  <option value="LOTO & Energy Isolation Verification">LOTO & Energy Isolation Verification</option>
                  <option value="Hot Work & Gas Clearance Safety">Hot Work & Gas Clearance Safety</option>
                  <option value="Scaffolding & Work at Height Audit">Scaffolding & Work at Height Audit</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAssignTrainingModal(false)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assigningTraining}
                  className="px-4 py-1.5 bg-teal-700 text-white rounded text-xs font-semibold hover:bg-teal-800 disabled:opacity-50"
                >
                  {assigningTraining ? 'Assigning...' : 'Assign Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
