'use client';

import { WorkerDashboard } from '@/components/WorkerDashboard';

export default function WorkerPage({ searchParams }: { searchParams?: { tab?: string } }) {
  return <WorkerDashboard initialTab={searchParams?.tab || 'reports'} />;
}
