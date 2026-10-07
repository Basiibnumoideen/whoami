import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Certification } from '../models/Certification';
import { AuditLog } from '../models/AuditLog';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { memoryStore } from '../services/memoryStore';
import { getParam } from '../utils/helpers';

export class CertificationController {
  static async getCertifications(req: Request, res: Response): Promise<void> {
    try {
      if (mongoose.connection.readyState === 1) {
        const certs = await Certification.find().sort({ order: 1 }).lean();
        res.status(200).json({ success: true, count: certs.length, data: certs });
        return;
      }
      res.status(200).json({ success: true, count: memoryStore.certifications.length, data: memoryStore.certifications });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to retrieve certifications.' });
    }
  }

  static async createCertification(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { title, provider, issueDate, credentialID, image, verifyURL, order } = req.body;
      const certData = {
        title: title?.trim(),
        provider: provider?.trim(),
        issueDate: issueDate?.trim() || '2024',
        credentialID: credentialID?.trim() || '',
        image: image || '',
        verifyURL: verifyURL || '',
        order: Number(order) || 0,
      };

      if (!certData.title || !certData.provider) {
        res.status(400).json({ success: false, message: 'Title and provider are required.' });
        return;
      }

      if (mongoose.connection.readyState === 1) {
        const cert = new Certification(certData);
        await cert.save();
        await AuditLog.create({
          action: 'CREATED',
          target: `Certification: "${cert.title}"`,
          author: req.user?.name || 'Admin',
          timestamp: new Date().toISOString(),
        });
        res.status(201).json({ success: true, message: 'Certification created.', data: cert });
        return;
      }

      const mockCert = { _id: `cert-${Date.now()}`, ...certData };
      memoryStore.certifications.push(mockCert);
      res.status(201).json({ success: true, message: 'Certification created.', data: mockCert });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to create certification.', error: error.message });
    }
  }

  static async updateCertification(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = getParam(req.params.id);

      if (mongoose.connection.readyState === 1) {
        const cert = await Certification.findByIdAndUpdate(id, req.body, { new: true });
        if (!cert) {
          res.status(404).json({ success: false, message: 'Certification not found.' });
          return;
        }
        res.status(200).json({ success: true, message: 'Certification updated.', data: cert });
        return;
      }

      const idx = memoryStore.certifications.findIndex(c => c._id === id);
      if (idx === -1) {
        res.status(404).json({ success: false, message: 'Certification not found.' });
        return;
      }
      memoryStore.certifications[idx] = { ...memoryStore.certifications[idx], ...req.body };
      res.status(200).json({ success: true, message: 'Certification updated.', data: memoryStore.certifications[idx] });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to update certification.', error: error.message });
    }
  }

  static async deleteCertification(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = getParam(req.params.id);

      if (mongoose.connection.readyState === 1) {
        await Certification.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: 'Certification deleted.' });
        return;
      }

      memoryStore.certifications = memoryStore.certifications.filter(c => c._id !== id);
      res.status(200).json({ success: true, message: 'Certification deleted.' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to delete certification.', error: error.message });
    }
  }
}

export default CertificationController;
