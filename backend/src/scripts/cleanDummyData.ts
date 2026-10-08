import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

import { Project } from '../models/Project';
import { Certification } from '../models/Certification';
import { ProjectView } from '../models/ProjectView';
import { Blog } from '../models/Blog';
import { Service } from '../models/Service';
import { Experience } from '../models/Experience';
import { Testimonial } from '../models/Testimonial';
import { Skill } from '../models/Skill';
import { Education } from '../models/Education';

async function runCleanup() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGO_URI is missing');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('⚡ Connected to MongoDB for dummy data purge.\n');

  // 1. ProjectViews with dummy slugs
  const dummySlugs = ['nexus-ai-workspaces', 'streamflow-distributed-pipeline', 'pulse-commerce-enterprise'];
  const deletedViews = await ProjectView.deleteMany({ projectSlug: { $in: dummySlugs } });
  console.log(`✓ Deleted ${deletedViews.deletedCount} dummy ProjectView records.`);

  // 2. Dummy seeded Blogs
  const deletedBlogs = await Blog.deleteMany({
    slug: { $in: ['architecting-resilient-realtime-microservices', 'react-19-server-actions-enterprise-practice'] }
  });
  console.log(`✓ Deleted ${deletedBlogs.deletedCount} dummy Blog records.`);

  // 3. Dummy seeded Services (matched by exact title and seeded icon discriminator)
  const deletedServices = await Service.deleteMany({
    $or: [
      { title: 'Full Stack Architecture & Web Apps', icon: 'Layers' },
      { title: 'Backend Systems & API Engineering', icon: 'Server' },
      { title: 'Performance & Architecture Auditing', icon: 'Cpu' },
    ]
  });
  console.log(`✓ Deleted ${deletedServices.deletedCount} dummy Service records.`);

  // 4. Dummy seeded Experience (matched by exact role, period, and company)
  const deletedExp = await Experience.deleteMany({
    company: 'CloudScale Technologies',
    role: 'Senior Full Stack & Backend Engineer',
    period: '2023 - Present',
  });
  console.log(`✓ Deleted ${deletedExp.deletedCount} dummy Experience records.`);

  // 5. Dummy seeded Testimonials (matched by exact name and company discriminator)
  const deletedTestimonials = await Testimonial.deleteMany({
    $or: [
      { name: 'Sarah Chen', company: 'Nexus Scale Labs' },
      { name: 'Marcus Vance', company: 'HyperFlow Systems' },
      { name: 'David Sterling', company: 'ApexScale Global' },
      { name: 'Elena Rostova', company: 'Vanguard Systems' },
    ]
  });
  console.log(`✓ Deleted ${deletedTestimonials.deletedCount} dummy Testimonial records.`);

  // 6. Clean dummy project slugs from Skill references
  const skills = await Skill.find({});
  let skillsUpdated = 0;
  for (const sk of skills) {
    if (Array.isArray(sk.projects) && sk.projects.length > 0) {
      const filtered = sk.projects.filter((p: string) => !dummySlugs.includes(p));
      if (filtered.length !== sk.projects.length) {
        sk.projects = filtered;
        await sk.save();
        skillsUpdated++;
      }
    }
  }
  console.log(`✓ Cleaned dummy project links from ${skillsUpdated} skills.`);

  // 7. Verify remaining Real Data
  console.log('\n=== REMAINING REAL DATABASE ASSETS ===');
  const remainingProjects = await Project.find({}).lean();
  console.log(`Projects (${remainingProjects.length}):`, remainingProjects.map((p: any) => p.title));

  const remainingCerts = await Certification.find({}).lean();
  console.log(`Certifications (${remainingCerts.length}):`, remainingCerts.map((c: any) => `${c.title} (${c.provider})`));

  const remainingEdu = await Education.find({}).lean();
  console.log(`Education (${remainingEdu.length}):`, remainingEdu.map((e: any) => `${e.degree} at ${e.school}`));

  await mongoose.disconnect();
  console.log('\n✓ Purge complete and verified.');
}

runCleanup().catch(err => {
  console.error('Purge error:', err);
  process.exit(1);
});
