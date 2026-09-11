'use client';

import { AdminDashboard } from '@/components/AdminDashboard';

export default function AdminPage({ searchParams }: { searchParams?: { tab?: string } }) {
  return <AdminDashboard initialTab={searchParams?.tab || 'overview'} />;
}
