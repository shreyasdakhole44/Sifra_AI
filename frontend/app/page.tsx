'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (user.role === 'Worker') {
        router.push('/worker');
      } else {
        router.push('/admin');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex items-center space-x-3 text-slate-500 font-medium text-sm">
        <div className="w-5 h-5 border-2 border-oil-600 border-t-transparent rounded-full animate-spin" />
        <span>Redirecting to SIFRA AI Portal...</span>
      </div>
    </div>
  );
}
