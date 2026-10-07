import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Service } from '../models/Service';
import { AuditLog } from '../models/AuditLog';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { memoryStore } from '../services/memoryStore';
import { getParam } from '../utils/helpers';

export class ServiceController {
  static async getServices(req: Request, res: Response): Promise<void> {
    try {
      const { all } = req.query;

      if (mongoose.connection.readyState === 1) {
        const query: any = {};
        if (all !== 'true') query.status = 'active';
        const services = await Service.find(query).sort({ order: 1 }).lean();
        res.status(200).json({ success: true, count: services.length, data: services });
        return;
      }

      let result = [...memoryStore.services];
      if (all !== 'true') result = result.filter(s => s.status !== 'inactive');
      res.status(200).json({ success: true, count: result.length, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to retrieve services.' });
    }
  }

  static async createService(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { title, description, icon, features, deliverables, status, order } = req.body;
      const featArray = Array.isArray(features) ? features : Array.isArray(deliverables) ? deliverables : [];

      const data = {
        title: title?.trim(),
        description: description?.trim(),
        icon: icon || 'Code',
        features: featArray,
        deliverables: featArray,
        status: status || 'active',
        order: Number(order) || 0,
      };

      if (!data.title || !data.description) {
        res.status(400).json({ success: false, message: 'Title and description are required.' });
        return;
      }

      if (mongoose.connection.readyState === 1) {
        const service = new Service(data);
        await service.save();
        await AuditLog.create({
          action: 'CREATED',
          target: `Service: "${service.title}"`,
          author: req.user?.name || 'Admin',
          timestamp: new Date().toISOString(),
        });
        res.status(201).json({ success: true, message: 'Service created.', data: service });
        return;
      }

      const mock = { _id: `srv-${Date.now()}`, ...data };
      memoryStore.services.push(mock);
      res.status(201).json({ success: true, message: 'Service created.', data: mock });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to create service.', error: error.message });
    }
  }

  static async updateService(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = getParam(req.params.id);

      if (mongoose.connection.readyState === 1) {
        const service = await Service.findByIdAndUpdate(id, req.body, { new: true });
        if (!service) {
          res.status(404).json({ success: false, message: 'Service not found.' });
          return;
        }
        res.status(200).json({ success: true, message: 'Service updated.', data: service });
        return;
      }

      const idx = memoryStore.services.findIndex(s => s._id === id);
      if (idx === -1) {
        res.status(404).json({ success: false, message: 'Service not found.' });
        return;
      }
      memoryStore.services[idx] = { ...memoryStore.services[idx], ...req.body };
      res.status(200).json({ success: true, message: 'Service updated.', data: memoryStore.services[idx] });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to update service.', error: error.message });
    }
  }

  static async deleteService(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = getParam(req.params.id);

      if (mongoose.connection.readyState === 1) {
        await Service.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: 'Service deleted.' });
        return;
      }

      memoryStore.services = memoryStore.services.filter(s => s._id !== id);
      res.status(200).json({ success: true, message: 'Service deleted.' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to delete service.', error: error.message });
    }
  }
}

export default ServiceController;
