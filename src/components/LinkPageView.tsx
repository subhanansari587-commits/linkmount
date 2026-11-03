'use client';

import React, { useEffect, useState } from 'react';
import IconRenderer from './IconRenderer';
import ShareModal from './ShareModal';
import ExchangeContactModal from './ExchangeContactModal';
import QrViewModal from './QrViewModal';
import GalleryModal from './GalleryModal';
import { downloadVCard } from '@/lib/vcard';
import { IGalleryItem, IPaymentInfo } from '@/models/Tenant';

export interface PublicLink {
  _id: string;
  label: string;
  url: string;
  icon: string;
  enabled: boolean;
  order: number;
}

export interface PublicTheme {
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

interface LinkPageViewProps {
  token: string;
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
  qrImagePath?: string;
  links: PublicLink[];
  theme: PublicTheme;
}

export default function LinkPageView({
  token,
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
  qrImagePath,
  links,
  theme,
}: LinkPageViewProps) {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isExchangeModalOpen, setIsExchangeModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [pageUrl, setPageUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPageUrl(window.location.href);
    }
  }, []);

  // Track page view once per browser session
  useEffect(() => {
    if (typeof window === 'undefined' || !token) return;

    const storageKey = `linkmount_viewed_${token}`;
    if (!sessionStorage.getItem(storageKey)) {
      sessionStorage.setItem(storageKey, 'true');

      const payload = JSON.stringify({ token });
      try {
        if (navigator.sendBeacon) {
          const blob = new Blob([payload], { type: 'application/json' });
          navigator.sendBeacon('/api/public/view', blob);
        } else {
          fetch('/api/public/view', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload,
            keepalive: true,
          }).catch(() => {});
        }
      } catch (err) {
        console.error('Failed to send view beacon:', err);
      }
    }
  }, [token]);

  const titleText = displayName?.trim() || name?.trim() || 'Welcome';

  const handleShareClick = async () => {
    const currentUrl = pageUrl || (typeof window !== 'undefined' ? window.location.href : '');
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: titleText,
          text: bio || `Check out ${titleText}'s profile on LinkMount`,
          url: currentUrl,
        });
        return;
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
      }
    }
    setIsShareModalOpen(true);
  };

  const handleSaveContact = () => {
    const phoneLink = links.find(
      (l) => l.enabled !== false && (l.icon === 'phone' || l.icon === 'whatsapp')
    );
    const emailLink = links.find(
      (l) => l.enabled !== false && l.icon === 'mail'
    );
    const websiteLink = links.find(
      (l) => l.enabled !== false && (l.icon === 'website' || l.icon === 'link')
    );

    downloadVCard(
      {
        fullName: titleText,
        designation,
        companyName,
        phone: phoneLink?.url,
        email: emailLink?.url,
        website: websiteLink?.url,
        address: companyAddress,
        note: companyBio || bio,
        avatarUrl: avatarPath,
      },
      `${titleText.replace(/[^a-zA-Z0-9_-]/g, '_')}.vcf`
    );
  };

  const handleShareOnWhatsApp = () => {
    const currentUrl = pageUrl || (typeof window !== 'undefined' ? window.location.href : '');
    const shareMessage = `*${titleText}*${designation ? ` (${designation})` : ''}${
      companyName ? ` - ${companyName}` : ''
    }\n${bio ? `${bio}\n` : ''}\nConnect with me: ${currentUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`, '_blank');
  };

  const copyText = (text: string, fieldName: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Track link click via sendBeacon / fetch keepalive
  const trackClick = (linkId: string) => {
    if (!token || !linkId) return;

    const payload = JSON.stringify({ token, linkId });
    try {
      if (navigator.sendBeacon) {
        const blob = new Blob([payload], { type: 'application/json' });
        navigator.sendBeacon('/api/public/click', blob);
      } else {
        fetch('/api/public/click', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          keepalive: true,
        }).catch(() => {});
      }
    } catch (err) {
      console.error('Failed to send click beacon:', err);
    }
  };

  const hasImage =
    theme.bgType === 'image' && (!!theme.bgDesktopImage || !!theme.bgMobileImage);

  const desktopBg = theme.bgDesktopImage || theme.bgMobileImage;
  const mobileBg = theme.bgMobileImage || theme.bgDesktopImage;

  const bgFallbackStyle: React.CSSProperties =
    theme.bgType === 'gradient'
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
          backgroundColor: hasImage ? 'rgba(0, 0, 0, 0.35)' : 'transparent',
          border: `2px solid ${theme.buttonColor || '#ffffff'}`,
          color: theme.textColor || '#ffffff',
          backdropFilter: hasImage ? 'blur(10px)' : undefined,
        };
      case 'soft':
        return {
          backgroundColor: `${theme.buttonColor || '#ffffff'}26`,
          border: '1px solid rgba(255, 255, 255, 0.15)',
          color: theme.textColor || '#ffffff',
          backdropFilter: hasImage ? 'blur(10px)' : undefined,
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

  const activeLinks = (links || [])
    .filter((l) => l.enabled !== false && l.label && l.url)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

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

  return (
    <main
      className="relative min-h-screen w-full flex flex-col items-center justify-between p-5 sm:p-10 select-none transition-colors duration-300"
      style={!hasImage ? bgFallbackStyle : { backgroundColor: theme.bgColor || '#0f172a' }}
    >
      {/* Top-Right Floating Share Button */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20">
        <button
          type="button"
          onClick={handleShareClick}
          aria-label="Share this page"
          className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-200 transform hover:scale-110 active:scale-95 shadow-lg cursor-pointer"
          style={{
            backgroundColor: theme.buttonColor ? `${theme.buttonColor}26` : 'rgba(255, 255, 255, 0.18)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            color: theme.textColor || '#ffffff',
          }}
          title="Share Page"
        >
          <svg
            className="w-5 h-5 drop-shadow"
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
        </button>
      </div>

      {/* Background Images for Mobile & Desktop Viewports */}
      {hasImage && (
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          {/* Base background color */}
          <div
            className="absolute inset-0"
            style={{ backgroundColor: theme.bgColor || '#0f172a' }}
          />

          {/* Mobile Background Image (phones: < md) */}
          {mobileBg && (
            <div
              className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-300 ${
                desktopBg !== mobileBg ? 'block md:hidden' : 'block'
              }`}
              style={{ backgroundImage: `url(${mobileBg})` }}
            />
          )}

          {/* Desktop/Website Background Image (tablets & laptops: >= md) */}
          {desktopBg && (
            <div
              className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-300 ${
                desktopBg !== mobileBg ? 'hidden md:block' : 'block'
              }`}
              style={{ backgroundImage: `url(${desktopBg})` }}
            />
          )}

          {/* Dark overlay for optimal text contrast and readability */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[0.5px]" />
        </div>
      )}

      <div className="w-full max-w-md mx-auto flex flex-col items-center flex-1 relative z-10">
        {/* Avatar Profile Picture */}
        <div className="mt-8 mb-3 relative">
          {avatarPath ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarPath}
              alt={titleText}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover shadow-2xl border-4 border-white/20 transition-transform duration-300 hover:scale-105"
            />
          ) : (
            <div
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center font-bold text-3xl sm:text-4xl shadow-2xl border-4 border-white/20"
              style={{
                backgroundColor: `${theme.buttonColor || '#ffffff'}33`,
                color: theme.textColor || '#ffffff',
              }}
            >
              {titleText.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Display Name */}
        <h1
          className="text-xl sm:text-2xl font-bold text-center tracking-tight px-4 leading-tight drop-shadow-md"
          style={{ color: theme.textColor || '#ffffff' }}
        >
          {titleText}
        </h1>

        {/* Designation and Company Name */}
        {(designation || companyName) && (
          <p
            className="mt-1 text-xs sm:text-sm font-semibold text-center px-4 tracking-wide opacity-95 drop-shadow-sm flex items-center justify-center gap-1.5 flex-wrap"
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
            className="mt-2 text-xs sm:text-sm text-center max-w-sm px-4 opacity-85 leading-relaxed break-words font-medium drop-shadow-sm"
            style={{ color: theme.textColor || '#ffffff' }}
          >
            {bio}
          </p>
        )}

        {/* Top Action Buttons (Digital Business Card CTAs) */}
        <div className="w-full mt-6 grid grid-cols-2 gap-2.5">
          {/* 1. Add to contacts */}
          <button
            type="button"
            onClick={handleSaveContact}
            className="py-3 px-3 rounded-2xl flex items-center justify-center gap-2 text-xs sm:text-sm font-bold shadow-md hover:scale-[1.02] active:scale-95 transition-all cursor-pointer bg-white text-slate-900 border border-slate-200/90"
            title="Download vCard contact"
          >
            <svg className="w-4 h-4 text-emerald-600 shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
            </svg>
            <span className="truncate">Add to contacts</span>
          </button>

          {/* 2. Share */}
          <button
            type="button"
            onClick={handleShareClick}
            className="py-3 px-3 rounded-2xl flex items-center justify-center gap-2 text-xs sm:text-sm font-bold shadow-md hover:scale-[1.02] active:scale-95 transition-all cursor-pointer bg-blue-600 hover:bg-blue-500 text-white"
            title="Share this card"
          >
            <svg
              className="w-4 h-4 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
            <span>Share</span>
          </button>

          {/* 3. Exchange Contact */}
          <button
            type="button"
            onClick={() => setIsExchangeModalOpen(true)}
            className="py-3 px-3 rounded-2xl flex items-center justify-center gap-2 text-xs sm:text-sm font-bold shadow-md hover:scale-[1.02] active:scale-95 transition-all cursor-pointer bg-emerald-700 hover:bg-emerald-600 text-white"
            title="Send your contact details"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
            </svg>
            <span className="truncate">Exchange Contact</span>
          </button>

          {/* 4. Share on WhatsApp */}
          <button
            type="button"
            onClick={handleShareOnWhatsApp}
            className="py-3 px-3 rounded-2xl flex items-center justify-center gap-2 text-xs sm:text-sm font-bold shadow-md hover:scale-[1.02] active:scale-95 transition-all cursor-pointer bg-[#25D366] hover:bg-[#20ba5a] text-white"
            title="Share via WhatsApp"
          >
            <IconRenderer icon="whatsapp" size={18} />
            <span className="truncate">Share on WhatsApp</span>
          </button>
        </div>

        {/* Links Stack */}
        <div className="w-full mt-7 space-y-3 flex-1 flex flex-col">
          {activeLinks.length === 0 ? (
            <div
              className="w-full py-10 text-center text-xs opacity-60 border border-dashed rounded-2xl flex items-center justify-center"
              style={{
                borderColor: `${theme.textColor || '#ffffff'}40`,
                color: theme.textColor || '#ffffff',
              }}
            >
              No links available at the moment
            </div>
          ) : (
            activeLinks.map((link) => {
              const isDirectAction =
                link.url.startsWith('tel:') || link.url.startsWith('mailto:');
              return (
                <a
                  key={link._id}
                  href={link.url}
                  target={isDirectAction ? undefined : '_blank'}
                  rel={isDirectAction ? undefined : 'noopener noreferrer'}
                  onClick={() => trackClick(link._id)}
                  style={getButtonStyle(theme.buttonStyle)}
                  className={`w-full py-3.5 px-5 flex items-center gap-3 shadow-lg hover:shadow-2xl transition-all duration-200 transform hover:-translate-y-0.5 active:scale-95 text-sm sm:text-base font-semibold group cursor-pointer ${getRadiusClass(
                    theme.radius
                  )}`}
                >
                  <IconRenderer
                    icon={link.icon}
                    size={22}
                    color={
                      theme.buttonStyle === 'filled'
                        ? theme.buttonTextColor || '#0f172a'
                        : theme.textColor || '#ffffff'
                    }
                    className="transition-transform duration-200 group-hover:scale-110 shrink-0"
                  />
                  <span className="flex-1 text-center truncate">{link.label}</span>
                  <span className="w-[22px] shrink-0" />
                </a>
              );
            })
          )}
        </div>

        {/* Direct Payment & Wallet Details (GPay, Paytm, PhonePe, UPI) */}
        {hasPaymentInfo && (
          <div className="w-full mt-7 space-y-2.5">
            <span
              className="text-[11px] font-bold uppercase tracking-wider block text-center opacity-70"
              style={{ color: theme.textColor || '#ffffff' }}
            >
              Payment & UPI Wallets
            </span>

            {paymentInfo?.gpay && (
              <div className="w-full py-2.5 px-4 rounded-2xl flex items-center justify-between bg-white/95 text-slate-800 shadow-sm border border-slate-200/80 backdrop-blur-sm">
                <div className="flex items-center gap-2.5 min-w-0">
                  <IconRenderer icon="gpay" size={22} />
                  <span className="text-xs font-mono font-bold truncate">{paymentInfo.gpay}</span>
                </div>
                <button
                  type="button"
                  onClick={() => copyText(paymentInfo.gpay!, 'gpay')}
                  className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg cursor-pointer transition active:scale-95"
                >
                  {copiedField === 'gpay' ? 'Copied!' : 'Copy'}
                </button>
              </div>
            )}

            {paymentInfo?.paytm && (
              <div className="w-full py-2.5 px-4 rounded-2xl flex items-center justify-between bg-white/95 text-slate-800 shadow-sm border border-slate-200/80 backdrop-blur-sm">
                <div className="flex items-center gap-2.5 min-w-0">
                  <IconRenderer icon="paytm" size={22} />
                  <span className="text-xs font-mono font-bold truncate">{paymentInfo.paytm}</span>
                </div>
                <button
                  type="button"
                  onClick={() => copyText(paymentInfo.paytm!, 'paytm')}
                  className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg cursor-pointer transition active:scale-95"
                >
                  {copiedField === 'paytm' ? 'Copied!' : 'Copy'}
                </button>
              </div>
            )}

            {paymentInfo?.phonepe && (
              <div className="w-full py-2.5 px-4 rounded-2xl flex items-center justify-between bg-white/95 text-slate-800 shadow-sm border border-slate-200/80 backdrop-blur-sm">
                <div className="flex items-center gap-2.5 min-w-0">
                  <IconRenderer icon="phonepe" size={22} />
                  <span className="text-xs font-mono font-bold truncate">{paymentInfo.phonepe}</span>
                </div>
                <button
                  type="button"
                  onClick={() => copyText(paymentInfo.phonepe!, 'phonepe')}
                  className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg cursor-pointer transition active:scale-95"
                >
                  {copiedField === 'phonepe' ? 'Copied!' : 'Copy'}
                </button>
              </div>
            )}

            {paymentInfo?.upiId && (
              <div className="w-full py-2.5 px-4 rounded-2xl flex items-center justify-between bg-white/95 text-slate-800 shadow-sm border border-slate-200/80 backdrop-blur-sm">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-900 text-white font-mono">
                    UPI
                  </span>
                  <span className="text-xs font-mono font-bold truncate">{paymentInfo.upiId}</span>
                </div>
                <button
                  type="button"
                  onClick={() => copyText(paymentInfo.upiId!, 'upi')}
                  className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg cursor-pointer transition active:scale-95"
                >
                  {copiedField === 'upi' ? 'Copied!' : 'Copy'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Company Profile Section Card */}
        {hasCompanyProfile && (
          <div
            className="w-full mt-7 rounded-3xl p-5 shadow-xl border backdrop-blur-md transition-all text-left"
            style={{
              backgroundColor:
                theme.buttonStyle === 'outline' ? 'rgba(0,0,0,0.45)' : 'rgba(255, 255, 255, 0.95)',
              borderColor: 'rgba(255, 255, 255, 0.25)',
              color: theme.buttonStyle === 'outline' ? '#ffffff' : '#0f172a',
            }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 mb-3.5">
              <h3 className="font-bold text-sm tracking-tight flex items-center gap-2">
                <IconRenderer icon="bank" size={18} />
                <span>Company Profile</span>
              </h3>
              {companyName && (
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                  {companyName}
                </span>
              )}
            </div>

            <div className="space-y-3.5 text-xs">
              {companyAddress && (
                <div>
                  <span className="font-bold opacity-60 uppercase tracking-wider text-[10px] block mb-0.5">
                    Office Address
                  </span>
                  <p className="leading-relaxed font-medium">{companyAddress}</p>
                </div>
              )}

              {companyBio && (
                <div>
                  <span className="font-bold opacity-60 uppercase tracking-wider text-[10px] block mb-0.5">
                    About Company
                  </span>
                  <p className="leading-relaxed opacity-90 whitespace-pre-line font-medium">
                    {companyBio}
                  </p>
                </div>
              )}

              {natureOfBusiness && (
                <div>
                  <span className="font-bold opacity-60 uppercase tracking-wider text-[10px] block mb-0.5">
                    Nature of Business
                  </span>
                  <p className="font-semibold">{natureOfBusiness}</p>
                </div>
              )}

              {(paymentInfo?.accountNumber || paymentInfo?.bankName) && (
                <div className="pt-2 border-t border-slate-200/60">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold opacity-60 uppercase tracking-wider text-[10px]">
                      Bank Transfer Details
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const bankText = `${paymentInfo?.bankName || ''}\nA/C: ${
                          paymentInfo?.accountNumber || ''
                        }\nIFSC: ${paymentInfo?.ifscCode || ''}`.trim();
                        copyText(bankText, 'bank');
                      }}
                      className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
                    >
                      {copiedField === 'bank' ? 'Copied!' : 'Copy Bank Details'}
                    </button>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-100/90 font-mono text-xs space-y-1 text-slate-800">
                    {paymentInfo?.bankName && (
                      <div>
                        <span className="opacity-60">Bank:</span> {paymentInfo.bankName}
                      </div>
                    )}
                    {paymentInfo?.accountNumber && (
                      <div>
                        <span className="opacity-60">A/C:</span> {paymentInfo.accountNumber}
                      </div>
                    )}
                    {paymentInfo?.ifscCode && (
                      <div>
                        <span className="opacity-60">IFSC:</span> {paymentInfo.ifscCode}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bottom Actions Bar (Gallery, QR, Share) */}
        <div className="mt-8 flex items-center justify-center gap-2.5 flex-wrap">
          {gallery && gallery.length > 0 && (
            <button
              type="button"
              onClick={() => setIsGalleryModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold backdrop-blur-md transition-all duration-200 hover:scale-105 active:scale-95 shadow-md cursor-pointer"
              style={{
                backgroundColor: theme.buttonColor ? `${theme.buttonColor}20` : 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: theme.textColor || '#ffffff',
              }}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Gallery ({gallery.length})</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsQrModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold backdrop-blur-md transition-all duration-200 hover:scale-105 active:scale-95 shadow-md cursor-pointer"
            style={{
              backgroundColor: theme.buttonColor ? `${theme.buttonColor}20` : 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: theme.textColor || '#ffffff',
            }}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h1v1H5zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h1v1H5zM13 3a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1V4a1 1 0 00-1-1h-3zm1 2v1h1V5h-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>QR Code</span>
          </button>

          <button
            type="button"
            onClick={handleShareClick}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold backdrop-blur-md transition-all duration-200 hover:scale-105 active:scale-95 shadow-md cursor-pointer"
            style={{
              backgroundColor: theme.buttonColor ? `${theme.buttonColor}20` : 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: theme.textColor || '#ffffff',
            }}
          >
            <svg
              className="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Discreet footer */}
      <footer className="mt-12 text-center relative z-10">
        <span
          className="text-[11px] font-semibold tracking-widest uppercase opacity-45 hover:opacity-80 transition-opacity drop-shadow"
          style={{ color: theme.textColor || '#ffffff' }}
        >
          Powered by LinkMount
        </span>
      </footer>

      {/* Share Modal Dialog */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title={titleText}
        url={pageUrl || (typeof window !== 'undefined' ? window.location.href : '')}
        bio={bio}
        avatarPath={avatarPath}
      />

      {/* Exchange Contact Lead Capture Modal */}
      <ExchangeContactModal
        isOpen={isExchangeModalOpen}
        onClose={() => setIsExchangeModalOpen(false)}
        token={token}
        recipientName={titleText}
      />

      {/* QR Code Fullscreen Modal */}
      <QrViewModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        qrImagePath={qrImagePath}
        name={titleText}
      />

      {/* Photo Gallery Modal */}
      <GalleryModal
        isOpen={isGalleryModalOpen}
        onClose={() => setIsGalleryModalOpen(false)}
        gallery={gallery}
        companyName={companyName || titleText}
      />
    </main>
  );
}
