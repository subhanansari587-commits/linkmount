'use client';

import React, { useState, useRef } from 'react';
import { toast } from 'sonner';
import { HugeiconsIcon } from '@hugeicons/react';
import { Upload01Icon, Delete01Icon, RefreshIcon } from '@/lib/icons';
import { ITheme } from '@/models/Tenant';
import ConfirmModal from './ConfirmModal';

interface ThemeEditorProps {
  theme: ITheme;
  onChange: (updatedTheme: ITheme) => void;
}

const PRESET_THEMES: { name: string; theme: ITheme }[] = [
  {
    name: 'Midnight Dark',
    theme: {
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
    },
  },
  {
    name: 'Sunset Glow',
    theme: {
      bgType: 'gradient',
      bgColor: '#f43f5e',
      bgColor2: '#7c3aed',
      bgDesktopImage: '',
      bgMobileImage: '',
      textColor: '#ffffff',
      buttonColor: '#ffffff',
      buttonTextColor: '#0f172a',
      buttonStyle: 'filled',
      radius: 'md',
    },
  },
  {
    name: 'Emerald Forest',
    theme: {
      bgType: 'gradient',
      bgColor: '#064e3b',
      bgColor2: '#022c22',
      bgDesktopImage: '',
      bgMobileImage: '',
      textColor: '#ecfdf5',
      buttonColor: '#10b981',
      buttonTextColor: '#022c22',
      buttonStyle: 'filled',
      radius: 'full',
    },
  },
  {
    name: 'Cyber Neon',
    theme: {
      bgType: 'gradient',
      bgColor: '#030712',
      bgColor2: '#1e1b4b',
      bgDesktopImage: '',
      bgMobileImage: '',
      textColor: '#38bdf8',
      buttonColor: '#38bdf8',
      buttonTextColor: '#030712',
      buttonStyle: 'outline',
      radius: 'sm',
    },
  },
  {
    name: 'Minimal Clean',
    theme: {
      bgType: 'solid',
      bgColor: '#f8fafc',
      bgColor2: '#e2e8f0',
      bgDesktopImage: '',
      bgMobileImage: '',
      textColor: '#0f172a',
      buttonColor: '#0f172a',
      buttonTextColor: '#ffffff',
      buttonStyle: 'filled',
      radius: 'full',
    },
  },
];

export default function ThemeEditor({ theme, onChange }: ThemeEditorProps) {
  const [uploadingDesktop, setUploadingDesktop] = useState(false);
  const [uploadingMobile, setUploadingMobile] = useState(false);
  const [bgToDelete, setBgToDelete] = useState<'desktop' | 'mobile' | null>(null);

  const desktopInputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  const update = (key: keyof ITheme, val: any) => {
    onChange({
      ...theme,
      [key]: val,
    });
  };

  const handleUploadBg = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'bg-desktop' | 'bg-mobile'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Background image file size cannot exceed 5MB');
      return;
    }

    const isDesktop = type === 'bg-desktop';
    if (isDesktop) setUploadingDesktop(true);
    else setUploadingMobile(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    const oldPath = isDesktop ? theme.bgDesktopImage : theme.bgMobileImage;
    if (oldPath) {
      formData.append('oldPath', oldPath);
    }

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload background image');

      const updated = {
        ...theme,
        bgType: 'image' as const,
        [isDesktop ? 'bgDesktopImage' : 'bgMobileImage']: data.path,
      };
      onChange(updated);

      toast.success(
        isDesktop
          ? 'Website/Desktop background uploaded!'
          : 'Mobile background uploaded!'
      );
    } catch (err: any) {
      toast.error(err.message || 'Background upload failed');
    } finally {
      if (isDesktop) setUploadingDesktop(false);
      else setUploadingMobile(false);
      e.target.value = '';
    }
  };

  const handleRemoveBg = (type: 'desktop' | 'mobile') => {
    if (type === 'desktop') {
      const updated = {
        ...theme,
        bgDesktopImage: '',
      };
      if (!updated.bgMobileImage && updated.bgType === 'image') {
        updated.bgType = 'solid';
      }
      onChange(updated);
      toast.info('Desktop background image removed');
    } else {
      const updated = {
        ...theme,
        bgMobileImage: '',
      };
      if (!updated.bgDesktopImage && updated.bgType === 'image') {
        updated.bgType = 'solid';
      }
      onChange(updated);
      toast.info('Mobile background image removed');
    }
  };

  const handleConfirmRemoveBg = () => {
    if (bgToDelete) {
      handleRemoveBg(bgToDelete);
      setBgToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Preset Palettes */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
          Preset Palettes
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {PRESET_THEMES.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => onChange(preset.theme)}
              className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition flex flex-col items-center gap-1.5 group cursor-pointer text-left shadow-2xs"
            >
              <div
                className="w-full h-7 rounded-lg border border-slate-300 shadow-inner flex items-center justify-center overflow-hidden"
                style={{
                  background:
                    preset.theme.bgType === 'gradient'
                      ? `linear-gradient(135deg, ${preset.theme.bgColor}, ${preset.theme.bgColor2})`
                      : preset.theme.bgColor,
                }}
              >
                <div
                  className="w-10 h-3 rounded shadow-xs"
                  style={{ backgroundColor: preset.theme.buttonColor }}
                />
              </div>
              <span className="text-[11px] font-semibold text-slate-700 group-hover:text-slate-900">
                {preset.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Background Type */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
          Background Type
        </label>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {(
            [
              { key: 'solid', label: 'Solid Color' },
              { key: 'gradient', label: 'Gradient' },
              { key: 'image', label: 'Custom Images' },
            ] as const
          ).map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => update('bgType', item.key)}
              className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer border text-center ${
                theme.bgType === item.key
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Upload Separate Desktop and Mobile Background Images */}
      {theme.bgType === 'image' && (
        <div className="bg-slate-50/70 border border-indigo-100 rounded-2xl p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-slate-200">
            <div>
              <h4 className="text-sm font-semibold text-slate-900">Custom Responsive Backgrounds</h4>
              <p className="text-xs text-slate-500">
                Upload separate images for website/desktop view and mobile screen view.
              </p>
            </div>
            <span className="inline-flex self-start sm:self-auto items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Responsive
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Desktop Background Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between space-y-3 shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                    <span className="text-xs font-semibold text-slate-900">Website / Desktop Image</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">≥ 768px</span>
                </div>
                <p className="text-[11px] text-slate-500 mb-3">
                  Shown on laptops, monitors & tablets. Recommended: 1920×1080px (max 5MB).
                </p>

                {/* Preview Box */}
                {theme.bgDesktopImage ? (
                  <div className="relative w-full h-32 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 group shadow-xs">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={theme.bgDesktopImage}
                      alt="Desktop background"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => desktopInputRef.current?.click()}
                        className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium cursor-pointer transition shadow"
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        onClick={() => setBgToDelete('desktop')}
                        className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium cursor-pointer transition shadow"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => !uploadingDesktop && desktopInputRef.current?.click()}
                    className="w-full h-32 rounded-lg border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50 flex flex-col items-center justify-center gap-2 cursor-pointer transition group"
                  >
                    <div className="w-9 h-9 rounded-full bg-slate-100 group-hover:bg-indigo-50 flex items-center justify-center text-slate-500 group-hover:text-indigo-600 transition">
                      {uploadingDesktop ? (
                        <HugeiconsIcon icon={RefreshIcon} size={18} className="animate-spin text-indigo-600" />
                      ) : (
                        <HugeiconsIcon icon={Upload01Icon} size={18} />
                      )}
                    </div>
                    <span className="text-xs text-slate-700 font-medium">
                      {uploadingDesktop ? 'Uploading Desktop Image...' : 'Click to Upload Desktop Background'}
                    </span>
                    <span className="text-[10px] text-slate-400">PNG, JPG or WebP up to 5MB</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <input
                  ref={desktopInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) => handleUploadBg(e, 'bg-desktop')}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={uploadingDesktop}
                  onClick={() => desktopInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition cursor-pointer disabled:opacity-50 border border-slate-200"
                >
                  <HugeiconsIcon icon={Upload01Icon} size={14} />
                  <span>{theme.bgDesktopImage ? 'Replace Desktop Image' : 'Upload Image'}</span>
                </button>
                {theme.bgDesktopImage && (
                  <button
                    type="button"
                    onClick={() => setBgToDelete('desktop')}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-xs font-medium transition cursor-pointer"
                  >
                    <HugeiconsIcon icon={Delete01Icon} size={14} />
                    <span>Delete</span>
                  </button>
                )}
              </div>
            </div>

            {/* Mobile Background Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between space-y-3 shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="text-xs font-semibold text-slate-900">Mobile Background Image</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">&lt; 768px</span>
                </div>
                <p className="text-[11px] text-slate-500 mb-3">
                  Shown on mobile smartphones. Recommended: 1080×1920px vertical (max 5MB).
                </p>

                {/* Preview Box */}
                {theme.bgMobileImage ? (
                  <div className="relative w-full h-32 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 group shadow-xs">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={theme.bgMobileImage}
                      alt="Mobile background"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => mobileInputRef.current?.click()}
                        className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium cursor-pointer transition shadow"
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        onClick={() => setBgToDelete('mobile')}
                        className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium cursor-pointer transition shadow"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => !uploadingMobile && mobileInputRef.current?.click()}
                    className="w-full h-32 rounded-lg border-2 border-dashed border-slate-200 hover:border-emerald-400 bg-slate-50 flex flex-col items-center justify-center gap-2 cursor-pointer transition group"
                  >
                    <div className="w-9 h-9 rounded-full bg-slate-100 group-hover:bg-emerald-50 flex items-center justify-center text-slate-500 group-hover:text-emerald-600 transition">
                      {uploadingMobile ? (
                        <HugeiconsIcon icon={RefreshIcon} size={18} className="animate-spin text-emerald-600" />
                      ) : (
                        <HugeiconsIcon icon={Upload01Icon} size={18} />
                      )}
                    </div>
                    <span className="text-xs text-slate-700 font-medium">
                      {uploadingMobile ? 'Uploading Mobile Image...' : 'Click to Upload Mobile Background'}
                    </span>
                    <span className="text-[10px] text-slate-400">PNG, JPG or WebP up to 5MB</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <input
                  ref={mobileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) => handleUploadBg(e, 'bg-mobile')}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={uploadingMobile}
                  onClick={() => mobileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition cursor-pointer disabled:opacity-50 border border-slate-200"
                >
                  <HugeiconsIcon icon={Upload01Icon} size={14} />
                  <span>{theme.bgMobileImage ? 'Replace Mobile Image' : 'Upload Image'}</span>
                </button>
                {theme.bgMobileImage && (
                  <button
                    type="button"
                    onClick={() => setBgToDelete('mobile')}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-xs font-medium transition cursor-pointer"
                  >
                    <HugeiconsIcon icon={Delete01Icon} size={14} />
                    <span>Delete</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs text-indigo-900 leading-relaxed">
            💡 <strong>Smart Fallback:</strong> If you only upload one background image (e.g., only mobile or only website), LinkMount will automatically adapt and show it on both screen sizes.
          </div>
        </div>
      )}

      {/* Colors Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Primary Bg / Tint */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-2xs">
          <label className="block text-xs font-medium text-slate-700 mb-1.5">
            {theme.bgType === 'gradient'
              ? 'Gradient Start Color'
              : theme.bgType === 'image'
              ? 'Background Base/Fallback Tint'
              : 'Background Color'}
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={theme.bgColor || '#0f172a'}
              onChange={(e) => update('bgColor', e.target.value)}
              className="w-9 h-9 rounded-lg border border-slate-300 cursor-pointer bg-transparent"
            />
            <input
              type="text"
              value={theme.bgColor || '#0f172a'}
              onChange={(e) => update('bgColor', e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs font-mono rounded-lg bg-white border border-slate-200 text-slate-900 shadow-xs"
            />
          </div>
        </div>

        {/* Gradient End Color */}
        {theme.bgType === 'gradient' && (
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-2xs">
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Gradient End Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={theme.bgColor2 || '#1e293b'}
                onChange={(e) => update('bgColor2', e.target.value)}
                className="w-9 h-9 rounded-lg border border-slate-300 cursor-pointer bg-transparent"
              />
              <input
                type="text"
                value={theme.bgColor2 || '#1e293b'}
                onChange={(e) => update('bgColor2', e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs font-mono rounded-lg bg-white border border-slate-200 text-slate-900 shadow-xs"
              />
            </div>
          </div>
        )}

        {/* Text Color */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-2xs">
          <label className="block text-xs font-medium text-slate-700 mb-1.5">
            Text Color
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={theme.textColor || '#ffffff'}
              onChange={(e) => update('textColor', e.target.value)}
              className="w-9 h-9 rounded-lg border border-slate-300 cursor-pointer bg-transparent"
            />
            <input
              type="text"
              value={theme.textColor || '#ffffff'}
              onChange={(e) => update('textColor', e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs font-mono rounded-lg bg-white border border-slate-200 text-slate-900 shadow-xs"
            />
          </div>
        </div>

        {/* Button Accent Color */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-2xs">
          <label className="block text-xs font-medium text-slate-700 mb-1.5">
            Button Accent Color
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={theme.buttonColor || '#ffffff'}
              onChange={(e) => update('buttonColor', e.target.value)}
              className="w-9 h-9 rounded-lg border border-slate-300 cursor-pointer bg-transparent"
            />
            <input
              type="text"
              value={theme.buttonColor || '#ffffff'}
              onChange={(e) => update('buttonColor', e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs font-mono rounded-lg bg-white border border-slate-200 text-slate-900 shadow-xs"
            />
          </div>
        </div>

        {/* Button Text Color */}
        {theme.buttonStyle === 'filled' && (
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-2xs">
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Button Text Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={theme.buttonTextColor || '#0f172a'}
                onChange={(e) => update('buttonTextColor', e.target.value)}
                className="w-9 h-9 rounded-lg border border-slate-300 cursor-pointer bg-transparent"
              />
              <input
                type="text"
                value={theme.buttonTextColor || '#0f172a'}
                onChange={(e) => update('buttonTextColor', e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs font-mono rounded-lg bg-white border border-slate-200 text-slate-900 shadow-xs"
              />
            </div>
          </div>
        )}
      </div>

      {/* Button Style & Radius */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Style */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Button Style
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['filled', 'outline', 'soft'] as const).map((style) => (
              <button
                key={style}
                type="button"
                onClick={() => update('buttonStyle', style)}
                className={`py-2 px-3 rounded-xl text-xs font-semibold capitalize transition cursor-pointer border ${
                  theme.buttonStyle === style
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {style}
              </button>
            ))}
          </div>
        </div>

        {/* Radius */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Corner Radius
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { key: 'sm', label: 'Subtle' },
              { key: 'md', label: 'Rounded' },
              { key: 'full', label: 'Pill' },
            ].map((r) => (
              <button
                key={r.key}
                type="button"
                onClick={() => update('radius', r.key)}
                className={`py-2 px-3 rounded-xl text-xs font-semibold transition cursor-pointer border ${
                  theme.radius === r.key
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Confirm Background Delete Warning Modal */}
      <ConfirmModal
        isOpen={bgToDelete !== null}
        title={bgToDelete === 'desktop' ? 'Remove Desktop Background?' : 'Remove Mobile Background?'}
        message={`Are you sure you want to remove this ${
          bgToDelete === 'desktop' ? 'desktop/website' : 'mobile'
        } background image?`}
        confirmLabel="Yes, Remove Image"
        cancelLabel="Cancel"
        isDestructive={true}
        onConfirm={handleConfirmRemoveBg}
        onCancel={() => setBgToDelete(null)}
      />
    </div>
  );
}
