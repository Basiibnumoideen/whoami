'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Search, ExternalLink, Filter, X, CheckCircle2, RefreshCw, FolderGit2, Play } from 'lucide-react';
import { Github } from '@/components/icons';
import { ProjectMediaCarousel } from '@/components/project-media-carousel';
import { ProjectModal } from '@/components/project-modal';
import { ProjectCard } from '@/components/project-card';

interface ProjectItem {
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
  order?: number;
  problem?: string;
  approach?: string;
  result?: string;
  keyFeatures?: string[];
}

function ProjectsContent() {
  const searchParams = useSearchParams();
  const initialSkill = searchParams.get('skill');

  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [manualSkillFilter, setManualSkillFilter] = useState<string | null>(null);
  const [selectedProjectForModal, setSelectedProjectForModal] = useState<ProjectItem | null>(null);

  // Dynamic fetch from MongoDB API
  useEffect(() => {
    api.projects.getAll()
      .then((data) => {
        setProjects(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error('Failed to fetch projects from database:', err);
        setProjects([]);
      })
      .finally(() => setLoading(false));

    // Telemetry tracking
    api.analytics.recordPageView().catch(() => null);
  }, []);

  // Derive active skill filter without cascading effect
  const activeSkillFilter = manualSkillFilter ?? initialSkill;

  const categories = ['All', ...Array.from(new Set(projects.map(p => p.category)))];

  const filteredProjects = projects.filter(project => {
    const matchesCategory = selectedCategory === 'All' || project.category === selectedCategory;
    const matchesQuery = 
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.tags && project.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesSkill = !activeSkillFilter || 
      (project.tags && project.tags.some(tag => tag.toLowerCase() === activeSkillFilter.toLowerCase()));

    return matchesCategory && matchesQuery && matchesSkill;
  });

  const handleProjectInteraction = (project: ProjectItem) => {
    api.analytics.recordProjectView({
      projectId: project._id || project.id,
      projectTitle: project.title,
      projectSlug: project.slug,
    }).catch(() => null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
      {/* Header */}
      <div className="max-w-3xl mb-12">
        <p className="text-xs font-mono uppercase tracking-wider text-primary font-semibold mb-2">
          Portfolio & Case Studies
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
          Production Systems & Scalable Architectures
        </h1>
        <p className="text-base text-text-secondary leading-relaxed">
          Every project below reflects real technical challenges, measurable benchmarks, and architectural rigor. Click any skill tag to trace evidence across projects.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="mb-10 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Categories */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-surface-elevated/60 border border-border/50 max-w-fit">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-surface text-foreground font-semibold shadow-sm border border-border/60'
                    : 'text-text-secondary hover:text-foreground'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search projects or tags..."
              className="w-full bg-surface border border-border/70 rounded-xl pl-9 pr-3.5 py-2 text-xs text-foreground placeholder:text-text-secondary outline-none focus:border-primary/60 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-foreground cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Active Skill Filter Badge */}
        {activeSkillFilter && (
          <div className="flex items-center gap-2 p-2 px-3 rounded-lg bg-primary/10 border border-primary/20 text-xs text-primary max-w-fit">
            <Filter className="w-3.5 h-3.5" />
            <span>Filtering by skill evidence: <strong>{activeSkillFilter}</strong></span>
            <button
              onClick={() => setManualSkillFilter('')}
              className="ml-2 p-0.5 hover:bg-primary/20 rounded cursor-pointer"
              title="Clear filter"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-6 h-6 text-primary animate-spin" />
          <p className="text-xs font-mono text-text-secondary">Loading case studies from database...</p>
        </div>
      ) : projects.length === 0 ? (
        /* Professional Empty State (Problem 11) */
        <div className="p-16 text-center glass-card rounded-3xl border border-border/80">
          <FolderGit2 className="w-12 h-12 text-primary mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-bold text-foreground mb-1">No projects available yet.</h3>
          <p className="text-xs text-text-secondary max-w-sm mx-auto">
            Production systems and case studies will be displayed here once published from the admin dashboard.
          </p>
        </div>
      ) : filteredProjects.length === 0 ? (
        /* Empty Filter State */
        <div className="p-12 text-center glass-card rounded-3xl border border-border/80">
          <h3 className="text-base font-bold text-foreground mb-1">No projects match your filter.</h3>
          <p className="text-xs text-text-secondary mb-4">Try clearing your search query or selecting another category.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setManualSkillFilter(null);
            }}
            className="text-xs px-3.5 py-1.5 rounded-lg gradient-brand-bg text-white font-semibold cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Top Featured Project */}
          {filteredProjects.length > 0 && (
            <ProjectCard
              project={filteredProjects[0]}
              index={0}
              variant="featured"
              href={`/projects/${filteredProjects[0].slug}`}
              onClick={(p) => {
                handleProjectInteraction(p);
              }}
              onSkillClick={(skill) => setManualSkillFilter(skill)}
            />
          )}

          {/* Remaining Projects in Modern Bento Grid */}
          {filteredProjects.length > 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 pt-2">
              {filteredProjects.slice(1).map((project, idx) => (
                <ProjectCard
                  key={project._id || project.slug || idx}
                  project={project}
                  index={idx + 1}
                  variant="grid"
                  href={`/projects/${project.slug}`}
                  onClick={(p) => {
                    handleProjectInteraction(p);
                  }}
                  onSkillClick={(skill) => setManualSkillFilter(skill)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-24 text-center text-text-secondary text-sm">Loading projects...</div>}>
      <ProjectsContent />
    </Suspense>
  );
}
