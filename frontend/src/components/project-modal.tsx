'use client';

import React, { useEffect } from 'react';
import { 
  X, 
  ExternalLink, 
  CheckCircle2, 
  Sparkles, 
  FolderGit2 
} from 'lucide-react';
import { Github } from '@/components/icons';
import { ProjectMediaCarousel } from '@/components/project-media-carousel';

export interface ProjectModalData {
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
}

interface ProjectModalProps {
  project: ProjectModalData | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectModal({ project, isOpen, onClose }: ProjectModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !project) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-background/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-4xl bg-surface border border-border/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-border/50 flex items-center justify-between gap-4 bg-surface-elevated/40">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono gradient-brand-bg text-white font-bold shrink-0">
              {project.category}
            </span>
            <h2 className="text-base sm:text-lg font-bold text-foreground truncate">
              {project.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-surface-elevated hover:bg-surface-elevated/80 border border-border/60 text-text-secondary hover:text-foreground transition-all cursor-pointer shrink-0"
            title="Close (ESC)"
            aria-label="Close Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Automatic Media Carousel Section */}
          <div className="w-full h-64 sm:h-96 rounded-2xl overflow-hidden shadow-inner">
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

          {/* Project Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Left Column: Description & Case Study */}
            <div className="md:col-span-8 space-y-5">
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-primary font-semibold mb-2">
                  Project Overview
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {project.description}
                </p>
              </div>

              {project.problem && (
                <div className="p-4 rounded-2xl bg-surface-elevated/40 border border-border/50 space-y-1">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-text-secondary font-bold">
                    Problem Solved
                  </span>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                    {project.problem}
                  </p>
                </div>
              )}

              {project.approach && (
                <div className="p-4 rounded-2xl bg-surface-elevated/40 border border-border/50 space-y-1">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-secondary font-bold">
                    Architectural Strategy
                  </span>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                    {project.approach}
                  </p>
                </div>
              )}

              {project.result && (
                <div className="p-4 rounded-2xl bg-surface-elevated/40 border border-border/50 space-y-1">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-success font-bold">
                    Engineering Impact
                  </span>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                    {project.result}
                  </p>
                </div>
              )}

              {project.keyFeatures && project.keyFeatures.length > 0 && (
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-text-secondary font-semibold mb-2">
                    Key Features & Technical Capabilities
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {project.keyFeatures.map((feat, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 rounded-xl bg-surface-elevated/30 border border-border/40">
                        <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
                        <span className="text-foreground/90">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Metadata & CTAs */}
            <div className="md:col-span-4 space-y-5 bg-surface-elevated/50 p-5 rounded-2xl border border-border/60">
              {project.metrics && (
                <div>
                  <span className="text-[10px] font-mono uppercase text-text-secondary">Key Benchmark</span>
                  <div className="text-base font-bold text-success mt-0.5">{project.metrics}</div>
                </div>
              )}

              {project.tags && project.tags.length > 0 && (
                <div>
                  <span className="text-[10px] font-mono uppercase text-text-secondary mb-2 block">Technologies</span>
                  <div className="flex flex-wrap gap-1.5">
                    {project.tags.map(tag => (
                      <span key={tag} className="text-[11px] px-2 py-0.5 rounded-md bg-surface text-text-secondary border border-border/50 font-mono">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-border/40 space-y-2.5">
                {project.demoUrl && (
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl gradient-brand-bg text-white text-xs font-semibold hover:opacity-95 shadow-sm transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Launch Live Production App</span>
                  </a>
                )}

                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-surface hover:bg-surface-elevated border border-border text-foreground text-xs font-semibold transition-all"
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span>View Source Code</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
