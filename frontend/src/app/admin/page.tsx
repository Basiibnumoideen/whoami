'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { ShieldCheck } from 'lucide-react';

export default function AdminRootRedirect() {
  const router = useRouter();
  const [targetRoute, setTargetRoute] = useState<string | null>(null);

  useEffect(() => {
    // Step 1: Check if admin authentication token exists and is valid
    const isAuth = api.auth.isAuthenticated();
    console.log('[Admin Root] Checking authentication...', { isAuth });

    const destination = isAuth ? '/admin/dashboard' : '/admin/login';
    setTargetRoute(destination);

    router.replace(destination);
  }, [router]);

  return (
    <div className="min-h-screen bg-[#050816] text-foreground flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary animate-pulse">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <p className="text-xs font-mono text-text-secondary tracking-widest uppercase">
          {targetRoute === '/admin/dashboard'
            ? 'Redirecting to Admin Dashboard...'
            : 'Redirecting to Admin Login...'}
        </p>
      </div>
    </div>
  );
}
