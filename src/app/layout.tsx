import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'LinkMount | Multi-Tenant Link Platform',
  description: 'Enterprise multi-tenant link-in-bio platform with branded QR codes and analytics',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased font-sans">
        {children}
        <Toaster position="top-right" richColors theme="light" />
      </body>
    </html>
  );
}
