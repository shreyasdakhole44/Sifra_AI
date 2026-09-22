'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { workerApi } from '@/lib/api';
import { Glasses, CheckCircle, ChevronRight } from 'lucide-react';

const IOGP_RULES = [
  { id: 1, title: 'Bypassing Safety Controls', desc: 'Identify and refuse to bypass safety interlocks.' },
  { id: 2, title: 'Confined Space', desc: 'Simulate permit checks, atmosphere testing, and attendant presence.' },
  { id: 3, title: 'Driving', desc: 'Practice seatbelt use, speed limits, and phone policies.' },
  { id: 4, title: 'Energy Isolation', desc: 'Lockout/tagout (LOTO) procedures before working on equipment.' },
  { id: 5, title: 'Hot Work', desc: 'Permit-to-work, fire watch, and flammable-material clearance.' },
  { id: 6, title: 'Line of Fire', desc: 'Positioning away from moving/suspended loads and pressurized lines.' },
  { id: 7, title: 'Safe Mechanical Lifting', desc: 'Crane/lifting plans, rigging inspection, and exclusion zones.' },
  { id: 8, title: 'Work Authorisation', desc: 'Obtain and verify a valid work permit before starting a task.' },
  { id: 9, title: 'Working at Height', desc: 'Harness use, anchor points, and fall-protection checks.' },
  { id: 10, title: 'H2S / Toxic Gas Emergency Response', desc: 'React to a sudden gas leak, check monitors, and evacuate safely.' }
];

export default function ARTrainingList() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const data = await workerApi.arTraining.getResults();
      setResults(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getPointsForRule = (ruleId: number) => {
    const records = results.filter(r => r.rule_id === ruleId);
    if (records.length === 0) return null;
    return records.reduce((max, r) => Math.max(max, r.points_earned), 0);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 text-white p-6 rounded-xl border border-slate-800 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-lg border-2 border-indigo-400 shrink-0">
            <Glasses className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">AR/VR Training Modules</h1>
            <p className="text-sm text-slate-300">Complete 3D safety simulations based on the 9 IOGP Life-Saving Rules.</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {IOGP_RULES.map((rule) => {
            const points = getPointsForRule(rule.id);
            const isCompleted = points !== null;

            return (
              <div key={rule.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
                <div className={`p-4 border-b ${isCompleted ? 'bg-indigo-50 border-indigo-100' : 'bg-slate-50 border-slate-200'} flex items-center justify-between`}>
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold font-mono">
                      {rule.id}
                    </span>
                    <h3 className="font-semibold text-slate-900 text-sm truncate">{rule.title}</h3>
                  </div>
                  {isCompleted && <CheckCircle className="w-5 h-5 text-indigo-600" />}
                </div>
                
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <p className="text-sm text-slate-600 mb-4">{rule.desc}</p>
                  
                  <div className="flex items-center justify-between mt-auto">
                    {isCompleted ? (
                      <span className="text-sm font-bold text-indigo-700 bg-indigo-100 px-2 py-1 rounded">
                        {points} XP Earned
                      </span>
                    ) : (
                      <span className="text-sm font-medium text-slate-400">Not attempted</span>
                    )}
                    
                    <button
                      onClick={() => router.push(`/worker/ar-training/${rule.id}`)}
                      className="flex items-center space-x-1 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <span>Launch</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
