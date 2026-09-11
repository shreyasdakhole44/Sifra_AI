'use client';

import React, { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api';
import { Bell, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getAlerts();
      setAlerts(data);
    } catch (e) {
      console.error('Error loading alerts:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center space-x-3 text-slate-500 font-medium text-xs">
          <div className="w-4 h-4 border-2 border-teal-700 border-t-transparent rounded-full animate-spin" />
          <span>Loading Alerts Inbox...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">HSE Notifications & Dispatch Logs</h1>
            <span className="bg-slate-100 text-slate-700 text-[11px] font-semibold px-2 py-0.5 rounded border border-slate-200">
              Emergency Dispatch Register
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Automated Twilio SMS and SendGrid email emergency notifications triggered upon High SIF incident detections (&gt;50% fatality probability).
          </p>
        </div>

        <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm text-right">
          <span className="block text-slate-500 text-[10px] uppercase font-bold tracking-wider">Total Notifications</span>
          <span className="text-sm font-bold text-slate-900 font-mono">{alerts.length}</span>
        </div>
      </div>

      {/* Alerts Table / List */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="w-4 h-4 text-teal-700" />
            <h3 className="font-bold text-slate-900 text-sm">Dispatched Alert History</h3>
          </div>
          <span className="text-xs font-mono text-slate-500">{alerts.length} dispatches</span>
        </div>

        {alerts.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            No alert dispatches recorded yet. High risk (&gt;50% SIF) incident submissions automatically trigger SMS/Email dispatches.
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {alerts.map((al) => (
              <div
                key={al.id}
                className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-rose-50 text-rose-600 rounded border border-rose-200 shrink-0 mt-0.5">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-slate-900 text-xs">HIGH SIF EMERGENCY DISPATCH</span>
                      <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-slate-100 border border-slate-200 text-slate-700">
                        {al.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 mt-1 font-medium">{al.message}</p>
                    <span className="text-[11px] text-slate-400 mt-1 block font-mono">
                      Dispatched at: {new Date(al.sent_at).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="shrink-0">
                  <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded text-[11px] font-semibold ${
                    al.status === 'sent' 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}>
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{al.status === 'sent' ? 'Delivered' : 'Log Output'}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
