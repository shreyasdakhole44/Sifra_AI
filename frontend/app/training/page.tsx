'use client';

import React, { useState, useEffect } from 'react';
import { quizApi } from '@/lib/api';
import { useAuth } from '@/lib/authContext';
import { BookOpen, Award, CheckCircle2, XCircle, Clock } from 'lucide-react';

export default function TrainingPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await quizApi.history();
      setHistory(data);
    } catch (e) {
      console.error('Error loading training history:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center space-x-3 text-slate-500 font-medium text-xs">
          <div className="w-4 h-4 border-2 border-teal-700 border-t-transparent rounded-full animate-spin" />
          <span>Loading Training Records...</span>
        </div>
      </div>
    );
  }

  const averageScore = history.length > 0
    ? (history.reduce((acc, curr) => acc + (curr.percentage || 0), 0) / history.length).toFixed(1)
    : 'N/A';

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Safety Compliance Training & Quizzes</h1>
            <span className="bg-slate-100 text-slate-700 text-[11px] font-semibold px-2 py-0.5 rounded border border-slate-200">
              Assessment Register
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Individual worker knowledge assessment history generated from RAG-grounded SIF safety evaluations.
          </p>
        </div>

        <div className="flex items-center space-x-4 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
          <div>
            <span className="block text-slate-500 text-[10px] uppercase font-bold tracking-wider">Total Quizzes</span>
            <span className="text-sm font-bold text-slate-900 font-mono">{history.length}</span>
          </div>
          <div className="h-6 w-px bg-slate-200" />
          <div>
            <span className="block text-slate-500 text-[10px] uppercase font-bold tracking-wider">Avg Score</span>
            <span className="text-sm font-bold text-teal-700 font-mono">{averageScore}%</span>
          </div>
        </div>
      </div>

      {/* History Table Container */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-teal-700" />
            <h3 className="font-bold text-slate-900 text-sm">Completed Safety Assessments</h3>
          </div>
          <span className="text-xs font-mono text-slate-500">{history.length} records</span>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            No training quizzes completed yet. Take an auto-generated MCQ quiz after submitting an incident report.
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {history.map((record) => {
              const passed = (record.percentage || 0) >= 70;
              return (
                <div
                  key={record.id}
                  className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`px-3 py-1.5 rounded text-xs font-bold font-mono border ${
                      passed 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {record.percentage}%
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 text-xs">{record.quiz_title}</h4>
                      <div className="flex items-center space-x-3 text-[11px] text-slate-500 mt-0.5">
                        <span className="flex items-center space-x-1 font-mono">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{new Date(record.completed_at).toLocaleString()}</span>
                        </span>
                        <span>•</span>
                        <span className="font-mono">Score: {record.score} / {record.total_questions}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded text-[11px] font-semibold ${
                      passed 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {passed ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      <span>{passed ? 'Passed (≥70%)' : 'Needs Review'}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
