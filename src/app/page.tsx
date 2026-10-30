import { redirect } from 'next/navigation';

export default function RootHomePage() {
  // Server-side redirect with replace semantics
  redirect('/link-expired');
}
