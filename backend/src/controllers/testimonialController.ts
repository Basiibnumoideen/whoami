import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Testimonial } from '../models/Testimonial';
import { AuditLog } from '../models/AuditLog';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { memoryStore } from '../services/memoryStore';
import { getParam } from '../utils/helpers';

export class TestimonialController {
  static async getTestimonials(req: Request, res: Response): Promise<void> {
    try {
      if (mongoose.connection.readyState === 1) {
        const testimonials = await Testimonial.find().sort({ order: 1 }).lean();
        res.status(200).json({ success: true, count: testimonials.length, data: testimonials });
        return;
      }
      res.status(200).json({ success: true, count: memoryStore.testimonials.length, data: memoryStore.testimonials });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to retrieve testimonials.' });
    }
  }

  static async createTestimonial(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { name, role, company, avatar, content, rating, order } = req.body;
      const data = {
        name: name?.trim(),
        role: role?.trim(),
        company: company?.trim(),
        avatar: avatar || '',
        content: content?.trim(),
        rating: Number(rating) || 5,
        order: Number(order) || 0,
      };

      if (!data.name || !data.content) {
        res.status(400).json({ success: false, message: 'Name and testimonial content are required.' });
        return;
      }

      if (mongoose.connection.readyState === 1) {
        const item = new Testimonial(data);
        await item.save();
        await AuditLog.create({
          action: 'CREATED',
          target: `Testimonial from ${item.name}`,
          author: req.user?.name || 'Admin',
          timestamp: new Date().toISOString(),
        });
        res.status(201).json({ success: true, message: 'Testimonial created.', data: item });
        return;
      }

      const mock = { _id: `test-${Date.now()}`, ...data };
      memoryStore.testimonials.push(mock);
      res.status(201).json({ success: true, message: 'Testimonial created.', data: mock });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to create testimonial.', error: error.message });
    }
  }

  static async updateTestimonial(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = getParam(req.params.id);

      if (mongoose.connection.readyState === 1) {
        const item = await Testimonial.findByIdAndUpdate(id, req.body, { new: true });
        if (!item) {
          res.status(404).json({ success: false, message: 'Testimonial not found.' });
          return;
        }
        res.status(200).json({ success: true, message: 'Testimonial updated.', data: item });
        return;
      }

      const idx = memoryStore.testimonials.findIndex(t => t._id === id);
      if (idx === -1) {
        res.status(404).json({ success: false, message: 'Testimonial not found.' });
        return;
      }
      memoryStore.testimonials[idx] = { ...memoryStore.testimonials[idx], ...req.body };
      res.status(200).json({ success: true, message: 'Testimonial updated.', data: memoryStore.testimonials[idx] });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to update testimonial.', error: error.message });
    }
  }

  static async deleteTestimonial(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = getParam(req.params.id);

      if (mongoose.connection.readyState === 1) {
        await Testimonial.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: 'Testimonial deleted.' });
        return;
      }

      memoryStore.testimonials = memoryStore.testimonials.filter(t => t._id !== id);
      res.status(200).json({ success: true, message: 'Testimonial deleted.' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to delete testimonial.', error: error.message });
    }
  }
}

export default TestimonialController;
