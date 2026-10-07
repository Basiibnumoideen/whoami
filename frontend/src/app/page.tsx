'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowRight, 
  Sparkles, 
  ExternalLink, 
  Terminal, 
  CheckCircle2, 
  Zap, 
  Code2, 
  Star, 
  ChevronLeft, 
  ChevronRight, 
  Send,
  Check,
  Award,
  TrendingUp,
  GitCommit,
  GitBranch,
  ShieldCheck,
  FolderGit2,
  Briefcase,
  ArrowUpRight,
  Heart,
  Layers,
  MapPin,
  Globe,
  Atom,
  Hexagon,
  Database
} from 'lucide-react';
import { Github } from '@/components/icons';
import { api } from '@/lib/api';
import { ProjectMediaCarousel } from '@/components/project-media-carousel';
import { ProjectModal } from '@/components/project-modal';
import { ProjectCard } from '@/components/project-card';
import { SkillIcon } from '@/components/skill-icon';

export default function Home() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [mouseSpotlight, setMouseSpotlight] = useState<{ [key: string]: { x: number; y: number } }>({});
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [selectedProjectForModal, setSelectedProjectForModal] = useState<any | null>(null);

  // Dynamic MongoDB state
  const [projects, setProjects] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // GitHub Stats
  const [gitStats, setGitStats] = useState({
    commits: '1,240+',
    repos: '15+',
  });

  // Contact form state
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) return;
    setIsSubmittingContact(true);
    try {
      await api.messages.create({
        name: contactForm.name,
        email: contactForm.email,
        message: contactForm.message,
        projectType: 'Home Page Inquiry',
      });
      setContactSuccess(true);
      setContactForm({ name: '', email: '', message: '' });
      setTimeout(() => setContactSuccess(false), 5000);
    } catch (error) {
      console.error(error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSubmittingContact(false);
    }
  };

  useEffect(() => {
    try {
      const cached = localStorage.getItem('portfolio_settings');
      if (cached) setSettings(JSON.parse(cached));
    } catch {}

    Promise.all([
      api.projects.getAll().catch(() => []),
      api.skills.getAll().catch(() => []),
      api.services.getAll().catch(() => []),
      api.testimonials.getAll().catch(() => []),
      api.settings.get().catch(() => null),
    ]).then(([pr, sk, srv, test, set]) => {
      setProjects(Array.isArray(pr) ? pr : []);
      setSkills(Array.isArray(sk) ? sk : []);
      setServices((Array.isArray(srv) ? srv : []).filter((s: any) => s.status !== 'inactive'));
      setTestimonials(Array.isArray(test) ? test : []);
      if (set) setSettings(set);
      setLoading(false);
    });

    const handleSettingsUpdate = (e: any) => {
      if (e.detail) setSettings(e.detail);
    };
    window.addEventListener('portfolio_settings_updated', handleSettingsUpdate);

    // Telemetry visitor & page-view tracking
    if (typeof window !== 'undefined') {
      if (!sessionStorage.getItem('basi_visited')) {
        sessionStorage.setItem('basi_visited', 'true');
        api.analytics.recordVisitor().catch(() => null);
      } else {
        api.analytics.recordPageView().catch(() => null);
      }
    }

    // Live GitHub information for Basiibnumoideen
    fetch('https://api.github.com/users/Basiibnumoideen/events/public')
      .then(r => r.json())
      .then(events => {
        if (Array.isArray(events)) {
          const pushEvents = events.filter(e => e.type === 'PushEvent');
          const commitCount = pushEvents.reduce((acc, e) => acc + (e.payload?.commits?.length || 0), 0);
          if (commitCount > 0) {
            setGitStats(prev => ({ ...prev, commits: `${commitCount + 1240}+` }));
          }
        }
      })
      .catch(() => null);

    return () => {
      window.removeEventListener('portfolio_settings_updated', handleSettingsUpdate);
    };
  }, []);

  // Auto-scroll testimonials if any exist
  useEffect(() => {
    if (testimonials.length <= 1) return;
    const timer = setInterval(() => {
      setActiveTestimonial(prev => (prev + 1) % testimonials.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>, cardId: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMouseSpotlight(prev => ({ ...prev, [cardId]: { x, y } }));
  };

  const copyEmail = () => {
    const emailToCopy = settings?.email || 'basi.dev@example.com';
    navigator.clipboard.writeText(emailToCopy);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleProjectInteraction = (project?: any) => {
    if (project) {
      api.analytics.recordProjectView({
        projectId: project._id || project.id,
        projectTitle: project.title,
        projectSlug: project.slug,
      }).catch(() => null);
    } else {
      api.analytics.recordProjectView().catch(() => null);
    }
  };

  const featuredHorizontalProject = projects.find(p => p.featured) || projects[0];
  const secondaryProjects = projects.filter(p => p !== featuredHorizontalProject).slice(0, 3);

  const heroTitle = settings?.heroTitle || 'Engineering Modern Web Architecture.';
  const heroSubtitle = settings?.heroSubtitle || 'Senior MERN & Next.js Engineer specializing in scalable distributed backends and premium web apps.';
  const contactEmail = settings?.email || 'basi.dev@example.com';

  const renderHeroTitle = (title: string) => {
    if (!title) {
      return (
        <>
          Engineering <br className="hidden sm:inline" />
          <span className="gradient-brand-text">Modern Web</span> <br />
          Architecture.
        </>
      );
    }
    const words = title.trim().split(/\s+/);
    if (words.length <= 2) {
      return (
        <>
          {words[0]}{' '}
          <span className="gradient-brand-text">{words.slice(1).join(' ')}</span>
        </>
      );
    }
    if (words.length === 3) {
      return (
        <>
          {words[0]} <br className="hidden sm:inline" />
          <span className="gradient-brand-text">{words[1]}</span> <br />
          {words[2]}
        </>
      );
    }
    if (words.length === 4) {
      return (
        <>
          {words[0]} <br className="hidden sm:inline" />
          <span className="gradient-brand-text">{words.slice(1, 3).join(' ')}</span> <br />
          {words[3]}
        </>
      );
    }
    const first = words.slice(0, 2).join(' ');
    const middle = words.slice(2, -1).join(' ');
    const last = words[words.length - 1];
    return (
      <>
        {first} <br className="hidden sm:inline" />
        <span className="gradient-brand-text">{middle}</span> <br />
        {last}
      </>
    );
  };

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      {/* ============================================================ */}
      {/* 1. HERO SECTION: Split Layout with Layered Floating Elements */}
      {/* ============================================================ */}
      <section className="relative pt-24 pb-28 md:pt-36 md:pb-40 overflow-hidden bg-grid-pattern">
        {/* Animated Gradient Mesh & Glowing Orbs */}
        <div className="absolute top-1/4 left-1/4 w-[550px] h-[550px] bg-primary/20 blur-[150px] rounded-full pointer-events-none animate-pulse-soft -z-10" />
        <div className="absolute top-1/3 right-1/4 w-[450px] h-[450px] bg-secondary/20 blur-[140px] rounded-full pointer-events-none animate-float-slow -z-10" />
        <div className="absolute bottom-10 left-1/3 w-[350px] h-[350px] bg-accent/15 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* LEFT COLUMN: Typography & CTAs */}
            <div className="lg:col-span-7 space-y-7 text-center lg:text-left">
              {/* Availability Badge */}
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full glass-panel border border-border/80 shadow-md backdrop-blur-md">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success"></span>
                </span>
                <span className="text-xs font-semibold text-text-primary tracking-wide">
                  Available for Full-Time Roles & Architecture Projects
                </span>
              </div>

              {/* Title matching mockup */}
              <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[76px] font-extrabold tracking-tight text-foreground leading-[1.06]">
                Crafting High-<br />
                Performance<br />
                <span className="gradient-brand-text">Full Stack</span><br />
                Systems
              </h1>

              {/* Introduction Body */}
              <p className="text-base sm:text-lg md:text-xl text-text-secondary leading-relaxed max-w-2xl mx-auto lg:mx-0 font-normal">
                {heroSubtitle || 'Senior MERN & Next.js Architect specialized in distributed high-throughput systems.'}
              </p>

              {/* Action Buttons matching mockup */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-1">
                {/* Primary Button */}
                <Link
                  href="/projects"
                  className="group relative inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl gradient-brand-bg text-white font-semibold text-sm shadow-[0_0_30px_rgba(99,102,241,0.35)] hover:shadow-[0_0_45px_rgba(99,102,241,0.6)] transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                >
                  <span>View My Work</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                {/* Secondary Button - GitHub */}
                <a
                  href={settings?.github || 'https://github.com/Basiibnumoideen'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl glass-panel text-foreground font-semibold text-sm hover:border-primary/60 hover:-translate-y-1 transition-all duration-300 shadow-md group cursor-pointer"
                >
                  <Github className="w-4 h-4 text-text-secondary group-hover:text-foreground transition-colors" />
                  <span>GitHub</span>
                </a>

                {/* Quick Copy Email Action */}
                <button
                  onClick={copyEmail}
                  className="p-4 rounded-2xl glass-panel text-text-secondary hover:text-foreground hover:border-border transition-all duration-200 cursor-pointer"
                  title={`Copy email (${contactEmail}) to clipboard`}
                >
                  {copiedEmail ? <Check className="w-4 h-4 text-success" /> : <Terminal className="w-4 h-4 text-primary" />}
                </button>
              </div>

              {/* Status details line matching mockup */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-5 pt-3 text-xs text-text-secondary font-medium">
                <span className="flex items-center gap-2 text-foreground/90 font-medium">
                  <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
                  Open to Opportunities
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-text-secondary" />
                  Kerala, India
                </span>
                <span className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-text-secondary" />
                  Remote (Worldwide)
                </span>
              </div>
            </div>

            {/* RIGHT COLUMN: Artistic Portrait & Floating Cards matching mockup */}
            <div className="lg:col-span-5 relative flex flex-col items-center justify-center pt-8 pb-10 sm:py-6">
              <div className="relative w-full max-w-[420px] flex items-center justify-center">
                
                {/* 3D Tilted Glass Blade Background */}
                <div className="absolute inset-0 sm:-inset-4 rounded-[44px] bg-gradient-to-tr from-purple-600/20 via-indigo-600/10 to-blue-600/20 border border-white/10 backdrop-blur-xl -rotate-6 scale-95 shadow-[0_20px_50px_rgba(0,0,0,0.5)] pointer-events-none" />
                
                {/* Ambient glow orbs */}
                <div className="absolute -top-10 -right-10 w-44 h-44 bg-primary/25 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

                {/* Neon Cursive Signature Branding on upper left */}
                <div className="absolute top-2 -left-4 sm:-left-8 z-20 pointer-events-none select-none">
                  <span className="font-signature text-4xl sm:text-5xl text-indigo-300 drop-shadow-[0_0_15px_rgba(168,85,247,0.85)] block">
                    Basi
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-mono tracking-[0.25em] text-indigo-400 font-bold uppercase block -mt-1">
                    FULL STACK DEVELOPER
                  </span>
                </div>

                {/* Central Portrait Glass Frame */}
                <div className="relative w-[280px] sm:w-[330px] md:w-[360px] h-[370px] sm:h-[430px] rounded-[36px] overflow-hidden border border-white/15 shadow-[0_30px_60px_rgba(0,0,0,0.7)] bg-[#070b16] group z-10">
                  <img
                    src={settings?.avatar || settings?.logo || '/basi-portrait.jpg'}
                    alt={settings?.name || 'Muhammed Abdul Basith'}
                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/basi-portrait.jpg';
                    }}
                  />
                  {/* Ambient bottom gradient fade to seamlessly merge with the dark UI */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050816] via-[#050816]/25 to-transparent opacity-90 pointer-events-none" />
                  <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-[36px] pointer-events-none" />
                </div>

                {/* Floating Card 1 (Top-Right): 3+ Years Learning & Building */}
                <div className="absolute -top-4 -right-2 sm:-right-8 z-30 p-3 sm:p-3.5 rounded-2xl bg-[#0b1224]/90 border border-white/15 shadow-[0_20px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl flex items-center gap-3 animate-float">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0">
                    <Briefcase className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-base sm:text-lg font-bold font-mono text-foreground leading-none">3+</p>
                    <p className="text-[10px] text-text-secondary leading-tight mt-1">Years Learning & Building</p>
                  </div>
                </div>

                {/* Floating Card 2 (Middle-Right): Tech Stack List */}
                <div className="absolute top-1/4 -right-4 sm:-right-10 z-30 p-3 sm:p-3.5 rounded-2xl bg-[#0b1224]/90 border border-white/15 shadow-[0_20px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl flex flex-col gap-2.5 animate-float-slow">
                  <div className="flex items-center gap-2.5 text-xs font-medium text-foreground">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-black border border-white/20 flex items-center justify-center font-bold text-white text-[10px]">
                      N
                    </div>
                    <span>Next.js</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs font-medium text-foreground">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-cyan-950/70 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                      <Atom className="w-3.5 h-3.5" />
                    </div>
                    <span>React</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs font-medium text-foreground">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-950/70 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <Hexagon className="w-3.5 h-3.5" />
                    </div>
                    <span>Node.js</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs font-medium text-foreground">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-green-950/70 border border-green-500/30 flex items-center justify-center text-green-400">
                      <Database className="w-3.5 h-3.5" />
                    </div>
                    <span>MongoDB</span>
                  </div>
                </div>

                {/* Floating Card 3 (Bottom-Left): Currently Building */}
                <div className="absolute -bottom-5 -left-3 sm:-left-8 z-30 p-3.5 sm:p-4 rounded-2xl bg-[#090f22]/95 border border-purple-500/30 shadow-[0_20px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl max-w-[240px] sm:max-w-[270px] animate-float-reverse">
                  <div className="flex items-center justify-between gap-3 mb-1.5">
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-purple-300">
                      <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
                      Currently Building
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-text-secondary" />
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-foreground">Scalable Web Applications</p>
                  <p className="text-[10px] sm:text-[11px] font-mono text-text-secondary mt-1">Next.js • MongoDB • AI</p>
                </div>

              </div>

              {/* BOTTOM STATS GLASS BAR with Git Information matching mockup */}
              <div className="w-full max-w-[480px] mt-8 p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl glass-panel border border-white/15 shadow-2xl backdrop-blur-xl grid grid-cols-4 gap-2 sm:gap-4 items-center text-center z-20">
                <a
                  href={settings?.github || 'https://github.com/Basiibnumoideen'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group hover:opacity-85 transition-opacity"
                  title="View GitHub Commits"
                >
                  <GitBranch className="w-5 h-5 text-purple-400 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                  <p className="text-sm sm:text-base font-bold font-mono text-foreground leading-tight">
                    {gitStats.commits || '1,240+'}
                  </p>
                  <p className="text-[10px] text-text-secondary leading-tight mt-0.5">Commits</p>
                </a>

                <Link href="/projects" className="group hover:opacity-85 transition-opacity">
                  <Layers className="w-5 h-5 text-cyan-400 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                  <p className="text-sm sm:text-base font-bold font-mono text-foreground leading-tight">
                    {projects.length > 0 ? `${projects.length}+` : '20+'}
                  </p>
                  <p className="text-[10px] text-text-secondary leading-tight mt-0.5">Projects</p>
                </Link>

                <Link href="/skills" className="group hover:opacity-85 transition-opacity">
                  <Code2 className="w-5 h-5 text-indigo-400 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                  <p className="text-sm sm:text-base font-bold font-mono text-foreground leading-tight">
                    {skills.length > 0 ? `${skills.length}+` : '5+'}</p>
                  <p className="text-[10px] text-text-secondary leading-tight mt-0.5">Technologies</p>
                </Link>

                <div className="group">
                  <Heart className="w-5 h-5 text-rose-500 fill-rose-500 mx-auto mb-1 animate-pulse" />
                  <p className="text-sm sm:text-base font-bold font-mono text-foreground leading-tight">100%</p>
                  <p className="text-[10px] text-text-secondary leading-tight mt-0.5">Passion</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. PROJECTS SECTION: Bento Grid with Dynamic MongoDB Data   */}
      {/* ============================================================ */}
      <section className="py-32 relative border-t border-border/50">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-primary font-bold mb-3">
                <Sparkles className="w-4 h-4" />
                <span>Featured Engineering Work</span>
              </div>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground">
                Selected Case Studies
              </h2>
              <p className="text-base sm:text-lg text-text-secondary mt-3 max-w-xl">
                Bento-grid architectural showcases grounded in real benchmarks, strict TypeScript, and high-concurrency testing.
              </p>
            </div>

            <Link
              href="/projects"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:gap-3 transition-all self-start md:self-auto"
            >
              <span>View complete catalog</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Dynamic Content or Empty State (Problem 11) */}
          {!featuredHorizontalProject ? (
            <div className="p-16 text-center glass-card rounded-3xl border border-border/80">
              <FolderGit2 className="w-12 h-12 text-primary mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-bold text-foreground mb-1">No projects available yet.</h3>
              <p className="text-xs text-text-secondary max-w-sm mx-auto">
                Case studies will appear here once published from the admin dashboard.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Featured Project: High-Impact Showcase Card */}
              <ProjectCard
                project={featuredHorizontalProject}
                index={0}
                variant="featured"
                href={`/projects/${featuredHorizontalProject.slug}`}
                onClick={(p) => {
                  handleProjectInteraction(p);
                }}
              />

              {/* Secondary Projects: Modern Grid */}
              {secondaryProjects.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 pt-2">
                  {secondaryProjects.map((project: any, idx: number) => (
                    <ProjectCard
                      key={project._id || project.slug || idx}
                      project={project}
                      index={idx + 1}
                      variant="grid"
                      href={`/projects/${project.slug}`}
                      onClick={(p) => {
                        handleProjectInteraction(p);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. SKILLS SECTION: Modern Cards with Dynamic MongoDB Data   */}
      {/* ============================================================ */}
      <section className="py-32 relative border-t border-border/50 bg-dot-pattern">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-20">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-primary font-bold mb-3">
              <Code2 className="w-4 h-4" />
              <span>Evidence-Linked Proficiencies</span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground">
              Production Capabilities
            </h2>
            <p className="text-base sm:text-lg text-text-secondary mt-3">
              Circular proficiency gauges verified through real repositories. Click any card to trace evidence.
            </p>
          </div>

          {skills.length === 0 ? (
            <div className="p-12 text-center glass-card rounded-3xl border border-border/80">
              <Code2 className="w-10 h-10 text-primary mx-auto mb-3 opacity-50" />
              <h3 className="text-base font-bold text-foreground mb-1">No skills available yet.</h3>
              <p className="text-xs text-text-secondary">Skills will appear here once published from the admin dashboard.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {skills.slice(0, 8).map((skill) => {
                const circumference = 283;
                const strokeOffset = circumference - (circumference * skill.level) / 100;
                const projectCount = skill.projects ? skill.projects.length : 0;

                return (
                  <Link
                    key={skill.name}
                    href={`/projects?skill=${encodeURIComponent(skill.name)}`}
                    className="rounded-3xl glass-card border border-border/80 hover:border-primary/60 p-6 flex flex-col justify-between items-center text-center transition-all duration-300 hover:-translate-y-1.5 group shadow-lg cursor-pointer"
                  >
                    {/* Circular Animated Progress Ring */}
                    <div className="relative w-28 h-28 my-3 flex items-center justify-center">
                      <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          stroke="currentColor"
                          strokeWidth="7"
                          fill="transparent"
                          className="text-surface-elevated"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          stroke="url(#brandGrad)"
                          strokeWidth="7"
                          strokeDasharray={circumference}
                          strokeDashoffset={strokeOffset}
                          strokeLinecap="round"
                          fill="transparent"
                          className="transition-all duration-1000 ease-out"
                        />
                        <defs>
                          <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="var(--primary)" />
                            <stop offset="50%" stopColor="var(--secondary)" />
                            <stop offset="100%" stopColor="var(--accent)" />
                          </linearGradient>
                        </defs>
                      </svg>

                      <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
                        <SkillIcon name={skill.name} icon={skill.icon} className="w-8 h-8 mb-1 group-hover:scale-110 transition-transform drop-shadow" />
                        <span className="text-xs font-bold font-mono text-foreground tracking-tight">
                          {skill.level}%
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 space-y-1">
                      <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                        {skill.name}
                      </h3>
                      <p className="text-xs font-mono text-text-secondary">{skill.category} · {skill.experience || '1+ Years'}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border/40 w-full flex items-center justify-between text-[11px] text-text-secondary">
                      <span>{projectCount} Shipped Projects</span>
                      <span className="text-primary font-bold group-hover:translate-x-0.5 transition-transform">
                        Proof →
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          <div className="mt-12 text-center">
            <Link
              href="/skills"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl glass-panel text-foreground text-xs font-semibold hover:border-primary/60 transition-all hover:scale-105"
            >
              <span>Explore all technical proficiencies</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. SERVICES SECTION: Dynamic Offerings from MongoDB          */}
      {/* ============================================================ */}
      <section className="py-32 relative border-t border-border/50">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-primary font-bold mb-3">
                <Zap className="w-4 h-4" />
                <span>Client & Product Services</span>
              </div>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground">
                High-Impact Offerings
              </h2>
              <p className="text-base sm:text-lg text-text-secondary mt-3 max-w-xl">
                End-to-end engineering contracts from concept definition to multi-region cloud deployment.
              </p>
            </div>

            <Link
              href="/services"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:gap-3 transition-all self-start md:self-auto"
            >
              <span>Detailed service specifications</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {services.length === 0 ? (
            <div className="p-12 text-center glass-card rounded-3xl border border-border/80">
              <Zap className="w-10 h-10 text-primary mx-auto mb-3 opacity-50" />
              <h3 className="text-base font-bold text-foreground mb-1">No services available yet.</h3>
              <p className="text-xs text-text-secondary">Engineering service offerings will be listed once published from the admin dashboard.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {services.map((srv, idx) => {
                const srvId = srv._id || srv.id || `srv-${idx}`;
                const spot = mouseSpotlight[srvId] || { x: -500, y: -500 };
                const featureList = srv.features && srv.features.length > 0 ? srv.features : (srv.deliverables || ['Turnkey Architecture', 'Production Codebase']);
                const techList = srv.technologies || ['TypeScript', 'Next.js 16', 'Node.js', 'MongoDB'];

                return (
                  <div
                    key={srvId}
                    onMouseMove={(e) => handleCardMouseMove(e, srvId)}
                    className="relative p-8 sm:p-10 rounded-3xl glass-card border border-border/80 hover:border-primary/60 transition-all duration-300 hover:-translate-y-1.5 overflow-hidden group shadow-xl flex flex-col justify-between"
                  >
                    <div
                      className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        background: `radial-gradient(400px circle at ${spot.x}px ${spot.y}px, rgba(99, 102, 241, 0.12), transparent 70%)`
                      }}
                    />

                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <div className="w-12 h-12 rounded-2xl gradient-brand-bg flex items-center justify-center text-white shadow-lg">
                          <Sparkles className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-mono px-3 py-1 rounded-full glass-dock text-text-secondary border border-border/40">
                          {srv.sla || srv.timeline || '2-4 Weeks'}
                        </span>
                      </div>

                      <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">
                        {srv.title}
                      </h3>

                      <p className="text-sm text-text-secondary leading-relaxed mb-8">
                        {srv.description}
                      </p>

                      <div className="space-y-3 mb-8">
                        {featureList.map((item: string, dIdx: number) => (
                          <div key={dIdx} className="flex items-start gap-3 text-xs sm:text-sm text-foreground/90">
                            <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-6 border-t border-border/40 flex items-center justify-between">
                      <div className="flex flex-wrap gap-1.5">
                        {techList.slice(0, 3).map((tech: string) => (
                          <span key={tech} className="text-[11px] font-mono px-2.5 py-0.5 rounded-md bg-surface-elevated text-text-secondary">
                            {tech}
                          </span>
                        ))}
                      </div>
                      <Link
                        href={`/contact?service=${encodeURIComponent(srv.title)}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:gap-2 transition-all"
                      >
                        <span>Inquire Now</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. TESTIMONIALS SECTION: Dynamic Testimonials from MongoDB   */}
      {/* ============================================================ */}
      {testimonials.length > 0 && (
        <section className="py-32 relative border-t border-border/50 bg-grid-pattern">
          <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center max-w-2xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-primary font-bold mb-3">
                <Star className="w-4 h-4 text-warning fill-warning" />
                <span>Verified Endorsements</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
                Client & Founder Testimonials
              </h2>
            </div>

            {/* Carousel Viewport */}
            <div className="relative max-w-3xl mx-auto">
              <div className="p-8 sm:p-12 rounded-3xl glass-card border border-border/80 shadow-2xl relative">
                {/* Star Rating */}
                <div className="flex items-center gap-1.5 mb-6">
                  {[...Array(testimonials[activeTestimonial % testimonials.length]?.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-warning fill-warning" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-base sm:text-xl text-foreground font-medium leading-relaxed mb-8 italic">
                  &quot;{testimonials[activeTestimonial % testimonials.length]?.content || testimonials[activeTestimonial % testimonials.length]?.quote}&quot;
                </p>

                {/* Author Info */}
                <div className="flex items-center justify-between pt-6 border-t border-border/40">
                  <div className="flex items-center gap-4">
                    {testimonials[activeTestimonial % testimonials.length]?.avatar ? (
                      <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-primary/50 shadow-md">
                        <img
                          src={testimonials[activeTestimonial % testimonials.length].avatar}
                          alt={testimonials[activeTestimonial % testimonials.length].name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full gradient-brand-bg flex items-center justify-center text-white font-bold text-base">
                        {testimonials[activeTestimonial % testimonials.length]?.name?.[0] || 'C'}
                      </div>
                    )}
                    <div>
                      <h4 className="text-base font-bold text-foreground">
                        {testimonials[activeTestimonial % testimonials.length]?.name}
                      </h4>
                      <p className="text-xs text-text-secondary">
                        {testimonials[activeTestimonial % testimonials.length]?.role} · {testimonials[activeTestimonial % testimonials.length]?.company}
                      </p>
                    </div>
                  </div>

                  {/* Carousel Controls */}
                  {testimonials.length > 1 && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setActiveTestimonial(prev => (prev - 1 + testimonials.length) % testimonials.length)}
                        className="p-2.5 rounded-full glass-panel hover:border-primary text-text-secondary hover:text-foreground transition-colors cursor-pointer"
                        aria-label="Previous testimonial"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setActiveTestimonial(prev => (prev + 1) % testimonials.length)}
                        className="p-2.5 rounded-full glass-panel hover:border-primary text-text-secondary hover:text-foreground transition-colors cursor-pointer"
                        aria-label="Next testimonial"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Pagination Indicators */}
              {testimonials.length > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6">
                  {testimonials.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveTestimonial(idx)}
                      className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                        (activeTestimonial % testimonials.length) === idx ? 'w-8 gradient-brand-bg' : 'w-2 bg-surface-elevated'
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/* 6. CONTACT SECTION: Split Glass Layout                       */}
      {/* ============================================================ */}
      <section className="py-32 relative border-t border-border/50">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Glass Details */}
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-primary font-bold">
                <Sparkles className="w-4 h-4" />
                <span>Direct Collaboration</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground leading-tight">
                Let&apos;s Build Something Unforgettable.
              </h2>
              <p className="text-base text-text-secondary leading-relaxed">
                Currently taking on senior full-stack roles, foundational engineering positions, and bespoke MERN architecture projects.
              </p>

              <div className="space-y-4 pt-4">
                <div className="p-4 rounded-2xl glass-card flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl gradient-brand-bg flex items-center justify-center text-white">
                    <Check className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">Swift 24-Hour Reply</h4>
                    <p className="text-xs text-text-secondary">Direct communication via {contactEmail}</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl glass-card flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-accent/20 text-accent flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">Non-Disclosure & Code Ownership</h4>
                    <p className="text-xs text-text-secondary">Clean intellectual property handoff on all client deliverables.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Split Glass Form */}
            <div className="lg:col-span-7 rounded-3xl glass-card border border-border/80 p-8 sm:p-12 shadow-2xl">
              <form onSubmit={handleContactSubmit} className="space-y-5">
                <h3 className="text-2xl font-bold mb-2">Initiate Conversation</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1.5 font-mono">
                      YOUR NAME
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Elena Rostova"
                      required
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      className="w-full bg-surface-elevated/70 border border-border/70 rounded-xl px-4 py-3 text-xs text-foreground placeholder:text-text-secondary outline-none focus:border-primary transition-all focus:shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1.5 font-mono">
                      EMAIL ADDRESS
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. elena@venture.io"
                      required
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      className="w-full bg-surface-elevated/70 border border-border/70 rounded-xl px-4 py-3 text-xs text-foreground placeholder:text-text-secondary outline-none focus:border-primary transition-all focus:shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5 font-mono">
                    PROJECT / ROLE SUMMARY
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Tell me about your product requirements, scope, target milestones, or team role..."
                    required
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className="w-full bg-surface-elevated/70 border border-border/70 rounded-xl p-4 text-xs text-foreground placeholder:text-text-secondary outline-none focus:border-primary transition-all focus:shadow-[0_0_15px_rgba(99,102,241,0.2)] resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingContact || contactSuccess}
                  className={`w-full py-4 rounded-2xl text-white font-bold text-xs transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                    contactSuccess 
                      ? 'bg-success hover:bg-success/90 shadow-[0_0_25px_rgba(16,185,129,0.4)]' 
                      : 'gradient-brand-bg shadow-[0_0_25px_rgba(99,102,241,0.4)] hover:shadow-[0_0_40px_rgba(99,102,241,0.7)] hover:-translate-y-1'
                  } ${isSubmittingContact ? 'opacity-70 cursor-wait' : ''}`}
                >
                  {contactSuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Message Sent Successfully!</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>{isSubmittingContact ? 'Sending...' : 'Send Message & Schedule Call'}</span>
                    </>
                  )}
                </button>
              </form>
            </div>

          </div>
        </div>
      </section>

      {/* Full project media carousel & details modal */}
      <ProjectModal
        project={selectedProjectForModal}
        isOpen={!!selectedProjectForModal}
        onClose={() => setSelectedProjectForModal(null)}
      />
    </div>
  );
}
