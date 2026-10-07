import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Certification } from '../models/Certification';
import { recordAuditLog } from '../models/AuditLog';
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
      const { title, provider, issueDate, credentialID, image, verifyURL, order, description, skills } = req.body;
      const certData = {
        title: title?.trim(),
        provider: provider?.trim(),
        issueDate: issueDate?.trim() || '2024',
        credentialID: credentialID?.trim() || '',
        image: image || '',
        verifyURL: verifyURL || '',
        description: description?.trim() || '',
        skills: Array.isArray(skills) ? skills : (typeof skills === 'string' ? skills.split(',').map((s: string) => s.trim()).filter(Boolean) : []),
        order: Number(order) || 0,
      };

      if (!certData.title || !certData.provider) {
        res.status(400).json({ success: false, message: 'Title and provider are required.' });
        return;
      }

      const author = req.user?.name || req.user?.email || 'Admin';

      if (mongoose.connection.readyState === 1) {
        const cert = new Certification(certData);
        await cert.save();
        await recordAuditLog('CREATED', `Certification: "${cert.title}"`, author, {
          provider: cert.provider,
          id: cert._id,
        });
        res.status(201).json({ success: true, message: 'Certification created.', data: cert });
        return;
      }

      const mockCert = { _id: `cert-${Date.now()}`, ...certData };
      memoryStore.certifications.push(mockCert);
      await recordAuditLog('CREATED', `Certification: "${mockCert.title}"`, author, {
        provider: mockCert.provider,
        id: mockCert._id,
      });
      res.status(201).json({ success: true, message: 'Certification created.', data: mockCert });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to create certification.', error: error.message });
    }
  }

  static async updateCertification(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = getParam(req.params.id);
      const author = req.user?.name || req.user?.email || 'Admin';

      if (mongoose.connection.readyState === 1) {
        const cert = await Certification.findByIdAndUpdate(id, req.body, { new: true });
        if (!cert) {
          res.status(404).json({ success: false, message: 'Certification not found.' });
          return;
        }
        await recordAuditLog('UPDATED', `Certification: "${cert.title}"`, author, {
          provider: cert.provider,
          id: cert._id,
        });
        res.status(200).json({ success: true, message: 'Certification updated.', data: cert });
        return;
      }

      const idx = memoryStore.certifications.findIndex(c => c._id === id);
      if (idx === -1) {
        res.status(404).json({ success: false, message: 'Certification not found.' });
        return;
      }
      memoryStore.certifications[idx] = { ...memoryStore.certifications[idx], ...req.body };
      await recordAuditLog('UPDATED', `Certification: "${memoryStore.certifications[idx].title}"`, author, {
        id,
      });
      res.status(200).json({ success: true, message: 'Certification updated.', data: memoryStore.certifications[idx] });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to update certification.', error: error.message });
    }
  }

  static async deleteCertification(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = getParam(req.params.id);
      const author = req.user?.name || req.user?.email || 'Admin';

      if (mongoose.connection.readyState === 1) {
        const cert = await Certification.findByIdAndDelete(id);
        const title = cert?.title || id;
        await recordAuditLog('DELETED', `Certification: "${title}"`, author, { id });
        res.status(200).json({ success: true, message: 'Certification deleted.' });
        return;
      }

      const target = memoryStore.certifications.find(c => c._id === id);
      const title = target?.title || id;
      memoryStore.certifications = memoryStore.certifications.filter(c => c._id !== id);
      await recordAuditLog('DELETED', `Certification: "${title}"`, author, { id });
      res.status(200).json({ success: true, message: 'Certification deleted.' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to delete certification.', error: error.message });
    }
  }
}

export default CertificationController;
