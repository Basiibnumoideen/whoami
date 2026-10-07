'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Clock, Calendar, ArrowRight, Search, X, BookOpen, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface BlogPostItem {
  _id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content?: string;
  category: string;
  tags: string[];
  readingTime?: string;
  published?: boolean;
  publishedAt?: string;
  createdAt?: string;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    api.blogs.getAll()
      .then((data) => {
        setPosts(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error('Failed to load blog posts:', err);
        setPosts([]);
      })
      .finally(() => setLoading(false));

    api.analytics.recordPageView().catch(() => null);
  }, []);

  const categories = ['All', ...Array.from(new Set(posts.map(b => b.category).filter(Boolean)))];

  const filteredPosts = posts.filter(post => {
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesSearch = 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.tags && post.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
      {/* Header */}
      <div className="max-w-3xl mb-12">
        <p className="text-xs font-mono uppercase tracking-wider text-primary font-semibold mb-2">
          Engineering Logs & Writing
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
          Architectural Deep-Dives
        </h1>
        <p className="text-base text-text-secondary leading-relaxed">
          Essays on high-scale MERN systems, Next.js 16 internals, database indexing, and grounding conversational AI assistants.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Category Pills */}
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

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search articles..."
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

      {/* Loading state */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-6 h-6 text-primary animate-spin" />
          <p className="text-xs font-mono text-text-secondary">Loading articles from database...</p>
        </div>
      ) : posts.length === 0 ? (
        /* Professional Empty State */
        <div className="p-16 text-center glass-card rounded-3xl border border-border/80">
          <BookOpen className="w-12 h-12 text-primary mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-bold text-foreground mb-1">No articles published yet.</h3>
          <p className="text-xs text-text-secondary max-w-sm mx-auto">
            Articles and engineering deep dives will appear here once published from the admin dashboard.
          </p>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="p-12 text-center glass-card rounded-3xl border border-border/80">
          <h3 className="text-base font-bold text-foreground mb-1">No articles match your search.</h3>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
            className="text-xs text-primary underline mt-2"
          >
            Clear filters
          </button>
        </div>
      ) : (
        /* Articles Grid */
        <div className="space-y-6">
          {filteredPosts.map(post => {
            const pubDate = post.publishedAt || (post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Recent');
            return (
              <article
                key={post.slug}
                className="p-6 sm:p-8 rounded-3xl bg-surface border border-border/80 hover:border-primary/40 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-text-secondary font-mono mb-3">
                    <span className="px-2 py-0.5 rounded bg-surface-elevated text-primary border border-border/60">
                      {post.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {pubDate}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {post.readingTime || '5 min read'}
                    </span>
                  </div>

                  <h2 className="text-2xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                    <Link href={`/blog/${post.slug}`}>
                      {post.title}
                    </Link>
                  </h2>

                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed mb-6">
                    {post.excerpt}
                  </p>
                </div>

                <div className="pt-4 border-t border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex flex-wrap gap-1.5">
                    {post.tags && post.tags.map(tag => (
                      <span key={tag} className="text-[11px] px-2 py-0.5 rounded bg-surface-elevated text-text-secondary border border-border/40 font-mono">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary group-hover:gap-2.5 transition-all self-start sm:self-auto"
                  >
                    <span>Read Full Article</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
