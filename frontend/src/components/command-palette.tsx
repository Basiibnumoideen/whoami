'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Sparkles, FolderGit2, Code2, ArrowRight, CornerDownLeft, X } from 'lucide-react';
import { api } from '@/lib/api';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [projectsList, setProjectsList] = useState<any[]>([]);
  const [skillsList, setSkillsList] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    api.projects.getAll().then(data => setProjectsList(Array.isArray(data) ? data : [])).catch(() => setProjectsList([]));
    api.skills.getAll().then(data => setSkillsList(Array.isArray(data) ? data : [])).catch(() => setSkillsList([]));
    api.settings.get().then(s => setSettings(s)).catch(() => {});
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const navigateTo = (path: string) => {
    router.push(path);
    onClose();
    setQuery('');
    setAiAnswer(null);
  };

  const navLinks = [
    { title: 'Home', path: '/', category: 'Pages' },
    { title: 'About Basi', path: '/about', category: 'Pages' },
    { title: 'Projects & Case Studies', path: '/projects', category: 'Pages' },
    { title: 'Skills & Evidence', path: '/skills', category: 'Pages' },
    { title: 'Experience & Timeline', path: '/experience', category: 'Pages' },
    { title: 'Services & Offerings', path: '/services', category: 'Pages' },
    { title: 'Blog & Articles', path: '/blog', category: 'Pages' },
    { title: 'Now (Current Status)', path: '/now', category: 'Pages' },
    { title: 'Uses & Workspace', path: '/uses', category: 'Pages' },
    { title: 'Contact & Resume', path: '/contact', category: 'Pages' },
  ];

  const filteredProjects = projectsList.filter(p =>
    (p.title || '').toLowerCase().includes(query.toLowerCase()) ||
    (Array.isArray(p.tags) && p.tags.some((t: string) => t.toLowerCase().includes(query.toLowerCase())))
  );

  const filteredSkills = skillsList.filter(s =>
    (s.name || '').toLowerCase().includes(query.toLowerCase()) ||
    (s.category || '').toLowerCase().includes(query.toLowerCase())
  );

  const filteredLinks = navLinks.filter(l =>
    l.title.toLowerCase().includes(query.toLowerCase())
  );

  const handleAskAi = () => {
    if (!query.trim()) return;
    setIsAiLoading(true);
    setAiAnswer(null);

    setTimeout(() => {
      const q = query.toLowerCase();
      let response = '';

      if (q.includes('mongo') || q.includes('database')) {
        response = 'Muhammed Abdul Basith has 3+ years of deep experience with MongoDB Atlas & Mongoose, including aggregation pipelines, compound indexing for reduced query latency, and vector search.';
      } else if (q.includes('mern') || q.includes('stack') || q.includes('tech')) {
        response = 'Basi is a specialized MERN Stack engineer mastering React 19, Next.js 16 (App Router & PPR), TypeScript, Node.js, Express.js, and MongoDB Atlas.';
      } else if (q.includes('project') || q.includes('best') || q.includes('work')) {
        if (projectsList.length > 0) {
          response = `Basi's verified uploaded projects include: ${projectsList.map(p => `"${p.title}"`).join(', ')}. Check them out in the Projects catalog.`;
        } else {
          response = 'Explore the Projects catalog for verified case studies, architecture breakdowns, and live demos.';
        }
      } else if (q.includes('hire') || q.includes('available') || q.includes('job') || q.includes('freelance')) {
        const email = settings?.email || 'abdulbasith.dev@gmail.com';
        response = `Yes! Basi is actively open to Full-time Full Stack Developer roles and high-impact freelance contracts. You can reach out directly at ${email}.`;
      } else if (q.includes('education') || q.includes('degree')) {
        response = 'Basi holds a Bachelor of Science in Computer Science from University of Calicut and specializes in Agentic MERN Stack engineering.';
      } else {
        const email = settings?.email || 'abdulbasith.dev@gmail.com';
        response = `Muhammed Abdul Basith is a MERN Stack Developer skilled in Next.js 16, Node.js, Express, and MongoDB Atlas. Available for remote roles worldwide. For your question "${query}", check out the Projects and Skills pages or connect via the Contact page!`;
      }

      setAiAnswer(response);
      setIsAiLoading(false);
    }, 400);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-surface border border-border/70 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-border/50 flex items-center gap-3">
          <Search className="w-5 h-5 text-text-secondary shrink-0" />
          <input
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setAiAnswer(null);
            }}
            onKeyDown={e => {
              if (e.key === 'Enter' && query.trim()) {
                handleAskAi();
              }
            }}
            placeholder="Search pages, projects, skills, or ask a question..."
            className="w-full bg-transparent border-0 outline-none text-base text-foreground placeholder:text-text-secondary"
            autoFocus
          />
          {query && (
            <button 
              onClick={() => { setQuery(''); setAiAnswer(null); }}
              className="p-1.5 rounded-lg text-text-secondary hover:text-foreground hover:bg-surface-elevated transition-colors cursor-pointer"
              title="Clear input"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-surface-elevated hover:bg-surface-elevated/80 text-text-secondary hover:text-foreground transition-colors cursor-pointer border border-border/50 flex items-center gap-1.5 shrink-0"
            title="Close Search (ESC)"
            aria-label="Close Search"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline text-[10px] font-mono font-semibold text-text-secondary">ESC</span>
          </button>
        </div>

        {/* Content results */}
        <div className="overflow-y-auto p-4 space-y-6">
          {/* Ask AI prompt if query typed */}
          {query.trim() && (
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                  <Sparkles className="w-4 h-4" />
                  <span>Ask AI Assistant about Basi</span>
                </div>
                <button
                  onClick={handleAskAi}
                  disabled={isAiLoading}
                  className="px-3 py-1 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity flex items-center gap-1 cursor-pointer"
                >
                  {isAiLoading ? 'Analyzing...' : 'Ask AI'}
                  <CornerDownLeft className="w-3 h-3" />
                </button>
              </div>
              <p className="text-xs text-text-secondary">
                Query: &quot;{query}&quot;
              </p>
              {aiAnswer && (
                <div className="mt-2 p-3 rounded-lg bg-surface border border-border/60 text-sm leading-relaxed text-foreground animate-in fade-in">
                  <p className="text-xs font-mono text-primary mb-1 uppercase tracking-wider font-semibold">Answer from AI Knowledge Base</p>
                  {aiAnswer}
                </div>
              )}
            </div>
          )}

          {/* Quick Pages */}
          {filteredLinks.length > 0 && (
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-text-secondary mb-2 px-2">Pages</p>
              <div className="space-y-1">
                {filteredLinks.slice(0, 5).map(link => (
                  <button
                    key={link.path}
                    onClick={() => navigateTo(link.path)}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg text-sm text-foreground hover:bg-surface-elevated transition-colors text-left cursor-pointer"
                  >
                    <span>{link.title}</span>
                    <ArrowRight className="w-4 h-4 text-text-secondary" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {filteredProjects.length > 0 && (
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-text-secondary mb-2 px-2">Projects</p>
              <div className="space-y-1">
                {filteredProjects.slice(0, 4).map(project => {
                  const target = project.slug || project._id;
                  return (
                    <button
                      key={project._id || project.slug || project.id}
                      onClick={() => navigateTo(target ? `/projects/${target}` : '/projects')}
                      className="w-full flex items-center justify-between p-2.5 rounded-lg text-sm text-foreground hover:bg-surface-elevated transition-colors text-left cursor-pointer"
                    >
                    <div className="flex items-center gap-2.5">
                      <FolderGit2 className="w-4 h-4 text-primary" />
                      <div>
                        <p className="font-medium">{project.title}</p>
                        <p className="text-xs text-text-secondary line-clamp-1">{project.metrics}</p>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded bg-surface-elevated text-text-secondary border border-border/50">
                      {project.category}
                    </span>
                  </button>
                );
              })}
              </div>
            </div>
          )}

          {/* Skills */}
          {filteredSkills.length > 0 && (
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-text-secondary mb-2 px-2">Skills (Evidence-Linked)</p>
              <div className="flex flex-wrap gap-2 px-2">
                {filteredSkills.slice(0, 8).map(skill => (
                  <button
                    key={skill.name}
                    onClick={() => navigateTo(`/projects?skill=${encodeURIComponent(skill.name)}`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-surface-elevated text-foreground hover:border-primary/50 border border-border/50 transition-colors cursor-pointer"
                  >
                    <Code2 className="w-3.5 h-3.5 text-secondary" />
                    <span>{skill.name}</span>
                    <span className="text-[10px] text-text-secondary">({skill.projects.length} projects)</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-border/50 bg-surface-elevated/40 flex items-center justify-between text-xs text-text-secondary">
          <div className="flex items-center gap-4">
            <span>Press <kbd className="font-mono bg-surface px-1 py-0.5 rounded border border-border/40">Enter</kbd> to select</span>
            <span><kbd className="font-mono bg-surface px-1 py-0.5 rounded border border-border/40">Esc</kbd> to exit</span>
          </div>
          <span className="flex items-center gap-1 text-primary">
            <Sparkles className="w-3.5 h-3.5" />
            AI Enabled
          </span>
        </div>
      </div>
    </div>
  );
}
