'use client';

import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Download01Icon,
  RefreshIcon,
  Upload01Icon,
  Delete01Icon,
  QrCode01Icon,
} from '@/lib/icons';
import { toast } from 'sonner';
import ConfirmModal from './ConfirmModal';

interface QrCardProps {
  tenantId?: string;
  imagePath?: string;
  updatedAt?: string | Date;
  color: string;
  logoPath?: string;
  isNew?: boolean;
  onColorChange: (newColor: string) => void;
  onLogoChange: (newLogoPath: string) => void;
  onRegenerated?: (updatedQr: { imagePath: string; updatedAt: Date }) => void;
}

export default function QrCard({
  tenantId,
  imagePath,
  updatedAt,
  color,
  logoPath,
  isNew = false,
  onColorChange,
  onLogoChange,
  onRegenerated,
}: QrCardProps) {
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [showRemoveLogoModal, setShowRemoveLogoModal] = useState(false);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Logo file size must be less than 2MB.');
      return;
    }

    setUploadingLogo(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'logo');
    if (logoPath) {
      formData.append('oldPath', logoPath);
    }

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      onLogoChange(data.path);
      toast.success('Tenant QR logo uploaded successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload logo');
    } finally {
      setUploadingLogo(false);
      e.target.value = '';
    }
  };

  const handleConfirmRemoveLogo = () => {
    onLogoChange('');
    setShowRemoveLogoModal(false);
    toast.info('Tenant QR logo removed (will fallback to global default).');
  };

  const handleRegenerate = async () => {
    if (!tenantId) return;
    setRegenerating(true);
    try {
      const res = await fetch(`/api/admin/tenants/${tenantId}/qr`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to regenerate QR');

      if (onRegenerated) {
        onRegenerated(data.qr);
      }
      toast.success('QR Code regenerated successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Error regenerating QR');
    } finally {
      setRegenerating(false);
    }
  };

  const handleDownload = () => {
    if (!tenantId) return;
    window.location.href = `/api/admin/tenants/${tenantId}/qr?download=true`;
  };

  const cacheBust = updatedAt ? new Date(updatedAt).getTime() : Date.now();
  const qrUrl = imagePath ? `${imagePath}?v=${cacheBust}` : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <HugeiconsIcon icon={QrCode01Icon} size={20} color="#4f46e5" strokeWidth={1.8} />
        <h3 className="text-base font-semibold text-slate-900">QR Code Configuration</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Controls */}
        <div className="space-y-5">
          {/* QR Color Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              QR Code Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={color || '#000000'}
                onChange={(e) => onColorChange(e.target.value)}
                className="w-10 h-10 rounded-xl border border-slate-300 cursor-pointer bg-transparent"
              />
              <input
                type="text"
                value={color || '#000000'}
                onChange={(e) => onColorChange(e.target.value)}
                className="flex-1 px-3 py-2 text-xs font-mono rounded-xl bg-slate-50 border border-slate-200 text-slate-900 shadow-xs"
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              Dark colors work best for scannability against standard white backgrounds.
            </p>
          </div>

          {/* Tenant Logo Override */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Custom QR Center Logo
            </label>

            {logoPath ? (
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logoPath}
                  alt="QR Center Logo"
                  className="w-12 h-12 rounded-lg object-contain bg-white p-1 border border-slate-200 shadow-xs"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-900 truncate">Tenant Logo Active</p>
                  <p className="text-[11px] text-slate-500">Centered in QR code</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRemoveLogoModal(true)}
                  className="p-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer transition"
                  title="Remove custom logo"
                >
                  <HugeiconsIcon icon={Delete01Icon} size={16} />
                </button>
              </div>
            ) : (
              <div className="relative">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleLogoUpload}
                  disabled={uploadingLogo}
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                />
                <div className="flex items-center justify-center gap-2 p-3 border border-dashed border-slate-300 rounded-xl bg-slate-50 hover:bg-slate-100 transition text-xs font-medium text-slate-700 cursor-pointer">
                  <HugeiconsIcon icon={Upload01Icon} size={16} />
                  <span>{uploadingLogo ? 'Uploading logo...' : 'Upload Tenant Logo (optional)'}</span>
                </div>
              </div>
            )}
            <p className="mt-1.5 text-[11px] text-slate-500">
              If not provided, the global default QR logo (from Settings) will be used automatically.
            </p>
          </div>

          {/* Action buttons (only when tenant already created) */}
          {!isNew && tenantId && (
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                disabled={regenerating}
                onClick={handleRegenerate}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition cursor-pointer active:scale-95 disabled:opacity-50 shadow-xs"
              >
                <HugeiconsIcon
                  icon={RefreshIcon}
                  size={16}
                  className={regenerating ? 'animate-spin' : ''}
                />
                <span>{regenerating ? 'Regenerating...' : 'Regenerate QR'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition cursor-pointer active:scale-95"
              >
                <HugeiconsIcon icon={Download01Icon} size={16} />
                <span>Download High-Res PNG</span>
              </button>
            </div>
          )}
        </div>

        {/* QR Preview Frame */}
        <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-200">
          {qrUrl ? (
            <div className="relative group text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrUrl}
                alt="Tenant QR Code"
                className="w-56 h-56 rounded-xl bg-white p-2.5 shadow-sm border border-slate-200 object-contain mx-auto"
              />
              <div className="mt-3 text-center">
                <span className="text-[11px] font-mono text-slate-500">1024 x 1024 • Scannable PNG</span>
              </div>
            </div>
          ) : (
            <div className="w-56 h-56 rounded-xl border border-dashed border-slate-300 flex flex-col items-center justify-center p-4 text-center">
              <HugeiconsIcon icon={QrCode01Icon} size={48} color="#94a3b8" strokeWidth={1.5} />
              <p className="mt-2 text-xs text-slate-500">
                QR code will be automatically generated upon creating this page.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Confirm Remove QR Logo Warning Modal */}
      <ConfirmModal
        isOpen={showRemoveLogoModal}
        title="Remove Custom QR Logo?"
        message="Are you sure you want to remove this custom logo from the QR code? The QR code will fallback to the global site logo or a clean pattern."
        confirmLabel="Yes, Remove Logo"
        cancelLabel="Cancel"
        isDestructive={true}
        onConfirm={handleConfirmRemoveLogo}
        onCancel={() => setShowRemoveLogoModal(false)}
      />
    </div>
  );
}
