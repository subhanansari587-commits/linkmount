import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import connectDB from '@/lib/db';
import Tenant from '@/models/Tenant';
import TenantForm from '@/components/TenantForm';

export const metadata: Metadata = {
  title: 'Edit Link Page | Admin | LinkMount',
};

export default async function EditTenantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await connectDB();

  const tenant = await Tenant.findById(id).lean();
  if (!tenant) {
    notFound();
  }

  // Convert MongoDB ObjectId to string for clean serialization
  const serializedTenant = JSON.parse(JSON.stringify(tenant));

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Edit Link Page: {tenant.name}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Modify links, theme styling, QR options, or manage active status.
        </p>
      </div>

      <TenantForm initialData={serializedTenant} isEditing={true} />
    </div>
  );
}
