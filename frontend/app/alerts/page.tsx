'use client';

import React, { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api';
import {
  Bell,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Mail,
  Send,
  Filter,
  RefreshCw,
  X
} from 'lucide-react';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [channelFilter, setChannelFilter] = useState<'all' | 'sms' | 'email'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'sent' | 'failed'>('all');
  
  // Modal state for Manual Warning dispatch
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetWorkerId, setTargetWorkerId] = useState('OIL-W-101');
  const [warningMessage, setWarningMessage] = useState('');
  const [dispatchChannel, setDispatchChannel] = useState<'both' | 'sms' | 'email'>('both');
  const [sending, setSending] = useState(false);
  const [modalSuccessMsg, setModalSuccessMsg] = useState('');

  useEffect(() => {
    loadAlerts();
  }, [channelFilter, statusFilter]);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getAlerts(channelFilter, statusFilter);
      setAlerts(data || []);
    } catch (e) {
      console.error('Error loading alerts:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSendWarning = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetWorkerId.trim() || !warningMessage.trim()) return;

    setSending(true);
    setModalSuccessMsg('');
    try {
      const smsDispatch = dispatchChannel === 'sms' || dispatchChannel === 'both';
      const emailDispatch = dispatchChannel === 'email' || dispatchChannel === 'both';
      
      await adminApi.sendWarning(
        targetWorkerId.trim(),
        warningMessage.trim(),
        smsDispatch,
        emailDispatch
      );
      
      setModalSuccessMsg('Emergency warning dispatched successfully!');
      setTimeout(() => {
        setIsModalOpen(false);
        setWarningMessage('');
        setModalSuccessMsg('');
        loadAlerts();
      }, 1200);
    } catch (err: any) {
      console.error('Failed to send warning:', err);
      alert('Error sending warning: ' + (err.response?.data?.detail || err.message));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">HSE Notifications & Dispatch Logs</h1>
            <span className="bg-slate-100 text-slate-700 text-[11px] font-semibold px-2 py-0.5 rounded border border-slate-200">
              Multi-Channel Dispatch
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Automated Twilio SMS and SendGrid Email safety dispatches triggered by High SIF incidents (&gt;50% fatality risk) or manual officer warnings.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => loadAlerts()}
            className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-sm"
            title="Refresh logs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center space-x-2 px-3.5 py-2 bg-teal-700 text-white rounded-lg hover:bg-teal-800 text-xs font-semibold shadow-sm transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Manual Warning</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Channel Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500 font-medium flex items-center space-x-1">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Channel:</span>
            </span>
            <div className="inline-flex rounded-lg p-0.5 bg-slate-100 border border-slate-200 text-xs font-medium">
              {(['all', 'sms', 'email'] as const).map((ch) => (
                <button
                  key={ch}
                  onClick={() => setChannelFilter(ch)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                    channelFilter === ch
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {ch === 'all' ? 'All Channels' : ch.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500 font-medium">Status:</span>
            <div className="inline-flex rounded-lg p-0.5 bg-slate-100 border border-slate-200 text-xs font-medium">
              {(['all', 'sent', 'failed'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                    statusFilter === st
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {st === 'all' ? 'All Status' : st === 'sent' ? 'Sent' : 'Failed'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="text-xs font-mono text-slate-500">
          Showing <span className="font-bold text-slate-900">{alerts.length}</span> alert logs
        </div>
      </div>

      {/* Alerts Table / Feed */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="w-4 h-4 text-teal-700" />
            <h3 className="font-bold text-slate-900 text-sm">Emergency Alert Dispatch Register</h3>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-500 text-xs font-medium space-x-3">
            <div className="w-4 h-4 border-2 border-teal-700 border-t-transparent rounded-full animate-spin" />
            <span>Fetching alert logs...</span>
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-xs space-y-2">
            <ShieldAlert className="w-8 h-8 text-slate-300 mx-auto stroke-1" />
            <p>No dispatches found matching current filter criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50/80 text-slate-500 uppercase font-semibold border-b border-slate-200 text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Channel</th>
                  <th className="px-4 py-3">Recipient Worker</th>
                  <th className="px-4 py-3">Dispatch Message</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {alerts.map((al) => {
                  const isSms = (al.channel || al.type || '').toLowerCase().includes('sms');
                  const isSent = (al.status || '').toLowerCase() === 'sent';

                  return (
                    <tr key={al.id || al._id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Channel Icon & Badge */}
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <div className={`p-1.5 rounded border shrink-0 ${
                            isSms 
                              ? 'bg-blue-50 text-blue-700 border-blue-200' 
                              : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          }`}>
                            {isSms ? <MessageSquare className="w-3.5 h-3.5" /> : <Mail className="w-3.5 h-3.5" />}
                          </div>
                          <span className={`text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded border ${
                            isSms
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                          }`}>
                            {isSms ? 'Twilio SMS' : 'SendGrid Email'}
                          </span>
                        </div>
                      </td>

                      {/* Recipient Worker */}
                      <td className="px-4 py-3">
                        <div className="font-mono font-bold text-slate-900 text-xs">
                          {al.worker_id}
                        </div>
                        {al.worker_name && (
                          <div className="text-[11px] text-slate-500 font-sans">
                            {al.worker_name}
                          </div>
                        )}
                      </td>

                      {/* Message Content */}
                      <td className="px-4 py-3 max-w-md">
                        <p className="text-slate-800 font-medium line-clamp-2 leading-relaxed">
                          {al.message}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-semibold border ${
                          isSent
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {isSent ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <XCircle className="w-3 h-3 text-rose-600" />}
                          <span>{isSent ? 'Sent & Delivered' : 'Dispatch Failed'}</span>
                        </span>
                      </td>

                      {/* Timestamp */}
                      <td className="px-4 py-3 text-right font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {al.sent_at ? new Date(al.sent_at).toLocaleString() : 'N/A'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual Warning Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-md w-full overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Send className="w-4 h-4 text-teal-700" />
                <h3 className="font-bold text-slate-900 text-sm">Dispatch Officer Warning Alert</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendWarning} className="p-5 space-y-4">
              {modalSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded text-xs font-semibold flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{modalSuccessMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Worker ID
                </label>
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Dispatch Channel
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['both', 'sms', 'email'] as const).map((ch) => (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => setDispatchChannel(ch)}
                      className={`py-1.5 px-2 text-xs font-semibold rounded-lg border transition-all ${
                        dispatchChannel === ch
                          ? 'bg-teal-50 text-teal-800 border-teal-600 shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {ch === 'both' ? 'Both (SMS+Email)' : ch.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Official Warning Message
                </label>
                <textarea
                  required
                  rows={4}
                  value={warningMessage}
                  onChange={(e) => setWarningMessage(e.target.value)}
                  placeholder="Type safety warning or non-compliance notice to dispatch to worker phone and email..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="px-4 py-2 bg-teal-700 text-white rounded-lg hover:bg-teal-800 text-xs font-semibold shadow-sm transition-colors flex items-center space-x-1.5 disabled:opacity-50"
                >
                  <Send className="w-3 h-3" />
                  <span>{sending ? 'Dispatching...' : 'Send Alert Now'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
