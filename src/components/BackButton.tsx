'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon } from '@/lib/icons';

interface BackButtonProps {
  label?: string;
  className?: string;
}

export default function BackButton({
  label = 'Go Back',
  className = '',
}: BackButtonProps) {
  const router = useRouter();
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    // Show back button only if browser history exists
    if (typeof window !== 'undefined' && window.history.length > 1) {
      setCanGoBack(true);
    }
  }, []);

  if (!canGoBack) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium transition-all duration-200 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-sm active:scale-95 cursor-pointer ${className}`}
    >
      <HugeiconsIcon icon={ArrowLeft01Icon} size={18} color="currentColor" strokeWidth={1.8} />
      <span>{label}</span>
    </button>
  );
}
