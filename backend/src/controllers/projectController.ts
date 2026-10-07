import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Project } from '../models/Project';
import { AuditLog } from '../models/AuditLog';
import { slugify, getParam, isObjectId, sanitizeSearchString } from '../utils/helpers';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { memoryStore } from '../services/memoryStore';

export class ProjectController {
  /**
   * GET /api/projects
   */
  static async getProjects(req: Request, res: Response): Promise<void> {
    try {
      const { category, featured, search } = req.query;

      if (mongoose.connection.readyState === 1) {
        const query: any = {};
        if (category && category !== 'All' && typeof category === 'string') query.category = category;
        if (featured === 'true') query.featured = true;
        
        const sanitizedSearch = sanitizeSearchString(search);
        if (sanitizedSearch) {
          query.$or = [
            { title: { $regex: sanitizedSearch, $options: 'i' } },
            { description: { $regex: sanitizedSearch, $options: 'i' } },
            { tags: { $regex: sanitizedSearch, $options: 'i' } },
          ];
        }

        const projects = await Project.find(query).sort({ order: 1, createdAt: -1 }).lean();
        res.status(200).json({ success: true, count: projects.length, data: projects });
        return;
      }

      // Memory Store Fallback
      let result = [...memoryStore.projects];
      if (category && category !== 'All') {
        result = result.filter(p => p.category === category);
      }
      if (featured === 'true') {
        result = result.filter(p => p.featured);
      }
      if (search && typeof search === 'string') {
        const s = search.toLowerCase();
        result = result.filter(p => p.title.toLowerCase().includes(s) || p.description.toLowerCase().includes(s));
      }

      res.status(200).json({ success: true, count: result.length, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to retrieve projects.' });
    }
  }

  /**
   * GET /api/projects/:idOrSlug
   */
  static async getProject(req: Request, res: Response): Promise<void> {
    try {
      const idOrSlug = getParam(req.params.idOrSlug);

      if (mongoose.connection.readyState === 1) {
        const conditions: any[] = [{ slug: idOrSlug }];
        if (isObjectId(idOrSlug)) conditions.push({ _id: idOrSlug });
        const project = await Project.findOne({ $or: conditions }).lean();
        if (!project) {
          res.status(404).json({ success: false, message: 'Project not found.' });
          return;
        }
        res.status(200).json({ success: true, data: project });
        return;
      }

      const project = memoryStore.projects.find(p => p.slug === idOrSlug || p._id === idOrSlug);
      if (!project) {
        res.status(404).json({ success: false, message: 'Project not found.' });
        return;
      }
      res.status(200).json({ success: true, data: project });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to retrieve project.', error: error.message });
    }
  }

  /**
   * POST /api/projects (Admin only)
   */
  static async createProject(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const {
        title,
        description,
        category,
        tags,
        metrics,
        featured,
        order,
        bentoSpan,
        problem,
        approach,
        result,
        demoUrl,
        githubUrl,
        image,
        keyFeatures,
      } = req.body;

      if (!title || !title.trim()) {
        res.status(400).json({ success: false, message: 'Project title is required.' });
        return;
      }

      const cleanTitle = title.trim();
      const cleanDesc = (description || '').trim() || cleanTitle;
      let slug = req.body.slug ? slugify(req.body.slug) : slugify(cleanTitle);
      if (!slug || slug.trim() === '') {
        slug = `project-${Date.now().toString().slice(-6)}`;
      }

      const projectData = {
        title: cleanTitle,
        slug,
        description: cleanDesc,
        category: (category || '').trim() || 'Full Stack',
        tags: Array.isArray(tags) ? tags : [],
        metrics: metrics || '',
        featured: Boolean(featured),
        order: Number(order) || 0,
        bentoSpan: bentoSpan || 'col-span-1',
        problem: problem || '',
        approach: approach || '',
        result: result || '',
        demoUrl: demoUrl || '',
        githubUrl: githubUrl || '',
        image: image || req.body.thumbnailImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
        thumbnailImage: req.body.thumbnailImage || image || '',
        videoUrl: req.body.videoUrl || '',
        images: Array.isArray(req.body.images) ? req.body.images : (image ? [image] : []),
        videos: Array.isArray(req.body.videos) ? req.body.videos : (req.body.videoUrl ? [req.body.videoUrl] : []),
        carouselAutoPlay: req.body.carouselAutoPlay !== undefined ? Boolean(req.body.carouselAutoPlay) : true,
        carouselInterval: Number(req.body.carouselInterval) || 4000,
        keyFeatures: Array.isArray(keyFeatures) ? keyFeatures : [],
      };

      if (mongoose.connection.readyState === 1) {
        const existingSlug = await Project.findOne({ slug });
        if (existingSlug) {
          slug = `${slug}-${Date.now().toString().slice(-4)}`;
          projectData.slug = slug;
        }
        const project = new Project(projectData);
        await project.save();
        await AuditLog.create({
          action: 'CREATED',
          target: `Project: "${project.title}"`,
          author: req.user?.name || 'Admin',
          timestamp: new Date().toISOString(),
        });
        res.status(201).json({ success: true, message: 'Project created.', data: project });
        return;
      }

      // Memory fallback
      const mockProject = { _id: `proj-${Date.now()}`, ...projectData };
      memoryStore.projects.unshift(mockProject);
    } catch (error: any) {
      console.error('[ProjectController createProject Error]:', error);
      res.status(500).json({
        success: false,
        message: error?.message ? `Failed to create project: ${error.message}` : 'Failed to create project.',
        error: error?.message,
      });
    }
  }

  /**
   * PUT /api/projects/:idOrSlug (Admin only)
   */
  static async updateProject(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const idOrSlug = getParam(req.params.idOrSlug);

      if (mongoose.connection.readyState === 1) {
        const conditions: any[] = [{ slug: idOrSlug }];
        if (isObjectId(idOrSlug)) conditions.push({ _id: idOrSlug });
        const project = await Project.findOne({ $or: conditions });
        if (!project) {
          res.status(404).json({ success: false, message: 'Project not found.' });
          return;
        }
        if (req.body.thumbnailImage && !req.body.image) req.body.image = req.body.thumbnailImage;
        if (req.body.image && !req.body.thumbnailImage) req.body.thumbnailImage = req.body.image;
        Object.assign(project, req.body);
        await project.save();
        await AuditLog.create({
          action: 'UPDATED',
          target: `Project: "${project.title}"`,
          author: req.user?.name || 'Admin',
          timestamp: new Date().toISOString(),
        }).catch(() => {});
        res.status(200).json({ success: true, message: 'Project updated.', data: project });
        return;
      }

      const idx = memoryStore.projects.findIndex(p => p.slug === idOrSlug || p._id === idOrSlug);
      if (idx === -1) {
        res.status(404).json({ success: false, message: 'Project not found.' });
        return;
      }
      memoryStore.projects[idx] = { ...memoryStore.projects[idx], ...req.body };
      res.status(200).json({ success: true, message: 'Project updated.', data: memoryStore.projects[idx] });
    } catch (error: any) {
      console.error('[ProjectController updateProject Error]:', error);
      res.status(500).json({
        success: false,
        message: error?.message ? `Failed to update project: ${error.message}` : 'Failed to update project.',
        error: error?.message,
      });
    }
  }

  /**
   * DELETE /api/projects/:idOrSlug (Admin only)
   */
  static async deleteProject(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const idOrSlug = getParam(req.params.idOrSlug);

      if (mongoose.connection.readyState === 1) {
        const conditions: any[] = [{ slug: idOrSlug }];
        if (isObjectId(idOrSlug)) conditions.push({ _id: idOrSlug });
        const project = await Project.findOneAndDelete({ $or: conditions });
        if (!project) {
          res.status(404).json({ success: false, message: 'Project not found.' });
          return;
        }
        await AuditLog.create({
          action: 'DELETED',
          target: `Project: "${project.title}"`,
          author: req.user?.name || 'Admin',
          timestamp: new Date().toISOString(),
        }).catch(() => {});
        res.status(200).json({ success: true, message: 'Project deleted successfully.' });
        return;
      }

      const initialLen = memoryStore.projects.length;
      memoryStore.projects = memoryStore.projects.filter(p => p.slug !== idOrSlug && p._id !== idOrSlug);
      if (memoryStore.projects.length === initialLen) {
        res.status(404).json({ success: false, message: 'Project not found.' });
        return;
      }
      res.status(200).json({ success: true, message: 'Project deleted successfully.' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to delete project.', error: error.message });
    }
  }

  /**
   * PATCH /api/projects/reorder (Admin only)
   */
  static async reorderProjects(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { items } = req.body;
      if (!Array.isArray(items)) {
        res.status(400).json({ success: false, message: 'Expected an array of items.' });
        return;
      }

      if (mongoose.connection.readyState === 1) {
        const bulkOps = items.map((item) => ({
          updateOne: {
            filter: { _id: item.id },
            update: { $set: { order: item.order } },
          },
        }));
        await Project.bulkWrite(bulkOps);
      } else {
        items.forEach(item => {
          const p = memoryStore.projects.find(p => p._id === item.id);
          if (p) p.order = item.order;
        });
      }

      res.status(200).json({ success: true, message: 'Projects reordered successfully.' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to reorder projects.', error: error.message });
    }
  }
}

export default ProjectController;
