import mongoose from 'mongoose';
import { User } from '../models/User';
import { Project } from '../models/Project';
import { Skill } from '../models/Skill';
import { Service } from '../models/Service';
import { Experience } from '../models/Experience';
import { Education } from '../models/Education';
import { Blog } from '../models/Blog';
import { SiteSettings } from '../models/SiteSettings';
import { NowUpdate } from '../models/NowUpdate';
import { AIKnowledgeBase } from '../models/AIKnowledgeBase';
import { AuditLog } from '../models/AuditLog';
import { Certification } from '../models/Certification';
import { Testimonial } from '../models/Testimonial';

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

    // 2. Seed Site Settings
    const existingSettings = await SiteSettings.findOne();
    if (!existingSettings) {
      console.log('⚡ Seeding initial site settings...');
      await SiteSettings.create({
        heroTitle: 'Crafting High-Performance Full Stack Systems',
        heroSubtitle: 'Senior MERN & Next.js Engineer specializing in scalable distributed backends and premium web apps.',
        resumeUrl: '/resume.pdf',
        email: 'basi.dev@example.com',
        phone: '+1 (555) 019-2834',
        socialLinks: {
          github: 'https://github.com',
          linkedin: 'https://linkedin.com',
          twitter: 'https://x.com',
          discord: '',
          leetcode: '',
        },
        footerContent: 'Designed with precision. Engineered for resilience.',
        stats: {
          totalVisitors: 1420,
          resumeDownloads: 342,
        },
      });
      console.log('✓ Initial Site Settings seeded');
    }

    // 3. Seed Skills if empty
    const skillCount = await Skill.countDocuments();
    if (skillCount === 0) {
      console.log('⚡ Seeding default skills...');
      const defaultSkills = [
        { name: 'React 19', category: 'Frontend', level: 95, experience: '3+ Years', order: 1, projects: ['nexus-ai-workspaces', 'pulse-commerce-enterprise'] },
        { name: 'Next.js 16', category: 'Frontend', level: 92, experience: '2+ Years', order: 2, projects: ['nexus-ai-workspaces', 'pulse-commerce-enterprise'] },
        { name: 'TypeScript', category: 'Frontend', level: 90, experience: '3+ Years', order: 3, projects: ['nexus-ai-workspaces', 'pulse-commerce-enterprise'] },
        { name: 'Node.js', category: 'Backend', level: 94, experience: '3+ Years', order: 4, projects: ['streamflow-distributed-pipeline', 'nexus-ai-workspaces'] },
        { name: 'Express.js', category: 'Backend', level: 92, experience: '3+ Years', order: 5, projects: ['streamflow-distributed-pipeline'] },
        { name: 'MongoDB Atlas', category: 'Database', level: 90, experience: '3+ Years', order: 6, projects: ['pulse-commerce-enterprise', 'streamflow-distributed-pipeline'] },
        { name: 'PostgreSQL', category: 'Database', level: 85, experience: '2+ Years', order: 7, projects: ['streamflow-distributed-pipeline'] },
        { name: 'Redis', category: 'Database', level: 88, experience: '2+ Years', order: 8, projects: ['streamflow-distributed-pipeline'] },
        { name: 'Docker', category: 'DevOps & Cloud', level: 86, experience: '2+ Years', order: 9, projects: ['streamflow-distributed-pipeline'] },
        { name: 'Tailwind CSS v4', category: 'Frontend', level: 95, experience: '3+ Years', order: 10, projects: ['nexus-ai-workspaces'] },
      ];
      await Skill.insertMany(defaultSkills);
      console.log(`✓ Seeded ${defaultSkills.length} default skills`);
    }

    // 4. Seed Projects if empty
    const projectCount = await Project.countDocuments();
    if (projectCount === 0) {
      console.log('⚡ Seeding default projects...');
      const defaultProjects = [
        {
          title: 'Nexus AI Workspaces',
          slug: 'nexus-ai-workspaces',
          description: 'Enterprise AI orchestration workspace with streaming collaborative canvases and LLM memory routers.',
          category: 'Full Stack',
          tags: ['Next.js 16', 'React 19', 'TypeScript', 'Node.js', 'MongoDB', 'Redis', 'Tailwind CSS'],
          metrics: '<120ms latency at 50k DAU',
          featured: true,
          order: 1,
          bentoSpan: 'col-span-2 row-span-2',
          problem: 'Teams struggle to collaborate with generative AI agents synchronously across stateful documents without context collisions.',
          approach: 'Built an event-driven CRDT sync engine atop Node.js microservices and Redis state stores with Next.js 16 App Router UI.',
          result: 'Achieved sub-120ms token distribution latency and eliminated multi-agent race conditions across distributed sessions.',
          demoUrl: 'https://example.com/demo/nexus',
          githubUrl: 'https://github.com/example/nexus-ai-workspaces',
          image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
          keyFeatures: ['Multi-agent turn arbitration', 'Vector semantic memory cache', 'Sub-second collaborative CRDT canvas'],
        },
        {
          title: 'StreamFlow Distributed Pipeline',
          slug: 'streamflow-distributed-pipeline',
          description: 'High-throughput real-time telemetry processing backend handling millions of ingestion events.',
          category: 'Backend Architecture',
          tags: ['Node.js', 'TypeScript', 'Redis Streams', 'Docker', 'MongoDB Atlas'],
          metrics: '4.2M events/sec peak',
          featured: true,
          order: 2,
          bentoSpan: 'col-span-1 row-span-1',
          problem: 'Legacy ingestion systems throttled and dropped telemetry data during spike loads.',
          approach: 'Implemented distributed backpressure with Redis cluster queuing and partitioned worker workers.',
          result: 'Processed 4.2M events/sec without a single dropped packet over 99.995% SLA.',
          demoUrl: 'https://example.com/demo/streamflow',
          githubUrl: 'https://github.com/example/streamflow',
          image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
          keyFeatures: ['Dynamic backpressure management', 'Zero-allocation buffer parser', 'Dead-letter automated replay'],
        },
        {
          title: 'Pulse Commerce Enterprise',
          slug: 'pulse-commerce-enterprise',
          description: 'Headless global retail commerce platform with sub-second catalog indexing and dynamic checkout.',
          category: 'Full Stack',
          tags: ['Next.js 16', 'TypeScript', 'MongoDB', 'Stripe', 'Tailwind CSS'],
          metrics: '99.99% checkout conversion',
          featured: true,
          order: 3,
          bentoSpan: 'col-span-1 row-span-1',
          problem: 'High cart abandonment due to multi-step legacy checkout workflows.',
          approach: 'Designed single-call optimistic checkout with Stripe Payment Element and edge caching.',
          result: 'Reduced checkout abandonment by 34% and improved mobile latency to 380ms.',
          demoUrl: 'https://example.com/demo/pulse',
          githubUrl: 'https://github.com/example/pulse-commerce',
          image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
          keyFeatures: ['Optimistic inventory reservation', 'Multi-currency settlement', 'Edge server-side rendered catalogs'],
        }
      ];
      await Project.insertMany(defaultProjects);
      console.log(`✓ Seeded ${defaultProjects.length} default projects`);
    }

    // 5. Seed Blogs if empty
    const blogCount = await Blog.countDocuments();
    if (blogCount === 0) {
      console.log('⚡ Seeding default blogs...');
      const defaultBlogs = [
        {
          title: 'Architecting Resilient Real-Time Microservices with Node.js and Redis',
          slug: 'architecting-resilient-realtime-microservices',
          excerpt: 'A deep dive into distributed backpressure, atomic pub/sub leases, and fault-tolerant ingestion pipelines at scale.',
          category: 'Architecture',
          tags: ['Node.js', 'Distributed Systems', 'Redis', 'Backend'],
          readingTime: '7 min read',
          published: true,
          views: 1240,
          publishedAt: new Date(),
          coverImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
          content: '## Architectural Foundations\n\nDesigning distributed backends requires rigorous guarantees around idempotency, message acknowledgment, and state isolation...',
        },
        {
          title: 'React 19 Server Actions and Next.js App Router in Enterprise Practice',
          slug: 'react-19-server-actions-enterprise-practice',
          excerpt: 'Benchmarking optimistic state mutations, form validation paradigms, and caching lifecycles in mission-critical applications.',
          category: 'Frontend Engineering',
          tags: ['React 19', 'Next.js', 'Performance', 'TypeScript'],
          readingTime: '5 min read',
          published: true,
          views: 980,
          publishedAt: new Date(),
          coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
          content: '## Evolution of Mutation Semantics\n\nServer Actions decouple network orchestration from imperative client handlers while preserving zero-JS fallbacks...',
        },
      ];
      await Blog.insertMany(defaultBlogs);
      console.log(`✓ Seeded ${defaultBlogs.length} default blogs`);
    }

    // 6. Seed Services if empty
    const serviceCount = await Service.countDocuments();
    if (serviceCount === 0) {
      console.log('⚡ Seeding default services...');
      const defaultServices = [
        {
          title: 'Full Stack Architecture & Web Apps',
          description: 'Turnkey development of mission-critical Next.js 16 and Node.js web applications designed for enterprise velocity and scale.',
          icon: 'Layers',
          deliverables: ['Production Next.js 16 App', 'TypeScript REST & GraphQL APIs', 'Continuous Delivery pipeline'],
          sla: '2-4 Weeks',
          order: 1,
        },
        {
          title: 'Backend Systems & API Engineering',
          description: 'High-throughput Node.js microservices, distributed messaging, Redis caching layers, and resilient database schemas.',
          icon: 'Server',
          deliverables: ['Sub-100ms response microservices', 'Database indexing & sharding design', 'End-to-end OpenAPI documentation'],
          sla: '1-3 Weeks',
          order: 2,
        },
        {
          title: 'Performance & Architecture Auditing',
          description: 'Deep-dive analysis of bottlenecks across database queries, memory leaks, latency spikes, and Core Web Vitals.',
          icon: 'Cpu',
          deliverables: ['Full architecture assessment', 'Actionable remediation roadmap', 'Hands-on performance refactoring'],
          sla: '3-5 Days',
          order: 3,
        },
      ];
      await Service.insertMany(defaultServices);
      console.log(`✓ Seeded ${defaultServices.length} default services`);
    }

    // 7. Seed Experience & Education if empty
    const expCount = await Experience.countDocuments();
    if (expCount === 0) {
      await Experience.create({
        role: 'Senior Full Stack & Backend Engineer',
        company: 'CloudScale Technologies',
        location: 'Remote, US',
        period: '2023 - Present',
        type: 'Full-time',
        description: 'Architecting distributed Node.js microservices and Next.js frontend applications for 100k+ global active users.',
        achievements: [
          'Engineered event ingestion microservices handling 4.2M events/day with 99.99% uptime',
          'Reduced API p99 latency from 680ms to 94ms via Redis multi-tier caching and Mongo index tuning',
          'Spearheaded transition to Next.js 15/16 App Router, boosting Core Web Vitals to 99/100',
        ],
        skills: ['Node.js', 'Next.js', 'TypeScript', 'MongoDB', 'Docker', 'Redis'],
        order: 1,
      });
    }

    const eduCount = await Education.countDocuments();
    if (eduCount === 0) {
      await Education.create({
        degree: 'Bachelor of Science in Computer Science & Engineering',
        school: 'Institute of Engineering & Technology',
        period: '2019 - 2023',
        gpa: '3.8 / 4.0',
        highlights: ['Algorithms & Data Structures', 'Distributed Systems', 'Software Architecture'],
        order: 1,
      });
    }

    // 8. Seed Now Update
    const nowCount = await NowUpdate.countDocuments();
    if (nowCount === 0) {
      await NowUpdate.create({
        lastUpdated: 'September 2026',
        currentFocus: 'High-throughput event streaming architectures and React 19 concurrent state systems.',
        building: ['Nexus AI Workspaces v2.0', 'Distributed CRDT document synchronizer'],
        learning: ['Rust systems programming for high-concurrency micro-daemons', 'eBPF network packet tracing'],
        reading: ['Designing Data-Intensive Applications (Kleppmann)', 'Database Internals (Petrov)'],
        seeking: 'Open to select high-impact Senior Full Stack / Backend engineering positions.',
      });
    }

    // 9. Seed AI Knowledge Base
    const kbCount = await AIKnowledgeBase.countDocuments();
    if (kbCount === 0) {
      await AIKnowledgeBase.insertMany([
        { topic: 'Core Tech Stack', category: 'Technical', content: 'Specializes in MERN stack, Next.js 16, React 19, TypeScript, Docker, Redis, and high-performance microservices.' },
        { topic: 'Availability', category: 'Career', content: 'Currently open to senior full stack roles, contract consulting, and enterprise system architecture projects.' },
        { topic: 'Contact', category: 'General', content: 'Can be reached directly at basi.dev@example.com or through the website contact form.' },
      ]);
    }

    // 10. Seed Certifications
    const certCount = await Certification.countDocuments();
    if (certCount === 0) {
      console.log('⚡ Seeding default certifications...');
      await Certification.insertMany([
        {
          title: 'AWS Certified Solutions Architect – Associate',
          provider: 'Amazon Web Services',
          issueDate: '2024',
          credentialID: 'AWS-SAA-839210',
          image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80',
          verifyURL: 'https://aws.amazon.com/verification',
          order: 1,
        },
        {
          title: 'MongoDB Certified Developer Associate',
          provider: 'MongoDB University',
          issueDate: '2023',
          credentialID: 'MDB-DEV-49201',
          image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80',
          verifyURL: 'https://learn.mongodb.com/certificates',
          order: 2,
        },
      ]);
      console.log('✓ Seeded default certifications');
    }

    // 11. Seed Testimonials
    const testCount = await Testimonial.countDocuments();
    if (testCount === 0) {
      console.log('⚡ Seeding default testimonials...');
      await Testimonial.insertMany([
        {
          name: 'Sarah Chen',
          role: 'VP of Engineering',
          company: 'Nexus Scale Labs',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80',
          content: 'Basi transformed our distributed backend infrastructure. His deep understanding of Node.js event loops and MongoDB indexing slashed our query latency by 85%.',
          rating: 5,
          order: 1,
        },
        {
          name: 'Marcus Vance',
          role: 'Chief Technology Officer',
          company: 'HyperFlow Systems',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
          content: 'One of the most capable full-stack architects I have partnered with. Delivers clean, production-grade Next.js and MERN systems with unmatched speed and rigor.',
          rating: 5,
          order: 2,
        },
      ]);
      console.log('✓ Seeded default testimonials');
    }

  } catch (error: any) {
    console.warn(`Seeder notice: ${error.message}`);
  }
};

export default seedDatabase;
