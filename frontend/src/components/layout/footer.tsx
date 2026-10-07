'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Mail, ArrowUpRight, Sparkles } from 'lucide-react';
import { Github, Linkedin, Twitter } from '@/components/icons';
import { api } from '@/lib/api';

export function Footer() {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    let mounted = true;

    const applyData = (data: any) => {
      if (!mounted || !data) return;
      setSettings(data);
    };

    try {
      const cached = localStorage.getItem('portfolio_settings');
      if (cached) applyData(JSON.parse(cached));
    } catch {}

    api.settings.get().then(applyData).catch(() => {});

    const handleUpdate = (e: any) => {
      if (e.detail) applyData(e.detail);
    };
    window.addEventListener('portfolio_settings_updated', handleUpdate);

    return () => {
      mounted = false;
      window.removeEventListener('portfolio_settings_updated', handleUpdate);
    };
  }, []);

  const name = settings?.name || 'Muhammed Abdul Basith';
  const tagline = settings?.footerDescription || settings?.footerContent || settings?.heroSubtitle || 'Building resilient full-stack systems, distributed engines, and modern digital interfaces.';
  const email = settings?.email || 'basi.dev@example.com';
  const github = settings?.github || settings?.socialLinks?.github || 'https://github.com';
  const linkedin = settings?.linkedin || settings?.socialLinks?.linkedin || 'https://linkedin.com';
  const twitter = settings?.socialLinks?.twitter || '';

  return (
    <footer className="border-t border-border/50 bg-surface/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand & Bio */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg gradient-brand-bg flex items-center justify-center text-white font-bold text-xs">
                {settings?.logo ? (
                  <img src={settings.logo} alt="Logo" className="w-5 h-5 object-contain" />
                ) : (
                  'B'
                )}
              </div>
              <span className="font-semibold text-lg text-foreground tracking-tight">
                {name}
              </span>
            </Link>
            <p className="text-xs text-text-secondary leading-relaxed max-w-md">
              {tagline}
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/20 text-success text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
              <span>Available for high-impact engineering roles & contracts</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-text-secondary font-semibold mb-3">
              Explore
            </h4>
            <ul className="space-y-2 text-xs">
              {settings?.navLinks?.home !== false && (
                <li>
                  <Link href="/" className="text-text-secondary hover:text-foreground transition-colors">
                    Home
                  </Link>
                </li>
              )}
              {settings?.navLinks?.about !== false && (
                <li>
                  <Link href="/about" className="text-text-secondary hover:text-foreground transition-colors">
                    About Basi
                  </Link>
                </li>
              )}
              {settings?.navLinks?.projects !== false && (
                <li>
                  <Link href="/projects" className="text-text-secondary hover:text-foreground transition-colors">
                    Projects & Case Studies
                  </Link>
                </li>
              )}
              {settings?.navLinks?.skills !== false && (
                <li>
                  <Link href="/skills" className="text-text-secondary hover:text-foreground transition-colors">
                    Evidence-Linked Skills
                  </Link>
                </li>
              )}
              {settings?.navLinks?.experience !== false && (
                <li>
                  <Link href="/experience" className="text-text-secondary hover:text-foreground transition-colors">
                    Career Timeline
                  </Link>
                </li>
              )}
              {settings?.navLinks?.services !== false && (
                <li>
                  <Link href="/services" className="text-text-secondary hover:text-foreground transition-colors">
                    Services & Pricing
                  </Link>
                </li>
              )}
              {settings?.navLinks?.blog !== false && (
                <li>
                  <Link href="/blog" className="text-text-secondary hover:text-foreground transition-colors">
                    Engineering Blog
                  </Link>
                </li>
              )}
              {settings?.navLinks?.now !== false && (
                <li>
                  <Link href="/now" className="text-text-secondary hover:text-foreground transition-colors">
                    /now (Live Status)
                  </Link>
                </li>
              )}
              {settings?.navLinks?.uses !== false && (
                <li>
                  <Link href="/uses" className="text-text-secondary hover:text-foreground transition-colors">
                    /uses (Hardware & Stack)
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Connect & Social */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-text-secondary font-semibold mb-3">
              Connect
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href={`mailto:${email}`}
                  className="flex items-center gap-1.5 text-text-secondary hover:text-foreground transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>{email}</span>
                </a>
              </li>
              {github && (
                <li>
                  <a
                    href={github}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-text-secondary hover:text-foreground transition-colors"
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span>GitHub Profile</span>
                    <ArrowUpRight className="w-3 h-3 text-text-secondary/60" />
                  </a>
                </li>
              )}
              {linkedin && (
                <li>
                  <a
                    href={linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-text-secondary hover:text-foreground transition-colors"
                  >
                    <Linkedin className="w-3.5 h-3.5" />
                    <span>LinkedIn Network</span>
                    <ArrowUpRight className="w-3 h-3 text-text-secondary/60" />
                  </a>
                </li>
              )}
              {twitter && (
                <li>
                  <a
                    href={twitter}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-text-secondary hover:text-foreground transition-colors"
                  >
                    <Twitter className="w-3.5 h-3.5" />
                    <span>Twitter / X</span>
                    <ArrowUpRight className="w-3 h-3 text-text-secondary/60" />
                  </a>
                </li>
              )}
              <li>
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 text-primary hover:underline font-medium pt-2"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Admin CMS Dashboard</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-secondary">
          <p>© {new Date().getFullYear()} {name}. All rights reserved.</p>
          <p className="font-mono text-[11px] text-text-secondary/70">
            Design Tokens: Linear Restraint + Vercel Monochrome
          </p>
        </div>
      </div>
    </footer>
  );
}
