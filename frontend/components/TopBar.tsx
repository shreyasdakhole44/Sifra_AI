'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { Search, ChevronRight } from 'lucide-react';

export const TopBar = () => {
  const { user } = useAuth();
  const pathname = usePathname();

  if (!user || pathname === '/login' || pathname === '/') return null;

  const getBreadcrumb = () => {
    if (pathname === '/admin') return 'Overview & Heatmap';
    if (pathname === '/admin/reports') return 'Reports & AI Analysis';
    if (pathname === '/admin/map') return 'Risk Map';
    if (pathname === '/admin/workers') return 'Worker Safety Register';
    if (pathname === '/admin/quizzes') return 'Safety Quizzes';
    if (pathname === '/alerts') return 'Alerts & Notifications';
    if (pathname === '/admin/pdf-reports') return 'PDF Trust Reports';
    if (pathname === '/admin/settings') return 'System Settings';
    if (pathname === '/worker' || pathname === '/worker/profile') return 'My Profile';
    if (pathname === '/worker/history') return 'Safety History';
    if (pathname === '/worker/alerts') return 'Alerts';
    if (pathname === '/worker/quizzes') return 'Assigned Quizzes';
    if (pathname === '/worker/leaderboard') return 'Leaderboard';
    if (pathname.startsWith('/reports/')) return 'Report Detailed Analysis';
    return 'Dashboard';
  };

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20">
      
      {/* Left: Breadcrumbs */}
      <div className="flex items-center space-x-2 text-xs text-slate-500">
        <span>Oil India Limited</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="font-semibold text-slate-900">{getBreadcrumb()}</span>
      </div>

      {/* Center: Search input */}
      <div className="hidden md:flex items-center space-x-2 w-72 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus-within:border-teal-700 focus-within:bg-white transition-colors">
        <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Search incidents, rules, NAICS..."
          className="w-full bg-transparent text-xs text-slate-900 focus:outline-none placeholder:text-slate-400"
        />
        <span className="text-[10px] font-mono text-slate-400 bg-white border border-slate-200 px-1.5 py-0.2 rounded shrink-0">
          ⌘K
        </span>
      </div>

      {/* Right: Environment & Avatar */}
      <div className="flex items-center space-x-4">
        <div className="hidden sm:flex items-center space-x-1.5 text-xs text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-medium text-slate-700">OIL Production Network</span>
        </div>

        <div className="flex items-center space-x-2 border-l border-slate-200 pl-4">
          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
            user.role === 'Admin'
              ? 'bg-purple-50 text-purple-700 border-purple-200'
              : user.role === 'HSE Officer'
              ? 'bg-blue-50 text-blue-700 border-blue-200'
              : 'bg-teal-50 text-teal-800 border-teal-200'
          }`}>
            {user.role}
          </span>
          <span className="text-xs font-semibold text-slate-800 hidden lg:inline">{user.name}</span>
        </div>
      </div>

    </header>
  );
};
