'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Calendar, MapPin, CheckCircle2, ArrowRight, Briefcase, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface ExperienceItem {
  _id?: string;
  id?: string;
  role: string;
  company: string;
  location?: string;
  duration?: string;
  period?: string;
  type?: string;
  description: string;
  achievements?: string[];
  technologies?: string[];
  skills?: string[];
  order?: number;
}

export default function ExperiencePage() {
  const [experiences, setExperiences] = useState<ExperienceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.experiences.getAll()
      .then((data) => {
        setExperiences(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error('Failed to fetch experiences:', err);
        setExperiences([]);
      })
      .finally(() => setLoading(false));

    api.analytics.recordPageView().catch(() => null);
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
      {/* Header */}
      <div className="max-w-3xl mb-16">
        <p className="text-xs font-mono uppercase tracking-wider text-primary font-semibold mb-2">
          Career Milestones
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
          Work History & Engineering Impact
        </h1>
        <p className="text-base text-text-secondary leading-relaxed">
          From freelance contracts to engineering internships, I take end-to-end ownership of software quality, performance bottlenecks, and user experience.
        </p>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-6 h-6 text-primary animate-spin" />
          <p className="text-xs font-mono text-text-secondary">Loading career milestones from database...</p>
        </div>
      ) : experiences.length === 0 ? (
        /* Professional Empty State (Problem 11) */
        <div className="p-16 text-center glass-card rounded-3xl border border-border/80">
          <Briefcase className="w-12 h-12 text-primary mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-bold text-foreground mb-1">No work experience records available yet.</h3>
          <p className="text-xs text-text-secondary max-w-sm mx-auto">
            Career milestones and positions will appear here once published from the admin dashboard.
          </p>
        </div>
      ) : (
        /* Chronological Timeline */
        <div className="relative border-l border-border/70 ml-4 sm:ml-8 pl-6 sm:pl-10 space-y-12">
          {experiences.map((exp, idx) => {
            const timeSpan = exp.duration || exp.period || 'Recent';
            const techList = exp.technologies && exp.technologies.length > 0
              ? exp.technologies
              : (exp.skills || []);
            const achievementList = exp.achievements || [];

            return (
              <div key={exp._id || exp.id || idx} className="relative group">
                {/* Timeline node icon */}
                <div className="absolute -left-[35px] sm:-left-[51px] top-1.5 w-6 h-6 rounded-full bg-surface border-2 border-primary flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                </div>

                {/* Experience Card */}
                <div className="p-6 sm:p-8 rounded-2xl bg-surface border border-border/80 group-hover:border-primary/40 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div>
                      {exp.type && (
                        <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 mb-2 inline-block">
                          {exp.type}
                        </span>
                      )}
                      <h2 className="text-xl sm:text-2xl font-bold text-foreground">{exp.role}</h2>
                      <p className="text-sm font-medium text-text-secondary">{exp.company}</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-text-secondary font-mono">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {timeSpan}
                      </span>
                      {exp.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {exp.location}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed mb-6">
                    {exp.description}
                  </p>

                  {/* Achievements */}
                  {achievementList.length > 0 && (
                    <div className="space-y-2 mb-6">
                      <p className="text-[11px] font-mono uppercase tracking-wider text-text-secondary font-semibold">
                        Key Achievements & Metrics
                      </p>
                      {achievementList.map((ach, i) => (
                        <div key={i} className="flex items-start gap-2.5 text-xs text-foreground/90">
                          <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
                          <span>{ach}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tech Tags */}
                  {techList.length > 0 && (
                    <div className="pt-4 border-t border-border/40">
                      <div className="flex flex-wrap gap-1.5">
                        {techList.map(tech => (
                          <Link
                            key={tech}
                            href={`/projects?skill=${encodeURIComponent(tech)}`}
                            className="text-xs px-2.5 py-1 rounded-md bg-surface-elevated hover:bg-primary/10 hover:text-primary text-text-secondary border border-border/40 transition-colors"
                          >
                            {tech}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CTA Box */}
      <div className="mt-16 p-8 rounded-2xl bg-surface-elevated/40 border border-border/70 text-center">
        <h3 className="text-lg font-bold mb-2">Looking for a dependable developer for your team?</h3>
        <p className="text-xs text-text-secondary max-w-md mx-auto mb-6">
          I bring high technical velocity, clear communication, and production-tested engineering habits.
        </p>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 text-xs font-semibold px-5 py-2.5 rounded-xl gradient-brand-bg text-white hover:opacity-95 shadow-sm transition-opacity"
        >
          <span>Get in Touch</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
