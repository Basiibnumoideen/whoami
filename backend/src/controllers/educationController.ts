import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Education } from '../models/Education';
import { AuditLog } from '../models/AuditLog';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { memoryStore } from '../services/memoryStore';
import { getParam } from '../utils/helpers';

export class EducationController {
  static async getEducation(req: Request, res: Response): Promise<void> {
    try {
      if (mongoose.connection.readyState === 1) {
        const edu = await Education.find().sort({ order: 1 }).lean();
        res.status(200).json({ success: true, count: edu.length, data: edu });
        return;
      }
      res.status(200).json({ success: true, count: memoryStore.education.length, data: memoryStore.education });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to retrieve education.' });
    }
  }

  static async createEducation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { degree, school, period, gpa, highlights, order } = req.body;
      const schoolName = (school || req.body.institution)?.trim();
      const periodVal = (period || req.body.year)?.trim();
      const data = {
        degree: degree?.trim(),
        school: schoolName,
        period: periodVal || '2019 - 2023',
        gpa: gpa || '',
        highlights: Array.isArray(highlights) ? highlights : [],
        order: Number(order) || 0,
      };

      if (!data.degree || !data.school) {
        res.status(400).json({ success: false, message: 'Degree and school (or institution) are required.' });
        return;
      }

      if (mongoose.connection.readyState === 1) {
        const item = new Education(data);
        await item.save();
        await AuditLog.create({
          action: 'CREATED',
          target: `Education: "${item.degree} at ${item.school}"`,
          author: req.user?.name || 'Admin',
          timestamp: new Date().toISOString(),
        });
        res.status(201).json({ success: true, message: 'Education created.', data: item });
        return;
      }

      const mock = { _id: `edu-${Date.now()}`, ...data };
      memoryStore.education.push(mock);
      res.status(201).json({ success: true, message: 'Education created.', data: mock });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to create education.', error: error.message });
    }
  }

  static async updateEducation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = getParam(req.params.id);

      if (mongoose.connection.readyState === 1) {
        const item = await Education.findByIdAndUpdate(id, req.body, { new: true });
        if (!item) {
          res.status(404).json({ success: false, message: 'Education not found.' });
          return;
        }
        res.status(200).json({ success: true, message: 'Education updated.', data: item });
        return;
      }

      const idx = memoryStore.education.findIndex(e => e._id === id);
      if (idx === -1) {
        res.status(404).json({ success: false, message: 'Education not found.' });
        return;
      }
      memoryStore.education[idx] = { ...memoryStore.education[idx], ...req.body };
      res.status(200).json({ success: true, message: 'Education updated.', data: memoryStore.education[idx] });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to update education.', error: error.message });
    }
  }

  static async deleteEducation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = getParam(req.params.id);

      if (mongoose.connection.readyState === 1) {
        await Education.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: 'Education deleted.' });
        return;
      }

      memoryStore.education = memoryStore.education.filter(e => e._id !== id);
      res.status(200).json({ success: true, message: 'Education deleted.' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to delete education.', error: error.message });
    }
  }
}

export default EducationController;
