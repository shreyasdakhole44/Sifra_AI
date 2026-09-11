'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { reportsApi, quizApi, workerApi } from '@/lib/api';
import { StructuredAnalysisCards } from '@/components/StructuredAnalysisCards';
import { QuizModal } from '@/components/QuizModal';
import { 
  Mic, 
  MicOff, 
  Send, 
  ShieldAlert, 
  Award, 
  Clock, 
  FileText, 
  Sliders,
  CheckCircle2,
  AlertTriangle,
  User,
  ListTodo,
  Bell,
  BookOpen,
  CheckSquare
} from 'lucide-react';

export default function WorkerPage() {
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'report' | 'tasks' | 'warnings' | 'quizzes'>('report');

  const [incidentText, setIncidentText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Metadata parameters
  const [employees, setEmployees] = useState('150');
  const [hoursWorked, setHoursWorked] = useState('300000');
  const [naicsCode, setNaicsCode] = useState('211111');
  const [industry, setIndustry] = useState('Oil and Gas Extraction');
  const [establishmentType, setEstablishmentType] = useState('Operating');
  const [size, setSize] = useState('100 to 249');
  const [state, setState] = useState('TX');

  const [activeReport, setActiveReport] = useState<any>(null);
  const [myReports, setMyReports] = useState<any[]>([]);
  const [myWarnings, setMyWarnings] = useState<any[]>([]);
  const [myTasks, setMyTasks] = useState<any[]>([]);
  const [myAssignedTraining, setMyAssignedTraining] = useState<any[]>([]);

  // Quiz Modal State
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizData, setQuizData] = useState<any>(null);
  const [loadingQuiz, setLoadingQuiz] = useState(false);

  const workerId = user?.worker_id || user?.id || 'OIL-W-101';

  useEffect(() => {
    fetchWorkerData();
  }, []);

  const fetchWorkerData = async () => {
    try {
      const [reportsData, warningsData, tasksData, trainingData] = await Promise.all([
        reportsApi.list(),
        workerApi.getWarnings(),
        workerApi.getTasks(),
        workerApi.getAssignedTraining()
      ]);
      setMyReports(reportsData);
      setMyWarnings(warningsData);
      setMyTasks(tasksData);
      setMyAssignedTraining(trainingData);
    } catch (e) {
      console.error('Error fetching worker data:', e);
    }
  };

  const toggleSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      let currentTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
      }
      setIncidentText((prev) => (prev ? prev + ' ' + currentTranscript : currentTranscript));
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidentText.trim()) return;

    setSubmitting(true);
    try {
      const establishment_info = {
        employees: parseFloat(employees) || 100,
        hours_worked: parseFloat(hoursWorked) || 200000,
        naics_code: parseFloat(naicsCode) || 211111,
        industry,
        establishment_type: establishmentType,
        size,
        state
      };

      const result = await reportsApi.create(incidentText, establishment_info, user?.site_id);
      setActiveReport(result);
      setIncidentText('');
      fetchWorkerData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Error submitting incident report.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTaskStatusChange = async (taskId: string, newStatus: string) => {
    try {
      await workerApi.updateTaskStatus(taskId, newStatus);
      fetchWorkerData();
    } catch (e) {
      alert('Error updating task status.');
    }
  };

  const handleLaunchQuiz = async (reportId: string) => {
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

  return (
    <div className="space-y-6">
      
      {/* Persistent Worker Profile & ID Header */}
      <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-teal-50 border border-teal-200 text-teal-800 rounded-lg shrink-0">
            <User className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                PERSISTENT ID: {workerId}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                Active Personnel
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-1">{user?.name || 'Ramesh Kumar (Worker)'}</h2>
            <p className="text-xs text-slate-500 font-mono">{user?.email || 'worker@oilindia.in'} • {user?.site_id || 'OIL-DIGBOI-01'}</p>
          </div>
        </div>

        <div className="flex items-center space-x-4 bg-slate-50 p-3 rounded-lg border border-slate-200 text-center">
          <div>
            <span className="block text-slate-400 text-[10px] font-semibold uppercase">Reports Logged</span>
            <span className="text-sm font-bold text-slate-900 font-mono">{myReports.length}</span>
          </div>
          <div className="h-6 w-px bg-slate-200" />
          <div>
            <span className="block text-slate-400 text-[10px] font-semibold uppercase">Open Tasks</span>
            <span className="text-sm font-bold text-teal-700 font-mono">
              {myTasks.filter(t => t.status !== 'Completed').length}
            </span>
          </div>
          <div className="h-6 w-px bg-slate-200" />
          <div>
            <span className="block text-slate-400 text-[10px] font-semibold uppercase">Warnings</span>
            <span className="text-sm font-bold text-rose-600 font-mono">{myWarnings.length}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('report')}
          className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-all border-b-2 flex items-center space-x-1.5 ${
            activeTab === 'report'
              ? 'border-teal-700 text-teal-700 bg-teal-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Incident Reporting & ML Score</span>
        </button>

        <button
          onClick={() => setActiveTab('tasks')}
          className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-all border-b-2 flex items-center space-x-1.5 ${
            activeTab === 'tasks'
              ? 'border-teal-700 text-teal-700 bg-teal-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <ListTodo className="w-3.5 h-3.5" />
          <span>My Corrective Tasks</span>
          {myTasks.filter(t => t.status !== 'Completed').length > 0 && (
            <span className="bg-teal-700 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {myTasks.filter(t => t.status !== 'Completed').length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('warnings')}
          className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-all border-b-2 flex items-center space-x-1.5 ${
            activeTab === 'warnings'
              ? 'border-teal-700 text-teal-700 bg-teal-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Safety Warnings Inbox</span>
          {myWarnings.length > 0 && (
            <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {myWarnings.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('quizzes')}
          className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-all border-b-2 flex items-center space-x-1.5 ${
            activeTab === 'quizzes'
              ? 'border-teal-700 text-teal-700 bg-teal-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Assigned Safety Quizzes</span>
        </button>
      </div>

      {/* TAB 1: INCIDENT REPORTING */}
      {activeTab === 'report' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form Card */}
            <div className="lg:col-span-2 bg-white rounded-lg p-5 border border-slate-200 shadow-sm">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                      Describe Safety Incident / Observation
                    </label>
                    
                    <button
                      type="button"
                      onClick={toggleSpeechRecognition}
                      className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-semibold border transition-colors ${
                        isListening
                          ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                      <span>{isListening ? 'Listening...' : 'Voice Input'}</span>
                    </button>
                  </div>

                  <textarea
                    required
                    rows={4}
                    value={incidentText}
                    onChange={(e) => setIncidentText(e.target.value)}
                    placeholder="Detail what happened e.g. High-pressure gas surge observed at wellhead manifold during line purging. Valve lock-out pin was missing..."
                    className="w-full p-3 bg-slate-50 rounded border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-teal-700 focus:bg-white transition-colors leading-relaxed placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>{showAdvanced ? 'Hide Rig Parameters' : 'Custom Rig Parameters (Optional)'}</span>
                  </button>

                  {showAdvanced && (
                    <div className="mt-3 p-3 bg-slate-50 rounded border border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Avg Employees</label>
                        <input type="number" value={employees} onChange={(e) => setEmployees(e.target.value)} className="w-full p-1.5 bg-white rounded border border-slate-200" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Total Hours Worked</label>
                        <input type="number" value={hoursWorked} onChange={(e) => setHoursWorked(e.target.value)} className="w-full p-1.5 bg-white rounded border border-slate-200" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">NAICS Code</label>
                        <input type="number" value={naicsCode} onChange={(e) => setNaicsCode(e.target.value)} className="w-full p-1.5 bg-white rounded border border-slate-200" />
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={submitting || !incidentText.trim()}
                  className="w-full py-2.5 bg-teal-700 text-white font-semibold rounded text-xs hover:bg-teal-800 disabled:opacity-50 transition-colors flex items-center justify-center space-x-1.5 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Running XGBoost V2 & Hybrid RAG Analysis...' : 'Analyze & Submit Incident'}</span>
                </button>
              </form>
            </div>

            {/* Right Column: History Shortcut */}
            <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 text-sm mb-3 flex items-center space-x-1.5 pb-2 border-b border-slate-100">
                  <Clock className="w-4 h-4 text-teal-700" />
                  <span>My Submissions History</span>
                </h3>

                {myReports.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center italic">No incident reports logged yet.</p>
                ) : (
                  <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                    {myReports.map((rep) => (
                      <button
                        key={rep.id}
                        onClick={() => setActiveReport(rep)}
                        className={`w-full text-left p-3 rounded border text-xs transition-colors ${
                          activeReport?.id === rep.id
                            ? 'border-teal-700 bg-teal-50/40 text-slate-900'
                            : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[10px] font-bold px-2 py-0.2 rounded border ${
                            rep.risk_level === 'HIGH' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}>
                            {rep.risk_level} ({rep.ml_probability?.toFixed(0)}%)
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">{new Date(rep.timestamp).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-slate-800 line-clamp-2 leading-tight font-medium">{rep.incident_text}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Structured Analysis Results View */}
          {activeReport && (
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">AI Safety Analysis & Evidence Panel</h3>
                  <p className="text-xs text-slate-500">XGBoost ML Risk Prediction + Hybrid RAG Citations & IOGP Rule Tags</p>
                </div>

                <button
                  onClick={() => handleLaunchQuiz(activeReport.id)}
                  disabled={loadingQuiz}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-teal-700 text-white font-semibold rounded text-xs hover:bg-teal-800 disabled:opacity-50 transition-colors shadow-sm"
                >
                  <Award className="w-4 h-4" />
                  <span>{loadingQuiz ? 'Generating Quiz...' : 'Take Safety Quiz'}</span>
                </button>
              </div>

              <StructuredAnalysisCards
                prediction={activeReport.ml_prediction}
                probability={activeReport.ml_probability}
                riskLevel={activeReport.risk_level}
                sections={activeReport.structured_sections || {}}
                ragSources={activeReport.rag_context_sources || []}
              />
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY CORRECTIVE TASKS */}
      {activeTab === 'tasks' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Assigned Corrective Safety Tasks</h3>
              <p className="text-xs text-slate-500">Tasks assigned by HSC Officer to address site safety vulnerabilities.</p>
            </div>
            <span className="text-xs font-mono text-slate-500">{myTasks.length} tasks</span>
          </div>

          {myTasks.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No tasks currently assigned by the HSC Officer.
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {myTasks.map((t) => (
                <div key={t.id} className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-slate-900 text-xs">{t.title}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.2 rounded border ${
                        t.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {t.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{t.description}</p>
                    <div className="flex items-center space-x-3 text-[11px] text-slate-400 mt-1 font-mono">
                      <span>Assigned by: {t.assigned_by}</span>
                      <span>•</span>
                      <span>Due: {t.due_date}</span>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center space-x-2">
                    <select
                      value={t.status}
                      onChange={(e) => handleTaskStatusChange(t.id, e.target.value)}
                      className="px-2.5 py-1 bg-white border border-slate-300 rounded text-xs font-medium text-slate-800 focus:outline-none focus:border-teal-700 shadow-sm"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SAFETY WARNINGS INBOX */}
      {activeTab === 'warnings' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="w-4 h-4 text-rose-600" />
              <h3 className="text-sm font-bold text-slate-900">Formal Safety Warnings Issued</h3>
            </div>
            <span className="text-xs font-mono text-slate-500">{myWarnings.length} warnings</span>
          </div>

          {myWarnings.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No formal warnings issued to your worker account. Keep up good safety compliance!
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {myWarnings.map((w) => (
                <div key={w.id} className="p-4 bg-rose-50/30 hover:bg-rose-50/60 transition-colors flex items-start space-x-3">
                  <div className="p-2 bg-rose-100 text-rose-700 rounded border border-rose-200 shrink-0 mt-0.5">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-rose-800 text-xs">OFFICIAL SAFETY COMPLIANCE WARNING</span>
                      <span className="text-[10px] font-mono text-slate-500">Issued by: {w.issued_by}</span>
                    </div>
                    <p className="text-xs text-slate-800 font-medium leading-relaxed">{w.message}</p>
                    <span className="text-[10px] font-mono text-slate-400 block">
                      Timestamp: {new Date(w.timestamp).toLocaleString()} • SMS Status: {w.sms_status || 'Delivered'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: ASSIGNED QUIZZES */}
      {activeTab === 'quizzes' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-teal-700" />
              <h3 className="text-sm font-bold text-slate-900">Mandatory Safety Quizzes & Refresher Courses</h3>
            </div>
            <span className="text-xs font-mono text-slate-500">{myAssignedTraining.length} modules</span>
          </div>

          {myAssignedTraining.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No mandatory training modules currently assigned. You can take an auto-generated quiz directly from any incident report.
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {myAssignedTraining.map((a) => (
                <div key={a.id} className="p-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors">
                  <div>
                    <h4 className="font-semibold text-xs text-slate-900">{a.quiz_title}</h4>
                    <span className="text-[11px] text-slate-500 block mt-0.5">Category: {a.category} • Assigned by: {a.assigned_by}</span>
                  </div>

                  <button
                    onClick={() => handleLaunchQuiz('SYSTEM-ASSIGNED')}
                    className="px-3 py-1.5 bg-teal-700 text-white rounded text-xs font-semibold hover:bg-teal-800 transition-colors"
                  >
                    Start Assessment
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

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
