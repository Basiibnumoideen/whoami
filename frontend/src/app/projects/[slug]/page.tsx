'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { 
  ArrowLeft, 
  ExternalLink, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  Cpu, 
  Target, 
  TrendingUp, 
  Calendar, 
  Tag, 
  Share2, 
  RefreshCw,
  FolderGit2
} from 'lucide-react';
import { Github } from '@/components/icons';
import { ProjectMediaCarousel } from '@/components/project-media-carousel';
import { SkillIcon } from '@/components/skill-icon';

interface ProjectDetailData {
  _id?: string;
  id?: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  tags?: string[];
  metrics?: string;
  demoUrl?: string;
  githubUrl?: string;
  image?: string;
  thumbnailImage?: string;
  videoUrl?: string;
  images?: string[];
  videos?: string[];
  carouselAutoPlay?: boolean;
  carouselInterval?: number;
  featured?: boolean;
  problem?: string;
  approach?: string;
  result?: string;
  keyFeatures?: string[];
  createdAt?: string;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [project, setProject] = useState<ProjectDetailData | null>(null);
  const [allProjects, setAllProjects] = useState<ProjectDetailData[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!slug) return;

    setLoading(true);

    // Fetch this project by slug or ID
    api.projects.getOne(slug)
      .then((data) => {
        if (data) {
          setProject(data);
          // Telemetry
          api.analytics.recordProjectView({
            projectId: data._id || data.id,
            projectTitle: data.title,
            projectSlug: data.slug,
          }).catch(() => null);
        } else {
          setProject(null);
        }
      })
      .catch((err) => {
        console.error('Failed to load project detail:', err);
        setProject(null);
      })
      .finally(() => setLoading(false));

    // Fetch related projects catalog
    api.projects.getAll()
      .then((data) => {
        if (Array.isArray(data)) {
          setAllProjects(data);
        }
      })
      .catch(() => null);

    api.analytics.recordPageView().catch(() => null);
  }, [slug]);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Other related projects for "More Case Studies" footer
  const relatedProjects = allProjects
    .filter((p) => p.slug !== slug && p._id !== project?._id)
    .slice(0, 3);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4 px-4">
        <RefreshCw className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm font-mono text-text-secondary">Loading architectural case study...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <div className="p-12 rounded-3xl glass-card border border-border/80 max-w-lg mx-auto space-y-4">
          <FolderGit2 className="w-12 h-12 text-primary mx-auto opacity-50" />
          <h1 className="text-2xl font-bold text-foreground">Project Not Found</h1>
          <p className="text-sm text-text-secondary">
            The requested project or case study does not exist or has been archived.
          </p>
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-brand-bg text-white text-xs font-semibold hover:opacity-95 transition-opacity"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Projects Catalog</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <article className="min-h-screen py-12 sm:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Navigation Breadcrumbs & Actions Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-6">
          <div className="flex items-center gap-2 text-xs font-mono text-text-secondary">
            <Link 
              href="/projects" 
              className="inline-flex items-center gap-1.5 hover:text-primary transition-colors text-foreground font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Projects</span>
            </Link>
            <span>/</span>
            <span className="text-primary font-medium">{project.category}</span>
            <span>/</span>
            <span className="truncate max-w-[200px] sm:max-w-xs">{project.title}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-elevated hover:bg-surface-elevated/80 border border-border/60 text-text-secondary hover:text-foreground text-xs font-mono transition-colors cursor-pointer"
              title="Copy Case Study Link"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copied ? 'Link Copied!' : 'Share'}</span>
            </button>
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-surface-elevated hover:bg-surface-elevated/80 border border-border/70 text-foreground text-xs font-medium transition-colors"
              >
                <Github className="w-3.5 h-3.5" />
                <span>Source Code</span>
              </a>
            )}
            {project.demoUrl && (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl gradient-brand-bg text-white text-xs font-semibold hover:opacity-95 shadow-sm transition-opacity"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Live Demo</span>
              </a>
            )}
          </div>
        </div>

        {/* Project Header Info */}
        <div className="space-y-4 max-w-4xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-mono gradient-brand-bg text-white font-bold tracking-wide shadow-sm">
              {project.category}
            </span>
            {project.featured && (
              <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-accent/20 border border-accent/40 text-accent font-semibold flex items-center gap-1 shadow-sm">
                <Sparkles className="w-3 h-3" />
                Featured Showcase
              </span>
            )}
            {project.metrics && (
              <span className="px-3 py-1 rounded-full text-xs font-mono bg-success/15 border border-success/30 text-success font-semibold flex items-center gap-1.5 shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{project.metrics}</span>
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
            {project.title}
          </h1>

          <p className="text-base sm:text-lg text-text-secondary leading-relaxed pt-1">
            {project.description}
          </p>
        </div>

        {/* Hero Media Container with Perfect Auto-Adjust View */}
        <div className="w-full relative rounded-3xl overflow-hidden border border-border/70 bg-surface-elevated shadow-2xl">
          <div className="w-full h-80 sm:h-[480px] lg:h-[560px]">
            <ProjectMediaCarousel
              images={project.images}
              videos={project.videos}
              thumbnailImage={project.thumbnailImage}
              image={project.image}
              videoUrl={project.videoUrl}
              autoPlay={project.carouselAutoPlay !== false}
              interval={project.carouselInterval || 4000}
              title={project.title}
              className="w-full h-full"
            />
          </div>
        </div>

        {/* Case Study Details & Architecture Deep-Dive */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Case Study Column */}
          <div className="lg:col-span-8 space-y-8">
            {/* Problem Solved */}
            {project.problem && (
              <div className="glass-card p-6 sm:p-8 rounded-3xl border border-border/70 space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-rose-400 font-bold">
                  <Target className="w-4 h-4" />
                  <span>The Engineering Problem</span>
                </div>
                <h3 className="text-xl font-bold text-foreground">Challenge & Constraints</h3>
                <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
                  {project.problem}
                </p>
              </div>
            )}

            {/* Architectural Strategy */}
            {project.approach && (
              <div className="glass-card p-6 sm:p-8 rounded-3xl border border-border/70 space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-secondary font-bold">
                  <Cpu className="w-4 h-4" />
                  <span>Technical Strategy</span>
                </div>
                <h3 className="text-xl font-bold text-foreground">Architecture & Implementation</h3>
                <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
                  {project.approach}
                </p>
              </div>
            )}

            {/* Measurable Impact / Result */}
            {project.result && (
              <div className="glass-card p-6 sm:p-8 rounded-3xl border border-border/70 space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-success font-bold">
                  <TrendingUp className="w-4 h-4" />
                  <span>Engineering Outcome</span>
                </div>
                <h3 className="text-xl font-bold text-foreground">Measurable Impact & Benchmark</h3>
                <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
                  {project.result}
                </p>
              </div>
            )}

            {/* Key Technical Features */}
            {project.keyFeatures && project.keyFeatures.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Layers className="w-5 h-5 text-primary" />
                  <span>Key Technical Capabilities</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {project.keyFeatures.map((feat, idx) => (
                    <div 
                      key={idx} 
                      className="p-4 rounded-2xl bg-surface-elevated/70 border border-border/60 flex items-start gap-3"
                    >
                      <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-sm text-foreground/90 font-medium leading-snug">
                        {feat}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Column: Tech Stack, Metrics & Links */}
          <div className="lg:col-span-4 space-y-6">
            {/* Quick Summary Bento Card */}
            <div className="glass-card p-6 rounded-3xl border border-border/70 space-y-6">
              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-text-secondary font-bold mb-3">
                  Benchmark Proof
                </h4>
                {project.metrics ? (
                  <div className="p-3.5 rounded-2xl bg-success/10 border border-success/20 flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                    <div>
                      <span className="text-xs font-mono text-text-secondary block">Production Benchmark</span>
                      <span className="text-sm font-bold text-success font-mono">{project.metrics}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-text-secondary font-mono">Production Ready</div>
                )}
              </div>

              {/* Technologies with matching Brand Icons */}
              {project.tags && project.tags.length > 0 && (
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-text-secondary font-bold mb-3">
                    Technologies & Stack
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <Link
                        key={tag}
                        href={`/projects?skill=${encodeURIComponent(tag)}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-elevated hover:bg-surface-elevated/80 border border-border/60 text-xs font-mono text-foreground transition-all hover:border-primary/50 group"
                      >
                        <SkillIcon name={tag} className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                        <span>{tag}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 border-t border-border/40 space-y-2.5">
                {project.demoUrl && (
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl gradient-brand-bg text-white text-xs font-bold hover:opacity-95 shadow-md transition-opacity"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Launch Live Production App</span>
                  </a>
                )}
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-surface-elevated hover:bg-surface-elevated/80 border border-border/70 text-foreground text-xs font-semibold transition-colors"
                  >
                    <Github className="w-4 h-4" />
                    <span>Explore Source Code</span>
                  </a>
                )}
                <Link
                  href="/contact"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-surface hover:bg-surface-elevated border border-border/50 text-text-secondary hover:text-foreground text-xs font-medium transition-colors"
                >
                  <span>Inquire about this architecture</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* More Case Studies Footer */}
        {relatedProjects.length > 0 && (
          <div className="pt-12 border-t border-border/40 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-foreground">Explore Other Case Studies</h3>
                <p className="text-xs text-text-secondary">More production systems and technical benchmarks.</p>
              </div>
              <Link
                href="/projects"
                className="text-xs font-mono text-primary hover:underline"
              >
                View all ({allProjects.length}) &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedProjects.map((relProj) => (
                <Link
                  key={relProj._id || relProj.slug}
                  href={`/projects/${relProj.slug}`}
                  className="group block p-5 rounded-2xl glass-card border border-border/70 hover:border-primary/50 transition-all hover:-translate-y-1"
                >
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-bold">
                    {relProj.category}
                  </span>
                  <h4 className="text-base font-bold text-foreground group-hover:text-primary transition-colors mt-2 mb-1">
                    {relProj.title}
                  </h4>
                  <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                    {relProj.description}
                  </p>
                  <div className="mt-3 pt-3 border-t border-border/40 flex items-center justify-between text-[11px] font-mono text-primary font-medium">
                    <span>View Case Study &rarr;</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
