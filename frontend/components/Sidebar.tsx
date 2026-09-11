'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { 
  ShieldAlert, 
  Activity, 
  FileText, 
  MapPin, 
  Users, 
  BookOpen, 
  Bell, 
  Sliders, 
  LogOut, 
  User, 
  Trophy, 
  ChevronRight
} from 'lucide-react';

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  // Hide sidebar on public pages, login, or admin portal routes
  if (!user || pathname === '/login' || pathname === '/' || pathname.startsWith('/admin')) return null;

  const isAdminOrHse = user.role === 'Admin' || user.role === 'HSE Officer';

  const officerNavItems = [
    { label: 'Overview & Heatmap', href: '/admin', icon: Activity },
    { label: 'Reports & AI Analysis', href: '/admin/reports', icon: FileText },
    { label: 'Risk Map', href: '/admin/map', icon: MapPin },
    { label: 'Worker Safety Register', href: '/admin/workers', icon: Users },
    { label: 'Safety Quizzes', href: '/admin/quizzes', icon: BookOpen },
    { label: 'PDF Trust Reports', href: '/admin/pdf-reports', icon: FileText },
  ];

  const officerSystemItems = [
    { label: 'System Settings', href: '/admin/settings', icon: Sliders },
  ];

  const workerNavItems = [
    { label: 'My Profile', href: '/worker', icon: User },
    { label: 'Safety History', href: '/worker/history', icon: ShieldAlert },
    { label: 'Alerts', href: '/worker/alerts', icon: Bell },
    { label: 'Assigned Quizzes', href: '/worker/quizzes', icon: BookOpen },
    { label: 'Leaderboard', href: '/worker/leaderboard', icon: Trophy },
  ];

  const mainItems = isAdminOrHse ? officerNavItems : workerNavItems;
  const secondaryItems = isAdminOrHse ? officerSystemItems : [];
  const dividerLabel = isAdminOrHse ? 'System' : 'Account';

  const isLinkActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    if (href === '/worker') return pathname === '/worker' || pathname === '/worker/profile';
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 shrink-0 flex flex-col justify-between h-screen sticky top-0 z-30 select-none">
      <div>
        {/* Brand Header */}
        <div className="h-14 px-4 border-b border-slate-200 flex items-center justify-between">
          <Link href={isAdminOrHse ? '/admin' : '/worker'} className="flex items-center space-x-2.5">
            <div className="w-7 h-7 bg-teal-700 text-white rounded-lg flex items-center justify-center font-bold text-xs shadow-sm">
              <ShieldAlert className="w-4 h-4 text-teal-100" />
            </div>
            <div>
              <span className="font-semibold text-sm text-slate-900 tracking-tight">OIL SIFRA AI</span>
              <span className="text-[10px] font-medium text-slate-500 block -mt-0.5">Enterprise Safety</span>
            </div>
          </Link>
          <span className="text-[10px] font-medium bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200 font-mono">
            OIL
          </span>
        </div>

        {/* Navigation Sections */}
        <div className="p-3 space-y-4">
          
          {/* Main Navigation */}
          <nav className="space-y-1">
            {mainItems.map((item) => {
              const Icon = item.icon;
              const active = isLinkActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    active
                      ? 'bg-slate-100 text-teal-800 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className={`w-4 h-4 ${active ? 'text-teal-700' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {active && <ChevronRight className="w-3.5 h-3.5 text-teal-700" />}
                </Link>
              );
            })}
          </nav>

          {/* Section Divider */}
          <div className="pt-2 border-t border-slate-200">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
              {dividerLabel}
            </div>

            {/* Secondary Navigation Items */}
            <nav className="space-y-1">
              {secondaryItems.map((item) => {
                const Icon = item.icon;
                const active = isLinkActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      active
                        ? 'bg-slate-100 text-teal-800 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon className={`w-4 h-4 ${active ? 'text-teal-700' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {active && <ChevronRight className="w-3.5 h-3.5 text-teal-700" />}
                  </Link>
                );
              })}

              {/* Logout Item in Divider Section */}
              <button
                onClick={logout}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-rose-700 hover:bg-rose-50 transition-colors text-left"
              >
                <div className="flex items-center space-x-2.5">
                  <LogOut className="w-4 h-4 text-slate-400 group-hover:text-rose-600" />
                  <span>Logout</span>
                </div>
              </button>
            </nav>
          </div>

        </div>
      </div>

      {/* User Info Footer */}
      <div className="p-3 border-t border-slate-200 bg-white">
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
          <div className="flex items-center space-x-2.5 truncate">
            <div className="w-7 h-7 rounded-md bg-teal-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="truncate text-left">
              <div className="text-xs font-semibold text-slate-900 truncate leading-tight">{user.name}</div>
              <span className="text-[10px] text-slate-500 font-mono block leading-tight">{user.role}</span>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold bg-white text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
            {user.worker_id || 'OIL'}
          </span>
        </div>
      </div>
    </aside>
  );
};
