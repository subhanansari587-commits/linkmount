'use client';

import React, { useState, useEffect } from 'react';
import IconRenderer from './IconRenderer';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url: string;
  bio?: string;
  avatarPath?: string;
}

export default function ShareModal({
  isOpen,
  onClose,
  title,
  url,
  bio,
  avatarPath,
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = url;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const shareText = bio ? `${title} - ${bio}` : `Check out ${title}'s links on LinkMount`;
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(shareText);

  const shareChannels = [
    {
      name: 'WhatsApp',
      iconKey: 'whatsapp',
      href: `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`,
      color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
    },
    {
      name: 'Facebook',
      iconKey: 'facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
    },
    {
      name: 'X (Twitter)',
      iconKey: 'twitter',
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
      color: 'bg-slate-100 text-slate-800 hover:bg-slate-200',
    },
    {
      name: 'LinkedIn',
      iconKey: 'linkedin',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      color: 'bg-sky-50 text-sky-700 hover:bg-sky-100',
    },
    {
      name: 'Telegram',
      iconKey: 'telegram',
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
      color: 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100',
    },
    {
      name: 'Email',
      iconKey: 'mail',
      href: `mailto:?subject=${encodeURIComponent(title)}&body=${encodedText}%0A%0A${encodedUrl}`,
      color: 'bg-rose-50 text-rose-700 hover:bg-rose-100',
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl text-slate-900 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">Share Page</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition cursor-pointer"
            title="Close"
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* Profile Card Preview */}
        <div className="mt-4 p-3 bg-slate-50 rounded-2xl flex items-center gap-3 border border-slate-100">
          {avatarPath ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarPath}
              alt={title}
              className="w-12 h-12 rounded-full object-cover shadow-sm shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-bold text-lg flex items-center justify-center shrink-0 shadow-sm">
              {title.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold text-slate-900 truncate">{title}</h4>
            <p className="text-xs text-slate-500 truncate">{url.replace(/^https?:\/\//i, '')}</p>
          </div>
        </div>

        {/* Share To Socials */}
        <div className="mt-5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2.5">
            Share via
          </label>
          <div className="grid grid-cols-3 gap-2">
            {shareChannels.map((channel) => (
              <a
                key={channel.name}
                href={channel.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-2.5 rounded-2xl hover:bg-slate-50 border border-slate-100 transition duration-150 active:scale-95 group"
              >
                <div className="w-10 h-10 flex items-center justify-center rounded-full transition group-hover:scale-110">
                  <IconRenderer icon={channel.iconKey} size={24} />
                </div>
                <span className="mt-1 text-[11px] font-medium text-slate-700 truncate max-w-full">
                  {channel.name}
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Copy Link Input Bar */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
            Or copy link
          </label>
          <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
            <input
              type="text"
              readOnly
              value={url}
              className="bg-transparent text-xs text-slate-800 font-mono pl-2 flex-1 outline-none select-all truncate"
            />
            <button
              type="button"
              onClick={handleCopy}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-150 flex items-center gap-1.5 cursor-pointer shrink-0 ${
                copied
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
              }`}
            >
              {copied ? (
                <>
                  <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="7" y="7" width="10" height="10" rx="2" />
                    <path d="M4 13V5a2 2 0 0 1 2-2h8" />
                  </svg>
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
