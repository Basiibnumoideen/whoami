'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { CheckCircle2, ArrowRight, HelpCircle, Layers, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface ServiceItem {
  _id?: string;
  id?: string;
  title: string;
  icon?: string;
  description: string;
  features?: string[];
  deliverables?: string[];
  status?: string;
  order?: number;
  sla?: string;
  timeline?: string;
  technologies?: string[];
}

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.services.getAll()
      .then((data) => {
        // Filter out inactive services on public site
        const active = (Array.isArray(data) ? data : []).filter(
          (s: ServiceItem) => s.status !== 'inactive'
        );
        setServices(active);
      })
      .catch((err) => {
        console.error('Failed to fetch services:', err);
        setServices([]);
      })
      .finally(() => setLoading(false));

    api.analytics.recordPageView().catch(() => null);
  }, []);

  const faqs = [
    {
      q: 'What makes your development approach different?',
      a: 'I combine backend structural rigor (clean MVC architecture, normalized MongoDB schemas, JWT auth with refresh rotation) with frontend aesthetic perfection (Linear-style minimalism, micro-interactions, responsive accessibility, and 95+ Core Web Vitals).'
    },
    {
      q: 'Can you work with existing engineering teams?',
      a: 'Yes! I have experience writing clean modular TypeScript, adhering to Git pull request workflows, writing comprehensive documentation, and collaborating with cross-functional teams.'
    },
    {
      q: 'How do you handle AI integration without hallucinations?',
      a: 'I ground AI models (like Claude Haiku or OpenAI GPT) using strict context injection, vector similarity search, and rigid system prompts that prohibit out-of-domain speculation.'
    },
    {
      q: 'What is your typical project turnaround?',
      a: 'Depending on scope, MVPs and targeted feature sets are delivered in 2 to 4 weeks with weekly milestones, live staging previews, and transparent code reviews.'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
      {/* Header */}
      <div className="max-w-3xl mb-16">
        <p className="text-xs font-mono uppercase tracking-wider text-primary font-semibold mb-2">
          Engineering Capabilities
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
          Software Services Tailored for Growth
        </h1>
        <p className="text-base text-text-secondary leading-relaxed">
          From greenfield MVP development to enterprise performance overhauls, I provide high-reliability engineering across the entire stack.
        </p>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-6 h-6 text-primary animate-spin" />
          <p className="text-xs font-mono text-text-secondary">Loading services from database...</p>
        </div>
      ) : services.length === 0 ? (
        /* Professional Empty State (Problem 11) */
        <div className="p-16 mb-20 text-center glass-card rounded-3xl border border-border/80">
          <Layers className="w-12 h-12 text-primary mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-bold text-foreground mb-1">No services available yet.</h3>
          <p className="text-xs text-text-secondary max-w-sm mx-auto">
            Available software engineering offerings will appear here once published from the admin dashboard.
          </p>
        </div>
      ) : (
        /* Services Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {services.map((srv, idx) => {
            const featureList = srv.features && srv.features.length > 0 
              ? srv.features 
              : (srv.deliverables || ['End-to-end architecture', 'Production-ready code handoff']);
            const techList = srv.technologies || ['TypeScript', 'Next.js 16', 'Node.js', 'MongoDB'];

            return (
              <div
                key={srv._id || srv.id || idx}
                className="p-8 rounded-3xl bg-surface border border-border/80 flex flex-col justify-between hover:border-primary/40 transition-colors shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono px-2.5 py-1 rounded bg-surface-elevated text-primary border border-border/60">
                      0{idx + 1}
                    </span>
                    <span className="text-xs font-mono text-text-secondary">
                      Est. {srv.sla || srv.timeline || '2-4 Weeks'}
                    </span>
                  </div>

                  <h2 className="text-2xl font-bold text-foreground mb-3">{srv.title}</h2>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed mb-6">
                    {srv.description}
                  </p>

                  <div className="space-y-2.5 mb-8">
                    <p className="text-[11px] font-mono uppercase tracking-wider text-text-secondary font-semibold">
                      What&apos;s Included
                    </p>
                    {featureList.map((item, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs text-foreground/90">
                        <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex flex-wrap gap-1.5">
                    {techList.slice(0, 3).map(tech => (
                      <span key={tech} className="text-[11px] px-2 py-0.5 rounded bg-surface-elevated text-text-secondary border border-border/40 font-mono">
                        {tech}
                      </span>
                    ))}
                  </div>
                  <Link
                    href={`/contact?service=${encodeURIComponent(srv.title)}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl gradient-brand-bg text-white hover:opacity-95 shadow-sm transition-opacity self-start sm:self-auto"
                  >
                    <span>Book Service</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Engineering Process Steps */}
      <section className="mb-20 p-8 sm:p-12 rounded-3xl bg-surface border border-border/80">
        <div className="text-center max-w-xl mx-auto mb-12">
          <p className="text-xs font-mono uppercase tracking-wider text-primary font-semibold mb-2">
            Methodology
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold">How We Build Together</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { step: '01', title: 'Discovery & Schema', desc: 'Define functional requirements, database entities, and API contracts before touching UI.' },
            { step: '02', title: 'Design System', desc: 'Establish typography tokens, responsive grids, and dark/light components.' },
            { step: '03', title: 'Full-Stack Build', desc: 'Rapid development sprints with daily git pushes, staging previews, and automated testing.' },
            { step: '04', title: 'Audit & Launch', desc: 'End-to-end security review, Lighthouse 90+ tuning, and production CI/CD handoff.' }
          ].map((item, i) => (
            <div key={i} className="p-5 rounded-2xl bg-surface-elevated/40 border border-border/50">
              <span className="text-xl font-mono font-bold text-primary mb-2 block">{item.step}</span>
              <h3 className="text-sm font-bold text-foreground mb-2">{item.title}</h3>
              <p className="text-xs text-text-secondary leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQs */}
      <section className="p-8 rounded-3xl bg-surface border border-border/80">
        <div className="flex items-center gap-2 mb-8">
          <HelpCircle className="w-5 h-5 text-primary" />
          <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {faqs.map((faq, i) => (
            <div key={i} className="p-5 rounded-2xl bg-surface-elevated/40 border border-border/50">
              <h3 className="text-sm font-bold text-foreground mb-2">{faq.q}</h3>
              <p className="text-xs text-text-secondary leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
