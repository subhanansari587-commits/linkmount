'use client';

import React, { useEffect } from 'react';

interface QrViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrImagePath?: string;
  name: string;
}

export default function QrViewModal({
  isOpen,
  onClose,
  qrImagePath,
  name,
}: QrViewModalProps) {
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

  const handleDownload = () => {
    if (!qrImagePath) return;
    const a = document.createElement('a');
    a.href = qrImagePath;
    a.download = `${name.replace(/[^a-zA-Z0-9_-]/g, '_')}_qr.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xs bg-white rounded-3xl p-6 shadow-2xl text-slate-900 text-center animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition cursor-pointer"
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

        <h3 className="text-base font-bold text-slate-900">Scan QR Code</h3>
        <p className="text-xs text-slate-500 mt-0.5">Scan to open or share {name}&apos;s profile</p>

        {/* QR Code image */}
        <div className="mt-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-inner flex items-center justify-center">
          {qrImagePath ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qrImagePath}
              alt="Profile QR Code"
              className="w-48 h-48 object-contain rounded-xl"
            />
          ) : (
            <div className="w-48 h-48 flex items-center justify-center text-xs text-slate-400">
              QR Code unavailable
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-5 space-y-2">
          {qrImagePath && (
            <button
              type="button"
              onClick={handleDownload}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md transition cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
            >
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Download QR Image</span>
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 px-4 rounded-xl text-slate-600 hover:bg-slate-100 font-medium text-xs transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
