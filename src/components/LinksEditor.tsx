'use client';

import React from 'react';
import { ILink } from '@/models/Tenant';
import { ICON_PRESETS } from '@/lib/icons';
import IconRenderer from './IconRenderer';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Add01Icon,
  Delete01Icon,
  ArrowUp01Icon,
  ArrowDown01Icon,
} from '@/lib/icons';

interface LinksEditorProps {
  links: ILink[];
  onChange: (updatedLinks: ILink[]) => void;
}

export default function LinksEditor({ links, onChange }: LinksEditorProps) {
  const addLink = () => {
    const newLink: ILink = {
      label: 'New Link',
      url: 'https://',
      icon: 'website',
      enabled: true,
      order: links.length,
      clicks: 0,
    };
    onChange([...links, newLink]);
  };

  const updateLink = (index: number, updates: Partial<ILink>) => {
    const next = [...links];
    next[index] = { ...next[index], ...updates };
    onChange(next);
  };

  const removeLink = (index: number) => {
    const next = links.filter((_, idx) => idx !== index);
    // Re-index order
    const reindexed = next.map((l, i) => ({ ...l, order: i }));
    onChange(reindexed);
  };

  const moveLink = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= links.length) return;

    const next = [...links];
    const temp = next[index];
    next[index] = next[targetIndex];
    next[targetIndex] = temp;

    const reindexed = next.map((l, i) => ({ ...l, order: i }));
    onChange(reindexed);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-slate-900">Links & Socials</h4>
          <p className="text-xs text-slate-500">
            Add custom destination links and social profiles.
          </p>
        </div>
        <button
          type="button"
          onClick={addLink}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition active:scale-95 cursor-pointer"
        >
          <HugeiconsIcon icon={Add01Icon} size={16} color="currentColor" strokeWidth={2} />
          <span>Add Link</span>
        </button>
      </div>

      {links.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/70">
          <p className="text-sm text-slate-500">No links added yet.</p>
          <button
            type="button"
            onClick={addLink}
            className="mt-3 text-xs font-semibold text-indigo-600 hover:text-indigo-700 underline cursor-pointer"
          >
            Click here to add your first link
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {links.map((link, index) => (
            <div
              key={link._id || index}
              className={`p-4 rounded-2xl border transition-all ${
                link.enabled
                  ? 'bg-slate-50/80 border-slate-200 shadow-xs hover:border-slate-300'
                  : 'bg-slate-50/40 border-slate-200/50 opacity-60'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                {/* Reorder and Toggle */}
                <div className="flex items-center gap-1 self-start sm:self-center">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => moveLink(index, 'up')}
                    className="p-1.5 text-slate-500 hover:text-slate-900 disabled:opacity-30 disabled:hover:text-slate-400 rounded-lg hover:bg-slate-200/60 cursor-pointer transition"
                    title="Move Up"
                  >
                    <HugeiconsIcon icon={ArrowUp01Icon} size={16} />
                  </button>
                  <button
                    type="button"
                    disabled={index === links.length - 1}
                    onClick={() => moveLink(index, 'down')}
                    className="p-1.5 text-slate-500 hover:text-slate-900 disabled:opacity-30 disabled:hover:text-slate-400 rounded-lg hover:bg-slate-200/60 cursor-pointer transition"
                    title="Move Down"
                  >
                    <HugeiconsIcon icon={ArrowDown01Icon} size={16} />
                  </button>

                  <button
                    type="button"
                    onClick={() => updateLink(index, { enabled: !link.enabled })}
                    className={`ml-1 text-xs px-2.5 py-1 rounded-full font-medium cursor-pointer transition ${
                      link.enabled
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-200 text-slate-600 border border-slate-300'
                    }`}
                  >
                    {link.enabled ? 'Active' : 'Disabled'}
                  </button>
                </div>

                {/* Icon Picker */}
                <div className="relative shrink-0">
                  <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-xs">
                    <IconRenderer icon={link.icon} size={18} color="#4f46e5" />
                    <select
                      value={link.icon}
                      onChange={(e) => updateLink(index, { icon: e.target.value })}
                      className="bg-transparent text-xs text-slate-800 outline-none cursor-pointer pr-1"
                    >
                      {ICON_PRESETS.map((preset) => (
                        <option
                          key={preset.key}
                          value={preset.key}
                          className="bg-white text-slate-900"
                        >
                          {preset.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Label Input */}
                <div className="flex-1 w-full sm:w-auto">
                  <input
                    type="text"
                    value={link.label}
                    onChange={(e) => updateLink(index, { label: e.target.value })}
                    placeholder="Link Label (e.g. My Portfolio)"
                    className="w-full px-3 py-1.5 text-sm rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none transition shadow-xs"
                  />
                </div>

                {/* URL Input */}
                <div className="flex-[1.5] w-full sm:w-auto">
                  <input
                    type="text"
                    value={link.url}
                    onChange={(e) => updateLink(index, { url: e.target.value })}
                    placeholder="https://... or mailto: or tel:"
                    className="w-full px-3 py-1.5 text-xs font-mono rounded-xl bg-white border border-slate-200 text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none transition shadow-xs"
                  />
                </div>

                {/* Clicks badge & Delete */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  {typeof link.clicks === 'number' && (
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-200 text-slate-700">
                      {link.clicks} clicks
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeLink(index)}
                    className="p-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                    title="Delete Link"
                  >
                    <HugeiconsIcon icon={Delete01Icon} size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
