import React from 'react';
import type { Metadata } from 'next';
import BackButton from '@/components/BackButton';
import { HugeiconsIcon } from '@hugeicons/react';
import { LogOut01Icon } from '@/lib/icons';

export const metadata: Metadata = {
  title: 'Unauthorized Access | LinkMount',
  robots: { index: false, follow: false },
};

export default function UnauthorizedPage() {
  return (
    <main className="min-h-screen w-full flex items-center justify-center p-6 bg-slate-50 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-100/70 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-3xl p-8 sm:p-10 shadow-xl shadow-slate-200/50 relative z-10 text-center space-y-6">
        {/* Shield / Access Icon badge */}
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 mx-auto flex items-center justify-center shadow-xs">
          <HugeiconsIcon icon={LogOut01Icon} size={32} color="currentColor" strokeWidth={1.8} />
        </div>

        <div className="space-y-2">
          <div className="inline-block px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold uppercase tracking-wider mb-1">
            HTTP 401
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Unauthorized Access
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            You do not have permission to view this resource, or this link is invalid.
          </p>
        </div>

        <div className="pt-2">
          <BackButton label="Go Back" />
        </div>
      </div>
    </main>
  );
}
