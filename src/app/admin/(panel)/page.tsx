'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Add01Icon,
  Copy01Icon,
  EyeIcon,
  Edit01Icon,
  Delete01Icon,
  Download01Icon,
  Globe02Icon,
  QrCode01Icon,
  Link01Icon,
} from '@/lib/icons';
import { toast } from 'sonner';
import ConfirmModal from '@/components/ConfirmModal';

interface TenantItem {
  _id: string;
  name: string;
  displayName?: string;
  bio?: string;
  avatarPath?: string;
  token: string;
  isActive: boolean;
  expiresAt?: string | null;
  views: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  links?: any[];
  qr?: {
    imagePath?: string;
    updatedAt?: string;
  };
  createdAt: string;
}

export default function AdminDashboardPage() {
  const [tenants, setTenants] = useState<TenantItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Deletion modal state
  const [deleteModalTenant, setDeleteModalTenant] = useState<TenantItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchTenants = async () => {
    try {
      const res = await fetch('/api/admin/tenants');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch tenants');
      setTenants(data.tenants || []);
    } catch (err: any) {
      toast.error(err.message || 'Error loading link pages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  // Quick toggle active/inactive
  const handleToggleActive = async (tenant: TenantItem) => {
    try {
      const res = await fetch(`/api/admin/tenants/${tenant._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: tenant.name,
          isActive: !tenant.isActive,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to toggle status');

      setTenants((prev) =>
        prev.map((t) => (t._id === tenant._id ? { ...t, isActive: !t.isActive } : t))
      );
      toast.success(`Page ${!tenant.isActive ? 'activated' : 'deactivated'}`);
    } catch (err: any) {
      toast.error(err.message || 'Error updating status');
    }
  };

  // Delete tenant
  const handleConfirmDelete = async () => {
    if (!deleteModalTenant) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/tenants/${deleteModalTenant._id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete tenant');

      setTenants((prev) => prev.filter((t) => t._id !== deleteModalTenant._id));
      toast.success('Page deleted successfully');
      setDeleteModalTenant(null);
    } catch (err: any) {
      toast.error(err.message || 'Error deleting tenant');
    } finally {
      setIsDeleting(false);
    }
  };

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  const copyLink = (token: string) => {
    const full = `${baseUrl.replace(/\/$/, '')}/p/${token}`;
    navigator.clipboard.writeText(full);
    toast.success('Public URL copied to clipboard');
  };

  // Aggregated Stats
  const totalPages = tenants.length;
  const activePages = tenants.filter((t) => {
    const isExpired = t.expiresAt && new Date(t.expiresAt) < new Date();
    return t.isActive && !isExpired;
  }).length;
  const totalViews = tenants.reduce((acc, curr) => acc + (curr.views || 0), 0);
  const totalClicks = tenants.reduce((acc, curr) => {
    const linkClicks = (curr.links || []).reduce(
      (sum: number, l: any) => sum + (l.clicks || 0),
      0
    );
    return acc + linkClicks;
  }, 0);

  // Filtered tenants list
  const filteredTenants = tenants.filter((tenant) => {
    const isExpired = tenant.expiresAt && new Date(tenant.expiresAt) < new Date();
    const effectiveActive = tenant.isActive && !isExpired;

    if (statusFilter === 'active' && !effectiveActive) return false;
    if (statusFilter === 'inactive' && effectiveActive) return false;

    if (search.trim()) {
      const term = search.toLowerCase();
      const matchName = tenant.name?.toLowerCase().includes(term);
      const matchDisplay = tenant.displayName?.toLowerCase().includes(term);
      const matchToken = tenant.token?.toLowerCase().includes(term);
      return matchName || matchDisplay || matchToken;
    }

    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your tenants, monitor engagement, and access branded QR codes.
          </p>
        </div>

        <Link
          href="/admin/tenants/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-sm shadow-indigo-600/20 transition active:scale-95 self-start sm:self-auto cursor-pointer"
        >
          <HugeiconsIcon icon={Add01Icon} size={18} color="currentColor" strokeWidth={2} />
          <span>New Link Page</span>
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Pages */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Pages
            </span>
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <HugeiconsIcon icon={Globe02Icon} size={20} />
            </span>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {totalPages}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Configured tenant pages</div>
        </div>

        {/* Active Pages */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Pages
            </span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
            </span>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {activePages}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Live & accepting traffic</div>
        </div>

        {/* Total Views */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Views
            </span>
            <span className="p-2 rounded-xl bg-cyan-50 text-cyan-600">
              <HugeiconsIcon icon={EyeIcon} size={20} />
            </span>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {totalViews.toLocaleString()}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Unique session impressions</div>
        </div>

        {/* Total Clicks */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Clicks
            </span>
            <span className="p-2 rounded-xl bg-violet-50 text-violet-600">
              <HugeiconsIcon icon={Link01Icon} size={20} />
            </span>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {totalClicks.toLocaleString()}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Total button interactions</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, display, or token..."
            className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:outline-none transition shadow-xs"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex gap-2 self-start sm:self-auto">
          {(['all', 'active', 'inactive'] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition cursor-pointer border ${
                statusFilter === filter
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Tenants List */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500">Loading your pages...</p>
        </div>
      ) : filteredTenants.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-slate-200 rounded-3xl bg-white shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 mx-auto mb-3">
            <HugeiconsIcon icon={Globe02Icon} size={24} />
          </div>
          <h3 className="text-base font-semibold text-slate-900">No Link Pages Found</h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
            {search
              ? 'No tenants match your search filter.'
              : 'Get started by creating your very first multi-tenant link page.'}
          </p>
          {!search && (
            <Link
              href="/admin/tenants/new"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition shadow-sm shadow-indigo-600/20"
            >
              <HugeiconsIcon icon={Add01Icon} size={16} />
              <span>Create Link Page</span>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTenants.map((tenant) => {
            const isExpired = tenant.expiresAt && new Date(tenant.expiresAt) < new Date();
            const publicUrl = `${baseUrl.replace(/\/$/, '')}/p/${tenant.token}`;
            const qrCacheBust = tenant.qr?.updatedAt
              ? new Date(tenant.qr.updatedAt).getTime()
              : Date.now();
            const qrUrl = tenant.qr?.imagePath ? `${tenant.qr.imagePath}?v=${qrCacheBust}` : null;

            return (
              <div
                key={tenant._id}
                className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  {/* Top Bar: Avatar, Names, Status Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {tenant.avatarPath ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={tenant.avatarPath}
                          alt={tenant.name}
                          className="w-11 h-11 rounded-full object-cover border border-slate-200 shrink-0 shadow-xs"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-sm shrink-0">
                          {tenant.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <h2 className="text-sm font-bold text-slate-900 truncate">{tenant.name}</h2>
                        {tenant.displayName && (
                          <p className="text-xs text-slate-500 truncate">{tenant.displayName}</p>
                        )}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div>
                      {isExpired ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          Expired
                        </span>
                      ) : tenant.isActive ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                          Disabled
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Public Link Bar */}
                  <div className="mt-4 p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between gap-2">
                    <span className="text-xs font-mono text-indigo-600 truncate pl-1 font-semibold">
                      /p/{tenant.token}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => copyLink(tenant.token)}
                        className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-200/60 transition cursor-pointer"
                        title="Copy Public Link"
                      >
                        <HugeiconsIcon icon={Copy01Icon} size={15} />
                      </button>
                      <a
                        href={publicUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-200/60 transition"
                        title="Open in new tab"
                      >
                        <HugeiconsIcon icon={EyeIcon} size={15} />
                      </a>
                    </div>
                  </div>

                  {/* QR & Metrics Section */}
                  <div className="mt-4 flex items-center justify-between gap-4 p-3 rounded-xl bg-slate-50/70 border border-slate-200/70">
                    {/* QR Thumbnail */}
                    <div className="flex items-center gap-3">
                      {qrUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={qrUrl}
                          alt="QR Code"
                          className="w-12 h-12 rounded-lg bg-white p-1 object-contain shrink-0 shadow-xs border border-slate-200"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-slate-200 flex items-center justify-center text-slate-500 shrink-0">
                          <HugeiconsIcon icon={QrCode01Icon} size={20} />
                        </div>
                      )}
                      <a
                        href={`/api/admin/tenants/${tenant._id}/qr?download=true`}
                        className="text-xs font-medium text-slate-600 hover:text-indigo-600 flex items-center gap-1 transition"
                        title="Download High-Res QR"
                      >
                        <HugeiconsIcon icon={Download01Icon} size={14} />
                        <span>PNG</span>
                      </a>
                    </div>

                    {/* Views & Links count */}
                    <div className="text-right">
                      <div className="text-xs font-semibold text-slate-900">
                        {tenant.views || 0} views
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {tenant.links?.length || 0} links
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  {/* Quick Toggle */}
                  <button
                    type="button"
                    onClick={() => handleToggleActive(tenant)}
                    className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition cursor-pointer"
                  >
                    {tenant.isActive ? 'Deactivate' : 'Activate'}
                  </button>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/tenants/${tenant._id}/edit`}
                      className="p-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-xl transition cursor-pointer"
                      title="Edit Link Page"
                    >
                      <HugeiconsIcon icon={Edit01Icon} size={16} />
                    </Link>

                    <button
                      type="button"
                      onClick={() => setDeleteModalTenant(tenant)}
                      className="p-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                      title="Delete Page"
                    >
                      <HugeiconsIcon icon={Delete01Icon} size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteModalTenant)}
        title="Delete Link Page?"
        message={`Are you sure you want to delete "${deleteModalTenant?.name}"? All associated uploaded files (avatar, QR logo, and generated QR code) will also be deleted immediately. This action cannot be undone.`}
        confirmLabel="Yes, Delete Page"
        cancelLabel="Cancel"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModalTenant(null)}
      />
    </div>
  );
}
