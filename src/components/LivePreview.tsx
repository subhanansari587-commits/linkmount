'use client';

import React, { useState } from 'react';
import IconRenderer from './IconRenderer';
import { IPaymentInfo, IGalleryItem } from '@/models/Tenant';

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
  designation?: string;
  companyName?: string;
  companyAddress?: string;
  companyBio?: string;
  natureOfBusiness?: string;
  bio?: string;
  avatarPath?: string;
  paymentInfo?: IPaymentInfo;
  gallery?: IGalleryItem[];
  links: PreviewLink[];
  theme: PreviewTheme;
}

export default function LivePreview({
  displayName,
  name,
  designation,
  companyName,
  companyAddress,
  companyBio,
  natureOfBusiness,
  bio,
  avatarPath,
  paymentInfo,
  gallery = [],
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

  const getButtonStyle = (style: string): React.CSSProperties => {
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

  const hasPaymentInfo = Boolean(
    paymentInfo?.gpay ||
      paymentInfo?.paytm ||
      paymentInfo?.phonepe ||
      paymentInfo?.upiId
  );

  const hasCompanyProfile = Boolean(
    companyName ||
      companyAddress ||
      companyBio ||
      natureOfBusiness ||
      paymentInfo?.bankName ||
      paymentInfo?.accountNumber
  );

  const renderCardContent = (isMobileView: boolean) => (
    <div className={`relative z-10 w-full flex flex-col items-center flex-1 ${isMobileView ? '' : 'max-w-[340px]'}`}>
      {/* Share Icon in top right */}
      <div className="absolute -top-1.5 right-0">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-md shadow-xs"
          style={{
            backgroundColor: theme.buttonColor ? `${theme.buttonColor}26` : 'rgba(255, 255, 255, 0.18)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            color: theme.textColor || '#ffffff',
          }}
        >
          <svg
            className="w-3.5 h-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
        </div>
      </div>

      {/* Avatar */}
      <div className="relative mb-2.5 mt-2 shrink-0">
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
        className="font-bold text-base text-center tracking-tight transition-colors line-clamp-1 px-2 drop-shadow"
        style={{ color: theme.textColor || '#ffffff' }}
      >
        {titleText}
      </h2>

      {/* Designation and Company Name */}
      {(designation || companyName) && (
        <p
          className="mt-0.5 text-[11px] font-semibold text-center px-2 tracking-wide opacity-95 drop-shadow-xs flex items-center justify-center gap-1 flex-wrap"
          style={{ color: theme.textColor || '#ffffff' }}
        >
          {designation && <span>{designation}</span>}
          {designation && companyName && <span className="opacity-60">•</span>}
          {companyName && <span className="font-bold">{companyName}</span>}
        </p>
      )}

      {/* Bio */}
      {bio && (
        <p
          className="mt-1 text-[11px] text-center max-w-[260px] opacity-85 leading-relaxed break-words px-2 drop-shadow-xs"
          style={{ color: theme.textColor || '#ffffff' }}
        >
          {bio}
        </p>
      )}

      {/* Top 4 Digital Business Card CTAs */}
      <div className="w-full mt-4 grid grid-cols-2 gap-1.5">
        <div className="py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 text-[10px] font-bold shadow-xs bg-white text-slate-900 border border-slate-200">
          <svg className="w-3.5 h-3.5 text-emerald-600 shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
          </svg>
          <span className="truncate">Add to contacts</span>
        </div>
        <div className="py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 text-[10px] font-bold shadow-xs bg-blue-600 text-white">
          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          <span>Share</span>
        </div>
        <div className="py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 text-[10px] font-bold shadow-xs bg-emerald-700 text-white">
          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
          </svg>
          <span className="truncate">Exchange</span>
        </div>
        <div className="py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 text-[10px] font-bold shadow-xs bg-[#25D366] text-white">
          <IconRenderer icon="whatsapp" size={14} />
          <span className="truncate">WhatsApp</span>
        </div>
      </div>

      {/* Links Stack */}
      <div className="w-full mt-4 space-y-2 flex-1 flex flex-col">
        {activeLinks.length === 0 ? (
          <div
            className="w-full py-6 text-center text-xs opacity-60 border border-dashed rounded-xl flex items-center justify-center"
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
              className={`w-full py-2.5 px-3.5 flex items-center gap-2.5 shadow-sm hover:scale-[1.01] transition-all text-xs font-semibold ${getRadiusClass(
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
                className="shrink-0"
              />
              <span className="flex-1 text-center truncate">{link.label}</span>
              <span className="w-4 shrink-0" />
            </div>
          ))
        )}
      </div>

      {/* Payment & UPI Wallets Preview */}
      {hasPaymentInfo && (
        <div className="w-full mt-4 space-y-1.5">
          <span
            className="text-[9px] font-bold uppercase tracking-wider block text-center opacity-70"
            style={{ color: theme.textColor || '#ffffff' }}
          >
            Payments & UPI
          </span>
          {paymentInfo?.gpay && (
            <div className="w-full py-1.5 px-2.5 rounded-xl flex items-center justify-between bg-white/95 text-slate-800 shadow-2xs border border-slate-200/80">
              <div className="flex items-center gap-1.5 min-w-0">
                <IconRenderer icon="gpay" size={18} />
                <span className="text-[10px] font-mono font-bold truncate">{paymentInfo.gpay}</span>
              </div>
              <span className="text-[9px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                Copy
              </span>
            </div>
          )}
          {paymentInfo?.paytm && (
            <div className="w-full py-1.5 px-2.5 rounded-xl flex items-center justify-between bg-white/95 text-slate-800 shadow-2xs border border-slate-200/80">
              <div className="flex items-center gap-1.5 min-w-0">
                <IconRenderer icon="paytm" size={18} />
                <span className="text-[10px] font-mono font-bold truncate">{paymentInfo.paytm}</span>
              </div>
              <span className="text-[9px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                Copy
              </span>
            </div>
          )}
          {paymentInfo?.phonepe && (
            <div className="w-full py-1.5 px-2.5 rounded-xl flex items-center justify-between bg-white/95 text-slate-800 shadow-2xs border border-slate-200/80">
              <div className="flex items-center gap-1.5 min-w-0">
                <IconRenderer icon="phonepe" size={18} />
                <span className="text-[10px] font-mono font-bold truncate">{paymentInfo.phonepe}</span>
              </div>
              <span className="text-[9px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                Copy
              </span>
            </div>
          )}
          {paymentInfo?.upiId && (
            <div className="w-full py-1.5 px-2.5 rounded-xl flex items-center justify-between bg-white/95 text-slate-800 shadow-2xs border border-slate-200/80">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-[8px] font-bold px-1 py-0.5 rounded bg-slate-900 text-white font-mono">
                  UPI
                </span>
                <span className="text-[10px] font-mono font-bold truncate">{paymentInfo.upiId}</span>
              </div>
              <span className="text-[9px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                Copy
              </span>
            </div>
          )}
        </div>
      )}

      {/* Company Profile Card Preview */}
      {hasCompanyProfile && (
        <div
          className="w-full mt-4 rounded-2xl p-3 shadow-md border backdrop-blur-md text-left"
          style={{
            backgroundColor:
              theme.buttonStyle === 'outline' ? 'rgba(0,0,0,0.45)' : 'rgba(255, 255, 255, 0.95)',
            borderColor: 'rgba(255, 255, 255, 0.25)',
            color: theme.buttonStyle === 'outline' ? '#ffffff' : '#0f172a',
          }}
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 mb-2">
            <h4 className="font-bold text-xs tracking-tight flex items-center gap-1.5">
              <IconRenderer icon="bank" size={14} />
              <span>Company Profile</span>
            </h4>
            {companyName && (
              <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 truncate max-w-[120px]">
                {companyName}
              </span>
            )}
          </div>
          <div className="space-y-2 text-[10px]">
            {companyAddress && (
              <div>
                <span className="font-bold opacity-60 uppercase tracking-wider text-[8px] block">
                  Office Address
                </span>
                <p className="leading-snug line-clamp-2">{companyAddress}</p>
              </div>
            )}
            {natureOfBusiness && (
              <div>
                <span className="font-bold opacity-60 uppercase tracking-wider text-[8px] block">
                  Nature of Business
                </span>
                <p className="font-semibold truncate">{natureOfBusiness}</p>
              </div>
            )}
            {(paymentInfo?.bankName || paymentInfo?.accountNumber) && (
              <div className="pt-1.5 border-t border-slate-200/60">
                <span className="font-bold opacity-60 uppercase tracking-wider text-[8px] block mb-1">
                  Bank Transfer Details
                </span>
                <div className="p-1.5 rounded-lg bg-slate-100 font-mono text-[9px] text-slate-800 space-y-0.5">
                  {paymentInfo.bankName && <div>Bank: {paymentInfo.bankName}</div>}
                  {paymentInfo.accountNumber && <div>A/C: {paymentInfo.accountNumber}</div>}
                  {paymentInfo.ifscCode && <div>IFSC: {paymentInfo.ifscCode}</div>}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom Actions Bar Preview */}
      <div className="mt-4 flex items-center justify-center gap-1.5 flex-wrap">
        {gallery && gallery.length > 0 && (
          <div
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-semibold backdrop-blur-md shadow-2xs"
            style={{
              backgroundColor: theme.buttonColor ? `${theme.buttonColor}20` : 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: theme.textColor || '#ffffff',
            }}
          >
            <span>Gallery ({gallery.length})</span>
          </div>
        )}
        <div
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-semibold backdrop-blur-md shadow-2xs"
          style={{
            backgroundColor: theme.buttonColor ? `${theme.buttonColor}20` : 'rgba(255, 255, 255, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: theme.textColor || '#ffffff',
          }}
        >
          <span>QR Code</span>
        </div>
        <div
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-semibold backdrop-blur-md shadow-2xs"
          style={{
            backgroundColor: theme.buttonColor ? `${theme.buttonColor}20` : 'rgba(255, 255, 255, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: theme.textColor || '#ffffff',
          }}
        >
          <span>Share</span>
        </div>
      </div>

      {/* Footer watermark inside mockup */}
      <div
        className="mt-5 text-[9px] opacity-50 font-medium tracking-widest uppercase drop-shadow"
        style={{ color: theme.textColor || '#ffffff' }}
      >
        LinkMount
      </div>
    </div>
  );

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
            className="w-full h-full rounded-[34px] overflow-y-auto px-3.5 pt-12 pb-8 flex flex-col items-center transition-colors duration-300 relative select-none scrollbar-none"
            style={bgStyle}
          >
            {/* Dark glass overlay for contrast if image background */}
            {isImageBg && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[0.5px] pointer-events-none rounded-[34px]" />
            )}

            {renderCardContent(true)}
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
            className="w-full flex-1 overflow-y-auto px-5 py-6 flex flex-col items-center transition-colors duration-300 relative select-none scrollbar-none"
            style={bgStyle}
          >
            {/* Dark glass overlay for contrast if image background */}
            {isImageBg && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[0.5px] pointer-events-none" />
            )}

            {renderCardContent(false)}
          </div>
        </div>
      )}
    </div>
  );
}
