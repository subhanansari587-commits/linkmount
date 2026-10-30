'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Upload01Icon,
  Delete01Icon,
  Copy01Icon,
  EyeIcon,
  RefreshIcon,
  Download01Icon,
} from '@/lib/icons';

import { ITenant, ILink, ITheme } from '@/models/Tenant';
import { normalizeLinkUrl } from '@/lib/validators';
import LinksEditor from './LinksEditor';
import ThemeEditor from './ThemeEditor';
import QrCard from './QrCard';
import LivePreview from './LivePreview';
import ConfirmModal from './ConfirmModal';

interface TenantFormProps {
  initialData?: any;
  isEditing?: boolean;
}

const DEFAULT_THEME: ITheme = {
  bgType: 'solid',
  bgColor: '#0f172a',
  bgColor2: '#1e293b',
  bgDesktopImage: '',
  bgMobileImage: '',
  textColor: '#ffffff',
  buttonColor: '#ffffff',
  buttonTextColor: '#0f172a',
  buttonStyle: 'filled',
  radius: 'full',
};

export default function TenantForm({ initialData, isEditing = false }: TenantFormProps) {
  const router = useRouter();

  // Basic Info state
  const [name, setName] = useState(initialData?.name || '');
  const [displayName, setDisplayName] = useState(initialData?.displayName || '');
  const [bio, setBio] = useState(initialData?.bio || '');
  const [avatarPath, setAvatarPath] = useState(initialData?.avatarPath || '');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Status and Expiry state
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [expiresAt, setExpiresAt] = useState<string>(() => {
    if (initialData?.expiresAt) {
      try {
        return new Date(initialData.expiresAt).toISOString().slice(0, 16);
      } catch {
        return '';
      }
    }
    return '';
  });

  // Links state
  const [links, setLinks] = useState<ILink[]>(initialData?.links || []);

  // Theme state
  const [theme, setTheme] = useState<ITheme>(initialData?.theme || DEFAULT_THEME);

  // QR state
  const [qrColor, setQrColor] = useState(initialData?.qr?.color || '#000000');
  const [qrLogoPath, setQrLogoPath] = useState(initialData?.qr?.logoPath || '');
  const [qrState, setQrState] = useState(initialData?.qr);
  const [token, setToken] = useState(initialData?.token || '');

  // Loading & Modals
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegeneratingToken, setIsRegeneratingToken] = useState(false);
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);

  // Success modal state after Create
  const [createdTenantData, setCreatedTenantData] = useState<ITenant | null>(null);

  // Active tab in form: 'content' | 'theme' | 'qr'
  const [activeTab, setActiveTab] = useState<'content' | 'theme' | 'qr'>('content');

  // Avatar upload handler
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Avatar file size cannot exceed 2MB');
      return;
    }

    setUploadingAvatar(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'avatar');
    if (avatarPath) {
      formData.append('oldPath', avatarPath);
    }

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload avatar');

      setAvatarPath(data.path);
      toast.success('Avatar uploaded successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Avatar upload failed');
    } finally {
      setUploadingAvatar(false);
      e.target.value = '';
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarPath('');
    toast.info('Avatar removed');
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Internal Page Name is required');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      name: name.trim(),
      displayName: displayName.trim(),
      bio: bio.trim(),
      avatarPath,
      links: links.map((l) => ({
        ...l,
        label: (l.label || '').trim(),
        url: normalizeLinkUrl(l.url, l.icon),
      })),
      theme,
      qrColor,
      qrLogoPath,
      isActive,
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
    };

    try {
      const url = isEditing
        ? `/api/admin/tenants/${initialData?._id}`
        : '/api/admin/tenants';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save link page');
      }

      if (isEditing) {
        toast.success('Page updated successfully!');
        if (data.tenant) {
          setQrState(data.tenant.qr);
        }
      } else {
        toast.success('Page created successfully!');
        setCreatedTenantData(data.tenant);
      }
    } catch (err: any) {
      toast.error(err.message || 'An error occurred while saving');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Regenerate Token Handler
  const handleRegenerateToken = async () => {
    if (!initialData?._id) return;
    setIsRegeneratingToken(true);
    try {
      const res = await fetch(`/api/admin/tenants/${initialData._id}/regenerate-token`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to regenerate token');

      setToken(data.token);
      setQrState(data.qr);
      setShowRegenerateModal(false);
      toast.success('Link token regenerated! The old URL is now invalid.');
    } catch (err: any) {
      toast.error(err.message || 'Token regeneration failed');
    } finally {
      setIsRegeneratingToken(false);
    }
  };

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied link to clipboard!');
  };

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Controls Column (7/12 on large screens) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 space-x-6 text-sm font-semibold">
            {[
              { id: 'content', label: '1. Content & Links' },
              { id: 'theme', label: '2. Theme & Design' },
              { id: 'qr', label: '3. QR Code & Status' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3 font-medium transition cursor-pointer border-b-2 -mb-[2px] ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: Content & Links */}
          {activeTab === 'content' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Basic Info Card */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-5">
                <h3 className="text-base font-semibold text-slate-900">Basic Information</h3>

                {/* Internal Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Internal Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Acme Marketing Campaign"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:border-indigo-500 focus:outline-none transition shadow-xs"
                  />
                  <p className="mt-1 text-[11px] text-slate-500">
                    Internal identifier visible in your admin dashboard.
                  </p>
                </div>

                {/* Avatar Upload */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Profile Avatar
                  </label>
                  <div className="flex items-center gap-4">
                    {avatarPath ? (
                      <div className="relative group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={avatarPath}
                          alt="Avatar preview"
                          className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500/50 shadow-xs"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveAvatar}
                          className="absolute -top-1 -right-1 p-1 bg-rose-600 hover:bg-rose-500 text-white rounded-full shadow cursor-pointer transition"
                          title="Remove Avatar"
                        >
                          <HugeiconsIcon icon={Delete01Icon} size={12} />
                        </button>
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-xs font-semibold">
                        No Photo
                      </div>
                    )}

                    <div className="relative">
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleAvatarUpload}
                        disabled={uploadingAvatar}
                        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                      />
                      <div className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-xs font-medium text-slate-700 transition cursor-pointer flex items-center gap-2">
                        <HugeiconsIcon icon={Upload01Icon} size={16} />
                        <span>{uploadingAvatar ? 'Uploading...' : 'Upload Avatar'}</span>
                      </div>
                    </div>
                  </div>
                  <p className="mt-1.5 text-[11px] text-slate-500">
                    PNG, JPG, or WEBP up to 2MB (Auto-resized to 512px).
                  </p>
                </div>

                {/* Display Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Acme Corporation"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:border-indigo-500 focus:outline-none transition shadow-xs"
                  />
                  <p className="mt-1 text-[11px] text-slate-500">
                    The public headline seen by visitors at the top of the page.
                  </p>
                </div>

                {/* Bio */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Bio Description
                    </label>
                    <span
                      className={`text-[11px] ${
                        bio.length > 200 ? 'text-rose-600 font-bold' : 'text-slate-400'
                      }`}
                    >
                      {bio.length}/200
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    maxLength={200}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Brief description, mission, or social greeting..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:border-indigo-500 focus:outline-none transition resize-none shadow-xs"
                  />
                </div>
              </div>

              {/* Links Editor Card */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
                <LinksEditor links={links} onChange={setLinks} />
              </div>
            </div>
          )}

          {/* TAB 2: Theme & Design */}
          {activeTab === 'theme' && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs animate-in fade-in duration-150">
              <ThemeEditor theme={theme} onChange={setTheme} />
            </div>
          )}

          {/* TAB 3: QR Code & Status */}
          {activeTab === 'qr' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* QR Code Config */}
              <QrCard
                tenantId={initialData?._id}
                imagePath={qrState?.imagePath}
                updatedAt={qrState?.updatedAt}
                color={qrColor}
                logoPath={qrLogoPath}
                isNew={!isEditing}
                onColorChange={setQrColor}
                onLogoChange={setQrLogoPath}
                onRegenerated={(newQr) => setQrState(newQr as any)}
              />

              {/* Status and Expiry Card */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
                <h3 className="text-base font-semibold text-slate-900">Status & Availability</h3>

                {/* Active Toggle */}
                <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                  <div>
                    <p className="text-sm font-medium text-slate-900">Page Active</p>
                    <p className="text-xs text-slate-500">
                      When disabled, visitors will see the Link Expired page.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                {/* Expiry Date */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Auto-Expiry Date (Optional)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="datetime-local"
                      value={expiresAt}
                      onChange={(e) => setExpiresAt(e.target.value)}
                      className="flex-1 px-3.5 py-2 text-sm rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none transition shadow-xs"
                    />
                    {expiresAt && (
                      <button
                        type="button"
                        onClick={() => setExpiresAt('')}
                        className="px-3 py-2 text-xs font-medium rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">
                    If set, the page will automatically expire and become inaccessible at this date.
                  </p>
                </div>
              </div>

              {/* Danger Zone: Regenerate Token */}
              {isEditing && (
                <div className="border border-rose-200 bg-rose-50/50 rounded-2xl p-6 space-y-4">
                  <h3 className="text-base font-semibold text-rose-700">Danger Zone</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Regenerating the link token immediately deactivates the current URL. Anyone with
                    the old link or older printed QR codes will be blocked with an Unauthorized message.
                  </p>
                  <div className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-rose-200 shadow-xs">
                    <div className="min-w-0 pr-4">
                      <p className="text-xs font-mono text-slate-600 truncate">Token: {token}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowRegenerateModal(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition active:scale-95 cursor-pointer shrink-0 shadow-xs"
                    >
                      <HugeiconsIcon icon={RefreshIcon} size={14} />
                      <span>Regenerate Link</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Form Submit Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => router.push('/admin')}
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-sm font-medium text-slate-700 transition cursor-pointer shadow-xs"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 text-sm font-semibold text-white shadow-sm shadow-indigo-600/20 transition flex items-center gap-2 cursor-pointer active:scale-95"
            >
              {isSubmitting && (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              <span>{isEditing ? 'Save Changes' : 'Create Link Page'}</span>
            </button>
          </div>
        </div>

        {/* Live Preview Column (5/12 on large screens) */}
        <div className="lg:col-span-5 flex justify-center">
          <LivePreview
            name={name}
            displayName={displayName}
            bio={bio}
            avatarPath={avatarPath}
            links={links}
            theme={theme}
          />
        </div>
      </form>

      {/* Confirm Regenerate Token Modal */}
      <ConfirmModal
        isOpen={showRegenerateModal}
        title="Regenerate Link Token?"
        message="This action will generate a brand new token and QR code for this page. The previous link will immediately stop working and show Unauthorized. Are you sure you want to proceed?"
        confirmLabel="Yes, Regenerate Token"
        cancelLabel="Cancel"
        isDestructive={true}
        isLoading={isRegeneratingToken}
        onConfirm={handleRegenerateToken}
        onCancel={() => setShowRegenerateModal(false)}
      />

      {/* Post-Create Success Dialog */}
      {createdTenantData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 mx-auto flex items-center justify-center">
              <span className="text-2xl font-bold">✓</span>
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                Link Page Successfully Created!
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Your multi-tenant page and scannable QR code are live and ready to share.
              </p>
            </div>

            {/* Generated Public Link */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3 text-left">
              <div className="min-w-0 flex-1 pl-1">
                <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                  Public URL
                </p>
                <p className="text-xs font-mono text-indigo-600 truncate font-semibold">
                  {`${baseUrl.replace(/\/$/, '')}/p/${createdTenantData.token}`}
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  copyToClipboard(`${baseUrl.replace(/\/$/, '')}/p/${createdTenantData.token}`)
                }
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-white flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              >
                <HugeiconsIcon icon={Copy01Icon} size={14} />
                <span>Copy</span>
              </button>
            </div>

            {/* QR Preview & Download */}
            {createdTenantData.qr?.imagePath && (
              <div className="flex flex-col items-center p-4 bg-slate-50 rounded-2xl border border-slate-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={createdTenantData.qr.imagePath}
                  alt="QR Code"
                  className="w-40 h-40 rounded-xl bg-white p-2 object-contain shadow-xs border border-slate-200"
                />
                <button
                  type="button"
                  onClick={() => {
                    window.location.href = `/api/admin/tenants/${createdTenantData._id}/qr?download=true`;
                  }}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition cursor-pointer shadow-xs"
                >
                  <HugeiconsIcon icon={Download01Icon} size={16} />
                  <span>Download High-Res QR PNG</span>
                </button>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <a
                href={`/p/${createdTenantData.token}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold transition flex items-center justify-center gap-2 border border-slate-200"
              >
                <HugeiconsIcon icon={EyeIcon} size={16} />
                <span>Open Public Page</span>
              </a>

              <button
                type="button"
                onClick={() => router.push('/admin')}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition shadow-sm shadow-indigo-600/20 cursor-pointer"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
