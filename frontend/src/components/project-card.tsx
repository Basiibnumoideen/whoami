'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ExternalLink, CheckCircle2, ArrowUpRight, Play, Image as ImageIcon, Sparkles } from 'lucide-react';
import { Github } from '@/components/icons';
import { ProjectMediaCarousel } from '@/components/project-media-carousel';

export interface ProjectCardData {
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

interface ProjectCardProps {
  project: ProjectCardData;
  index?: number;
  variant?: 'grid' | 'featured';
  href?: string;
  onClick?: (project: ProjectCardData) => void;
  onSkillClick?: (skill: string) => void;
}

export function ProjectCard({
  project,
  index = 0,
  variant = 'grid',
  href,
  onClick,
  onSkillClick,
}: ProjectCardProps) {
  const router = useRouter();

  const images = project.images && project.images.length > 0
    ? project.images
    : (project.thumbnailImage || project.image ? [project.thumbnailImage || project.image || ''] : []);

  const videos = project.videos && project.videos.length > 0
    ? project.videos
    : (project.videoUrl ? [project.videoUrl] : []);

  const totalMedia = images.length + videos.length;
  const hasVideo = videos.length > 0;

  const handleCardClick = () => {
    if (onClick) {
      onClick(project);
    }
    const targetUrl = href || `/projects/${project.slug}`;
    if (targetUrl) {
      router.push(targetUrl);
    }
  };

  // =========================================================================
  // FEATURED HORIZONTAL LAYOUT (For Hero/Top Showcases)
  // =========================================================================
  if (variant === 'featured') {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={handleCardClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleCardClick();
          }
        }}
        className="group relative w-full rounded-3xl bg-surface/90 hover:bg-surface border border-border/70 hover:border-primary/50 transition-all duration-500 overflow-hidden shadow-xl hover:shadow-2xl hover:-translate-y-1 cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-primary/50"
      >
        {/* Ambient background glow on hover */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl -z-10 pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-10 items-center">
          {/* Media Preview Column */}
          <div className="lg:col-span-7 relative rounded-2xl overflow-hidden border border-border/80 bg-surface-elevated shadow-inner h-72 sm:h-96">
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

            {/* Gradient bottom shadow vignette for smooth blend */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent pointer-events-none" />

            {/* Floating Top Badges */}
            <div className="absolute top-3.5 left-3.5 flex items-center gap-2 z-10 pointer-events-none">
              <span className="text-[11px] font-mono px-3 py-1 rounded-full glass-dock text-primary font-bold shadow-sm border border-primary/20">
                {project.category}
              </span>
              {project.featured && (
                <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-accent/20 border border-accent/40 text-accent font-semibold flex items-center gap-1 shadow-sm">
                  <Sparkles className="w-3 h-3" />
                  Featured
                </span>
              )}
            </div>

            {/* Media Count Pill */}
            {totalMedia > 1 && (
              <div className="absolute bottom-3.5 right-3.5 z-10 pointer-events-none flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1 rounded-full glass-dock text-text-secondary border border-border/60">
                {hasVideo ? <Play className="w-3 h-3 text-secondary fill-secondary" /> : <ImageIcon className="w-3 h-3 text-primary" />}
                <span>{totalMedia} media files</span>
              </div>
            )}
          </div>

          {/* Details Column */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-5">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <span className="text-xs font-mono text-primary font-semibold tracking-wider uppercase">
                  {`0${index + 1} // CASE STUDY`}
                </span>
                {project.metrics && (
                  <span className="text-xs font-mono text-success font-medium flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-success/10 border border-success/20">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>{project.metrics}</span>
                  </span>
                )}
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                <span>{project.title}</span>
                <ArrowUpRight className="w-5 h-5 text-text-secondary group-hover:text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform shrink-0" />
              </h3>

              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed mt-3 line-clamp-3">
                {project.description}
              </p>
            </div>

            {/* Problem / Result Quick Highlights if present */}
            {(project.problem || project.result) && (
              <div className="p-3.5 rounded-xl bg-surface-elevated/70 border border-border/60 text-xs space-y-1.5">
                {project.problem && (
                  <p className="text-text-secondary line-clamp-1">
                    <strong className="text-foreground">Problem:</strong> {project.problem}
                  </p>
                )}
                {project.result && (
                  <p className="text-success line-clamp-1">
                    <strong className="text-foreground">Result:</strong> {project.result}
                  </p>
                )}
              </div>
            )}

            {/* Technologies */}
            {project.tags && project.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {project.tags.slice(0, 6).map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={(e) => {
                      if (onSkillClick) {
                        e.stopPropagation();
                        onSkillClick(tag);
                      }
                    }}
                    className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-surface-elevated text-text-secondary hover:text-foreground hover:bg-surface-elevated/80 border border-border/50 transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              {project.demoUrl && (
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg gradient-brand-bg text-white text-xs font-semibold hover:opacity-95 shadow-sm transition-opacity"
                  title="Live App"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Live App</span>
                </a>
              )}
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-elevated hover:bg-surface-elevated/80 border border-border/70 text-foreground text-xs font-medium transition-colors"
                  title="GitHub Repository"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>Source</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // MODERN GRID CARD (For 2-column or 3-column views)
  // =========================================================================
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      className="group relative rounded-3xl bg-surface/90 hover:bg-surface border border-border/70 hover:border-primary/50 transition-all duration-500 overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between text-left focus:outline-none focus:ring-2 focus:ring-primary/50"
    >
      {/* Subtle ambient hover glow */}
      <div className="absolute -inset-0.5 bg-gradient-to-b from-primary/10 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-lg -z-10 pointer-events-none" />

      {/* Top Media Banner */}
      <div>
        <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-border/60 bg-surface-elevated">
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

          {/* Smooth bottom gradient vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent pointer-events-none" />

          {/* Floating Top Left Category Badge */}
          <div className="absolute top-3 left-3 z-10 pointer-events-none flex items-center gap-1.5">
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full glass-dock text-primary font-bold shadow-sm border border-primary/20">
              {project.category}
            </span>
          </div>

          {/* Floating Top Right Metrics Badge */}
          {project.metrics && (
            <div className="absolute top-3 right-3 z-10 pointer-events-none">
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-success/20 border border-success/30 text-success font-semibold flex items-center gap-1 shadow-sm">
                <CheckCircle2 className="w-3 h-3" />
                {project.metrics}
              </span>
            </div>
          )}

          {/* Bottom Right Media Counter */}
          {totalMedia > 1 && (
            <div className="absolute bottom-2.5 right-2.5 z-10 pointer-events-none flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full glass-dock text-text-secondary border border-border/60">
              {hasVideo ? <Play className="w-2.5 h-2.5 text-secondary fill-secondary" /> : <ImageIcon className="w-2.5 h-2.5 text-primary" />}
              <span>{totalMedia}</span>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
              <span>{project.title}</span>
              <ArrowUpRight className="w-4 h-4 text-text-secondary group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
            </h3>
          </div>

          <p className="text-xs text-text-secondary leading-relaxed line-clamp-3 mb-4">
            {project.description}
          </p>

          {/* Technology Badges */}
          {project.tags && project.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {project.tags.slice(0, 4).map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={(e) => {
                    if (onSkillClick) {
                      e.stopPropagation();
                      onSkillClick(tag);
                    }
                  }}
                  className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-surface-elevated text-text-secondary hover:text-foreground border border-border/40 transition-colors"
                >
                  {tag}
                </button>
              ))}
              {project.tags.length > 4 && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 text-text-secondary/70">
                  +{project.tags.length - 4}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-6 pb-5 pt-3 border-t border-border/40 flex items-center justify-between text-xs">
        <span className="text-[11px] font-mono text-primary font-medium group-hover:underline flex items-center gap-1">
          View Details &rarr;
        </span>

        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-lg bg-surface-elevated hover:bg-surface-elevated/80 border border-border/60 text-text-secondary hover:text-foreground transition-colors"
              title="GitHub Repository"
            >
              <Github className="w-3.5 h-3.5" />
            </a>
          )}
          {project.demoUrl && (
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-lg gradient-brand-bg text-white hover:opacity-95 shadow-sm transition-opacity"
              title="Live Application"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
