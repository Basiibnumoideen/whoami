import crypto from 'crypto';
import { Request, Response } from 'express';

interface CacheEntry<T = any> {
  data: T;
  etag: string;
  expiresAt: number;
  cachedAt: number;
}

class CacheService {
  private cache: Map<string, CacheEntry> = new Map();
  private defaultTTL: number = 5 * 60 * 1000; // 5 minutes default

  /**
   * Generate an MD5 ETag hash for data payload
   */
  public generateETag(data: any): string {
    const json = typeof data === 'string' ? data : JSON.stringify(data);
    return `"${crypto.createHash('md5').update(json).digest('hex')}"`;
  }

  /**
   * Get cached entry if valid and not expired
   */
  public get<T>(key: string): CacheEntry<T> | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry as CacheEntry<T>;
  }

  /**
   * Store data in cache with calculated ETag and expiry
   */
  public set<T>(key: string, data: T, ttlMs?: number): CacheEntry<T> {
    const ttl = ttlMs || this.defaultTTL;
    const etag = this.generateETag(data);
    const entry: CacheEntry<T> = {
      data,
      etag,
      expiresAt: Date.now() + ttl,
      cachedAt: Date.now(),
    };
    this.cache.set(key, entry);
    return entry;
  }

  /**
   * Invalidate cache entries matching a prefix or namespace
   */
  public invalidate(prefixOrNamespace: string): void {
    const prefix = prefixOrNamespace.toLowerCase();
    for (const key of this.cache.keys()) {
      if (key.toLowerCase().startsWith(prefix) || key.toLowerCase().includes(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Invalidate all cached entries
   */
  public clear(): void {
    this.cache.clear();
  }

  /**
   * Standardized cache wrapper for Express controller GET handlers
   */
  public async handleCachedResponse<T>(
    req: Request,
    res: Response,
    cacheKey: string,
    fetchFn: () => Promise<T>,
    ttlMs?: number,
    browserMaxAge: number = 120
  ): Promise<void> {
    const forceRefresh = req.query.refresh === 'true';

    // 1. Check in-memory server cache
    if (!forceRefresh) {
      const cached = this.get<T>(cacheKey);
      if (cached) {
        // Cache-Control headers based on browserMaxAge
        const cacheControlHeader = browserMaxAge === 0
          ? 'no-cache, no-store, must-revalidate'
          : `public, max-age=${browserMaxAge}, stale-while-revalidate=600`;

        // Check Client ETag for 304 Not Modified
        const clientETag = req.headers['if-none-match'];
        if (clientETag && clientETag === cached.etag) {
          res.setHeader('Cache-Control', cacheControlHeader);
          res.setHeader('ETag', cached.etag);
          res.setHeader('X-Cache', 'HIT-304');
          res.status(304).end();
          return;
        }

        res.setHeader('Cache-Control', cacheControlHeader);
        res.setHeader('ETag', cached.etag);
        res.setHeader('X-Cache', 'HIT');
        res.status(200).json(cached.data);
        return;
      }
    }

    // 2. Cache miss: Fetch from database
    const freshData = await fetchFn();
    const entry = this.set(cacheKey, freshData, ttlMs);

    const cacheControlHeader = browserMaxAge === 0
      ? 'no-cache, no-store, must-revalidate'
      : `public, max-age=${browserMaxAge}, stale-while-revalidate=600`;

    res.setHeader('Cache-Control', cacheControlHeader);
    res.setHeader('ETag', entry.etag);
    res.setHeader('X-Cache', 'MISS');
    res.status(200).json(freshData);
  }

  /**
   * Pre-warm public data in background on server startup to eliminate cold start queries
   */
  public async prewarm(): Promise<void> {
    try {
      const { SiteSettings } = await import('../models/SiteSettings');
      const { Service } = await import('../models/Service');
      const { Project } = await import('../models/Project');
      const { Skill } = await import('../models/Skill');
      const { Experience } = await import('../models/Experience');
      const { Education } = await import('../models/Education');
      const { Certification } = await import('../models/Certification');
      const { Testimonial } = await import('../models/Testimonial');
      const { Blog } = await import('../models/Blog');

      const [
        settings,
        services,
        projectsAll,
        projectsFeatured,
        skills,
        experiences,
        education,
        certifications,
        testimonials,
        blogs,
      ] = await Promise.all([
        SiteSettings.findOne().lean().catch(() => null),
        Service.find().sort({ order: 1 }).lean().catch(() => null),
        Project.find().sort({ order: 1, createdAt: -1 }).lean().catch(() => null),
        Project.find({ featured: true }).sort({ order: 1, createdAt: -1 }).lean().catch(() => null),
        Skill.find().sort({ order: 1, level: -1 }).lean().catch(() => null),
        Experience.find().sort({ order: 1, startDate: -1 }).lean().catch(() => null),
        Education.find().sort({ order: 1 }).lean().catch(() => null),
        Certification.find().sort({ order: 1 }).lean().catch(() => null),
        Testimonial.find().sort({ order: 1 }).lean().catch(() => null),
        Blog.find({ published: true }).select('-content').sort({ createdAt: -1 }).lean().catch(() => null),
      ]);

      if (settings) this.set('settings', { success: true, data: settings });
      if (services) this.set('services', { success: true, count: services.length, data: services });
      if (projectsAll) this.set('projects:all:false:', { success: true, count: projectsAll.length, data: projectsAll });
      if (projectsFeatured) this.set('projects:all:true:', { success: true, count: projectsFeatured.length, data: projectsFeatured });
      if (skills) this.set('skills:all', { success: true, count: skills.length, data: skills });
      if (experiences) this.set('experiences', { success: true, count: experiences.length, data: experiences });
      if (education) this.set('education', { success: true, count: education.length, data: education });
      if (certifications) this.set('certifications', { success: true, count: certifications.length, data: certifications });
      if (testimonials) this.set('testimonials:all', { success: true, count: testimonials.length, data: testimonials });
      if (blogs) this.set('blogs:all::false', { success: true, count: blogs.length, data: blogs });

      console.log('⚡ [CacheService] Public portfolio cache pre-warmed successfully.');
    } catch (err: any) {
      console.warn('⚠️ [CacheService] Cache pre-warming encountered an issue:', err.message);
    }
  }
}

export const cacheService = new CacheService();
export default cacheService;
