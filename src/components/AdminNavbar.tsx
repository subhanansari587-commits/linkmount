'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Link01Icon,
  Settings01Icon,
  LogOut01Icon,
  Add01Icon,
  QrCode01Icon,
} from '@/lib/icons';
import { toast } from 'sonner';

interface AdminNavbarProps {
  adminEmail?: string;
  siteName?: string;
}

export default function AdminNavbar({
  adminEmail = 'admin@example.com',
  siteName = 'LinkMount',
}: AdminNavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const res = await fetch('/api/admin/logout', { method: 'POST' });
      if (!res.ok) throw new Error('Logout failed');
      toast.success('Signed out successfully');
      router.push('/admin/login');
      router.refresh();
    } catch {
      toast.error('Failed to log out');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const navLinks = [
    { href: '/admin', label: 'Dashboard', icon: Link01Icon },
    { href: '/admin/settings', label: 'Settings', icon: Settings01Icon },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <Link href="/admin" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <HugeiconsIcon icon={QrCode01Icon} size={20} color="#ffffff" strokeWidth={2} />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-base tracking-tight">{siteName}</span>
              <span className="ml-2 text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                Admin
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const isActive =
                link.href === '/admin'
                  ? pathname === '/admin'
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    isActive
                      ? 'bg-slate-100 text-slate-900 font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <HugeiconsIcon icon={link.icon} size={16} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/admin/tenants/new"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm shadow-indigo-600/20 transition active:scale-95"
          >
            <HugeiconsIcon icon={Add01Icon} size={16} color="currentColor" strokeWidth={2} />
            <span>Create Page</span>
          </Link>

          {/* Admin Email badge */}
          <div className="hidden lg:flex items-center px-3 py-1 rounded-full bg-slate-100 border border-slate-200/80 text-[11px] font-medium text-slate-600">
            {adminEmail}
          </div>

          {/* Logout Button */}
          <button
            type="button"
            disabled={isLoggingOut}
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200/80 hover:border-rose-200 text-xs font-semibold transition cursor-pointer shadow-xs"
            title="Sign Out"
          >
            <HugeiconsIcon
              icon={LogOut01Icon}
              size={16}
              className={isLoggingOut ? 'animate-spin' : ''}
            />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
