'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Layers, Cpu, Database, Zap, Code2, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { SkillIcon } from '@/components/skill-icon';

interface SkillItem {
  _id?: string;
  name: string;
  category: string;
  level: number;
  experience?: string;
  projects?: string[];
  icon?: string;
  order?: number;
}

export default function SkillsPage() {
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Dynamic MongoDB API Fetch
    api.skills.getAll()
      .then((data) => {
        setSkills(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error('Failed to fetch skills from database:', err);
        setSkills([]);
      })
      .finally(() => setLoading(false));

    // Record page view analytics
    api.analytics.recordPageView().catch(() => null);
  }, []);

  const categoryMeta: Record<string, { icon: typeof Layers; desc: string }> = {
    Frontend: { icon: Layers, desc: 'Client interfaces, state machines, motion physics, and CSS design tokens.' },
    Backend: { icon: Cpu, desc: 'RESTful architectures, microservices, authentication security, and real-time sockets.' },
    'Database & Cloud': { icon: Database, desc: 'Document schemas, caching layers, media CDNs, and containerization.' },
    Database: { icon: Database, desc: 'Document schemas, caching layers, and high-performance queries.' },
    'AI & Tools': { icon: Zap, desc: 'Anthropic Claude integration, developer workflows, and testing harnesses.' },
    'DevOps & Cloud': { icon: Database, desc: 'Containerization, continuous integration, and infrastructure provisioning.' },
  };

  // Dynamically extract all unique categories while preserving standard order first
  const uniqueCategoryNames = Array.from(new Set([
    'Frontend',
    'Backend',
    'Database & Cloud',
    'Database',
    'AI & Tools',
    'DevOps & Cloud',
    ...skills.map(s => s.category)
  ])).filter(cat => skills.some(s => s.category === cat));

  const categories = uniqueCategoryNames.map(name => ({
    name,
    icon: categoryMeta[name]?.icon || Code2,
    desc: categoryMeta[name]?.desc || `${name} competencies, production libraries, and verified architecture.`
  }));

  return (
    <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
      {/* Header */}
      <div className="max-w-3xl mb-16">
        <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-primary font-bold mb-3">
          <Code2 className="w-4 h-4" />
          <span>Interactive Skills Matrix</span>
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground mb-4">
          Evidence-Linked Proficiencies
        </h1>
        <p className="text-base sm:text-lg text-text-secondary leading-relaxed">
          Circular proficiency gauges verified through real production codebases. Click any card to trace evidence directly to shipped projects.
        </p>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-6 h-6 text-primary animate-spin" />
          <p className="text-xs font-mono text-text-secondary">Loading skills from database...</p>
        </div>
      ) : skills.length === 0 ? (
        /* Professional Empty State (Problem 11) */
        <div className="p-16 text-center glass-card rounded-3xl border border-border/80">
          <Code2 className="w-12 h-12 text-primary mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-bold text-foreground mb-1">No skills available yet.</h3>
          <p className="text-xs text-text-secondary max-w-sm mx-auto">
            Technical proficiencies will be displayed here once published from the admin dashboard.
          </p>
        </div>
      ) : (
        /* Categories Grid */
        <div className="space-y-16">
          {categories.map(cat => {
            const categorySkills = skills.filter(s => s.category === cat.name);
            const Icon = cat.icon;

            return (
              <div key={cat.name} className="p-8 sm:p-12 rounded-3xl glass-card border border-border/80">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-border/40">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl gradient-brand-bg flex items-center justify-center text-white shadow-lg">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">{cat.name}</h2>
                      <p className="text-xs sm:text-sm text-text-secondary">{cat.desc}</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono px-3 py-1.5 rounded-full bg-surface-elevated text-text-secondary border border-border/50">
                    {categorySkills.length} Verified Proficiencies
                  </span>
                </div>

                {/* Skills cards with circular progress rings */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {categorySkills.map(skill => {
                    const circumference = 251; // r=40
                    const strokeOffset = circumference - (circumference * skill.level) / 100;
                    const projectCount = skill.projects ? skill.projects.length : 0;

                    return (
                      <Link
                        key={skill.name}
                        href={`/projects?skill=${encodeURIComponent(skill.name)}`}
                        className="p-6 rounded-2xl glass-panel hover:bg-surface-elevated/70 border border-border/60 hover:border-primary/60 transition-all duration-300 flex flex-col justify-between items-center text-center group hover:-translate-y-1 shadow-md cursor-pointer"
                      >
                        {/* Animated circular progress ring */}
                        <div className="relative w-24 h-24 my-2 flex items-center justify-center">
                          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 90 90">
                            <circle
                              cx="45"
                              cy="45"
                              r="40"
                              stroke="currentColor"
                              strokeWidth="6"
                              fill="transparent"
                              className="text-surface"
                            />
                            <circle
                              cx="45"
                              cy="45"
                              r="40"
                              stroke="url(#skillGrad)"
                              strokeWidth="6"
                              strokeDasharray={circumference}
                              strokeDashoffset={strokeOffset}
                              strokeLinecap="round"
                              fill="transparent"
                              className="transition-all duration-1000 ease-out"
                            />
                            <defs>
                              <linearGradient id="skillGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="var(--primary)" />
                                <stop offset="50%" stopColor="var(--secondary)" />
                                <stop offset="100%" stopColor="var(--accent)" />
                              </linearGradient>
                            </defs>
                          </svg>

                          <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
                            <SkillIcon name={skill.name} icon={skill.icon} className="w-7 h-7 mb-0.5 group-hover:scale-110 transition-transform drop-shadow" />
                            <span className="text-[11px] font-bold font-mono text-foreground tracking-tight">
                              {skill.level}%
                            </span>
                          </div>
                        </div>

                        <div className="mt-2 space-y-1">
                          <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                            {skill.name}
                          </h3>
                          <p className="text-xs font-mono text-text-secondary">{skill.experience || 'Verified'}</p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-border/30 w-full flex items-center justify-between text-[11px] text-text-secondary">
                          <span>{projectCount} Shipped Projects</span>
                          <span className="text-primary font-bold group-hover:translate-x-0.5 transition-transform">
                            Proof →
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
