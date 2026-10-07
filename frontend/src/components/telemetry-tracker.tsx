'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { api } from '@/lib/api';

/**
 * Generate a random session ID or retrieve existing one from sessionStorage
 */
function getOrCreateSessionId(): { id: string; isNew: boolean } {
  if (typeof window === 'undefined') return { id: '', isNew: false };
  try {
    const existing = sessionStorage.getItem('portfolio_session_id');
    if (existing) {
      return { id: existing, isNew: false };
    }
    const newId = 'sess_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
    sessionStorage.setItem('portfolio_session_id', newId);
    return { id: newId, isNew: true };
  } catch {
    return { id: 'sess_' + Date.now(), isNew: false };
  }
}

/**
 * Global Telemetry Tracker
 * Automatically captures:
 * 1. Unique visitor session on first hit
 * 2. Page views on every client-side navigation route change
 * 3. Listens for custom project view and resume download events
 */
export function TelemetryTracker() {
  const pathname = usePathname();
  const lastPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const { id: sessionId, isNew } = getOrCreateSessionId();

    // 1. Record Unique Visitor on initial session hit
    if (isNew) {
      api.analytics.recordVisitor({
        sessionId,
        referrer: document.referrer || '',
      }).catch((err) => {
        console.debug('[Telemetry] Visitor tracking skipped:', err?.message);
      });
    }

    // 2. Track Route Page View
    // Exclude /admin paths so administrator edits don't skew real visitor analytics
    const isAdminRoute = pathname.startsWith('/admin');
    if (!isAdminRoute && pathname !== lastPathRef.current) {
      lastPathRef.current = pathname;
      api.analytics.recordPageView({
        path: pathname,
        title: document.title || pathname,
        referrer: document.referrer || '',
        sessionId,
      }).catch((err) => {
        console.debug('[Telemetry] PageView tracking skipped:', err?.message);
      });
    }
  }, [pathname]);

  // Global listeners for project interactions and downloads
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleProjectViewEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        api.analytics.recordProjectView(customEvent.detail).catch(() => null);
      }
    };

    const handleResumeDownloadEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      api.analytics.recordResumeDownload(customEvent.detail || { source: 'Unknown' }).catch(() => null);
    };

    window.addEventListener('track:project_view', handleProjectViewEvent);
    window.addEventListener('track:resume_download', handleResumeDownloadEvent);

    return () => {
      window.removeEventListener('track:project_view', handleProjectViewEvent);
      window.removeEventListener('track:resume_download', handleResumeDownloadEvent);
    };
  }, []);

  return null;
}
