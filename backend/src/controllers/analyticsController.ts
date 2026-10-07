import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Project } from '../models/Project';
import { Skill } from '../models/Skill';
import { Blog } from '../models/Blog';
import { Message } from '../models/Message';
import { Service } from '../models/Service';
import { Experience } from '../models/Experience';
import { Education } from '../models/Education';
import { Certification } from '../models/Certification';
import { Testimonial } from '../models/Testimonial';
import { SiteSettings } from '../models/SiteSettings';
import { AuditLog } from '../models/AuditLog';
import { Visitor } from '../models/Visitor';
import { PageView } from '../models/PageView';
import { ProjectView } from '../models/ProjectView';
import { ResumeDownload } from '../models/ResumeDownload';
import { ActivityLog } from '../models/ActivityLog';
import { Analytics } from '../models/Analytics';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { memoryStore } from '../services/memoryStore';

// In-Memory Aggregation Cache (30-second TTL for peak performance)
interface CachePayload {
  data: any;
  cachedAt: number;
}
let analyticsCache: CachePayload | null = null;
const CACHE_TTL_MS = 30 * 1000;

function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket.remoteAddress || '127.0.0.1';
}

function formatDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

function generateDateBuckets(days: number): { [dateKey: string]: { date: string; label: string; visitors: number; pageViews: number; downloads: number; inquiries: number } } {
  const buckets: Record<string, any> = {};
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = formatDateKey(d);
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    buckets[key] = { date: key, label, visitors: 0, pageViews: 0, downloads: 0, inquiries: 0 };
  }
  return buckets;
}

export class AnalyticsController {
  /**
   * GET /api/admin/dashboard & GET /api/analytics/dashboard (Admin only)
   * Real database-driven analytics, aggregation pipelines, caching, and activity feeds.
   */
  static async getDashboardStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const forceRefresh = req.query.refresh === 'true';
      const now = Date.now();

      // Return cached analytics if fresh and not explicitly refreshed
      if (!forceRefresh && analyticsCache && now - analyticsCache.cachedAt < CACHE_TTL_MS) {
        res.status(200).json(analyticsCache.data);
        return;
      }

      if (mongoose.connection.readyState === 1) {
        const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
        const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

        // Parallel count queries across all content & tracking collections
        const [
          totalVisitors,
          pageViews,
          projectViews,
          resumeDownloads,
          contactSubmissions,
          totalProjects,
          totalSkills,
          totalServices,
          totalExperiences,
          totalEducation,
          totalCertifications,
          totalBlogs,
          totalTestimonials,
          totalMessages,
          unreadMessages,
          recentActivities,
          recentMessages,
          topPagesAgg,
          topProjectsAgg,
          dailyPageViewsAgg,
          dailyVisitorsAgg,
          dailyDownloadsAgg,
          dailyInquiriesAgg,
        ] = await Promise.all([
          Visitor.countDocuments(),
          PageView.countDocuments(),
          ProjectView.countDocuments(),
          ResumeDownload.countDocuments(),
          Message.countDocuments(),
          Project.countDocuments(),
          Skill.countDocuments(),
          Service.countDocuments(),
          Experience.countDocuments(),
          Education.countDocuments(),
          Certification.countDocuments(),
          Blog.countDocuments(),
          Testimonial.countDocuments(),
          Message.countDocuments(),
          Message.countDocuments({ read: false }),
          ActivityLog.find().sort({ createdAt: -1 }).limit(15),
          Message.find().sort({ createdAt: -1 }).limit(5),

          // Aggregation 1: Most Visited Pages
          PageView.aggregate([
            { $group: { _id: '$path', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 8 },
          ]),

          // Aggregation 2: Top Viewed Projects
          ProjectView.aggregate([
            { $group: { _id: '$projectTitle', count: { $sum: 1 }, slug: { $first: '$projectSlug' } } },
            { $sort: { count: -1 } },
            { $limit: 6 },
          ]),

          // Aggregation 3: Daily PageViews (Last 30 Days)
          PageView.aggregate([
            { $match: { createdAt: { $gte: thirtyDaysAgo } } },
            { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
          ]),

          // Aggregation 4: Daily Unique Visitors (Last 30 Days)
          Visitor.aggregate([
            { $match: { createdAt: { $gte: thirtyDaysAgo } } },
            { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
          ]),

          // Aggregation 5: Daily Resume Downloads (Last 30 Days)
          ResumeDownload.aggregate([
            { $match: { createdAt: { $gte: thirtyDaysAgo } } },
            { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
          ]),

          // Aggregation 6: Daily Inquiries (Last 30 Days)
          Message.aggregate([
            { $match: { createdAt: { $gte: thirtyDaysAgo } } },
            { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
          ]),
        ]);

        // Build continuous 7-Day & 30-Day Buckets
        const last30Buckets = generateDateBuckets(30);
        dailyPageViewsAgg.forEach((item: any) => {
          if (last30Buckets[item._id]) last30Buckets[item._id].pageViews = item.count;
        });
        dailyVisitorsAgg.forEach((item: any) => {
          if (last30Buckets[item._id]) last30Buckets[item._id].visitors = item.count;
        });
        dailyDownloadsAgg.forEach((item: any) => {
          if (last30Buckets[item._id]) last30Buckets[item._id].downloads = item.count;
        });
        dailyInquiriesAgg.forEach((item: any) => {
          if (last30Buckets[item._id]) last30Buckets[item._id].inquiries = item.count;
        });

        const chart30Days = Object.values(last30Buckets);
        const chart7Days = chart30Days.slice(-7);

        // Format Top Pages & Top Projects
        const topPages = topPagesAgg.map((p: any) => ({
          path: p._id,
          views: p.count,
        }));

        const topProjects = topProjectsAgg.map((p: any) => ({
          title: p._id,
          views: p.count,
          slug: p.slug,
        }));

        // Format Activity Feed with friendly relative times & icons
        const activities = recentActivities.map((act: any) => ({
          id: act._id,
          type: act.type,
          title: act.title,
          description: act.description,
          metadata: act.metadata,
          ip: act.ip,
          timestamp: act.createdAt,
        }));

        const statsObj = {
          totalVisitors,
          pageViews,
          projectViews,
          resumeDownloads,
          contactSubmissions,
          totalProjects,
          totalSkills,
          totalServices,
          totalExperiences,
          totalEducation,
          totalCertifications,
          totalBlogs,
          totalTestimonials,
          totalMessages,
          unreadMessages,
        };

        const totalAnalyticsEvents = totalVisitors + pageViews + projectViews + resumeDownloads + contactSubmissions;
        const hasAnalyticsData = totalAnalyticsEvents > 0;

        const responsePayload = {
          success: true,
          hasData: hasAnalyticsData,
          stats: statsObj,
          data: statsObj,
          charts: {
            visitorsLast7Days: chart7Days,
            visitorsLast30Days: chart30Days,
            topViewedProjects: topProjects,
            mostVisitedPages: topPages,
            downloadTrends: chart30Days.map(d => ({ date: d.date, label: d.label, count: d.downloads })),
            inquiryTrends: chart30Days.map(d => ({ date: d.date, label: d.label, count: d.inquiries })),
          },
          recentActivities: activities,
          recentMessages,
          cachedAt: new Date(now).toISOString(),
        };

        // Cache the response in memory
        analyticsCache = {
          data: responsePayload,
          cachedAt: now,
        };

        res.status(200).json(responsePayload);
        return;
      }

      // Memory store fallback
      res.status(200).json({
        success: true,
        hasData: false,
        stats: {
          totalVisitors: 0,
          pageViews: 0,
          projectViews: 0,
          resumeDownloads: 0,
          contactSubmissions: 0,
          totalProjects: memoryStore.projects.length,
          totalSkills: memoryStore.skills.length,
          totalServices: memoryStore.services.length,
          totalExperiences: memoryStore.experiences.length,
          totalEducation: memoryStore.education.length,
          totalCertifications: memoryStore.certifications.length,
          totalBlogs: memoryStore.blogs.length,
          totalTestimonials: memoryStore.testimonials.length,
          totalMessages: memoryStore.messages.length,
          unreadMessages: 0,
        },
        charts: {
          visitorsLast7Days: [],
          visitorsLast30Days: [],
          topViewedProjects: [],
          mostVisitedPages: [],
          downloadTrends: [],
          inquiryTrends: [],
        },
        recentActivities: [],
        recentMessages: [],
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve analytics dashboard statistics.',
        error: error.message,
      });
    }
  }

  /**
   * POST /api/analytics/visitor (Public)
   * Automatically track unique visitor by IP / Session
   */
  static async recordVisitor(req: Request, res: Response): Promise<void> {
    try {
      const clientIp = getClientIp(req);
      const userAgent = req.headers['user-agent'] || '';
      const referrer = req.body?.referrer || req.headers['referer'] || '';
      const sessionId = req.body?.sessionId || '';

      if (mongoose.connection.readyState === 1) {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        // Find existing visitor session in the last 24h
        let existing = await Visitor.findOne({
          $or: [
            { ip: clientIp, lastVisit: { $gte: todayStart } },
            ...(sessionId ? [{ sessionId }] : []),
          ],
        });

        let isNew = false;
        if (existing) {
          existing.lastVisit = new Date();
          existing.visitCount = (existing.visitCount || 1) + 1;
          if (sessionId && !existing.sessionId) existing.sessionId = sessionId;
          await existing.save();
        } else {
          isNew = true;
          existing = await Visitor.create({
            ip: clientIp,
            userAgent,
            referrer,
            sessionId,
            firstVisit: new Date(),
            lastVisit: new Date(),
            visitCount: 1,
          });

          // Log real activity feed entry
          await ActivityLog.create({
            type: 'visitor',
            title: 'New Unique Visitor',
            description: `Visitor from ${clientIp.slice(0, 15)} accessed portfolio`,
            metadata: { ip: clientIp, userAgent: userAgent.slice(0, 80), referrer },
            ip: clientIp,
          }).catch(() => null);
        }

        // Invalidate analytics cache
        analyticsCache = null;

        const totalVisitors = await Visitor.countDocuments();
        res.status(200).json({ success: true, isNew, totalVisitors });
        return;
      }

      res.status(200).json({ success: true, isNew: true, totalVisitors: 1 });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * POST /api/analytics/page-view (Public)
   * Automatically track route visits
   */
  static async recordPageView(req: Request, res: Response): Promise<void> {
    try {
      const path = req.body?.path || '/';
      const title = req.body?.title || '';
      const referrer = req.body?.referrer || req.headers['referer'] || '';
      const sessionId = req.body?.sessionId || '';
      const clientIp = getClientIp(req);
      const userAgent = req.headers['user-agent'] || '';

      // Skip internal next assets / static files
      if (path.startsWith('/_next') || path.startsWith('/api') || path.includes('.')) {
        res.status(200).json({ success: true, skipped: true });
        return;
      }

      if (mongoose.connection.readyState === 1) {
        await PageView.create({
          path,
          title,
          ip: clientIp,
          userAgent,
          referrer,
          sessionId,
        });

        // Invalidate cache
        analyticsCache = null;

        res.status(200).json({ success: true });
        return;
      }

      res.status(200).json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * POST /api/analytics/project-view (Public)
   * Track individual project interactions
   */
  static async recordProjectView(req: Request, res: Response): Promise<void> {
    try {
      const { projectId, projectTitle, projectSlug } = req.body;
      const clientIp = getClientIp(req);
      const userAgent = req.headers['user-agent'] || '';
      const sessionId = req.body?.sessionId || '';

      const title = projectTitle || 'Project';

      if (mongoose.connection.readyState === 1) {
        await ProjectView.create({
          projectId: projectId || '',
          projectSlug: projectSlug || '',
          projectTitle: title,
          ip: clientIp,
          userAgent,
          sessionId,
        });

        // Log real activity feed entry
        await ActivityLog.create({
          type: 'project_view',
          title: 'Project Viewed',
          description: `Explored project: "${title}"`,
          metadata: { projectId, projectTitle: title, projectSlug },
          ip: clientIp,
        }).catch(() => null);

        // Invalidate cache
        analyticsCache = null;

        res.status(200).json({ success: true, projectTitle: title });
        return;
      }

      res.status(200).json({ success: true, projectTitle: title });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * POST /api/analytics/resume-download (Public)
   * Track resume downloads
   */
  static async recordResumeDownload(req: Request, res: Response): Promise<void> {
    try {
      const source = req.body?.source || 'Direct';
      const clientIp = getClientIp(req);
      const userAgent = req.headers['user-agent'] || '';
      const referrer = req.body?.referrer || req.headers['referer'] || '';

      if (mongoose.connection.readyState === 1) {
        const download = await ResumeDownload.create({
          ip: clientIp,
          userAgent,
          referrer,
          source,
        });

        // Log real activity feed entry
        await ActivityLog.create({
          type: 'resume_download',
          title: 'Resume Downloaded',
          description: `Resume CV PDF downloaded via ${source}`,
          metadata: { source, downloadId: download._id },
          ip: clientIp,
        }).catch(() => null);

        await AuditLog.create({
          action: 'INDEXED',
          target: `Resume Downloaded (${source})`,
          author: 'Visitor',
          timestamp: new Date().toISOString(),
        }).catch(() => null);

        // Invalidate cache
        analyticsCache = null;

        const totalDownloads = await ResumeDownload.countDocuments();
        res.status(200).json({ success: true, resumeDownloads: totalDownloads });
        return;
      }

      res.status(200).json({ success: true, resumeDownloads: 1 });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * GET /api/analytics/audit-logs (Admin only)
   */
  static async getAuditLogs(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (mongoose.connection.readyState === 1) {
        const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(100);
        res.status(200).json({ success: true, count: logs.length, data: logs });
        return;
      }

      res.status(200).json({ success: true, count: memoryStore.auditLogs.length, data: memoryStore.auditLogs });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to retrieve audit logs.', error: error.message });
    }
  }
}

export default AnalyticsController;
