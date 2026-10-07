import { notFound } from 'next/navigation';
import { api } from '@/lib/api';
import { Clock, Calendar, ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;

  let post: any = null;
  let relatedPosts: any[] = [];

  try {
    const [fetchedPost, allPosts] = await Promise.all([
      api.blogs.getOne(slug).catch(() => null),
      api.blogs.getAll().catch(() => []),
    ]);

    post = fetchedPost;
    if (!post && Array.isArray(allPosts)) {
      post = allPosts.find((p: any) => p.slug === slug);
    }

    if (Array.isArray(allPosts)) {
      relatedPosts = allPosts.filter((p: any) => p.slug !== slug).slice(0, 2);
    }
  } catch (err) {
    console.error('Error fetching blog post:', err);
  }

  if (!post) {
    notFound();
  }

  const pubDate = post.publishedAt || (post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Recent');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
      {/* Back button */}
      <Link
        href="/blog"
        className="inline-flex items-center gap-2 text-xs font-medium text-text-secondary hover:text-foreground mb-8 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to all articles</span>
      </Link>

      {/* Post Header */}
      <header className="mb-12 pb-8 border-b border-border/50">
        <div className="flex flex-wrap items-center gap-3 text-xs text-text-secondary font-mono mb-4">
          <span className="px-2.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
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

        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground mb-6 leading-tight">
          {post.title}
        </h1>

        <p className="text-base text-text-secondary leading-relaxed">
          {post.excerpt}
        </p>

        {/* Author badge */}
        <div className="flex items-center gap-3 mt-6 pt-6 border-t border-border/40">
          <div className="w-10 h-10 rounded-full gradient-brand-bg flex items-center justify-center text-white font-bold text-sm">
            B
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground">Muhammed Abdul Basith</p>
            <p className="text-[11px] text-text-secondary">Senior Full Stack Engineer</p>
          </div>
        </div>
      </header>

      {/* Post Content */}
      <div className="prose prose-invert max-w-none text-text-secondary text-sm leading-relaxed space-y-6">
        {(post.content || post.excerpt || '').split('\n\n').map((paragraph: string, idx: number) => {
          if (paragraph.startsWith('### ')) {
            return (
              <h3 key={idx} className="text-lg font-bold text-foreground mt-8 mb-3">
                {paragraph.replace('### ', '')}
              </h3>
            );
          }
          if (paragraph.startsWith('## ')) {
            return (
              <h2 key={idx} className="text-2xl font-bold text-foreground mt-10 mb-4">
                {paragraph.replace('## ', '')}
              </h2>
            );
          }
          if (paragraph.startsWith('# ')) {
            return (
              <h1 key={idx} className="text-3xl font-bold text-foreground mt-8 mb-4">
                {paragraph.replace('# ', '')}
              </h1>
            );
          }
          if (paragraph.startsWith('```')) {
            const cleanCode = paragraph.replace(/```[a-z]*\n?/g, '');
            return (
              <pre key={idx} className="p-4 rounded-xl bg-surface border border-border/70 overflow-x-auto font-mono text-xs text-foreground/90 my-4">
                <code>{cleanCode}</code>
              </pre>
            );
          }
          return (
            <p key={idx} className="text-sm text-text-secondary leading-relaxed">
              {paragraph}
            </p>
          );
        })}
      </div>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="my-12 pt-6 border-t border-border/50">
          <p className="text-xs font-mono uppercase tracking-wider text-text-secondary mb-3">Article Tags</p>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag: string) => (
              <span
                key={tag}
                className="text-xs px-3 py-1 rounded-lg bg-surface border border-border/60 text-text-secondary font-mono"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <div className="mt-16 pt-12 border-t border-border/50">
          <h3 className="text-xl font-bold mb-6">Continue Reading</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {relatedPosts.map(related => (
              <Link
                key={related.slug}
                href={`/blog/${related.slug}`}
                className="p-6 rounded-2xl bg-surface border border-border/80 hover:border-primary/40 transition-colors flex flex-col justify-between group"
              >
                <div>
                  <span className="text-[11px] font-mono text-primary">{related.category}</span>
                  <h4 className="text-base font-bold text-foreground group-hover:text-primary transition-colors mt-1 mb-2">
                    {related.title}
                  </h4>
                  <p className="text-xs text-text-secondary line-clamp-2">{related.excerpt}</p>
                </div>
                <span className="text-xs font-semibold text-primary pt-4 inline-flex items-center gap-1">
                  Read Article <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
