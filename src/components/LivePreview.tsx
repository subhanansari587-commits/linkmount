'use client';

import React, { useState } from 'react';
import IconRenderer from './IconRenderer';

export interface PreviewLink {
  _id?: string;
  label: string;
  url: string;
  icon: string;
  enabled: boolean;
  order: number;
}

export interface PreviewTheme {
  bgType: 'solid' | 'gradient' | 'image';
  bgColor: string;
  bgColor2: string;
  bgDesktopImage?: string;
  bgMobileImage?: string;
  textColor: string;
  buttonColor: string;
  buttonTextColor: string;
  buttonStyle: 'filled' | 'outline' | 'soft';
  radius: 'sm' | 'md' | 'full';
}

interface LivePreviewProps {
  displayName?: string;
  name?: string;
  bio?: string;
  avatarPath?: string;
  links: PreviewLink[];
  theme: PreviewTheme;
}

export default function LivePreview({
  displayName,
  name,
  bio,
  avatarPath,
  links,
  theme,
}: LivePreviewProps) {
  const [viewMode, setViewMode] = useState<'mobile' | 'desktop'>('mobile');

  const activeLinks = (links || [])
    .filter((l) => l.enabled !== false && l.label)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  // Determine current preview background image based on selected view mode
  const currentBgImage =
    viewMode === 'mobile'
      ? theme.bgMobileImage || theme.bgDesktopImage
      : theme.bgDesktopImage || theme.bgMobileImage;

  const isImageBg = theme.bgType === 'image' && !!currentBgImage;

  const bgStyle: React.CSSProperties = isImageBg
    ? {
        backgroundImage: `url(${currentBgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: theme.bgColor || '#0f172a',
      }
    : theme.bgType === 'gradient'
    ? {
        background: `linear-gradient(180deg, ${theme.bgColor || '#0f172a'} 0%, ${
          theme.bgColor2 || '#1e293b'
        } 100%)`,
      }
    : {
        backgroundColor: theme.bgColor || '#0f172a',
      };

  const getRadiusClass = (radius: string) => {
    switch (radius) {
      case 'sm':
        return 'rounded-lg';
      case 'md':
        return 'rounded-xl';
      case 'full':
        return 'rounded-full';
      default:
        return 'rounded-full';
    }
  };

  const getButtonStyle = (style: string) => {
    switch (style) {
      case 'outline':
        return {
          backgroundColor: 'rgba(0, 0, 0, 0.25)',
          border: `2px solid ${theme.buttonColor || '#ffffff'}`,
          color: theme.textColor || '#ffffff',
          backdropFilter: 'blur(8px)',
        };
      case 'soft':
        return {
          backgroundColor: `${theme.buttonColor || '#ffffff'}33`,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: theme.textColor || '#ffffff',
          backdropFilter: 'blur(8px)',
        };
      case 'filled':
      default:
        return {
          backgroundColor: theme.buttonColor || '#ffffff',
          color: theme.buttonTextColor || '#0f172a',
          border: 'none',
        };
    }
  };

  const titleText = displayName?.trim() || name?.trim() || 'Your Name';

  return (
    <div className="flex flex-col items-center sticky top-8">
      {/* View Switcher: Mobile vs Desktop */}
      <div className="w-full flex items-center justify-between gap-2 mb-3 px-1">
        <div className="text-xs font-semibold text-slate-500 tracking-wider uppercase flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Live Preview</span>
        </div>

        <div className="flex items-center bg-slate-100 border border-slate-200 rounded-lg p-0.5 text-[11px] font-medium shadow-2xs">
          <button
            type="button"
            onClick={() => setViewMode('mobile')}
            className={`px-2.5 py-1 rounded-md transition cursor-pointer flex items-center gap-1 ${
              viewMode === 'mobile'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>📱 Mobile</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('desktop')}
            className={`px-2.5 py-1 rounded-md transition cursor-pointer flex items-center gap-1 ${
              viewMode === 'desktop'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>💻 Website</span>
          </button>
        </div>
      </div>

      {viewMode === 'mobile' ? (
        /* Mobile Phone Mockup */
        <div className="w-[320px] h-[640px] bg-slate-900 p-3 rounded-[44px] shadow-2xl ring-1 ring-slate-300 border-4 border-slate-800 relative flex flex-col overflow-hidden transition-all duration-300">
          {/* Dynamic Island / Speaker */}
          <div className="absolute top-5 left-1/2 -translate-x-1/2 w-24 h-4 bg-slate-950/90 rounded-full z-30 flex items-center justify-end px-2 backdrop-blur-sm">
            <div className="w-2 h-2 rounded-full bg-slate-800" />
          </div>

          {/* Screen Content */}
          <div
            className="w-full h-full rounded-[34px] overflow-y-auto px-4 pt-12 pb-8 flex flex-col items-center transition-colors duration-300 relative select-none scrollbar-none"
            style={bgStyle}
          >
            {/* Dark glass overlay for contrast if image background */}
            {isImageBg && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[0.5px] pointer-events-none rounded-[34px]" />
            )}

            <div className="relative z-10 w-full flex flex-col items-center flex-1">
              {/* Avatar */}
              <div className="relative mb-3 mt-2 shrink-0">
                {avatarPath ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarPath}
                    alt={titleText}
                    className="w-20 h-20 rounded-full object-cover shadow-lg border-2 border-white/20"
                  />
                ) : (
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center font-bold text-2xl shadow-lg border-2 border-white/20"
                    style={{
                      backgroundColor: `${theme.buttonColor || '#ffffff'}33`,
                      color: theme.textColor || '#ffffff',
                    }}
                  >
                    {titleText.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Profile Name */}
              <h2
                className="font-bold text-lg text-center tracking-tight transition-colors line-clamp-1 px-2 drop-shadow"
                style={{ color: theme.textColor || '#ffffff' }}
              >
                {titleText}
              </h2>

              {/* Bio */}
              {bio && (
                <p
                  className="mt-1 text-xs text-center max-w-[260px] opacity-85 leading-relaxed break-words px-2 drop-shadow-sm"
                  style={{ color: theme.textColor || '#ffffff' }}
                >
                  {bio}
                </p>
              )}

              {/* Links Stack */}
              <div className="w-full mt-6 space-y-2.5 flex-1 flex flex-col">
                {activeLinks.length === 0 ? (
                  <div
                    className="w-full py-8 text-center text-xs opacity-60 border border-dashed rounded-xl flex items-center justify-center"
                    style={{
                      borderColor: `${theme.textColor || '#ffffff'}40`,
                      color: theme.textColor || '#ffffff',
                    }}
                  >
                    No active links to display
                  </div>
                ) : (
                  activeLinks.map((link, idx) => (
                    <div
                      key={link._id || idx}
                      style={getButtonStyle(theme.buttonStyle)}
                      className={`w-full py-3 px-4 flex items-center gap-3 shadow-md hover:scale-[1.02] active:scale-95 transition-all text-xs font-semibold ${getRadiusClass(
                        theme.radius
                      )}`}
                    >
                      <IconRenderer
                        icon={link.icon}
                        size={16}
                        color={
                          theme.buttonStyle === 'filled'
                            ? theme.buttonTextColor || '#0f172a'
                            : theme.textColor || '#ffffff'
                        }
                      />
                      <span className="flex-1 text-center truncate">{link.label}</span>
                      <span className="w-4" />
                    </div>
                  ))
                )}
              </div>

              {/* Footer watermark inside mockup */}
              <div
                className="mt-6 text-[10px] opacity-50 font-medium tracking-widest uppercase drop-shadow"
                style={{ color: theme.textColor || '#ffffff' }}
              >
                LinkMount
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Desktop Browser Window Mockup */
        <div className="w-[360px] sm:w-[420px] h-[640px] bg-white rounded-2xl shadow-2xl ring-1 ring-slate-200 border-2 border-slate-300 flex flex-col overflow-hidden transition-all duration-300">
          {/* Browser Header Bar */}
          <div className="bg-slate-100 border-b border-slate-200 px-3.5 py-2.5 flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            </div>
            <div className="flex-1 ml-2 bg-white px-3 py-1 rounded-md text-[10px] font-mono text-slate-600 truncate border border-slate-200 flex items-center justify-between shadow-2xs">
              <span>https://yourlink.com/p/...</span>
              <span className="text-indigo-600 font-semibold text-[9px]">🖥️ Desktop</span>
            </div>
          </div>

          {/* Browser Content */}
          <div
            className="w-full flex-1 overflow-y-auto px-6 py-8 flex flex-col items-center transition-colors duration-300 relative select-none scrollbar-none"
            style={bgStyle}
          >
            {/* Dark glass overlay for contrast if image background */}
            {isImageBg && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[0.5px] pointer-events-none" />
            )}

            <div className="relative z-10 w-full max-w-[320px] flex flex-col items-center flex-1">
              {/* Avatar */}
              <div className="relative mb-3 mt-2 shrink-0">
                {avatarPath ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarPath}
                    alt={titleText}
                    className="w-20 h-20 rounded-full object-cover shadow-xl border-2 border-white/20"
                  />
                ) : (
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center font-bold text-2xl shadow-xl border-2 border-white/20"
                    style={{
                      backgroundColor: `${theme.buttonColor || '#ffffff'}33`,
                      color: theme.textColor || '#ffffff',
                    }}
                  >
                    {titleText.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Profile Name */}
              <h2
                className="font-bold text-lg text-center tracking-tight transition-colors line-clamp-1 px-2 drop-shadow"
                style={{ color: theme.textColor || '#ffffff' }}
              >
                {titleText}
              </h2>

              {/* Bio */}
              {bio && (
                <p
                  className="mt-1 text-xs text-center max-w-[260px] opacity-85 leading-relaxed break-words px-2 drop-shadow-sm"
                  style={{ color: theme.textColor || '#ffffff' }}
                >
                  {bio}
                </p>
              )}

              {/* Links Stack */}
              <div className="w-full mt-6 space-y-2.5 flex-1 flex flex-col">
                {activeLinks.length === 0 ? (
                  <div
                    className="w-full py-8 text-center text-xs opacity-60 border border-dashed rounded-xl flex items-center justify-center"
                    style={{
                      borderColor: `${theme.textColor || '#ffffff'}40`,
                      color: theme.textColor || '#ffffff',
                    }}
                  >
                    No active links to display
                  </div>
                ) : (
                  activeLinks.map((link, idx) => (
                    <div
                      key={link._id || idx}
                      style={getButtonStyle(theme.buttonStyle)}
                      className={`w-full py-3 px-4 flex items-center gap-3 shadow-md hover:scale-[1.02] active:scale-95 transition-all text-xs font-semibold ${getRadiusClass(
                        theme.radius
                      )}`}
                    >
                      <IconRenderer
                        icon={link.icon}
                        size={16}
                        color={
                          theme.buttonStyle === 'filled'
                            ? theme.buttonTextColor || '#0f172a'
                            : theme.textColor || '#ffffff'
                        }
                      />
                      <span className="flex-1 text-center truncate">{link.label}</span>
                      <span className="w-4" />
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div
                className="mt-6 text-[10px] opacity-50 font-medium tracking-widest uppercase drop-shadow"
                style={{ color: theme.textColor || '#ffffff' }}
              >
                LinkMount
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
