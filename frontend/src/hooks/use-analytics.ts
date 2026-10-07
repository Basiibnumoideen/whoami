'use client';

import useSWR from 'swr';
import { api } from '@/lib/api';

export interface DashboardAnalyticsData {
  success: boolean;
  hasData: boolean;
  stats: {
    totalProjects: number;
    totalSkills: number;
    totalBlogs: number;
    totalServices: number;
    totalExperiences: number;
    totalEducation: number;
    totalCertifications: number;
    totalTestimonials: number;
    totalMessages: number;
    unreadMessages: number;
    totalVisitors: number;
    pageViews: number;
    projectViews: number;
    resumeDownloads: number;
    contactSubmissions: number;
  };
  charts: {
    visitorsLast7Days: { date: string; label: string; visitors: number; pageViews: number; downloads: number; inquiries: number }[];
    visitorsLast30Days: { date: string; label: string; visitors: number; pageViews: number; downloads: number; inquiries: number }[];
    topViewedProjects: { title: string; views: number; slug?: string }[];
    mostVisitedPages: { path: string; views: number }[];
    downloadTrends: { date: string; label: string; count: number }[];
    inquiryTrends: { date: string; label: string; count: number }[];
  };
  recentActivities: {
    id: string;
    type: 'visitor' | 'page_view' | 'project_view' | 'resume_download' | 'contact_submission';
    title: string;
    description: string;
    metadata?: any;
    ip?: string;
    timestamp: string;
  }[];
  recentMessages: any[];
  cachedAt?: string;
}

/**
 * useAnalytics Hook
 * Real-time SWR hook for MongoDB-backed dashboard analytics.
 * Supports configurable auto-refresh interval, focus revalidation, and cache-busting manual refresh.
 */
export function useAnalytics(options?: { refreshInterval?: number; enabled?: boolean }) {
  const enabled = options?.enabled ?? true;

  const { data, error, isLoading, isValidating, mutate } = useSWR<DashboardAnalyticsData>(
    enabled ? 'admin_dashboard_analytics' : null,
    async () => {
      return (await api.analytics.getDashboard(false)) as DashboardAnalyticsData;
    },
    {
      refreshInterval: options?.refreshInterval ?? 15000, // 15 seconds real-time polling
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 4000,
    }
  );

  /**
   * Force refresh: bypasses server-side 30s cache with ?refresh=true
   */
  const refresh = async () => {
    try {
      const fresh = (await api.analytics.getDashboard(true)) as DashboardAnalyticsData;
      await mutate(fresh, false);
      return fresh;
    } catch (err) {
      console.error('[useAnalytics] Error during forced refresh:', err);
      throw err;
    }
  };

  return {
    data,
    stats: data?.stats,
    charts: data?.charts,
    activities: data?.recentActivities || [],
    hasData: data?.hasData ?? false,
    cachedAt: data?.cachedAt,
    isLoading,
    isValidating,
    error,
    refresh,
  };
}
