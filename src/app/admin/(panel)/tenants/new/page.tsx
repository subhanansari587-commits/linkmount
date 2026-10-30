import React from 'react';
import type { Metadata } from 'next';
import TenantForm from '@/components/TenantForm';

export const metadata: Metadata = {
  title: 'Create New Link Page | Admin | LinkMount',
};

export default function NewTenantPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Create New Link Page
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Configure page details, destination links, theme styling, and customized QR code.
        </p>
      </div>

      <TenantForm isEditing={false} />
    </div>
  );
}
