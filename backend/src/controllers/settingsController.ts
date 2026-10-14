import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { SiteSettings } from '../models/SiteSettings';
import { AuditLog } from '../models/AuditLog';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { memoryStore } from '../services/memoryStore';
import { cacheService } from '../services/cacheService';

export class SettingsController {
  /**
   * GET /api/settings
   */
  static async getSettings(req: Request, res: Response): Promise<void> {
    try {
      await cacheService.handleCachedResponse(
        req,
        res,
        'settings',
        async () => {
          if (mongoose.connection.readyState === 1) {
            let settings = await SiteSettings.findOne().lean();
            if (!settings) {
              settings = await SiteSettings.create(memoryStore.settings);
            }
            return { success: true, data: settings };
          }

          return { success: true, data: memoryStore.settings };
        },
        10 * 60 * 1000 // 10-minute cache for site settings
      );
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to retrieve site settings.' });
    }
  }

  /**
   * PUT /api/settings (Admin only)
   */
  static async updateSettings(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const updateData = { ...req.body };
      delete updateData._id;
      delete updateData.__v;
      delete updateData.createdAt;
      delete updateData.updatedAt;

      // Keep aliases in sync
      if (updateData.avatar && !updateData.logo) updateData.logo = updateData.avatar;
      if (updateData.logo && !updateData.avatar) updateData.avatar = updateData.logo;
      if (updateData.resumeURL) updateData.resumeUrl = updateData.resumeURL;
      if (updateData.resumeUrl) updateData.resumeURL = updateData.resumeUrl;
      if (updateData.footerDescription) updateData.footerContent = updateData.footerDescription;
      if (updateData.footerContent) updateData.footerDescription = updateData.footerContent;

      // Sync socialLinks with top-level fields
      if (!updateData.socialLinks) updateData.socialLinks = {};
      if (updateData.github) updateData.socialLinks.github = updateData.github;
      if (updateData.linkedin) updateData.socialLinks.linkedin = updateData.linkedin;
      if (updateData.twitter) updateData.socialLinks.twitter = updateData.twitter;

      if (mongoose.connection.readyState === 1) {
        const settings = await SiteSettings.findOneAndUpdate(
          {},
          { $set: updateData },
          { returnDocument: 'after', upsert: true, runValidators: true }
        );

        await AuditLog.create({
          action: 'UPDATED',
          target: 'Global Site Settings',
          author: req.user?.name || 'Admin',
          timestamp: new Date().toISOString(),
        }).catch(() => null);

        if (settings) {
          memoryStore.settings = settings.toObject ? settings.toObject() : { ...settings };
        }

        cacheService.invalidate('settings');

        res.status(200).json({ success: true, message: 'Site settings updated successfully.', data: settings });
        return;
      }

      memoryStore.settings = { ...memoryStore.settings, ...updateData };
      cacheService.invalidate('settings');
      res.status(200).json({ success: true, message: 'Site settings updated successfully.', data: memoryStore.settings });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to update site settings.', error: error.message });
    }
  }
}

export default SettingsController;
