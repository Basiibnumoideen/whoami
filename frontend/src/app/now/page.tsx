'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Clock, Hammer, BookOpen, Search, ArrowRight, Sparkles, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function NowPage() {
  const [nowData, setNowData] = useState<any>({
    lastUpdated: 'September 2026',
    currentFocus: 'High-throughput event streaming architectures and React 19 concurrent state systems.',
    building: ['Nexus AI Workspaces v2.0', 'Distributed CRDT document synchronizer'],
    learning: ['Rust systems programming for high-concurrency micro-daemons', 'eBPF network packet tracing'],
    reading: ['Designing Data-Intensive Applications (Kleppmann)', 'Database Internals (Petrov)'],
    seeking: 'Open to select high-impact Senior Full Stack / Backend engineering positions.',
  });
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const cached = localStorage.getItem('portfolio_settings');
      if (cached) setSettings(JSON.parse(cached));
    } catch {}

    // Dynamic fetch from API
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/experiences/now`)
      .then(res => res.json())
      .then(data => {
        if (data?.data) {
          setNowData(data.data);
        }
      })
      .catch(() => null)
      .finally(() => setLoading(false));

    api.settings.get()
      .then(data => setSettings(data))
      .catch(() => null);

    const handleUpdate = (e: any) => {
      if (e.detail) setSettings(e.detail);
    };
    window.addEventListener('portfolio_settings_updated', handleUpdate);

    api.analytics.recordPageView().catch(() => null);

    return () => {
      window.removeEventListener('portfolio_settings_updated', handleUpdate);
    };
  }, []);

  const location = settings?.location || 'Remote (Worldwide)';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2.5 h-2.5 rounded-full bg-success animate-pulse"></span>
          <p className="text-xs font-mono uppercase tracking-wider text-primary font-semibold">
            Live Status Page
          </p>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
          What I&apos;m Doing Now
        </h1>
        <div className="flex items-center gap-2 text-xs text-text-secondary font-mono">
          <Clock className="w-3.5 h-3.5" />
          <span>Last updated: {nowData.lastUpdated || 'Recently'}</span>
          <span>·</span>
          <span>Location: {location}</span>
        </div>
      </div>

      <div className="space-y-8">
        {/* Current Primary Focus */}
        <div className="p-6 rounded-2xl bg-surface border border-primary/30 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-mono text-primary font-semibold mb-2">
            <Sparkles className="w-4 h-4" />
            <span>Active Focus</span>
          </div>
          <p className="text-lg font-bold text-foreground">
            {nowData.currentFocus}
          </p>
        </div>

        {/* What I'm Building */}
        {nowData.building && nowData.building.length > 0 && (
          <div className="p-8 rounded-3xl bg-surface border border-border/80">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Hammer className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">What I&apos;m Building</h2>
                <p className="text-xs text-text-secondary">Current active repositories and side-projects</p>
              </div>
            </div>
            <ul className="space-y-3">
              {nowData.building.map((item: string, idx: number) => (
                <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-text-secondary">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0"></span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* What I'm Learning */}
        {nowData.learning && nowData.learning.length > 0 && (
          <div className="p-8 rounded-3xl bg-surface border border-border/80">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-9 h-9 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">What I&apos;m Exploring & Learning</h2>
                <p className="text-xs text-text-secondary">Pushing deeper into cutting-edge paradigms</p>
              </div>
            </div>
            <ul className="space-y-3">
              {nowData.learning.map((item: string, idx: number) => (
                <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-text-secondary">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary mt-2 shrink-0"></span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* What I'm Seeking */}
        <div className="p-8 rounded-3xl bg-surface-elevated/40 border border-border/80">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-xl bg-success/10 border border-success/20 flex items-center justify-center text-success">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">What I&apos;m Seeking Next</h2>
              <p className="text-xs text-text-secondary">Opportunities and collaborations</p>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed mb-6">
            {nowData.seeking || 'Open to select high-impact Senior Full Stack / Backend engineering positions.'}
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-brand-bg text-white text-xs font-semibold hover:opacity-95 transition-opacity"
          >
            <span>Reach out directly</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
