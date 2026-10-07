'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function AdminSubrouteRedirect() {
  const router = useRouter();

  useEffect(() => {
    if (!api.auth.isAuthenticated()) {
      router.replace('/admin/login?from=/admin/blogs');
    } else {
      router.replace('/admin/dashboard?tab=blog');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-[#050816] flex items-center justify-center text-xs text-text-secondary">
      Loading blogs...
    </div>
  );
}
