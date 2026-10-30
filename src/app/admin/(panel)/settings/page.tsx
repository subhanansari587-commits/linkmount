'use client';

import React, { useState, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Settings01Icon,
  Upload01Icon,
  Delete01Icon,
  LogOut01Icon,
} from '@/lib/icons';
import { toast } from 'sonner';
import ConfirmModal from '@/components/ConfirmModal';

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [siteName, setSiteName] = useState('LinkMount');
  const [defaultQrLogoPath, setDefaultQrLogoPath] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [showRemoveLogoModal, setShowRemoveLogoModal] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch settings');

      setSiteName(data.siteName || 'LinkMount');
      setDefaultQrLogoPath(data.defaultQrLogoPath || '');
    } catch (err: any) {
      toast.error(err.message || 'Error loading settings');
    } finally {
      setLoading(false);
    }
  };

  // Upload default QR logo
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
    if (defaultQrLogoPath) {
      formData.append('oldPath', defaultQrLogoPath);
    }

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      setDefaultQrLogoPath(data.path);
      toast.success('Logo uploaded. Click "Save Settings" to persist.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload logo');
    } finally {
      setUploadingLogo(false);
      e.target.value = '';
    }
  };

  const handleConfirmRemoveLogo = () => {
    setDefaultQrLogoPath('');
    setShowRemoveLogoModal(false);
    toast.info('Logo removed. Remember to click "Save Settings".');
  };

  // Save General Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteName: siteName.trim(),
          defaultQrLogoPath,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save settings');

      toast.success('Settings saved successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Error saving settings');
    } finally {
      setSavingSettings(false);
    }
  };

  // Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setChangingPassword(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'change-password',
          currentPassword,
          newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to change password');

      toast.success('Admin password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.message || 'Error changing password');
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-500">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-8 animate-in fade-in duration-150">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          System Settings
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Configure site metadata, default QR logo fallback, and manage your admin credentials.
        </p>
      </div>

      {/* General Settings */}
      <form onSubmit={handleSaveSettings} className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
          <HugeiconsIcon icon={Settings01Icon} size={20} color="#6366f1" />
          <h2 className="text-base font-semibold text-slate-900">Global Preferences</h2>
        </div>

        {/* Site Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Platform Name
          </label>
          <input
            type="text"
            required
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:border-indigo-500 focus:outline-none transition shadow-xs"
          />
        </div>

        {/* Default QR Logo */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Global Default QR Logo
          </label>
          <p className="text-xs text-slate-500 mb-3">
            This logo appears automatically in the center of QR codes for all link pages that have not uploaded their own custom logo.
          </p>

          {defaultQrLogoPath ? (
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={defaultQrLogoPath}
                alt="Default QR logo"
                className="w-16 h-16 rounded-xl object-contain bg-white p-1.5 border border-slate-200 shadow-xs"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-900">Global Logo Active</p>
                <p className="text-[11px] text-slate-500 truncate">{defaultQrLogoPath}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowRemoveLogoModal(true)}
                className="p-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                title="Remove Logo"
              >
                <HugeiconsIcon icon={Delete01Icon} size={18} />
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
              <div className="flex flex-col items-center justify-center p-6 border border-dashed border-slate-300 rounded-2xl bg-slate-50/70 hover:bg-slate-100/70 transition text-center cursor-pointer">
                <HugeiconsIcon icon={Upload01Icon} size={24} color="#6366f1" />
                <p className="mt-2 text-xs font-semibold text-slate-700">
                  {uploadingLogo ? 'Uploading logo...' : 'Click to upload default QR logo'}
                </p>
                <p className="mt-1 text-[11px] text-slate-500">
                  PNG, JPG, or WEBP (Square aspect ratio recommended, max 2MB)
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={savingSettings}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 text-white text-xs font-semibold transition flex items-center gap-2 cursor-pointer shadow-sm shadow-indigo-600/20 active:scale-95"
          >
            {savingSettings && (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            <span>Save Settings</span>
          </button>
        </div>
      </form>

      {/* Security & Password Change */}
      <form onSubmit={handleChangePassword} className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
          <HugeiconsIcon icon={LogOut01Icon} size={20} color="#6366f1" />
          <h2 className="text-base font-semibold text-slate-900">Security & Password</h2>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Current Password
          </label>
          <input
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:border-indigo-500 focus:outline-none transition shadow-xs"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              New Password
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:border-indigo-500 focus:outline-none transition shadow-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:border-indigo-500 focus:outline-none transition shadow-xs"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={changingPassword}
            className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-semibold transition flex items-center gap-2 cursor-pointer active:scale-95 shadow-xs"
          >
            {changingPassword && (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            <span>Update Password</span>
          </button>
        </div>
      </form>

      {/* Confirm Remove Global Default Logo Modal */}
      <ConfirmModal
        isOpen={showRemoveLogoModal}
        title="Remove Global Default QR Logo?"
        message="Are you sure you want to remove the global default QR logo? All newly generated QR codes without tenant logos will use standard plain styling."
        confirmLabel="Yes, Remove Logo"
        cancelLabel="Cancel"
        isDestructive={true}
        onConfirm={handleConfirmRemoveLogo}
        onCancel={() => setShowRemoveLogoModal(false)}
      />
    </div>
  );
}
