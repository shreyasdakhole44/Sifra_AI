'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { Search, ChevronRight, LogOut, Menu, Bell } from 'lucide-react';

interface TopBarProps {
  isMobileOpen?: boolean;
  onToggleMobile?: () => void;
}

export const TopBar = ({ isMobileOpen, onToggleMobile }: TopBarProps) => {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user || pathname === '/login' || pathname === '/') return null;

  const isWorker = user.role === 'Worker' || !pathname.startsWith('/admin');

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
    <header className="h-16 bg-white border-b border-slate-200 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-20">
      
      {/* Left: Mobile Menu Button & Breadcrumbs */}
      <div className="flex items-center space-x-2 sm:space-x-3 truncate">
        {isWorker && onToggleMobile && (
          <button
            onClick={onToggleMobile}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
            title="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center space-x-1.5 text-xs text-slate-500 truncate font-medium">
          <span className="shrink-0 text-slate-600">
            {isWorker ? 'Worker Safety Portal' : 'Admin Portal'}
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="font-semibold text-slate-900 truncate">{getBreadcrumb()}</span>
        </div>
      </div>

      {/* Center: Search input (desktop only) */}
      <div className="hidden md:flex items-center space-x-2 w-64 lg:w-80 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus-within:border-teal-700 focus-within:bg-white transition-colors">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder={isWorker ? "Search safety reports, quizzes, and guidance..." : "Search reports, workers, sites, rules..."}
          className="w-full bg-transparent text-xs text-slate-900 focus:outline-none placeholder:text-slate-400 font-sans"
        />
        <span className="text-[10px] font-mono text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded shrink-0">
          ⌘K
        </span>
      </div>

      {/* Right: Notifications & Avatar & Logout */}
      <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
        
        {/* Notification Icon Button */}
        <button
          className="p-2 text-slate-500 hover:text-teal-800 rounded-lg hover:bg-slate-100 transition-colors relative"
          title="Safety Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-teal-600" />
        </button>

        {/* User Identity */}
        <div className="flex items-center space-x-2 border-l border-slate-200 pl-2 sm:pl-3">
          <div className="w-8 h-8 rounded-full bg-teal-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
            {(user.name || 'HSC Lead Officer').charAt(0).toUpperCase()}
          </div>
          <div className="hidden sm:block text-left">
            <span className="text-xs font-semibold text-slate-800 block leading-tight truncate max-w-[140px]">
              {user.name || 'HSC Lead Officer'}
            </span>
            <span className="text-[11px] text-slate-500 block leading-tight font-normal">
              {user.role === 'Worker' ? 'Field Operations Worker' : 'HSE Officer'}
            </span>
          </div>
          <button
            onClick={logout}
            className="ml-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1"
            title="Sign out of SIFRA AI"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

    </header>
  );
};
