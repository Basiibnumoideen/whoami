import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Testimonial } from '../models/Testimonial';
import { recordAuditLog } from '../models/AuditLog';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { memoryStore } from '../services/memoryStore';
import { getParam } from '../utils/helpers';
import { cacheService } from '../services/cacheService';

export class TestimonialController {
  static async getTestimonials(req: Request, res: Response): Promise<void> {
    try {
      await cacheService.handleCachedResponse(
        req,
        res,
        'testimonials:all',
        async () => {
          if (mongoose.connection.readyState === 1) {
            const testimonials = await Testimonial.find().sort({ order: 1 }).lean();
            return { success: true, count: testimonials.length, data: testimonials };
          }
          return { success: true, count: memoryStore.testimonials.length, data: memoryStore.testimonials };
        },
        15 * 1000,
        0 // Force no-cache, no-store, must-revalidate on client browser
      );
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

      const author = req.user?.name || req.user?.email || 'Admin';

      if (mongoose.connection.readyState === 1) {
        const item = new Testimonial(data);
        await item.save();
        cacheService.invalidate('testimonial');
        cacheService.invalidate('testimonials');
        await recordAuditLog('CREATED', `Testimonial from ${item.name}`, author, {
          company: item.company,
          role: item.role,
          id: item._id,
        });
        res.status(201).json({ success: true, message: 'Testimonial created.', data: item });
        return;
      }

      const mock = { _id: `test-${Date.now()}`, ...data };
      memoryStore.testimonials.push(mock);
      cacheService.invalidate('testimonial');
      cacheService.invalidate('testimonials');
      await recordAuditLog('CREATED', `Testimonial from ${mock.name}`, author, {
        company: mock.company,
        role: mock.role,
        id: mock._id,
      });
      res.status(201).json({ success: true, message: 'Testimonial created.', data: mock });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to create testimonial.', error: error.message });
    }
  }

  static async updateTestimonial(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = getParam(req.params.id);
      const author = req.user?.name || req.user?.email || 'Admin';

      if (!id) {
        res.status(400).json({ success: false, message: 'Testimonial ID is required.' });
        return;
      }

      const { name, role, company, avatar, content, rating, order } = req.body;
      const updateData: Record<string, any> = {};
      if (name !== undefined) updateData.name = name?.trim();
      if (role !== undefined) updateData.role = role?.trim();
      if (company !== undefined) updateData.company = company?.trim();
      if (avatar !== undefined) updateData.avatar = avatar?.trim() || '';
      if (content !== undefined) updateData.content = content?.trim();
      if (rating !== undefined) updateData.rating = Number(rating) || 5;
      if (order !== undefined) updateData.order = Number(order) || 0;

      let updatedItem: any = null;

      if (mongoose.connection.readyState === 1) {
        if (mongoose.Types.ObjectId.isValid(id)) {
          updatedItem = await Testimonial.findByIdAndUpdate(id, updateData, { new: true });
        } else {
          updatedItem = await Testimonial.findOneAndUpdate({ _id: String(id) }, updateData, { new: true });
        }
      }

      if (!updatedItem) {
        const idx = memoryStore.testimonials.findIndex(t => String(t._id) === String(id) || String(t.id) === String(id));
        if (idx !== -1) {
          memoryStore.testimonials[idx] = { ...memoryStore.testimonials[idx], ...updateData };
          updatedItem = memoryStore.testimonials[idx];
        }
      }

      if (!updatedItem) {
        res.status(404).json({ success: false, message: 'Testimonial not found.' });
        return;
      }

      cacheService.invalidate('testimonial');
      cacheService.invalidate('testimonials');
      await recordAuditLog('UPDATED', `Testimonial from ${updatedItem.name}`, author, {
        company: updatedItem.company,
        role: updatedItem.role,
        id,
      });
      res.status(200).json({ success: true, message: 'Testimonial updated.', data: updatedItem });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to update testimonial.', error: error.message });
    }
  }

  static async deleteTestimonial(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = getParam(req.params.id);
      const author = req.user?.name || req.user?.email || 'Admin';

      if (!id) {
        res.status(400).json({ success: false, message: 'Testimonial ID is required.' });
        return;
      }

      let deletedItem: any = null;

      if (mongoose.connection.readyState === 1) {
        if (mongoose.Types.ObjectId.isValid(id)) {
          deletedItem = await Testimonial.findByIdAndDelete(id);
        } else {
          deletedItem = await Testimonial.findOneAndDelete({ _id: String(id) });
        }
      }

      // If not deleted from MongoDB, check memoryStore
      if (!deletedItem) {
        const memIdx = memoryStore.testimonials.findIndex(t => String(t._id) === String(id) || String(t.id) === String(id));
        if (memIdx !== -1) {
          deletedItem = memoryStore.testimonials[memIdx];
          memoryStore.testimonials.splice(memIdx, 1);
        }
      } else {
        // Also keep memoryStore synchronized
        memoryStore.testimonials = memoryStore.testimonials.filter(t => String(t._id) !== String(id) && String(t.id) !== String(id));
      }

      // If the testimonial was not found in either store, return 404
      if (!deletedItem) {
        res.status(404).json({ success: false, message: 'Testimonial not found.' });
        return;
      }

      cacheService.invalidate('testimonial');
      cacheService.invalidate('testimonials');
      const name = deletedItem.name || id;
      await recordAuditLog('DELETED', `Testimonial from ${name}`, author, { id });
      res.status(200).json({ success: true, message: 'Testimonial deleted.' });
    } catch (error: any) {
      console.error('[deleteTestimonial error]', error);
      res.status(500).json({ success: false, message: 'Failed to delete testimonial.', error: error.message });
    }
  }
}

export default TestimonialController;
