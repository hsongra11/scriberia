import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '../../(auth)/auth';
import { RecentNotes } from '@/components/dashboard/recent-notes';
import { DailyTasks } from '@/components/dashboard/daily-tasks';
import { QuickActions } from '@/components/dashboard/quick-actions';

export const metadata: Metadata = {
  title: 'Dashboard | HyperScribe',
  description: 'Your personal dashboard for notes and tasks',
};

export default async function DashboardPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Welcome, {session.user.name || "User"}</h1>
        <p className="text-muted-foreground">Here&apos;s a summary of your notes and tasks</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentNotes />
        </div>
        <div className="space-y-6">
          <QuickActions />
          <DailyTasks />
        </div>
      </div>
    </div>
  );
} 