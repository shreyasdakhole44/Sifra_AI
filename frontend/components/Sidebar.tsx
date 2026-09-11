'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { 
  ShieldAlert, 
  Activity, 
  BookOpen, 
  Bell, 
  LogOut, 
  FileText,
  Sliders,
  CheckCircle2,
  Building2,
  ChevronRight
} from 'lucide-react';

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user || pathname === '/login') return null;

  const isAdminOrHse = user.role === 'Admin' || user.role === 'HSE Officer';

  const navItems = [
    ...(isAdminOrHse
      ? [
          {
            label: 'HSE Dashboard',
            href: '/admin',
            icon: Activity,
            category: 'Overview'
          }
        ]
      : [
          {
            label: 'Incident Portal',
            href: '/worker',
            icon: ShieldAlert,
            category: 'Overview'
          }
        ]),
    {
      label: 'Safety Quizzes',
      href: '/training',
      icon: BookOpen,
      category: 'Compliance'
    },
    {
      label: 'Alerts Inbox',
      href: '/alerts',
      icon: Bell,
      category: 'Compliance'
    }
  ];

  return (
    <aside className="w-60 bg-white border-r border-slate-200 shrink-0 flex flex-col justify-between h-screen sticky top-0 z-30 select-none">
      <div>
        {/* Brand Header */}
        <div className="h-14 px-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 bg-teal-700 text-white rounded-lg flex items-center justify-center font-bold text-xs shadow-sm">
              <ShieldAlert className="w-4 h-4 text-teal-100" />
            </div>
            <div>
              <span className="font-semibold text-sm text-slate-900 tracking-tight">SIFRA AI</span>
              <span className="text-[10px] font-medium text-slate-500 block -mt-0.5">Enterprise Safety</span>
            </div>
          </div>
          <span className="text-[10px] font-medium bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
            OIL
          </span>
        </div>

        {/* Navigation Sections */}
        <div className="p-3 space-y-6">
          
          {/* Main Navigation */}
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 mb-2">
              Platform Navigation
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== '/admin' && item.href !== '/worker' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-slate-100 text-teal-800 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-teal-700' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="w-3 h-3 text-teal-700" />}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Quick Info Block */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
            <div className="flex items-center space-x-1.5 text-slate-700 font-semibold mb-1">
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              <span className="truncate">{user.site_id || 'OIL-DULIAJAN-01'}</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              Operational Safety & Fatality Risk Monitoring Protocol
            </p>
          </div>

        </div>
      </div>

      {/* User Footer */}
      <div className="p-3 border-t border-slate-200 bg-white">
        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
          <div className="flex items-center space-x-2 truncate">
            <div className="w-7 h-7 rounded-md bg-teal-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="truncate text-left">
              <div className="text-xs font-semibold text-slate-900 truncate leading-tight">{user.name}</div>
              <span className="text-[10px] text-slate-500 font-mono block leading-tight">{user.role}</span>
            </div>
          </div>

          <button
            onClick={logout}
            className="text-slate-400 hover:text-rose-600 p-1.5 rounded hover:bg-rose-50 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
