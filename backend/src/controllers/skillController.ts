import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Skill } from '../models/Skill';
import { AuditLog } from '../models/AuditLog';
import { getParam, isObjectId } from '../utils/helpers';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { memoryStore } from '../services/memoryStore';

export class SkillController {
  /**
   * GET /api/skills
   */
  static async getSkills(req: Request, res: Response): Promise<void> {
    try {
      const { category } = req.query;

      if (mongoose.connection.readyState === 1) {
        const query: any = {};
        if (category && category !== 'All') query.category = category;
        const skills = await Skill.find(query).sort({ order: 1, level: -1 }).lean();
        res.status(200).json({ success: true, count: skills.length, data: skills });
        return;
      }

      // Memory Store Fallback
      let result = [...memoryStore.skills];
      if (category && category !== 'All') {
        result = result.filter(s => s.category === category);
      }
      result.sort((a, b) => (a.order || 0) - (b.order || 0));

      res.status(200).json({ success: true, count: result.length, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to retrieve skills.' });
    }
  }

  /**
   * POST /api/skills (Admin only)
   */
  static async createSkill(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { name, category, level, experience, projects, order } = req.body;

      if (!name || !category) {
        res.status(400).json({ success: false, message: 'Skill name and category are required.' });
        return;
      }

      const skillData = {
        name: name.trim(),
        category: category.trim(),
        level: Number(level) || 80,
        experience: experience || '1+ Years',
        order: Number(order) || 0,
        projects: Array.isArray(projects) ? projects : [],
      };

      if (mongoose.connection.readyState === 1) {
        const existingSkill = await Skill.findOne({ name: skillData.name });
        if (existingSkill) {
          res.status(400).json({ success: false, message: `Skill "${name}" already exists.` });
          return;
        }
        const skill = new Skill(skillData);
        await skill.save();
        await AuditLog.create({
          action: 'CREATED',
          target: `Skill: "${skill.name}" (${skill.category})`,
          author: req.user?.name || 'Admin',
          timestamp: new Date().toISOString(),
        });
        res.status(201).json({ success: true, message: 'Skill created.', data: skill });
        return;
      }

      // Memory fallback
      const mockSkill = { _id: `sk-${Date.now()}`, ...skillData };
      memoryStore.skills.push(mockSkill);
      res.status(201).json({ success: true, message: 'Skill created.', data: mockSkill });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to create skill.', error: error.message });
    }
  }

  /**
   * PUT /api/skills/:idOrName (Admin only)
   */
  static async updateSkill(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const idOrName = getParam(req.params.idOrName);

      if (mongoose.connection.readyState === 1) {
        const conditions: any[] = [{ name: idOrName }];
        if (isObjectId(idOrName)) conditions.push({ _id: idOrName });
        const skill = await Skill.findOne({ $or: conditions });
        if (!skill) {
          res.status(404).json({ success: false, message: 'Skill not found.' });
          return;
        }
        Object.assign(skill, req.body);
        await skill.save();
        await AuditLog.create({
          action: 'UPDATED',
          target: `Skill: "${skill.name}" (${skill.category})`,
          author: req.user?.name || 'Admin',
          timestamp: new Date().toISOString(),
        }).catch(() => null);
        res.status(200).json({ success: true, message: 'Skill updated.', data: skill });
        return;
      }

      const idx = memoryStore.skills.findIndex(s => s.name === idOrName || s._id === idOrName);
      if (idx === -1) {
        res.status(404).json({ success: false, message: 'Skill not found.' });
        return;
      }
      memoryStore.skills[idx] = { ...memoryStore.skills[idx], ...req.body };
      res.status(200).json({ success: true, message: 'Skill updated.', data: memoryStore.skills[idx] });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to update skill.', error: error.message });
    }
  }

  /**
   * DELETE /api/skills/:idOrName (Admin only)
   */
  static async deleteSkill(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const idOrName = getParam(req.params.idOrName);

      if (mongoose.connection.readyState === 1) {
        const conditions: any[] = [{ name: idOrName }];
        if (isObjectId(idOrName)) conditions.push({ _id: idOrName });
        const skill = await Skill.findOneAndDelete({ $or: conditions });
        if (!skill) {
          res.status(404).json({ success: false, message: 'Skill not found.' });
          return;
        }
        await AuditLog.create({
          action: 'DELETED',
          target: `Skill: "${skill.name}" (${skill.category})`,
          author: req.user?.name || 'Admin',
          timestamp: new Date().toISOString(),
        }).catch(() => null);
        res.status(200).json({ success: true, message: 'Skill deleted.' });
        return;
      }

      const initialLen = memoryStore.skills.length;
      memoryStore.skills = memoryStore.skills.filter(s => s.name !== idOrName && s._id !== idOrName);
      if (memoryStore.skills.length === initialLen) {
        res.status(404).json({ success: false, message: 'Skill not found.' });
        return;
      }
      res.status(200).json({ success: true, message: 'Skill deleted.' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to delete skill.', error: error.message });
    }
  }

  /**
   * PATCH /api/skills/reorder (Admin only)
   */
  static async reorderSkills(req: AuthenticatedRequest, res: Response): Promise<void> {
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
        await Skill.bulkWrite(bulkOps);
      } else {
        items.forEach(item => {
          const s = memoryStore.skills.find(s => s._id === item.id || s.name === item.name);
          if (s) s.order = item.order;
        });
      }

      res.status(200).json({ success: true, message: 'Skills reordered successfully.' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to reorder skills.', error: error.message });
    }
  }
}

export default SkillController;
