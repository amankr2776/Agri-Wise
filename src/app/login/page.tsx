'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Redirects any stray traffic from /login back to the main app since the login system is removed.
 */
export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/');
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="animate-pulse text-white font-headline font-bold text-2xl">
        Redirecting to dashboard...
      </div>
    </div>
  );
}