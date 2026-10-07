import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Blog } from '../models/Blog';
import { AuditLog } from '../models/AuditLog';
import { slugify, calculateReadingTime, getParam, isObjectId, sanitizeSearchString } from '../utils/helpers';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { memoryStore } from '../services/memoryStore';

export class BlogController {
  /**
   * GET /api/blogs
   */
  static async getBlogs(req: Request, res: Response): Promise<void> {
    try {
      const { category, search, all } = req.query;

      if (mongoose.connection.readyState === 1) {
        const query: any = {};
        if (all !== 'true') query.published = true;
        if (category && category !== 'All' && typeof category === 'string') query.category = category;
        
        const sanitizedSearch = sanitizeSearchString(search);
        if (sanitizedSearch) {
          query.$or = [
            { title: { $regex: sanitizedSearch, $options: 'i' } },
            { excerpt: { $regex: sanitizedSearch, $options: 'i' } },
            { tags: { $regex: sanitizedSearch, $options: 'i' } },
          ];
        }

        const blogs = await Blog.find(query).sort({ createdAt: -1 }).lean();
        res.status(200).json({ success: true, count: blogs.length, data: blogs });
        return;
      }

      // Memory Fallback
      let result = [...memoryStore.blogs];
      if (all !== 'true') result = result.filter(b => b.published);
      if (category && category !== 'All') result = result.filter(b => b.category === category);
      if (search && typeof search === 'string') {
        const s = search.toLowerCase();
        result = result.filter(b => b.title.toLowerCase().includes(s) || b.excerpt.toLowerCase().includes(s));
      }

      res.status(200).json({ success: true, count: result.length, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to retrieve blog posts.' });
    }
  }

  /**
   * GET /api/blogs/:idOrSlug
   */
  static async getBlog(req: Request, res: Response): Promise<void> {
    try {
      const idOrSlug = getParam(req.params.idOrSlug);

      if (mongoose.connection.readyState === 1) {
        const conditions: any[] = [{ slug: idOrSlug }];
        if (isObjectId(idOrSlug)) conditions.push({ _id: idOrSlug });
        const blog = await Blog.findOneAndUpdate(
          { $or: conditions },
          { $inc: { views: 1 } },
          { new: true }
        ).lean();
        if (!blog) {
          res.status(404).json({ success: false, message: 'Blog post not found.' });
          return;
        }
        res.status(200).json({ success: true, data: blog });
        return;
      }

      const blog = memoryStore.blogs.find(b => b.slug === idOrSlug || b._id === idOrSlug);
      if (!blog) {
        res.status(404).json({ success: false, message: 'Blog post not found.' });
        return;
      }
      blog.views = (blog.views || 0) + 1;
      res.status(200).json({ success: true, data: blog });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to retrieve blog post.' });
    }
  }

  /**
   * POST /api/blogs (Admin only)
   */
  static async createBlog(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { title, excerpt, content, coverImage, category, tags, published } = req.body;

      if (!title || !content) {
        res.status(400).json({ success: false, message: 'Title and content are required.' });
        return;
      }

      let slug = req.body.slug ? slugify(req.body.slug) : slugify(title);
      const readingTime = calculateReadingTime(content);

      const blogData = {
        title,
        slug,
        excerpt: excerpt || '',
        content,
        coverImage: coverImage || '',
        category: category || 'Engineering',
        tags: Array.isArray(tags) ? tags : [],
        readingTime,
        published: Boolean(published),
        publishedAt: published ? new Date() : undefined,
      };

      if (mongoose.connection.readyState === 1) {
        const existingSlug = await Blog.findOne({ slug });
        if (existingSlug) {
          slug = `${slug}-${Date.now().toString().slice(-4)}`;
          blogData.slug = slug;
        }
        const blog = new Blog(blogData);
        await blog.save();
        await AuditLog.create({
          action: 'CREATED',
          target: `Blog: "${blog.title}" (${blog.published ? 'Published' : 'Draft'})`,
          author: req.user?.name || 'Admin',
          timestamp: new Date().toISOString(),
        });
        res.status(201).json({ success: true, message: 'Blog created.', data: blog });
        return;
      }

      // Memory fallback
      const mockBlog = { _id: `blog-${Date.now()}`, ...blogData, views: 0 };
      memoryStore.blogs.unshift(mockBlog);
      res.status(201).json({ success: true, message: 'Blog created.', data: mockBlog });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to create blog post.', error: error.message });
    }
  }

  /**
   * PUT /api/blogs/:idOrSlug (Admin only)
   */
  static async updateBlog(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const idOrSlug = getParam(req.params.idOrSlug);

      if (mongoose.connection.readyState === 1) {
        const conditions: any[] = [{ slug: idOrSlug }];
        if (isObjectId(idOrSlug)) conditions.push({ _id: idOrSlug });
        const blog = await Blog.findOne({ $or: conditions });
        if (!blog) {
          res.status(404).json({ success: false, message: 'Blog post not found.' });
          return;
        }
        Object.assign(blog, req.body);
        if (req.body.content) blog.readingTime = calculateReadingTime(req.body.content);
        await blog.save();
        res.status(200).json({ success: true, message: 'Blog updated.', data: blog });
        return;
      }

      const idx = memoryStore.blogs.findIndex(b => b.slug === idOrSlug || b._id === idOrSlug);
      if (idx === -1) {
        res.status(404).json({ success: false, message: 'Blog post not found.' });
        return;
      }
      memoryStore.blogs[idx] = { ...memoryStore.blogs[idx], ...req.body };
      res.status(200).json({ success: true, message: 'Blog updated.', data: memoryStore.blogs[idx] });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to update blog post.', error: error.message });
    }
  }

  /**
   * DELETE /api/blogs/:idOrSlug (Admin only)
   */
  static async deleteBlog(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const idOrSlug = getParam(req.params.idOrSlug);

      if (mongoose.connection.readyState === 1) {
        const conditions: any[] = [{ slug: idOrSlug }];
        if (isObjectId(idOrSlug)) conditions.push({ _id: idOrSlug });
        const blog = await Blog.findOneAndDelete({ $or: conditions });
        if (!blog) {
          res.status(404).json({ success: false, message: 'Blog post not found.' });
          return;
        }
        res.status(200).json({ success: true, message: 'Blog deleted.' });
        return;
      }

      const initialLen = memoryStore.blogs.length;
      memoryStore.blogs = memoryStore.blogs.filter(b => b.slug !== idOrSlug && b._id !== idOrSlug);
      if (memoryStore.blogs.length === initialLen) {
        res.status(404).json({ success: false, message: 'Blog post not found.' });
        return;
      }
      res.status(200).json({ success: true, message: 'Blog deleted.' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to delete blog post.', error: error.message });
    }
  }
}

export default BlogController;
