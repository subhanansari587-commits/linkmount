'use client';

import React, { useEffect } from 'react';
import IconRenderer from './IconRenderer';

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
  bio?: string;
  avatarPath?: string;
  links: PublicLink[];
  theme: PublicTheme;
}

export default function LinkPageView({
  token,
  displayName,
  name,
  bio,
  avatarPath,
  links,
  theme,
}: LinkPageViewProps) {
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

  const titleText = displayName?.trim() || name?.trim() || 'Welcome';
  const activeLinks = (links || [])
    .filter((l) => l.enabled !== false && l.label && l.url)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <main
      className="relative min-h-screen w-full flex flex-col items-center justify-between p-6 sm:p-10 select-none transition-colors duration-300"
      style={!hasImage ? bgFallbackStyle : { backgroundColor: theme.bgColor || '#0f172a' }}
    >
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
        <div className="mt-8 mb-4 relative">
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

        {/* Bio */}
        {bio && (
          <p
            className="mt-2 text-sm text-center max-w-sm px-4 opacity-90 leading-relaxed break-words font-medium drop-shadow-sm"
            style={{ color: theme.textColor || '#ffffff' }}
          >
            {bio}
          </p>
        )}

        {/* Links Stack */}
        <div className="w-full mt-8 space-y-3.5 flex-1 flex flex-col">
          {activeLinks.length === 0 ? (
            <div
              className="w-full py-12 text-center text-sm opacity-60 border border-dashed rounded-2xl flex items-center justify-center"
              style={{
                borderColor: `${theme.textColor || '#ffffff'}40`,
                color: theme.textColor || '#ffffff',
              }}
            >
              No links available at the moment
            </div>
          ) : (
            activeLinks.map((link) => (
              <a
                key={link._id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackClick(link._id)}
                style={getButtonStyle(theme.buttonStyle)}
                className={`w-full py-3.5 px-5 flex items-center gap-3 shadow-lg hover:shadow-2xl transition-all duration-200 transform hover:-translate-y-0.5 active:scale-95 text-sm sm:text-base font-semibold group cursor-pointer ${getRadiusClass(
                  theme.radius
                )}`}
              >
                <IconRenderer
                  icon={link.icon}
                  size={20}
                  color={
                    theme.buttonStyle === 'filled'
                      ? theme.buttonTextColor || '#0f172a'
                      : theme.textColor || '#ffffff'
                  }
                  className="transition-transform duration-200 group-hover:scale-110"
                />
                <span className="flex-1 text-center truncate">{link.label}</span>
                <span className="w-5" /> {/* Balance spacer to keep label strictly centered */}
              </a>
            ))
          )}
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
    </main>
  );
}
