import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Experience } from '../models/Experience';
import { NowUpdate } from '../models/NowUpdate';
import { AIKnowledgeBase } from '../models/AIKnowledgeBase';
import { recordAuditLog } from '../models/AuditLog';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { memoryStore } from '../services/memoryStore';
import { getParam } from '../utils/helpers';
import { cacheService } from '../services/cacheService';

export class ExperienceController {
  // Experiences CRUD
  static async getExperiences(req: Request, res: Response): Promise<void> {
    try {
      await cacheService.handleCachedResponse(
        req,
        res,
        'experiences',
        async () => {
          if (mongoose.connection.readyState === 1) {
            const experiences = await Experience.find().sort({ order: 1, createdAt: -1 }).lean();
            return { success: true, count: experiences.length, data: experiences };
          }
          return { success: true, count: memoryStore.experiences.length, data: memoryStore.experiences };
        },
        5 * 60 * 1000
      );
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to retrieve experience.' });
    }
  }

  static async createExperience(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { company, role, duration, period, location, description, technologies, skills, order } = req.body;
      const techArray = Array.isArray(technologies) ? technologies : Array.isArray(skills) ? skills : [];

      const data = {
        company: company?.trim(),
        role: role?.trim(),
        duration: duration?.trim() || period?.trim() || '2023 - Present',
        period: period?.trim() || duration?.trim() || '2023 - Present',
        location: location?.trim() || 'Remote',
        description: description?.trim() || '',
        technologies: techArray,
        skills: techArray,
        order: Number(order) || 0,
      };

      if (!data.company || !data.role) {
        res.status(400).json({ success: false, message: 'Company and role are required.' });
        return;
      }

      const author = req.user?.name || req.user?.email || 'Admin';

      if (mongoose.connection.readyState === 1) {
        const exp = new Experience(data);
        await exp.save();
        cacheService.invalidate('experience');
        await recordAuditLog('CREATED', `Experience: "${exp.role} at ${exp.company}"`, author, {
          company: exp.company,
          role: exp.role,
          id: exp._id,
        });
        res.status(201).json({ success: true, message: 'Experience created.', data: exp });
        return;
      }

      const mock = { _id: `exp-${Date.now()}`, ...data };
      memoryStore.experiences.push(mock);
      cacheService.invalidate('experience');
      await recordAuditLog('CREATED', `Experience: "${mock.role} at ${mock.company}"`, author, {
        company: mock.company,
        role: mock.role,
        id: mock._id,
      });
      res.status(201).json({ success: true, message: 'Experience created.', data: mock });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to create experience.', error: error.message });
    }
  }

  static async updateExperience(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = getParam(req.params.id);
      const author = req.user?.name || req.user?.email || 'Admin';

      if (mongoose.connection.readyState === 1) {
        const exp = await Experience.findByIdAndUpdate(id, req.body, { new: true });
        if (!exp) {
          res.status(404).json({ success: false, message: 'Experience record not found.' });
          return;
        }
        cacheService.invalidate('experience');
        await recordAuditLog('UPDATED', `Experience: "${exp.role} at ${exp.company}"`, author, {
          company: exp.company,
          role: exp.role,
          id: exp._id,
        });
        res.status(200).json({ success: true, message: 'Experience updated.', data: exp });
        return;
      }

      const idx = memoryStore.experiences.findIndex(e => e._id === id);
      if (idx === -1) {
        res.status(404).json({ success: false, message: 'Experience record not found.' });
        return;
      }
      memoryStore.experiences[idx] = { ...memoryStore.experiences[idx], ...req.body };
      cacheService.invalidate('experience');
      await recordAuditLog('UPDATED', `Experience: "${memoryStore.experiences[idx].role} at ${memoryStore.experiences[idx].company}"`, author, {
        id,
      });
      res.status(200).json({ success: true, message: 'Experience updated.', data: memoryStore.experiences[idx] });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to update experience.', error: error.message });
    }
  }

  static async deleteExperience(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = getParam(req.params.id);
      const author = req.user?.name || req.user?.email || 'Admin';

      if (mongoose.connection.readyState === 1) {
        const exp = await Experience.findByIdAndDelete(id);
        const label = exp ? `${exp.role} at ${exp.company}` : id;
        cacheService.invalidate('experience');
        await recordAuditLog('DELETED', `Experience: "${label}"`, author, { id });
        res.status(200).json({ success: true, message: 'Experience deleted.' });
        return;
      }

      const exp = memoryStore.experiences.find(e => e._id === id);
      const label = exp ? `${exp.role} at ${exp.company}` : id;
      memoryStore.experiences = memoryStore.experiences.filter(e => e._id !== id);
      cacheService.invalidate('experience');
      await recordAuditLog('DELETED', `Experience: "${label}"`, author, { id });
      res.status(200).json({ success: true, message: 'Experience deleted.' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to delete experience.', error: error.message });
    }
  }

  // Now Single-Record Update
  static async getNow(req: Request, res: Response): Promise<void> {
    try {
      await cacheService.handleCachedResponse(
        req,
        res,
        'now',
        async () => {
          if (mongoose.connection.readyState === 1) {
            let now = await NowUpdate.findOne().lean();
            if (!now) {
              now = await NowUpdate.create(memoryStore.now);
            }
            return { success: true, data: now };
          }
          return { success: true, data: memoryStore.now };
        },
        5 * 60 * 1000
      );
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to retrieve Now status.', error: error.message });
    }
  }

  static async updateNow(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const author = req.user?.name || req.user?.email || 'Admin';

      if (mongoose.connection.readyState === 1) {
        let now = await NowUpdate.findOne();
        if (!now) now = new NowUpdate(req.body);
        else Object.assign(now, req.body);
        now.lastUpdated = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        await now.save();
        cacheService.invalidate('now');
        await recordAuditLog('UPDATED', 'Now Status Dashboard Section', author, {
          currentFocus: now.currentFocus,
        });
        res.status(200).json({ success: true, message: 'Now status updated.', data: now });
        return;
      }

      memoryStore.now = { ...memoryStore.now, ...req.body, lastUpdated: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) };
      cacheService.invalidate('now');
      await recordAuditLog('UPDATED', 'Now Status Dashboard Section', author);
      res.status(200).json({ success: true, message: 'Now status updated.', data: memoryStore.now });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to update Now status.', error: error.message });
    }
  }

  // AI Knowledge Base
  static async getAIKnowledge(req: Request, res: Response): Promise<void> {
    try {
      await cacheService.handleCachedResponse(
        req,
        res,
        'aiKb',
        async () => {
          if (mongoose.connection.readyState === 1) {
            const kb = await AIKnowledgeBase.find().lean();
            return { success: true, count: kb.length, data: kb };
          }
          return { success: true, count: memoryStore.aiKb.length, data: memoryStore.aiKb };
        },
        5 * 60 * 1000
      );
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to retrieve AI Knowledge Base.', error: error.message });
    }
  }

  static async createAIKnowledge(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const author = req.user?.name || req.user?.email || 'Admin';

      if (mongoose.connection.readyState === 1) {
        const item = new AIKnowledgeBase(req.body);
        await item.save();
        cacheService.invalidate('aiKb');
        await recordAuditLog('CREATED', `AI Knowledge Fact: "${item.topic}"`, author, {
          category: item.category,
          id: item._id,
        });
        res.status(201).json({ success: true, message: 'Grounding fact added.', data: item });
        return;
      }
      const mock = { _id: `kb-${Date.now()}`, ...req.body };
      memoryStore.aiKb.push(mock);
      cacheService.invalidate('aiKb');
      await recordAuditLog('CREATED', `AI Knowledge Fact: "${mock.topic}"`, author, {
        category: mock.category,
        id: mock._id,
      });
      res.status(201).json({ success: true, message: 'Grounding fact added.', data: mock });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to add grounding fact.', error: error.message });
    }
  }

  static async deleteAIKnowledge(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = getParam(req.params.id);
      const author = req.user?.name || req.user?.email || 'Admin';

      if (mongoose.connection.readyState === 1) {
        const kb = await AIKnowledgeBase.findByIdAndDelete(id);
        const topic = kb?.topic || id;
        cacheService.invalidate('aiKb');
        await recordAuditLog('DELETED', `AI Knowledge Fact: "${topic}"`, author, { id });
        res.status(200).json({ success: true, message: 'Grounding fact deleted.' });
        return;
      }
      const kb = memoryStore.aiKb.find(k => k._id !== id);
      const topic = kb?.topic || id;
      memoryStore.aiKb = memoryStore.aiKb.filter(k => k._id !== id);
      cacheService.invalidate('aiKb');
      await recordAuditLog('DELETED', `AI Knowledge Fact: "${topic}"`, author, { id });
      res.status(200).json({ success: true, message: 'Grounding fact deleted.' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to delete grounding fact.', error: error.message });
    }
  }
}

export default ExperienceController;
