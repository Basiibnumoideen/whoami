'use client';

import { useEffect } from 'react';
import { api } from '@/lib/api';

export function DynamicBranding() {
  useEffect(() => {
    const applyBranding = (data: any) => {
      if (!data) return;

      // Dynamic Favicon
      if (data.favicon) {
        let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
        if (!link) {
          link = document.createElement('link');
          link.rel = 'shortcut icon';
          document.head.appendChild(link);
        }
        link.href = data.favicon;
      }
    };

    // 1. Initial cached check for instant response
    try {
      const cached = localStorage.getItem('portfolio_settings');
      if (cached) {
        applyBranding(JSON.parse(cached));
      }
    } catch {}

    // 2. Network fetch from MongoDB
    api.settings.get().then(applyBranding).catch(() => {});

    // 3. Real-time update listener
    const handleUpdate = (e: any) => {
      if (e.detail) applyBranding(e.detail);
    };
    window.addEventListener('portfolio_settings_updated', handleUpdate);
    return () => window.removeEventListener('portfolio_settings_updated', handleUpdate);
  }, []);

  return null;
}
