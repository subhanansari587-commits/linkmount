import React from 'react';
import connectDB from '@/lib/db';
import Settings from '@/models/Settings';
import { getServerSession } from '@/lib/auth';
import AdminNavbar from '@/components/AdminNavbar';

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  await connectDB();
  const settings = await Settings.findOne().lean();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <AdminNavbar
        adminEmail={session?.email || 'admin@example.com'}
        siteName={settings?.siteName || 'LinkMount'}
      />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
