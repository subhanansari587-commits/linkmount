'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { HugeiconsIcon } from '@hugeicons/react';
import { QrCode01Icon, Mail01Icon } from '@/lib/icons';
import { toast } from 'sonner';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get('next');

  // Prevent open redirect: only redirect to paths starting strictly with /admin
  const safeNextUrl =
    nextParam && nextParam.startsWith('/admin') && !nextParam.startsWith('/admin/login')
      ? nextParam
      : '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorText = data.error || 'Invalid credentials';
        setErrorMessage(errorText);
        toast.error(errorText);
        return;
      }

      toast.success('Signed in successfully!');
      router.push(safeNextUrl);
      router.refresh();
    } catch {
      setErrorMessage('An unexpected network error occurred.');
      toast.error('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-3xl p-8 sm:p-10 shadow-xl shadow-slate-200/50 relative z-10">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 mx-auto flex items-center justify-center text-white shadow-lg shadow-indigo-600/25 mb-4">
          <HugeiconsIcon icon={QrCode01Icon} size={28} color="#ffffff" strokeWidth={2} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Portal</h1>
        <p className="mt-1 text-xs text-slate-500">
          Sign in to manage your multi-tenant link pages and QR codes.
        </p>
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs text-center font-medium">
          {errorMessage}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Admin Email
          </label>
          <div className="relative">
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:border-indigo-500 focus:outline-none transition shadow-xs"
            />
            <div className="absolute left-3 top-3 text-slate-400 pointer-events-none">
              <HugeiconsIcon icon={Mail01Icon} size={18} />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:border-indigo-500 focus:outline-none transition shadow-xs"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 text-white font-semibold text-sm shadow-md shadow-indigo-600/20 transition active:scale-98 flex items-center justify-center gap-2 cursor-pointer mt-2"
        >
          {isLoading && (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          )}
          <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
        </button>
      </form>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen w-full flex items-center justify-center p-6 bg-slate-50 relative overflow-hidden">
      {/* Ambient background gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-100/70 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-violet-100/70 rounded-full blur-3xl pointer-events-none" />

      <Suspense
        fallback={
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-10 text-center text-slate-500 text-sm shadow-lg">
            Loading sign in...
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </main>
  );
}
