'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Add01Icon,
} from '@/lib/icons';

import { ITenant, ILink, ITheme, IGalleryItem, ILead, IPaymentInfo } from '@/models/Tenant';
import { normalizeLinkUrl } from '@/lib/validators';
import LinksEditor from './LinksEditor';
import ThemeEditor from './ThemeEditor';
import QrCard from './QrCard';
import LivePreview from './LivePreview';
import ConfirmModal from './ConfirmModal';
import IconRenderer from './IconRenderer';

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

  // Business Card & Company Info state
  const [designation, setDesignation] = useState(initialData?.designation || '');
  const [companyName, setCompanyName] = useState(initialData?.companyName || '');
  const [companyAddress, setCompanyAddress] = useState(initialData?.companyAddress || '');
  const [companyBio, setCompanyBio] = useState(initialData?.companyBio || '');
  const [natureOfBusiness, setNatureOfBusiness] = useState(initialData?.natureOfBusiness || '');

  // Payment & Direct Transfer Info state
  const [gpay, setGpay] = useState(initialData?.paymentInfo?.gpay || '');
  const [paytm, setPaytm] = useState(initialData?.paymentInfo?.paytm || '');
  const [phonepe, setPhonepe] = useState(initialData?.paymentInfo?.phonepe || '');
  const [upiId, setUpiId] = useState(initialData?.paymentInfo?.upiId || '');
  const [bankName, setBankName] = useState(initialData?.paymentInfo?.bankName || '');
  const [accountNumber, setAccountNumber] = useState(initialData?.paymentInfo?.accountNumber || '');
  const [ifscCode, setIfscCode] = useState(initialData?.paymentInfo?.ifscCode || '');

  // Gallery state
  const [gallery, setGallery] = useState<IGalleryItem[]>(initialData?.gallery || []);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  // Leads / Exchange Contact Submissions
  const [leads, setLeads] = useState<ILead[]>(initialData?.leads || []);

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
  const [showRemoveAvatarModal, setShowRemoveAvatarModal] = useState(false);

  // Auto-Save State & Timers
  const [autoSaveStatus, setAutoSaveStatus] = useState<
    'idle' | 'unsaved' | 'saving' | 'saved' | 'error'
  >('idle');
  const [lastSavedTime, setLastSavedTime] = useState<string>('');
  const lastSavedPayloadRef = useRef<string>('');
  const isInitialMount = useRef(true);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Success modal state after Create
  const [createdTenantData, setCreatedTenantData] = useState<ITenant | null>(null);

  // Active tab in form: 'content' | 'business' | 'gallery' | 'leads' | 'theme' | 'qr'
  const [activeTab, setActiveTab] = useState<
    'content' | 'business' | 'gallery' | 'leads' | 'theme' | 'qr'
  >('content');

  // Payload constructor
  const getPayload = useCallback(
    () => ({
      name: name.trim(),
      displayName: displayName.trim(),
      designation: designation.trim(),
      companyName: companyName.trim(),
      companyAddress: companyAddress.trim(),
      companyBio: companyBio.trim(),
      natureOfBusiness: natureOfBusiness.trim(),
      bio: bio.trim(),
      avatarPath,
      paymentInfo: {
        gpay: gpay.trim(),
        paytm: paytm.trim(),
        phonepe: phonepe.trim(),
        upiId: upiId.trim(),
        bankName: bankName.trim(),
        accountNumber: accountNumber.trim(),
        ifscCode: ifscCode.trim(),
      },
      gallery: gallery.map((item) => ({
        url: item.url,
        caption: (item.caption || '').trim(),
      })),
      leads,
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
    }),
    [
      name,
      displayName,
      designation,
      companyName,
      companyAddress,
      companyBio,
      natureOfBusiness,
      bio,
      avatarPath,
      gpay,
      paytm,
      phonepe,
      upiId,
      bankName,
      accountNumber,
      ifscCode,
      gallery,
      leads,
      links,
      theme,
      qrColor,
      qrLogoPath,
      isActive,
      expiresAt,
    ]
  );

  // Initialize lastSavedPayload baseline on mount
  useEffect(() => {
    if (initialData?._id) {
      lastSavedPayloadRef.current = JSON.stringify(getPayload());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2-second debounced auto-save effect
  useEffect(() => {
    if (!isEditing || !initialData?._id) return;

    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const currentPayload = getPayload();
    if (!currentPayload.name) return; // Name is required to save

    const currentPayloadStr = JSON.stringify(currentPayload);
    if (currentPayloadStr === lastSavedPayloadRef.current) {
      return;
    }

    setAutoSaveStatus('unsaved');

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(async () => {
      try {
        setAutoSaveStatus('saving');
        const res = await fetch(`/api/admin/tenants/${initialData._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: currentPayloadStr,
        });

        const data = await res.json();
        if (!res.ok) {
          const detailMsg = data.details ? `: ${JSON.stringify(data.details)}` : '';
          throw new Error((data.error || 'Auto-save failed') + detailMsg);
        }

        lastSavedPayloadRef.current = currentPayloadStr;
        setAutoSaveStatus('saved');
        const now = new Date();
        setLastSavedTime(
          now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        );

        if (data.tenant?.qr) {
          setQrState(data.tenant.qr);
        }
      } catch (err) {
        console.error('Auto-save error:', err);
        setAutoSaveStatus('error');
      }
    }, 2000);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [
    name,
    displayName,
    designation,
    companyName,
    companyAddress,
    companyBio,
    natureOfBusiness,
    bio,
    avatarPath,
    gpay,
    paytm,
    phonepe,
    upiId,
    bankName,
    accountNumber,
    ifscCode,
    gallery,
    leads,
    links,
    theme,
    qrColor,
    qrLogoPath,
    isActive,
    expiresAt,
    isEditing,
    initialData?._id,
    getPayload,
  ]);

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
    setShowRemoveAvatarModal(true);
  };

  const handleConfirmRemoveAvatar = () => {
    setAvatarPath('');
    setShowRemoveAvatarModal(false);
    toast.info('Avatar removed');
  };

  // Gallery multi-upload handler
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingGallery(true);
    try {
      const newItems: IGalleryItem[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`File ${file.name} exceeds 5MB limit`);
          continue;
        }
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'gallery');

        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to upload image');
        newItems.push({ url: data.path, caption: '' });
      }

      if (newItems.length > 0) {
        setGallery((prev) => [...prev, ...newItems]);
        toast.success(`${newItems.length} photo(s) added to gallery!`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Gallery upload failed');
    } finally {
      setUploadingGallery(false);
      e.target.value = '';
    }
  };

  const handleRemoveGalleryItem = (index: number) => {
    setGallery((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleUpdateGalleryCaption = (index: number, caption: string) => {
    setGallery((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, caption } : item))
    );
  };

  // Export Leads to CSV
  const handleExportLeadsCsv = () => {
    if (!leads || leads.length === 0) {
      toast.info('No leads to export yet');
      return;
    }
    const headers = ['Name', 'Phone', 'Email', 'Note', 'Date Received'];
    const rows = leads.map((l) => [
      `"${(l.name || '').replace(/"/g, '""')}"`,
      `"${(l.phone || '').replace(/"/g, '""')}"`,
      `"${(l.email || '').replace(/"/g, '""')}"`,
      `"${(l.note || '').replace(/"/g, '""')}"`,
      `"${l.createdAt ? new Date(l.createdAt).toLocaleString() : ''}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${name || 'digital_card'}_leads.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Leads spreadsheet downloaded!');
  };

  const handleRemoveLead = (index: number) => {
    setLeads((prev) => prev.filter((_, idx) => idx !== index));
    toast.info('Lead record removed');
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Internal Page Name is required');
      return;
    }

    // Cancel pending debounced auto-save to avoid race conditions
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    setIsSubmitting(true);
    const payload = getPayload();

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
        throw new Error(data.error || 'Failed to save card page');
      }

      lastSavedPayloadRef.current = JSON.stringify(payload);
      setAutoSaveStatus('saved');

      if (isEditing) {
        toast.success('Changes saved successfully! Redirecting...');
        router.push('/admin');
      } else {
        toast.success('Digital business card created successfully!');
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
          {/* Navigation Tabs & Auto-Save Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200">
            <div className="flex space-x-4 sm:space-x-5 text-sm font-semibold overflow-x-auto scrollbar-none pb-0.5">
              {[
                { id: 'content', label: '1. Profile & Links' },
                { id: 'business', label: '2. Business & Payments' },
                { id: 'gallery', label: `3. Gallery (${gallery.length})` },
                { id: 'leads', label: `4. Leads (${leads.length})` },
                { id: 'theme', label: '5. Theme' },
                { id: 'qr', label: '6. QR & Status' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`pb-3 font-medium transition cursor-pointer border-b-2 -mb-[2px] whitespace-nowrap text-xs sm:text-sm ${
                    activeTab === tab.id
                      ? 'border-indigo-600 text-indigo-600 font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Auto-Save Indicator (when editing) */}
            {isEditing && (
              <div className="pb-2.5 sm:pb-0 flex items-center shrink-0">
                {autoSaveStatus === 'saving' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200/80 animate-in fade-in">
                    <span className="w-2 h-2 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
                    <span>Auto-saving...</span>
                  </span>
                )}
                {autoSaveStatus === 'unsaved' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200/80 animate-in fade-in">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span>Unsaved (saving in 2s)...</span>
                  </span>
                )}
                {autoSaveStatus === 'saved' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80 animate-in fade-in">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Auto-saved {lastSavedTime ? `at ${lastSavedTime}` : ''}</span>
                  </span>
                )}
                {autoSaveStatus === 'error' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200/80 animate-in fade-in">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span>Auto-save failed</span>
                  </span>
                )}
                {autoSaveStatus === 'idle' && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                    <span>Auto-save active</span>
                  </span>
                )}
              </div>
            )}
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
                    Internal Identifier <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Harpreet Singh - F2 Fintech Card"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:border-indigo-500 focus:outline-none transition shadow-xs"
                  />
                  <p className="mt-1 text-[11px] text-slate-500">
                    Internal title visible on your admin dashboard.
                  </p>
                </div>

                {/* Avatar Upload */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Profile Avatar / Photo
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
                    Display Name / Full Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Harpreet Singh"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:border-indigo-500 focus:outline-none transition shadow-xs"
                  />
                  <p className="mt-1 text-[11px] text-slate-500">
                    The public headline seen by visitors at the top of the card.
                  </p>
                </div>

                {/* Bio */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Bio / Summary
                    </label>
                    <span
                      className={`text-[11px] ${
                        bio.length > 500 ? 'text-rose-600 font-bold' : 'text-slate-400'
                      }`}
                    >
                      {bio.length}/500
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    maxLength={500}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Brief intro, tagline, or professional elevator pitch..."
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

          {/* TAB 2: Business & Payments */}
          {activeTab === 'business' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Company & Designation Information */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-5">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <IconRenderer icon="bank" size={20} className="text-indigo-600" />
                  <h3 className="text-base font-semibold text-slate-900">
                    Company & Professional Profile
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Designation */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Designation / Role
                    </label>
                    <input
                      type="text"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      placeholder="e.g. Founder & CEO"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:border-indigo-500 focus:outline-none transition shadow-xs"
                    />
                  </div>

                  {/* Company Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. F2 Fintech"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:border-indigo-500 focus:outline-none transition shadow-xs"
                    />
                  </div>
                </div>

                {/* Nature of Business */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Nature of Business
                  </label>
                  <input
                    type="text"
                    value={natureOfBusiness}
                    onChange={(e) => setNatureOfBusiness(e.target.value)}
                    placeholder="e.g. Financial Services, Business Loans & Consulting"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:border-indigo-500 focus:outline-none transition shadow-xs"
                  />
                </div>

                {/* Office Address */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Office Address
                  </label>
                  <textarea
                    rows={2}
                    value={companyAddress}
                    onChange={(e) => setCompanyAddress(e.target.value)}
                    placeholder="e.g. Tower B, 5th Floor, Cyber City, Gurugram, Haryana - 122002"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:border-indigo-500 focus:outline-none transition resize-none shadow-xs"
                  />
                </div>

                {/* About Company / Bio */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    About Company / Services Overview
                  </label>
                  <textarea
                    rows={3}
                    value={companyBio}
                    onChange={(e) => setCompanyBio(e.target.value)}
                    placeholder="Describe what your company offers, solutions, mission..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:border-indigo-500 focus:outline-none transition resize-none shadow-xs"
                  />
                </div>
              </div>

              {/* Digital Wallets & UPI */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-5">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <span className="text-lg">💳</span>
                  <h3 className="text-base font-semibold text-slate-900">
                    Instant UPI & Payment Wallets
                  </h3>
                </div>
                <p className="text-xs text-slate-500">
                  These allow visitors to copy payment numbers or UPI IDs with a single tap.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Google Pay */}
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      <IconRenderer icon="gpay" size={16} />
                      <span>Google Pay (Number/UPI)</span>
                    </label>
                    <input
                      type="text"
                      value={gpay}
                      onChange={(e) => setGpay(e.target.value)}
                      placeholder="e.g. 9876543210 or name@okhdfcbank"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:border-indigo-500 focus:outline-none transition shadow-xs"
                    />
                  </div>

                  {/* Paytm */}
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      <IconRenderer icon="paytm" size={16} />
                      <span>Paytm (Number/UPI)</span>
                    </label>
                    <input
                      type="text"
                      value={paytm}
                      onChange={(e) => setPaytm(e.target.value)}
                      placeholder="e.g. 9876543210 or name@paytm"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:border-indigo-500 focus:outline-none transition shadow-xs"
                    />
                  </div>

                  {/* PhonePe */}
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      <IconRenderer icon="phonepe" size={16} />
                      <span>PhonePe (Number/UPI)</span>
                    </label>
                    <input
                      type="text"
                      value={phonepe}
                      onChange={(e) => setPhonepe(e.target.value)}
                      placeholder="e.g. 9876543210 or name@ybl"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:border-indigo-500 focus:outline-none transition shadow-xs"
                    />
                  </div>

                  {/* General UPI ID */}
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      <span className="text-[10px] font-bold px-1 rounded bg-slate-900 text-white font-mono">
                        UPI
                      </span>
                      <span>UPI ID / VPA</span>
                    </label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="e.g. business@icici"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:border-indigo-500 focus:outline-none transition shadow-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Bank Transfer Details */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-5">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <span className="text-lg">🏦</span>
                  <h3 className="text-base font-semibold text-slate-900">
                    Bank Account Transfer Details
                  </h3>
                </div>
                <p className="text-xs text-slate-500">
                  Direct NEFT / IMPS / RTGS payment instructions displayed in the Company Profile card.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Bank Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="e.g. HDFC Bank"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:border-indigo-500 focus:outline-none transition shadow-xs"
                    />
                  </div>

                  {/* Account Number */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Account Number
                    </label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="e.g. 50200012345678"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:border-indigo-500 focus:outline-none transition shadow-xs"
                    />
                  </div>

                  {/* IFSC Code */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      IFSC Code
                    </label>
                    <input
                      type="text"
                      value={ifscCode}
                      onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                      placeholder="e.g. HDFC0001234"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:border-indigo-500 focus:outline-none transition shadow-xs uppercase font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Photo Gallery */}
          {activeTab === 'gallery' && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-6 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">Photo Showcase Gallery</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Upload certificates, office photos, client testimonials, or product showcase pictures.
                  </p>
                </div>

                <div className="relative">
                  <input
                    type="file"
                    multiple
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleGalleryUpload}
                    disabled={uploadingGallery}
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                  />
                  <button
                    type="button"
                    disabled={uploadingGallery}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition cursor-pointer flex items-center gap-2 shadow-xs"
                  >
                    <HugeiconsIcon icon={Upload01Icon} size={16} />
                    <span>{uploadingGallery ? 'Uploading...' : 'Upload Photos'}</span>
                  </button>
                </div>
              </div>

              {gallery.length === 0 ? (
                <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-2xl p-6">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
                    <HugeiconsIcon icon={Upload01Icon} size={22} />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-800">No Gallery Photos Yet</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Click &ldquo;Upload Photos&rdquo; above to add images. Visitors can click the
                    &ldquo;Gallery&rdquo; button at the bottom of your digital card to view them in
                    a full-screen lightbox.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {gallery.map((item, index) => (
                    <div
                      key={item._id || index}
                      className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/70 p-3 flex flex-col gap-2.5 shadow-2xs group"
                    >
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.url}
                          alt={item.caption || `Gallery photo ${index + 1}`}
                          className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveGalleryItem(index)}
                          className="absolute top-2 right-2 p-1.5 bg-rose-600/90 hover:bg-rose-600 text-white rounded-full shadow cursor-pointer transition active:scale-95"
                          title="Remove Photo"
                        >
                          <HugeiconsIcon icon={Delete01Icon} size={14} />
                        </button>
                      </div>

                      <input
                        type="text"
                        value={item.caption || ''}
                        onChange={(e) => handleUpdateGalleryCaption(index, e.target.value)}
                        placeholder="Caption (e.g. ISO Certification 2026)"
                        className="w-full px-3 py-1.5 text-xs rounded-lg bg-white border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Leads / Exchange Contact Submissions */}
          {activeTab === 'leads' && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-6 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    Collected Visitor Leads ({leads.length})
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Visitors who clicked &ldquo;Exchange Contact&rdquo; on your public card and shared their details.
                  </p>
                </div>

                {leads.length > 0 && (
                  <button
                    type="button"
                    onClick={handleExportLeadsCsv}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition cursor-pointer shadow-xs active:scale-95 shrink-0"
                  >
                    <HugeiconsIcon icon={Download01Icon} size={15} />
                    <span>Export to CSV / Excel</span>
                  </button>
                )}
              </div>

              {leads.length === 0 ? (
                <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-2xl p-6">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
                    <span className="text-xl">🤝</span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-800">No Leads Captured Yet</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    When visitors view your card and click the &ldquo;Exchange Contact&rdquo; button, their
                    name, phone number, email, and message will appear right here in real time.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {leads.map((lead, index) => (
                    <div
                      key={lead._id || index}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">{lead.name}</span>
                          {lead.createdAt && (
                            <span className="text-[10px] text-slate-400">
                              {new Date(lead.createdAt).toLocaleDateString(undefined, {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap">
                          <a
                            href={`tel:${lead.phone}`}
                            className="font-medium text-indigo-600 hover:underline flex items-center gap-1"
                          >
                            <span>📞</span> {lead.phone}
                          </a>
                          {lead.email && (
                            <a
                              href={`mailto:${lead.email}`}
                              className="font-medium text-slate-700 hover:underline flex items-center gap-1"
                            >
                              <span>✉️</span> {lead.email}
                            </a>
                          )}
                        </div>

                        {lead.note && (
                          <p className="text-xs text-slate-600 italic bg-white p-2 rounded-lg border border-slate-200/60 mt-1">
                            &ldquo;{lead.note}&rdquo;
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveLead(index)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                          title="Delete Lead Record"
                        >
                          <HugeiconsIcon icon={Delete01Icon} size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: Theme & Design */}
          {activeTab === 'theme' && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs animate-in fade-in duration-150">
              <ThemeEditor theme={theme} onChange={setTheme} />
            </div>
          )}

          {/* TAB 6: QR Code & Status */}
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
                    <p className="text-sm font-medium text-slate-900">Card Active</p>
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

            <div className="flex items-center gap-3">
              {isEditing && autoSaveStatus === 'saved' && (
                <span className="text-xs text-slate-500 hidden sm:inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>All changes auto-saved</span>
                </span>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 text-sm font-semibold text-white shadow-sm shadow-indigo-600/20 transition flex items-center gap-2 cursor-pointer active:scale-95"
              >
                {isSubmitting && (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                <span>{isEditing ? 'Save Changes' : 'Create Digital Card'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Live Preview Column (5/12 on large screens) */}
        <div className="lg:col-span-5 flex justify-center">
          <LivePreview
            name={name}
            displayName={displayName}
            designation={designation}
            companyName={companyName}
            companyAddress={companyAddress}
            companyBio={companyBio}
            natureOfBusiness={natureOfBusiness}
            bio={bio}
            avatarPath={avatarPath}
            paymentInfo={{
              gpay,
              paytm,
              phonepe,
              upiId,
              bankName,
              accountNumber,
              ifscCode,
            }}
            gallery={gallery}
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

      {/* Confirm Remove Avatar Modal */}
      <ConfirmModal
        isOpen={showRemoveAvatarModal}
        title="Remove Profile Avatar?"
        message="Are you sure you want to remove your profile avatar photo? Visitors will see a placeholder initial instead."
        confirmLabel="Yes, Remove Avatar"
        cancelLabel="Cancel"
        isDestructive={true}
        onConfirm={handleConfirmRemoveAvatar}
        onCancel={() => setShowRemoveAvatarModal(false)}
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
                Digital Business Card Created!
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Your profile, NFC-ready contact exchange, and scannable QR code are live and ready to share.
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
                <span>Open Public Card</span>
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
