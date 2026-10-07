import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Message } from '../models/Message';
import { SiteSettings } from '../models/SiteSettings';
import { AuditLog } from '../models/AuditLog';
import { ActivityLog } from '../models/ActivityLog';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { memoryStore } from '../services/memoryStore';
import { getParam } from '../utils/helpers';

export class MessageController {
  /**
   * GET /api/messages (Admin only)
   */
  static async getMessages(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { read } = req.query;

      if (mongoose.connection.readyState === 1) {
        const query: any = {};
        if (read === 'true') query.read = true;
        if (read === 'false') query.read = false;
        const messages = await Message.find(query).sort({ createdAt: -1 });
        const unreadCount = await Message.countDocuments({ read: false });
        res.status(200).json({ success: true, count: messages.length, unreadCount, data: messages });
        return;
      }

      // Memory Store Fallback
      let result = [...memoryStore.messages];
      if (read === 'true') result = result.filter(m => m.read);
      if (read === 'false') result = result.filter(m => !m.read);
      const unreadCount = memoryStore.messages.filter(m => !m.read).length;

      res.status(200).json({ success: true, count: result.length, unreadCount, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to retrieve messages.', error: error.message });
    }
  }

  /**
   * POST /api/messages (Public contact form)
   */
  static async createMessage(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, subject, projectType, message } = req.body;

      if (!name || !email || !message) {
        res.status(400).json({ success: false, message: 'Please provide name, email, and message.' });
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
        return;
      }

      const msgData = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        subject: subject ? subject.trim() : 'Website Inquiry',
        projectType: projectType || 'General Inquiry',
        message: message.trim(),
        read: false,
        createdAt: new Date().toISOString(),
      };

      if (mongoose.connection.readyState === 1) {
        const newMessage = new Message(msgData);
        await newMessage.save();
        await SiteSettings.updateOne({}, { $inc: { 'stats.contactSubmissions': 1 } });
        await AuditLog.create({
          action: 'CREATED',
          target: `Inquiry from ${newMessage.name}`,
          author: 'Contact Visitor',
          timestamp: new Date().toISOString(),
        }).catch(() => null);

        const clientIp = (req.headers['x-forwarded-for'] as string || req.ip || '').split(',')[0].trim();
        await ActivityLog.create({
          type: 'contact_submission',
          title: 'New Contact Submission',
          description: `${newMessage.name} reached out regarding "${newMessage.subject || 'Website Inquiry'}"`,
          metadata: {
            messageId: newMessage._id,
            name: newMessage.name,
            email: newMessage.email,
            projectType: newMessage.projectType,
          },
          ip: clientIp,
        }).catch(() => null);
        res.status(201).json({
          success: true,
          message: 'Thank you! Your message has been received. I will respond within 24 hours.',
          data: newMessage,
        });
        return;
      }

      // Memory fallback
      const mockMessage = { _id: `msg-${Date.now()}`, ...msgData };
      memoryStore.messages.unshift(mockMessage);
      memoryStore.settings.stats = memoryStore.settings.stats || {};
      memoryStore.settings.stats.contactSubmissions = (memoryStore.settings.stats.contactSubmissions || 0) + 1;
      res.status(201).json({
        success: true,
        message: 'Thank you! Your message has been received. I will respond within 24 hours.',
        data: mockMessage,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to send message.', error: error.message });
    }
  }

  /**
   * PATCH /api/messages/:id/read (Admin only)
   */
  static async toggleRead(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = getParam(req.params.id);
      const { read } = req.body;

      if (mongoose.connection.readyState === 1) {
        const message = await Message.findById(id);
        if (!message) {
          res.status(404).json({ success: false, message: 'Message not found.' });
          return;
        }
        message.read = read !== undefined ? Boolean(read) : !message.read;
        await message.save();
        res.status(200).json({ success: true, message: `Message status updated.`, data: message });
        return;
      }

      const msg = memoryStore.messages.find(m => m._id === id);
      if (!msg) {
        res.status(404).json({ success: false, message: 'Message not found.' });
        return;
      }
      msg.read = read !== undefined ? Boolean(read) : !msg.read;
      res.status(200).json({ success: true, message: `Message status updated.`, data: msg });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to update message status.', error: error.message });
    }
  }

  /**
   * DELETE /api/messages/:id (Admin only)
   */
  static async deleteMessage(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = getParam(req.params.id);

      if (mongoose.connection.readyState === 1) {
        const message = await Message.findByIdAndDelete(id);
        if (!message) {
          res.status(404).json({ success: false, message: 'Message not found.' });
          return;
        }
        res.status(200).json({ success: true, message: 'Message deleted successfully.' });
        return;
      }

      const initialLen = memoryStore.messages.length;
      memoryStore.messages = memoryStore.messages.filter(m => m._id !== id);
      if (memoryStore.messages.length === initialLen) {
        res.status(404).json({ success: false, message: 'Message not found.' });
        return;
      }
      res.status(200).json({ success: true, message: 'Message deleted successfully.' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to delete message.', error: error.message });
    }
  }
}

export default MessageController;
