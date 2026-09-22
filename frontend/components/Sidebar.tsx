'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { 
  ShieldCheck, 
  Activity, 
  FileText, 
  MapPin, 
  Users, 
  BookOpen, 
  Bell, 
  Sliders, 
  LogOut, 
  UserRound, 
  ClipboardList,
  BookOpenCheck,
  Trophy, 
  ChevronRight,
  X,
  View
} from 'lucide-react';

interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar = ({ isMobileOpen = false, onCloseMobile }: SidebarProps) => {
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
    { label: 'My Profile', href: '/worker', icon: UserRound },
    { label: 'Safety History', href: '/worker/history', icon: ClipboardList },
    { label: 'Alerts', href: '/worker/alerts', icon: Bell },
    { label: 'Assigned Quizzes', href: '/worker/quizzes', icon: BookOpenCheck },
    { label: 'AR/VR Training', href: '/worker/ar-training', icon: View },
    { label: 'Leaderboard', href: '/worker/leaderboard', icon: Trophy },
  ];

  const mainItems = isAdminOrHse ? officerNavItems : workerNavItems;
  const secondaryItems = isAdminOrHse ? officerSystemItems : [];

  const isLinkActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    if (href === '/worker') return pathname === '/worker' || pathname === '/worker/profile';
    return pathname === href || pathname.startsWith(href + '/');
  };

  const handleNavClick = () => {
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full bg-white select-none">
      <div>
        {/* Brand Header */}
        <div className="h-16 px-4 border-b border-slate-200 flex items-center justify-between">
          <Link href={isAdminOrHse ? '/admin' : '/worker'} onClick={handleNavClick} className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-teal-700 text-white rounded-lg flex items-center justify-center font-bold text-xs shadow-sm shrink-0">
              <ShieldCheck className="w-5 h-5 text-teal-100" />
            </div>
            <div>
              <span className="font-semibold text-sm text-slate-900 tracking-tight block">SIFRA AI</span>
              <span className="text-xs text-slate-500 block -mt-0.5 font-normal">
                {isAdminOrHse ? 'Enterprise Safety' : 'Worker Safety Portal'}
              </span>
            </div>
          </Link>

          {/* Close button for mobile drawer */}
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
            title="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Section */}
        <div className="p-3 space-y-1">
          <nav className="space-y-1">
            {mainItems.map((item) => {
              const Icon = item.icon;
              const active = isLinkActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleNavClick}
                  className={`h-11 flex items-center justify-between px-3 gap-3 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-teal-50 text-teal-800 font-semibold border-l-2 border-teal-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-3 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-teal-700' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {active && <ChevronRight className="w-4 h-4 text-teal-700 shrink-0" />}
                </Link>
              );
            })}
          </nav>

          {secondaryItems.length > 0 && (
            <div className="pt-3 mt-3 border-t border-slate-200 space-y-1">
              {secondaryItems.map((item) => {
                const Icon = item.icon;
                const active = isLinkActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={handleNavClick}
                    className={`h-11 flex items-center justify-between px-3 gap-3 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? 'bg-teal-50 text-teal-800 font-semibold border-l-2 border-teal-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3 truncate">
                      <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-teal-700' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {active && <ChevronRight className="w-4 h-4 text-teal-700 shrink-0" />}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Area: Logout & Worker Profile Card */}
      <div className="p-3 border-t border-slate-200 space-y-3 bg-slate-50/50">
        {/* Logout Button */}
        <button
          onClick={() => {
            handleNavClick();
            logout();
          }}
          className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:text-rose-700 hover:bg-rose-50 transition-colors text-left group"
        >
          <LogOut className="w-4 h-4 text-slate-400 group-hover:text-rose-600 shrink-0" />
          <span>Log out</span>
        </button>

        {/* Worker Profile Card */}
        <div className="flex items-center space-x-3 p-2.5 rounded-xl bg-white border border-slate-200/90 shadow-xs">
          <div className="w-9 h-9 rounded-full bg-teal-700 text-white flex items-center justify-center font-bold text-sm shrink-0">
            {(user.name || 'Ramesh Kumar').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-slate-900 truncate leading-tight">
              {user.name || 'Ramesh Kumar'}
            </div>
            <div className="text-xs text-slate-500 truncate leading-tight mt-0.5">
              {user.role === 'Worker' ? 'Field Operations Worker' : user.role}
            </div>
            <div className="text-xs font-mono text-slate-500 truncate leading-tight mt-0.5">
              {user.worker_id || 'OIL-W-101'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (hidden on mobile) */}
      <aside className="hidden md:block w-64 border-r border-slate-200 shrink-0 h-screen sticky top-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (overlay on mobile when isMobileOpen is true) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          {/* Sliding Drawer */}
          <aside className="relative w-72 max-w-[80vw] bg-white h-full shadow-2xl z-10 flex flex-col">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};
