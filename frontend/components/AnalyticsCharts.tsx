'use client';

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { TrendingUp, PieChart as PieIcon, BarChart3 } from 'lucide-react';

interface AnalyticsChartsProps {
  riskBySite: Array<{ site_name: string; high_risk: number; total: number; avg_risk: number }>;
  trendAnalytics: Array<{ month: string; incidents: number; high_risk: number }>;
  uaUcBreakdown: Array<{ rule: string; count: number; color: string }>;
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  riskBySite,
  trendAnalytics,
  uaUcBreakdown
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      
      {/* 1. Line Chart: Incident Risk Trend */}
      <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-sm lg:col-span-2">
        <div className="flex items-center space-x-2 mb-4 pb-2 border-b border-slate-100">
          <TrendingUp className="w-4 h-4 text-teal-700" />
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Incident Risk Trend (Monthly)</h3>
            <p className="text-[11px] text-slate-500">Total reported incidents vs high-risk SIF flags over time</p>
          </div>
        </div>

        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendAnalytics} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '6px', borderColor: '#cbd5e1', fontSize: '12px' }}
                labelStyle={{ fontWeight: 'bold', color: '#0f172a' }}
              />
              <Line type="monotone" dataKey="incidents" name="Total Incidents" stroke="#64748b" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="high_risk" name="High Risk SIF" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Donut Chart: UA / UC Violations */}
      <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-2 mb-4 pb-2 border-b border-slate-100">
          <PieIcon className="w-4 h-4 text-teal-700" />
          <div>
            <h3 className="text-sm font-semibold text-slate-900">UA / UC Rule Categories</h3>
            <p className="text-[11px] text-slate-500">Violation distribution</p>
          </div>
        </div>

        <div className="h-44 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={uaUcBreakdown}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={65}
                paddingAngle={3}
                dataKey="count"
                nameKey="rule"
              >
                {uaUcBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '6px', borderColor: '#cbd5e1', fontSize: '11px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-1 mt-2 max-h-24 overflow-y-auto pr-1 text-xs">
          {uaUcBreakdown.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-[11px]">
              <div className="flex items-center space-x-1.5 truncate">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-slate-600 truncate">{item.rule}</span>
              </div>
              <span className="font-semibold text-slate-900 shrink-0 ml-2">{item.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Bar Chart: Risk by Site */}
      <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-sm lg:col-span-3">
        <div className="flex items-center space-x-2 mb-4 pb-2 border-b border-slate-100">
          <BarChart3 className="w-4 h-4 text-teal-700" />
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Facility Incident Comparison</h3>
            <p className="text-[11px] text-slate-500">Total incident reports vs high-risk flags per OIL facility</p>
          </div>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={riskBySite} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="site_name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '6px', borderColor: '#cbd5e1', fontSize: '12px' }}
              />
              <Bar dataKey="total" name="Total Reports" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="high_risk" name="High Risk Flags" fill="#0f766e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
