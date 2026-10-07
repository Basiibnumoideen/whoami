'use client';

import React, { useState, useMemo } from 'react';
import {
  Users,
  Eye,
  FolderGit2,
  Download,
  MessageSquare,
  RefreshCw,
  Clock,
  TrendingUp,
  Activity,
  BarChart3,
  Globe,
  FileText,
  AlertCircle,
  ExternalLink,
  Code2,
  Layers,
  Briefcase,
  GraduationCap,
  Award,
  BookOpen,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import { useAnalytics } from '@/hooks/use-analytics';
import { api } from '@/lib/api';

interface AnalyticsOverviewProps {
  onNavigateTab?: (tab: string) => void;
}

/**
 * Format relative time (e.g. "3 mins ago", "Just now")
 */
function formatTimeAgo(dateString?: string): string {
  if (!dateString) return 'Just now';
  const now = Date.now();
  const date = new Date(dateString).getTime();
  const diffSec = Math.floor((now - date) / 1000);

  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function AnalyticsOverview({ onNavigateTab }: AnalyticsOverviewProps) {
  const { stats, charts, activities, hasData, isLoading, isValidating, error, refresh, cachedAt } = useAnalytics({
    refreshInterval: 15000,
  });

  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('7d');
  const [hoveredPoint, setHoveredPoint] = useState<any | null>(null);
  const [isTestPinging, setIsTestPinging] = useState(false);

  // Active time series for visitor chart
  const activeSeries = useMemo(() => {
    if (!charts) return [];
    return timeRange === '7d' ? charts.visitorsLast7Days || [] : charts.visitorsLast30Days || [];
  }, [charts, timeRange]);

  // Max value for scaling SVG chart
  const maxVisitorsInSeries = useMemo(() => {
    if (!activeSeries.length) return 10;
    const maxVal = Math.max(...activeSeries.map((d: any) => Math.max(d.visitors || 0, d.pageViews || 0)));
    return maxVal > 0 ? maxVal : 10;
  }, [activeSeries]);

  // Aggregate totals for the active time window
  const totalViewsInSeries = useMemo(() => {
    return activeSeries.reduce((acc: number, cur: any) => acc + (cur.pageViews || 0), 0);
  }, [activeSeries]);

  const totalVisitorsInSeries = useMemo(() => {
    return activeSeries.reduce((acc: number, cur: any) => acc + (cur.visitors || 0), 0);
  }, [activeSeries]);

  // Handle manual test ping to populate real data
  const handleTestPing = async () => {
    try {
      setIsTestPinging(true);
      await api.analytics.recordPageView({
        path: '/',
        title: 'Home — Portfolio',
        referrer: 'manual_test_ping',
      });
      await refresh();
    } catch (e) {
      console.error('Test ping failed:', e);
    } finally {
      setIsTestPinging(false);
    }
  };

  // 1. Loading Skeleton State
  if (isLoading && !stats) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 glass-card rounded-3xl border border-border/80">
          <div className="space-y-2">
            <div className="h-6 w-48 bg-surface-elevated rounded-lg" />
            <div className="h-4 w-72 bg-surface-elevated/70 rounded-lg" />
          </div>
          <div className="h-9 w-32 bg-surface-elevated rounded-xl" />
        </div>

        {/* 5 Metrics Cards Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="glass-card p-5 rounded-2xl border border-border/80 space-y-3">
              <div className="flex justify-between items-center">
                <div className="h-3 w-20 bg-surface-elevated rounded" />
                <div className="h-4 w-4 bg-surface-elevated rounded-full" />
              </div>
              <div className="h-8 w-16 bg-surface-elevated rounded-lg" />
              <div className="h-2.5 w-24 bg-surface-elevated/60 rounded" />
            </div>
          ))}
        </div>

        {/* Quick Tabs Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-20 bg-surface-elevated/60 rounded-xl border border-border/50" />
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 glass-card rounded-3xl border border-border/80" />
          <div className="h-80 glass-card rounded-3xl border border-border/80" />
        </div>
      </div>
    );
  }

  // 2. Error State
  if (error && !stats) {
    return (
      <div className="glass-card p-8 rounded-3xl border border-destructive/40 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-destructive/15 text-destructive mx-auto flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="max-w-md mx-auto space-y-1">
          <h3 className="text-lg font-bold text-foreground">Analytics Service Temporarily Unavailable</h3>
          <p className="text-xs text-text-secondary">
            Could not fetch live dashboard telemetry from MongoDB Atlas. Check your network or database connection.
          </p>
        </div>
        <button
          onClick={() => refresh()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl gradient-brand-bg text-white text-xs font-semibold hover:opacity-95 transition-opacity"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Connection</span>
        </button>
      </div>
    );
  }

  const s = stats || {
    totalVisitors: 0,
    pageViews: 0,
    projectViews: 0,
    resumeDownloads: 0,
    contactSubmissions: 0,
    totalProjects: 0,
    totalSkills: 0,
    totalServices: 0,
    totalExperiences: 0,
    totalEducation: 0,
    totalCertifications: 0,
    totalBlogs: 0,
    totalTestimonials: 0,
    totalMessages: 0,
    unreadMessages: 0,
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Control Header */}
      <div className="glass-card p-5 sm:p-6 rounded-3xl border border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Real-Time Portfolio Analytics
            </h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-success/15 border border-success/30 text-success text-[10px] font-mono font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              LIVE MONGO DB
            </span>
          </div>
          <p className="text-xs text-text-secondary">
            Production telemetry collected across public routes, project engagements, and download endpoints.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          {cachedAt && (
            <div className="text-[11px] font-mono text-text-secondary hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-elevated/60 border border-border/50">
              <Clock className="w-3 h-3 text-text-secondary" />
              <span>Cached: {new Date(cachedAt).toLocaleTimeString()}</span>
            </div>
          )}

          <button
            onClick={() => refresh()}
            disabled={isValidating}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-elevated border border-border hover:border-primary/50 text-foreground text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer shadow-sm"
            title="Force refresh database aggregation bypass"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isValidating ? 'animate-spin text-primary' : 'text-text-secondary'}`} />
            <span>{isValidating ? 'Syncing...' : 'Refresh Live Data'}</span>
          </button>

          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl gradient-brand-bg text-white text-xs font-semibold hover:opacity-95 shadow-sm transition-opacity"
          >
            <span>Live Portfolio</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* 1. Core Telemetry Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {[
          {
            label: 'Total Visitors',
            value: s.totalVisitors,
            sub: 'Unique IP & Sessions',
            icon: Users,
            color: 'text-indigo-400',
            bgGlow: 'from-indigo-500/10 to-transparent',
          },
          {
            label: 'Page Views',
            value: s.pageViews,
            sub: 'Across All Routes',
            icon: Eye,
            color: 'text-cyan-400',
            bgGlow: 'from-cyan-500/10 to-transparent',
          },
          {
            label: 'Project Views',
            value: s.projectViews,
            sub: 'Interactive Case Studies',
            icon: FolderGit2,
            color: 'text-purple-400',
            bgGlow: 'from-purple-500/10 to-transparent',
          },
          {
            label: 'Resume Downloads',
            value: s.resumeDownloads,
            sub: 'CV PDF Downloads',
            icon: Download,
            color: 'text-emerald-400',
            bgGlow: 'from-emerald-500/10 to-transparent',
          },
          {
            label: 'Contact Submissions',
            value: s.contactSubmissions,
            sub: 'Client Inquiries',
            icon: MessageSquare,
            color: 'text-amber-400',
            bgGlow: 'from-amber-500/10 to-transparent',
          },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className={`glass-card p-4 sm:p-5 rounded-2xl border border-border/80 relative overflow-hidden bg-gradient-to-b ${card.bgGlow}`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-mono text-text-secondary uppercase tracking-wider font-semibold">
                  {card.label}
                </span>
                <div className={`p-2 rounded-xl bg-surface-elevated/80 border border-border/50 ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                {card.value.toLocaleString()}
              </div>
              <p className="text-[11px] font-mono text-text-secondary mt-1">{card.sub}</p>
            </div>
          );
        })}
      </div>

      {/* 2. Database CMS Content Inventory */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        {[
          { label: 'Projects', value: s.totalProjects, tab: 'projects', icon: FolderGit2 },
          { label: 'Skills', value: s.totalSkills, tab: 'skills', icon: Code2 },
          { label: 'Services', value: s.totalServices, tab: 'services', icon: Layers },
          { label: 'Career', value: s.totalExperiences, tab: 'experience', icon: Briefcase },
          { label: 'Education', value: s.totalEducation, tab: 'education', icon: GraduationCap },
          { label: 'Certifications', value: s.totalCertifications, tab: 'certifications', icon: Award },
          { label: 'Articles', value: s.totalBlogs, tab: 'blog', icon: BookOpen },
          {
            label: 'Inquiries',
            value: s.totalMessages,
            tab: 'messages',
            icon: MessageSquare,
            sub: s.unreadMessages > 0 ? `${s.unreadMessages} new` : undefined,
          },
        ].map((item, idx) => {
          const ItemIcon = item.icon;
          return (
            <button
              key={idx}
              onClick={() => onNavigateTab && onNavigateTab(item.tab)}
              className="p-3 rounded-2xl bg-surface-elevated/60 border border-border/60 hover:border-primary/50 text-left transition-all hover:-translate-y-0.5 cursor-pointer group shadow-sm"
            >
              <div className="flex items-center justify-between text-text-secondary mb-1">
                <span className="text-[10px] font-mono uppercase font-semibold">{item.label}</span>
                <ItemIcon className="w-3 h-3 group-hover:text-primary transition-colors" />
              </div>
              <p className="text-xl font-bold text-foreground">{item.value}</p>
              {item.sub && (
                <span className="inline-block mt-1 px-1.5 py-0.2 rounded-full bg-warning/15 text-warning text-[9px] font-mono font-bold">
                  {item.sub}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 4. Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visitors & Page Views Timeline (2 cols) */}
        <div className="lg:col-span-2 glass-card p-6 rounded-3xl border border-border/80 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Traffic Volume Trends
                </h3>
                <p className="text-xs text-text-secondary">Unique visitors and route pageviews over time</p>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-elevated/80 border border-border/50 text-[11px] font-mono">
                  <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    {totalViewsInSeries.toLocaleString()} Views
                  </span>
                  <span className="text-border">|</span>
                  <span className="flex items-center gap-1.5 text-indigo-400 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-indigo-400" />
                    {totalVisitorsInSeries.toLocaleString()} Unique
                  </span>
                </div>

                {/* Time Range Toggle */}
                <div className="flex items-center p-1 rounded-xl bg-surface-elevated border border-border/60 max-w-fit">
                  <button
                    onClick={() => setTimeRange('7d')}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                      timeRange === '7d' ? 'gradient-brand-bg text-white shadow-sm' : 'text-text-secondary hover:text-foreground'
                    }`}
                  >
                    Last 7 Days
                  </button>
                  <button
                    onClick={() => setTimeRange('30d')}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                      timeRange === '30d' ? 'gradient-brand-bg text-white shadow-sm' : 'text-text-secondary hover:text-foreground'
                    }`}
                  >
                    Last 30 Days
                  </button>
                </div>
              </div>
            </div>

            {/* SVG Interactive Chart */}
            <div className="relative h-56 sm:h-64 w-full">
              {activeSeries.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-text-secondary">
                  No traffic logged in this period.
                </div>
              ) : (
                <div className="h-full flex flex-col justify-between">
                  {/* Chart Bars/Columns */}
                  <div className="flex-1 flex items-end gap-1.5 sm:gap-2.5 pb-6 border-b border-border/50 relative">
                    {activeSeries.map((point: any, idx: number) => {
                      const visitorHeight = Math.max(6, Math.round(((point.visitors || 0) / maxVisitorsInSeries) * 100));
                      const pageViewHeight = Math.max(6, Math.round(((point.pageViews || 0) / maxVisitorsInSeries) * 100));

                      return (
                        <div
                          key={idx}
                          className="flex-1 h-full flex flex-col justify-end items-center group relative cursor-pointer"
                          onMouseEnter={() => setHoveredPoint(point)}
                          onMouseLeave={() => setHoveredPoint(null)}
                        >
                          {/* Tooltip */}
                          {hoveredPoint === point && (
                            <div className="absolute -top-12 z-30 px-2.5 py-1.5 rounded-lg bg-surface border border-border text-[11px] font-mono shadow-xl whitespace-nowrap pointer-events-none">
                              <span className="font-bold text-foreground">{point.label}:</span>{' '}
                              <span className="text-cyan-400 font-semibold">{point.pageViews || 0} views</span> |{' '}
                              <span className="text-indigo-400 font-semibold">{point.visitors || 0} visitors</span>
                            </div>
                          )}

                          {/* Dual Bar Representation */}
                          <div className="w-full flex items-end justify-center gap-0.5 sm:gap-1 max-w-[28px]">
                            {/* PageViews Bar */}
                            <div
                              style={{ height: `${pageViewHeight}%` }}
                              className="w-1/2 rounded-t-sm bg-cyan-400/80 group-hover:bg-cyan-300 transition-all duration-300 shadow-[0_0_8px_rgba(34,211,238,0.3)]"
                            />
                            {/* Visitors Bar */}
                            <div
                              style={{ height: `${visitorHeight}%` }}
                              className="w-1/2 rounded-t-sm bg-indigo-500/80 group-hover:bg-indigo-400 transition-all duration-300 shadow-[0_0_8px_rgba(99,102,241,0.3)]"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* X-Axis Labels */}
                  <div className="flex justify-between items-center pt-2 text-[10px] font-mono text-text-secondary">
                    {activeSeries
                      .filter((_, i) => (timeRange === '7d' ? true : i % 5 === 0 || i === activeSeries.length - 1))
                      .map((p: any, i: number) => (
                        <span key={i}>{p.label}</span>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-6 pt-4 border-t border-border/40 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-indigo-500" />
              <span className="text-text-secondary">Unique Visitors</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-cyan-400" />
              <span className="text-text-secondary">Page Views</span>
            </div>
          </div>
        </div>

        {/* Top Viewed Projects */}
        <div className="glass-card p-6 rounded-3xl border border-border/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-purple-400" />
                Top Viewed Projects
              </h3>
              <span className="text-[10px] font-mono text-text-secondary">Ranked by clicks</span>
            </div>

            {(!charts?.topViewedProjects || charts.topViewedProjects.length === 0) ? (
              <div className="py-12 text-center space-y-2">
                <FolderGit2 className="w-8 h-8 text-text-secondary/40 mx-auto" />
                <p className="text-xs text-text-secondary">No project views recorded yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {charts.topViewedProjects.slice(0, 5).map((proj, idx) => {
                  const maxCount = charts.topViewedProjects[0]?.views || 1;
                  const pct = Math.round((proj.views / maxCount) * 100);

                  return (
                    <div key={idx} className="space-y-1.5 p-2 rounded-xl bg-surface-elevated/40 border border-border/40">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-foreground truncate max-w-[180px]">{proj.title}</span>
                        <span className="text-[11px] font-mono text-purple-400 font-bold">{proj.views} views</span>
                      </div>
                      <div className="w-full h-1.5 bg-surface-elevated rounded-full overflow-hidden">
                        <div
                          style={{ width: `${pct}%` }}
                          className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-border/40">
            <button
              onClick={() => onNavigateTab && onNavigateTab('projects')}
              className="text-xs text-primary hover:underline font-mono flex items-center justify-between w-full cursor-pointer"
            >
              <span>Manage Projects Portfolio</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 5. Lower Grid: Most Visited Pages & Engagement Trends & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Most Visited Pages */}
        <div className="glass-card p-6 rounded-3xl border border-border/80 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              Most Visited Pages
            </h3>
            <span className="text-[10px] font-mono text-text-secondary">Route analytics</span>
          </div>

          {(!charts?.mostVisitedPages || charts.mostVisitedPages.length === 0) ? (
            <div className="py-8 text-center text-xs text-text-secondary">
              No page routes logged yet.
            </div>
          ) : (
            <div className="space-y-2.5">
              {charts.mostVisitedPages.slice(0, 6).map((page, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-surface-elevated/50 border border-border/50 text-xs"
                >
                  <span className="font-mono text-foreground font-medium truncate max-w-[200px]">{page.path}</span>
                  <span className="px-2 py-0.5 rounded-md bg-cyan-400/10 text-cyan-400 font-mono text-[11px] font-bold">
                    {page.views} hits
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Conversion & Download Trends */}
        <div className="glass-card p-6 rounded-3xl border border-border/80 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Conversions & Leads
            </h3>
            <span className="text-[10px] font-mono text-text-secondary">Downloads & Inquiries</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-surface-elevated/60 border border-border/60 space-y-1">
              <span className="text-[10px] font-mono text-text-secondary uppercase">CV Downloads</span>
              <div className="text-2xl font-bold text-emerald-400">{s.resumeDownloads}</div>
              <p className="text-[10px] text-text-secondary">Direct recruiter acquisitions</p>
            </div>
            <div className="p-4 rounded-2xl bg-surface-elevated/60 border border-border/60 space-y-1">
              <span className="text-[10px] font-mono text-text-secondary uppercase">Inquiries</span>
              <div className="text-2xl font-bold text-amber-400">{s.contactSubmissions}</div>
              <p className="text-[10px] text-text-secondary">Contact form leads</p>
            </div>
          </div>

          {/* Download Trend Bars */}
          <div className="space-y-2 pt-2">
            <span className="text-[11px] font-mono text-text-secondary uppercase">Daily Downloads (Last 7 Days)</span>
            <div className="h-16 flex items-end gap-2 pt-2 border-b border-border/40 pb-2">
              {(charts?.downloadTrends?.slice(-7) || []).map((d, i) => {
                const maxD = Math.max(1, ...((charts?.downloadTrends || []).map((x) => x.count)));
                const h = Math.max(8, Math.round((d.count / maxD) * 100));
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                    <div style={{ height: `${h}%` }} className="w-full rounded-t-sm bg-emerald-400/80 group-hover:bg-emerald-300 transition-all" />
                    <span className="text-[9px] font-mono text-text-secondary truncate">{d.label.split(' ')[1] || d.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Real-Time Live Activity Feed (Requirement 7) */}
        <div className="glass-card p-6 rounded-3xl border border-border/80 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Live Activity Stream
            </h3>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-mono font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              EVENT FEED
            </span>
          </div>

          {activities.length === 0 ? (
            <div className="py-8 text-center text-xs text-text-secondary">
              No interactions registered yet.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {activities.slice(0, 6).map((act) => {
                let badgeColor = 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
                let IconComponent = Users;

                if (act.type === 'page_view') {
                  badgeColor = 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
                  IconComponent = Eye;
                } else if (act.type === 'project_view') {
                  badgeColor = 'text-purple-400 bg-purple-500/10 border-purple-500/20';
                  IconComponent = FolderGit2;
                } else if (act.type === 'resume_download') {
                  badgeColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
                  IconComponent = Download;
                } else if (act.type === 'contact_submission') {
                  badgeColor = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
                  IconComponent = MessageSquare;
                }

                return (
                  <div
                    key={act.id}
                    className="p-2.5 rounded-xl bg-surface-elevated/50 border border-border/50 flex items-start gap-2.5 text-xs"
                  >
                    <div className={`p-1.5 rounded-lg border shrink-0 mt-0.5 ${badgeColor}`}>
                      <IconComponent className="w-3 h-3" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-semibold text-foreground truncate">{act.title}</span>
                        <span className="text-[10px] font-mono text-text-secondary shrink-0">
                          {formatTimeAgo(act.timestamp)}
                        </span>
                      </div>
                      <p className="text-[11px] text-text-secondary truncate mt-0.5">{act.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
