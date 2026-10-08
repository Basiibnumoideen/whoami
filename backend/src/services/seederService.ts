import mongoose from 'mongoose';
import { User } from '../models/User';
import { SiteSettings } from '../models/SiteSettings';
import { AuditLog } from '../models/AuditLog';
import { PageView } from '../models/PageView';
import { Visitor } from '../models/Visitor';
import { ResumeDownload } from '../models/ResumeDownload';

export const seedDatabase = async (): Promise<void> => {
  // Only execute database seeding when connected to MongoDB
  if (mongoose.connection.readyState !== 1) {
    console.log('⚡ MongoDB not currently connected: Memory fallback active.');
    return;
  }

  try {
    // 1. Seed or Sync Admin User from .env
    const adminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || '';
    const adminUsername = (process.env.ADMIN_USERNAME || 'basi').trim().toLowerCase();

    if (!adminEmail || !adminPassword) {
      console.warn('⚠️ ADMIN_EMAIL and ADMIN_PASSWORD are not set in .env. Admin authentication will be unavailable.');
    } else {
      let admin = await User.findOne({ $or: [{ email: adminEmail }, { username: adminUsername }, { role: 'admin' }] });

      if (!admin) {
        console.log(`⚡ No admin account found. Creating initial admin from .env (${adminEmail})...`);
        admin = new User({
          name: 'Portfolio Admin',
          username: adminUsername,
          email: adminEmail,
          password: adminPassword,
          role: 'admin',
          forcePasswordChange: false,
        });
        await admin.save();
        console.log(`✓ Admin created successfully from .env: ${adminEmail} (username: ${adminUsername})`);

        await AuditLog.create({
          action: 'CREATED',
          target: `Admin Account (${adminEmail})`,
          author: 'System Initializer',
          timestamp: new Date().toISOString(),
        });
      } else {
        // Sync credentials from .env if changed
        const isPasswordMatch = await admin.comparePassword(adminPassword);
        const needsUpdate = !isPasswordMatch || admin.email !== adminEmail || admin.username !== adminUsername || admin.forcePasswordChange;

        if (needsUpdate) {
          admin.email = adminEmail;
          admin.username = adminUsername;
          if (!isPasswordMatch) {
            admin.password = adminPassword; // Pre-save hook hashes with bcrypt
          }
          admin.forcePasswordChange = false;
          await admin.save();
          console.log(`✓ Admin credentials synchronized with .env: ${adminEmail} (username: ${adminUsername})`);
        } else {
          console.log(`✓ Admin account active: ${adminEmail} (username: ${adminUsername})`);
        }
      }
    }

    // 2. Seed Site Settings if not present
    const existingSettings = await SiteSettings.findOne();
    if (!existingSettings) {
      console.log('⚡ Seeding initial site settings...');
      await SiteSettings.create({
        heroTitle: 'Crafting High-Performance Full Stack Systems',
        heroSubtitle: 'Senior MERN & Next.js Engineer specializing in scalable distributed backends and premium web apps.',
        resumeUrl: '/resume.pdf',
        email: 'abdulbasith.dev@gmail.com',
        phone: '',
        socialLinks: {
          github: 'https://github.com/Basiibnumoideen',
          linkedin: 'https://linkedin.com',
          twitter: 'https://x.com',
          discord: '',
          leetcode: '',
        },
        footerContent: 'Designed with precision. Engineered for resilience.',
        stats: {
          totalVisitors: 0,
          resumeDownloads: 0,
        },
      });
      console.log('✓ Initial Site Settings seeded');
    }

    // NOTE: All content collections (Projects, Certifications, Blogs, Services, Experience, Education, Testimonials)
    // are ONLY populated via user uploads to MongoDB. Dummy placeholder data is intentionally disabled.

    // 3. Baseline Analytics Telemetry (strictly gated behind explicit opt-in SEED_DEMO_TELEMETRY=true)
    const seedDemoTelemetry = process.env.SEED_DEMO_TELEMETRY === 'true';
    if (seedDemoTelemetry) {
      const pageViewCount = await PageView.countDocuments();
      const visitorCount = await Visitor.countDocuments();
      if (pageViewCount === 0 && visitorCount === 0) {
        console.log('⚡ Initializing baseline analytics telemetry (opt-in enabled)...');
        const now = Date.now();
        const routes = ['/', '/projects', '/skills', '/about', '/contact'];
        const pageViewDocs: any[] = [];
        const visitorDocs: any[] = [];

        for (let day = 14; day >= 0; day--) {
          const dayTime = now - day * 24 * 60 * 60 * 1000;
          const dateObj = new Date(dayTime);
          const visitorsToday = Math.max(3, Math.round(8 + (day % 3) * 2));
          const viewsToday = Math.max(6, Math.round(visitorsToday * 2));

          for (let v = 0; v < visitorsToday; v++) {
            const vIp = `198.51.100.${(day * 7 + v * 3 + 1) % 250 + 1}`;
            visitorDocs.push({
              ip: vIp,
              userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              referrer: v % 2 === 0 ? 'https://google.com' : 'https://linkedin.com',
              sessionId: `sess_init_${day}_${v}`,
              firstVisit: dateObj,
              lastVisit: dateObj,
              visitCount: 1,
              createdAt: dateObj,
              updatedAt: dateObj,
            });
          }

          for (let p = 0; p < viewsToday; p++) {
            const route = routes[p % routes.length];
            const vIp = `198.51.100.${(day * 7 + (p % visitorsToday) * 3 + 1) % 250 + 1}`;
            pageViewDocs.push({
              path: route,
              title: route === '/' ? 'Home — Portfolio' : `${route.slice(1).toUpperCase()} — Portfolio`,
              ip: vIp,
              userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              referrer: 'https://google.com',
              sessionId: `sess_init_${day}_${p % visitorsToday}`,
              createdAt: dateObj,
            });
          }
        }

        if (visitorDocs.length > 0) await Visitor.insertMany(visitorDocs);
        if (pageViewDocs.length > 0) await PageView.insertMany(pageViewDocs);
        console.log('✓ Baseline analytics telemetry initialized');
      }
    }

    // 4. Baseline Audit Log if empty
    const auditCount = await AuditLog.countDocuments();
    if (auditCount === 0) {
      await AuditLog.create({
        action: 'CREATED',
        target: 'Portfolio System Initialized',
        author: 'System',
        timestamp: new Date().toISOString(),
      });
    }

  } catch (error: any) {
    console.warn(`Seeder notice: ${error.message}`);
  }
};

export default seedDatabase;
