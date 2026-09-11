import './globals.css';
import type { Metadata } from 'next';
import { AuthProvider } from '@/lib/authContext';
import { AppLayoutWrapper } from '@/components/AppLayoutWrapper';

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
          <AppLayoutWrapper>
            {children}
          </AppLayoutWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
