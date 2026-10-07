'use client';

import { PERSONAL_INFO } from '@/lib/data';
import { Github, Linkedin, Twitter } from '@/components/icons';
import { Mail, FileText, ArrowUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export function FloatingDock() {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

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
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('portfolio_settings_updated', handleUpdate);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const github = settings?.github || settings?.socialLinks?.github || PERSONAL_INFO.github;
  const linkedin = settings?.linkedin || settings?.socialLinks?.linkedin || PERSONAL_INFO.linkedin;
  const twitter = settings?.socialLinks?.twitter || PERSONAL_INFO.twitter;
  const email = settings?.email || PERSONAL_INFO.email;
  const resumeUrl = settings?.resumeURL || settings?.resumeUrl || '/resume.pdf';

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-full glass-dock border border-border/80 shadow-2xl backdrop-blur-2xl">
      <a
        href={github}
        target="_blank"
        rel="noreferrer"
        className="p-2.5 rounded-full text-text-secondary hover:text-foreground hover:bg-surface transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
        title="GitHub Profile"
      >
        <Github className="w-4 h-4" />
      </a>
      <a
        href={linkedin}
        target="_blank"
        rel="noreferrer"
        className="p-2.5 rounded-full text-text-secondary hover:text-foreground hover:bg-surface transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
        title="LinkedIn Network"
      >
        <Linkedin className="w-4 h-4" />
      </a>
      {twitter && (
        <a
          href={twitter}
          target="_blank"
          rel="noreferrer"
          className="p-2.5 rounded-full text-text-secondary hover:text-foreground hover:bg-surface transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
          title="Twitter / X"
        >
          <Twitter className="w-4 h-4" />
        </a>
      )}
      <a
        href={`mailto:${email}`}
        className="p-2.5 rounded-full text-text-secondary hover:text-foreground hover:bg-surface transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
        title="Send Direct Email"
      >
        <Mail className="w-4 h-4" />
      </a>
      <div className="w-[1px] h-4 bg-border/60 mx-1" />
      <a
        href={resumeUrl}
        download
        onClick={() => {
          api.analytics.recordResumeDownload({ source: 'FloatingDock' }).catch(() => null);
        }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold gradient-brand-bg text-white shadow-md hover:opacity-90 hover:-translate-y-0.5 transition-all"
        title="Download CV"
      >
        <FileText className="w-3.5 h-3.5" />
        <span>Resume</span>
      </a>

      {showBackToTop && (
        <>
          <div className="w-[1px] h-4 bg-border/60 mx-1" />
          <button
            onClick={scrollToTop}
            className="p-2 rounded-full text-text-secondary hover:text-primary hover:bg-surface transition-all duration-200 hover:-translate-y-1 cursor-pointer"
            title="Scroll to Top"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </>
      )}
    </div>
  );
}
