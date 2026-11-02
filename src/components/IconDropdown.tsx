'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ICON_PRESETS } from '@/lib/icons';
import IconRenderer from './IconRenderer';

interface IconDropdownProps {
  value: string;
  onChange: (newIconKey: string) => void;
  className?: string;
}

export default function IconDropdown({
  value,
  onChange,
  className = '',
}: IconDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const currentPreset =
    ICON_PRESETS.find((p) => p.key === (value || '').toLowerCase()) ||
    ICON_PRESETS.find((p) => p.key === 'website') ||
    ICON_PRESETS[0];

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Auto-focus search input when opened
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Filter presets based on search
  const filteredPresets = ICON_PRESETS.filter((preset) =>
    preset.label.toLowerCase().includes(search.toLowerCase().trim())
  );

  return (
    <div ref={dropdownRef} className={`relative shrink-0 ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen((prev) => !prev);
          setSearch('');
        }}
        className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl px-2.5 py-1.5 shadow-xs transition-all cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        title="Select Platform / Media Icon"
      >
        <IconRenderer icon={currentPreset.key} size={20} />
        <span className="text-xs font-semibold text-slate-800 truncate max-w-[105px]">
          {currentPreset.label}
        </span>
        <svg
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-indigo-600' : ''
          }`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Popover Menu with Real Icons */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 z-50 w-64 bg-white/98 backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-xl p-1.5 animate-in fade-in zoom-in-95 duration-150">
          {/* Quick search input */}
          <div className="p-1 pb-1.5 border-b border-slate-100">
            <div className="relative">
              <svg
                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="9" cy="9" r="6" />
                <path d="m14 14 3.5 3.5" strokeLinecap="round" />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search icon..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1 text-xs bg-slate-50 focus:bg-white border border-slate-200/70 focus:border-indigo-500 rounded-lg text-slate-800 placeholder-slate-400 outline-none transition"
              />
            </div>
          </div>

          {/* Preset Options List */}
          <div className="mt-1 max-h-60 overflow-y-auto space-y-0.5 overscroll-contain">
            {filteredPresets.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-slate-400">
                No matching platform icon found
              </div>
            ) : (
              filteredPresets.map((preset) => {
                const isSelected = preset.key === currentPreset.key;
                return (
                  <button
                    key={preset.key}
                    type="button"
                    onClick={() => {
                      onChange(preset.key);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition cursor-pointer select-none ${
                      isSelected
                        ? 'bg-indigo-50/90 text-indigo-950 font-semibold shadow-2xs'
                        : 'text-slate-700 hover:bg-slate-100/90 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <IconRenderer icon={preset.key} size={20} />
                      <span className="truncate">{preset.label}</span>
                    </div>

                    {isSelected && (
                      <svg
                        className="w-4 h-4 text-indigo-600 shrink-0"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
