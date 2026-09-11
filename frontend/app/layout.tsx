import './globals.css';
import type { Metadata } from 'next';
import { AuthProvider } from '@/lib/authContext';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';

export const metadata: Metadata = {
  title: 'SIFRA AI — Industrial Safety Incident Analysis Platform',
  description: 'Enterprise Fatality Risk Classification and RAG Incident Safety Platform for Oil India Limited (OIL)',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-slate-50 text-slate-900 antialiased min-h-screen font-sans selection:bg-teal-700 selection:text-white" suppressHydrationWarning>
        <AuthProvider>
          <div className="flex h-screen overflow-hidden bg-slate-50">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
              <TopBar />
              <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
                {children}
              </main>
              <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
                SIFRA AI Enterprise • Industrial Compliance System • Oil India Limited (OIL)
              </footer>
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
