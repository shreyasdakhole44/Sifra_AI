'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';

export const AppLayoutWrapper = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const isPublicPage = pathname === '/' || pathname === '/login';
  const isAdminPage = pathname.startsWith('/admin');

  if (isPublicPage) {
    return (
      <div className="min-h-screen bg-slate-50">
        {children}
      </div>
    );
  }

  if (isAdminPage) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <TopBar isMobileOpen={isMobileOpen} onToggleMobile={() => setIsMobileOpen(!isMobileOpen)} />
        <main className="flex-1 p-3 sm:p-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
        <footer className="bg-white border-t border-slate-200 py-3 sm:py-4 px-4 text-center text-xs text-slate-500">
          SIFRA AI Enterprise &bull; Industrial Compliance System
        </footer>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar isMobileOpen={isMobileOpen} onCloseMobile={() => setIsMobileOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <TopBar isMobileOpen={isMobileOpen} onToggleMobile={() => setIsMobileOpen(!isMobileOpen)} />
        <main className="flex-1 p-3 sm:p-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
        <footer className="bg-white border-t border-slate-200 py-3 sm:py-4 px-4 text-center text-xs text-slate-500">
          SIFRA AI Enterprise &bull; Industrial Safety Intelligence System
        </footer>
      </div>
    </div>
  );
};
