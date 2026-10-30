'use client';

import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { getIconByKey } from '@/lib/icons';

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
  const iconObject = typeof icon === 'string' ? getIconByKey(icon) : icon;

  if (!iconObject) {
    return null;
  }

  return (
    <span className={`inline-flex items-center justify-center shrink-0 ${className}`}>
      <HugeiconsIcon
        icon={iconObject}
        size={size}
        color={color}
        strokeWidth={strokeWidth}
      />
    </span>
  );
}
