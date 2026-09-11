'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { adminApi, reportsApi } from '@/lib/api';
import { GeoHeatmap } from '@/components/GeoHeatmap';
import { AnalyticsCharts } from '@/components/AnalyticsCharts';
import { TrustReportView } from '@/components/TrustReportView';
import { DropzoneUpload } from '@/components/DropzoneUpload';
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
  Clock,
  Layers,
  Upload,
  Eye
} from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  const { user } = useAuth();
  
  const [stats, setStats] = useState<any>(null);
  const [workers, setWorkers] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'overview' | 'moderation' | 'workers' | 'intake'>('overview');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Inspection Modal
  const [selectedReportForView, setSelectedReportForView] = useState<any>(null);

  // Single Report Submission State
  const [showSingleReportModal, setShowSingleReportModal] = useState(false);
  const [targetWorkerId, setTargetWorkerId] = useState('OIL-W-101');
  const [targetSiteId, setTargetSiteId] = useState('OIL-DIGBOI-01');
  const [reportText, setReportText] = useState('');
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
  const [submittingReport, setSubmittingReport] = useState(false);
  const [formValidationError, setFormValidationError] = useState('');

  // Batch Report Intake State
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchRawText, setBatchRawText] = useState(`OIL-W-101 Site: OIL-DIGBOI-01
Gas surge detected on rig pressure manifold valve. Required immediate emergency isolation.

OIL-W-102 Site: OIL-DULIAJAN-01
Unsafe ladder placement without safety harness lanyard anchor during height inspection.`);
  const [submittingBatch, setSubmittingBatch] = useState(false);
  const [batchResults, setBatchResults] = useState<any[]>([]);

  // Warning / Task / Training Modals
  const [selectedWorkerDetail, setSelectedWorkerDetail] = useState<any>(null);
  const [loadingWorkerDetail, setLoadingWorkerDetail] = useState(false);

  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningWorkerId, setWarningWorkerId] = useState('');
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

  const handleSingleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormValidationError('');

    const hasText = reportText.trim().length > 0;
    const hasFiles = evidenceFiles.length > 0;

    if (!hasText && !hasFiles) {
      setFormValidationError('Add a description, attach at least one evidence file, or both, to submit.');
      return;
    }

    setSubmittingReport(true);
    try {
      const created = await reportsApi.create({
        worker_id: targetWorkerId.trim() || 'OIL-W-101',
        incident_text: reportText.trim(),
        site_id: targetSiteId,
        has_files: hasFiles
      });

      if (hasFiles) {
        await reportsApi.uploadAttachments(created.id, evidenceFiles);
      }

      alert(`Near-Miss / Incident Report submitted successfully for Worker ${targetWorkerId}! Quiz & alert dispatched.`);
      setShowSingleReportModal(false);
      setReportText('');
      setEvidenceFiles([]);
      loadDashboardData();
    } catch (err: any) {
      console.error('Failed to submit report:', err);
      alert(err.response?.data?.detail || 'Error submitting report.');
    } finally {
      setSubmittingReport(false);
    }
  };

  const handleBatchReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchRawText.trim()) return;

    setSubmittingBatch(true);
    try {
      // Parse multi-worker text entries
      const pattern = /(OIL-W-\d+)/g;
      const matches = batchRawText.split(pattern);
      
      const entries: Array<{ worker_id: string; site_id: string; incident_text: string }> = [];
      let i = 1;
      while (i < matches.length) {
        const wId = matches[i].trim();
        const text = matches[i+1] ? matches[i+1].trim() : '';
        if (wId) {
          entries.push({
            worker_id: wId,
            site_id: text.toUpperCase().includes('DIGBOI') ? 'OIL-DIGBOI-01' : 'OIL-DULIAJAN-01',
            incident_text: text || `Batch near-miss report for ${wId}`
          });
        }
        i += 2;
      }

      if (entries.length === 0) {
        entries.push({
          worker_id: 'OIL-W-101',
          site_id: 'OIL-DIGBOI-01',
          incident_text: batchRawText.trim()
        });
      }

      const results = await reportsApi.createBatch(entries);
      setBatchResults(results);
      alert(`Batch processing complete! ${results.length} worker report(s) created & quizzes dispatched.`);
      loadDashboardData();
    } catch (err: any) {
      console.error('Batch intake error:', err);
      alert('Error processing batch intake: ' + (err.response?.data?.detail || err.message));
    } finally {
      setSubmittingBatch(false);
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
    if (!warningWorkerId || !warningMessage) return;

    setSendingWarning(true);
    try {
      await adminApi.sendWarning(warningWorkerId, warningMessage, true);
      alert(`SMS Formal Warning dispatched to Worker ID: ${warningWorkerId}`);
      setShowWarningModal(false);
      setWarningMessage('');
      loadDashboardData();
    } catch (e) {
      alert('Error sending warning.');
    } finally {
      setSendingWarning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center space-x-3 text-slate-500 font-medium text-xs">
          <div className="w-4 h-4 border-2 border-teal-700 border-t-transparent rounded-full animate-spin" />
          <span>Loading HSC Control Room & Executive Dashboard...</span>
        </div>
      </div>
    );
  }

  const unassignedCount = reports.filter(r => r.status === 'Pending Review').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">HSC Officer Control Room</h1>
            <span className="bg-teal-50 text-teal-800 text-[11px] font-mono font-bold px-2 py-0.5 rounded border border-teal-200">
              Oil India Limited Executive Command
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            File worker near-miss reports, run batch PDF intakes, view dynamic Leaflet heatmaps, and audit AI Trust Reports.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowBatchModal(true)}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center space-x-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Batch PDF Intake</span>
          </button>

          <button
            onClick={() => setShowSingleReportModal(true)}
            className="px-3.5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>File Worker Incident Report</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Logged Reports</span>
            <FileText className="w-4 h-4 text-teal-700" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">{reports.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Audit register entries</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">High SIF Flags (&gt;50%)</span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-600 mt-2 font-mono">
            {reports.filter(r => r.risk_level === 'HIGH').length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Immediate action required</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Active Field Workers</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">{workers.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Tracked across 5 sites</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Alert Dispatches</span>
            <Activity className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-600 mt-2 font-mono">{stats?.active_alerts_count || 0}</div>
          <div className="text-[11px] text-slate-500 mt-1">Twilio SMS / Email logs</div>
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
          Interactive Leaflet Risk Map & Analytics
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
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Incident Review & Corrective Action Queue</h3>
              <p className="text-xs text-slate-500">Review SIF predictions, inspect in-app Trust Reports, download ReportLab PDFs, and set status.</p>
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
                  <th className="p-3 text-right">Actions & Inspection</th>
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
                        <button
                          onClick={() => setSelectedReportForView(rep)}
                          className="inline-flex items-center space-x-1 px-2 py-1 bg-teal-50 border border-teal-200 text-teal-800 hover:bg-teal-100 rounded text-xs font-semibold transition-colors"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Inspect Report</span>
                        </button>

                        <button
                          onClick={() => handleDownloadPdf(rep.id)}
                          className="inline-flex items-center space-x-1 px-2 py-1 bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 rounded text-xs font-medium transition-colors"
                        >
                          <Download className="w-3 h-3 text-teal-700" />
                          <span>PDF</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: WORKER SAFETY REGISTER */}
      {activeTab === 'workers' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Worker Safety & Compliance Register</h3>
              <p className="text-xs text-slate-500">Perform deep worker status lookups, dispatch warnings, and assign corrective tasks.</p>
            </div>
            <div className="text-xs text-slate-500 font-mono">
              {workers.length} Tracked Workers
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/70 text-slate-600 font-semibold border-b border-slate-200">
                  <th className="p-3">Worker ID & Name</th>
                  <th className="p-3">Assigned Site</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {workers.map((w) => (
                  <tr key={w.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{w.name}</div>
                      <div className="text-[11px] font-mono text-slate-500">{w.worker_id || w.id}</div>
                    </td>
                    <td className="p-3 font-mono text-slate-700">{w.site_id || 'OIL-DIGBOI-01'}</td>
                    <td className="p-3">
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-semibold">
                        {w.status || 'Active'}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => {
                          setWarningWorkerId(w.worker_id || w.id);
                          setShowWarningModal(true);
                        }}
                        className="px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 rounded text-xs font-semibold transition-colors"
                      >
                        Warning
                      </button>
                      <button
                        onClick={() => handleOpenWorkerDetail(w.worker_id || w.id)}
                        className="px-2.5 py-1 bg-teal-700 text-white rounded text-xs font-semibold hover:bg-teal-800 transition-colors"
                      >
                        Deep Lookup
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SINGLE REPORT FILE MODAL */}
      {showSingleReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-teal-400" />
                <h3 className="font-bold text-sm">File Worker Incident / Near-Miss Report</h3>
              </div>
              <button onClick={() => setShowSingleReportModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSingleReportSubmit} className="p-5 space-y-4">
              {formValidationError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded text-xs font-semibold flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{formValidationError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Worker ID</label>
                  <input
                    type="text"
                    required
                    value={targetWorkerId}
                    onChange={(e) => setTargetWorkerId(e.target.value)}
                    placeholder="e.g. OIL-W-101"
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Operational Site ID</label>
                  <select
                    value={targetSiteId}
                    onChange={(e) => setTargetSiteId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
                  >
                    <option value="OIL-DIGBOI-01">OIL-DIGBOI-01 (Refinery & Field)</option>
                    <option value="OIL-DULIAJAN-01">OIL-DULIAJAN-01 (HQ Rig Site)</option>
                    <option value="OIL-MORAN-01">OIL-MORAN-01 (Production Site)</option>
                    <option value="OIL-JORHAT-01">OIL-JORHAT-01 (Exploration)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Incident Narrative / Observation Description
                </label>
                <textarea
                  rows={4}
                  value={reportText}
                  onChange={(e) => {
                    setReportText(e.target.value);
                    if (formValidationError) setFormValidationError('');
                  }}
                  placeholder="Describe observed unsafe acts, line pressure surge, gas leaks, or missing LOTO locks..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Attach Evidence Files (Images, PDFs, Voice Notes)
                </label>
                <DropzoneUpload
                  onFilesSelected={(files) => {
                    setEvidenceFiles(files);
                    if (formValidationError) setFormValidationError('');
                  }}
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSingleReportModal(false)}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReport}
                  className="px-4 py-2 bg-teal-700 text-white rounded-lg text-xs font-semibold hover:bg-teal-800 shadow-xs flex items-center space-x-1.5 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submittingReport ? 'Running AI Pipeline...' : 'Submit Report & Dispatch Quiz'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BATCH PDF INTAKE MODAL */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Upload className="w-4 h-4 text-teal-400" />
                <h3 className="font-bold text-sm">Batch PDF Intake — Multi-Worker Processing</h3>
              </div>
              <button onClick={() => setShowBatchModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleBatchReportSubmit} className="p-5 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Upload or paste a single batch report containing 5–10 worker entries. Each entry must start with a valid Worker ID (e.g. <code className="font-mono text-teal-700 bg-teal-50 px-1 py-0.5 rounded">OIL-W-101</code>). The AI pipeline will generate individual Trust Reports and dispatch worker quizzes automatically.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Batch Text / PDF Content Entries</label>
                <textarea
                  rows={8}
                  value={batchRawText}
                  onChange={(e) => setBatchRawText(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowBatchModal(false)}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingBatch}
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 shadow-xs flex items-center space-x-1.5 disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5 text-teal-400" />
                  <span>{submittingBatch ? 'Processing Batch Entries...' : 'Process Batch Reports Now'}</span>
                </button>
              </div>
            </form>

            {batchResults.length > 0 && (
              <div className="p-4 bg-slate-50 border-t border-slate-200 max-h-60 overflow-y-auto space-y-2">
                <h4 className="font-bold text-xs text-slate-900">Batch Processing Summary Results ({batchResults.length})</h4>
                <div className="space-y-1">
                  {batchResults.map((r, i) => (
                    <div key={i} className="p-2 bg-white rounded border border-slate-200 text-xs flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-800">{r.worker_id}</span>
                      <span className="font-semibold text-slate-700">{r.risk_level} RISK ({r.ml_probability?.toFixed(0)}%)</span>
                      <span className="text-[10px] text-emerald-700 font-mono">Quiz Dispatched</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* INSPECTION TRUST REPORT MODAL */}
      {selectedReportForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-lg border border-slate-200 shadow-2xl max-w-4xl w-full my-8 overflow-hidden">
            <div className="p-3 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <span className="font-bold text-xs flex items-center space-x-2">
                <Eye className="w-4 h-4 text-teal-400" />
                <span>Executive Trust Report Visual Inspection</span>
              </span>
              <button onClick={() => setSelectedReportForView(null)} className="text-slate-400 hover:text-white px-2 py-1 text-xs font-bold">
                ✕ Close
              </button>
            </div>
            <div className="p-4 max-h-[80vh] overflow-y-auto">
              <TrustReportView report={selectedReportForView} />
            </div>
          </div>
        </div>
      )}

      {/* SMS WARNING MODAL */}
      {showWarningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-md w-full overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <span className="font-bold text-sm">Dispatch Officer Safety Warning</span>
              <button onClick={() => setShowWarningModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSendWarningSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Worker ID</label>
                <input
                  type="text"
                  required
                  value={warningWorkerId}
                  onChange={(e) => setWarningWorkerId(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Warning Text</label>
                <textarea
                  required
                  rows={4}
                  value={warningMessage}
                  onChange={(e) => setWarningMessage(e.target.value)}
                  placeholder="Official HSE safety warning message..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
                />
              </div>
              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowWarningModal(false)}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingWarning}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg text-xs font-semibold hover:bg-amber-700"
                >
                  {sendingWarning ? 'Dispatching...' : 'Send SMS Warning'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
