import React from 'react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/db';
import Tenant from '@/models/Tenant';
import LinkPageView from '@/components/LinkPageView';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { token } = await params;

  try {
    await connectDB();
    const tenant = await Tenant.findOne({ token }).lean();

    if (!tenant || !tenant.isActive) {
      return {
        title: 'Link Expired or Not Found',
        robots: { index: false, follow: false },
      };
    }

    const title = tenant.displayName || tenant.name || 'Profile Links';
    return {
      title: `${title} | LinkMount`,
      description: tenant.bio || 'Personal link directory',
      robots: { index: false, follow: false },
    };
  } catch {
    return {
      title: 'Links | LinkMount',
      robots: { index: false, follow: false },
    };
  }
}

export default async function PublicTenantPage({ params }: PageProps) {
  const { token } = await params;

  await connectDB();
  const tenant = await Tenant.findOne({ token }).lean();

  // Unknown token -> redirect to /unauthorized
  if (!tenant) {
    redirect('/unauthorized');
  }

  // Tenant inactive -> redirect to /link-expired
  if (!tenant.isActive) {
    redirect('/link-expired');
  }

  // Tenant expired -> redirect to /link-expired
  if (tenant.expiresAt && new Date(tenant.expiresAt) < new Date()) {
    redirect('/link-expired');
  }

  // Serialize tenant data for client component
  const serialized = JSON.parse(JSON.stringify(tenant));

  return (
    <LinkPageView
      token={serialized.token}
      displayName={serialized.displayName}
      name={serialized.name}
      bio={serialized.bio}
      avatarPath={serialized.avatarPath}
      links={serialized.links || []}
      theme={serialized.theme}
    />
  );
}
