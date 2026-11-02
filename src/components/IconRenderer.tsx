'use client';

import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { getIconByKey } from '@/lib/icons';
import { BRAND_ICONS_MAP } from '@/lib/brandIcons';

interface IconRendererProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: string | any;
  size?: number;
  color?: string;
  className?: string;
  strokeWidth?: number;
}

export default function IconRenderer({
  icon,
  size = 20,
  color = 'currentColor',
  className = '',
  strokeWidth = 1.8,
}: IconRendererProps) {
  // If icon key matches our authentic brand icon registry, render the true original icon
  if (typeof icon === 'string') {
    const key = icon.toLowerCase().trim();
    const BrandComponent = BRAND_ICONS_MAP[key];
    if (BrandComponent) {
      return (
        <span className={`inline-flex items-center justify-center shrink-0 select-none ${className}`}>
          <BrandComponent size={size} />
        </span>
      );
    }
  }

  const iconObject = typeof icon === 'string' ? getIconByKey(icon) : icon;

  if (!iconObject) {
    return null;
  }

  return (
    <span className={`inline-flex items-center justify-center shrink-0 select-none ${className}`}>
      <HugeiconsIcon
        icon={iconObject}
        size={size}
        color={color}
        strokeWidth={strokeWidth}
      />
    </span>
  );
}
