import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

import { Project } from '../models/Project';
import { Certification } from '../models/Certification';
import { Blog } from '../models/Blog';
import { Service } from '../models/Service';
import { Skill } from '../models/Skill';
import { Education } from '../models/Education';
import { Experience } from '../models/Experience';

async function inspect() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) {
    console.error('No MONGO_URI found in environment.');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    const projects = await Project.find({}).lean();
    console.log(`\n=== PROJECTS (${projects.length}) ===`);
    projects.forEach((p: any) => console.log(`- [${p._id}] "${p.title}" (slug: ${p.slug})`));

    const certs = await Certification.find({}).lean();
    console.log(`\n=== CERTIFICATIONS (${certs.length}) ===`);
    certs.forEach((c: any) => console.log(`- [${c._id}] "${c.title}" (provider: ${c.provider}, id: ${c.credentialID}, image: ${c.image})`));

    const blogs = await Blog.find({}).lean();
    console.log(`\n=== BLOGS (${blogs.length}) ===`);
    blogs.forEach((b: any) => console.log(`- [${b._id}] "${b.title}"`));

    const services = await Service.find({}).lean();
    console.log(`\n=== SERVICES (${services.length}) ===`);
    services.forEach((s: any) => console.log(`- [${s._id}] "${s.title}"`));

    const skills = await Skill.find({}).lean();
    console.log(`\n=== SKILLS (${skills.length}) ===`);
    skills.forEach((s: any) => console.log(`- [${s._id}] "${s.name}"`));

    const edu = await Education.find({}).lean();
    console.log(`\n=== EDUCATION (${edu.length}) ===`);
    edu.forEach((e: any) => console.log(`- [${e._id}] "${e.degree}" at ${e.school}`));

    const exp = await Experience.find({}).lean();
    console.log(`\n=== EXPERIENCE (${exp.length}) ===`);
    exp.forEach((e: any) => console.log(`- [${e._id}] "${e.role}" at ${e.company}`));

    const { Testimonial } = await import('../models/Testimonial');
    const tests = await Testimonial.find({}).lean();
    console.log(`\n=== TESTIMONIALS (${tests.length}) ===`);
    tests.forEach((t: any) => console.log(`- [${t._id}] "${t.name}" (${t.company})`));

    const { ProjectView } = await import('../models/ProjectView');
    const dummyViews = await ProjectView.find({
      projectSlug: { $in: ['nexus-ai-workspaces', 'streamflow-distributed-pipeline', 'pulse-commerce-enterprise'] }
    }).lean();
    console.log(`\n=== DUMMY PROJECT VIEWS: ${dummyViews.length} ===`);
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
}

inspect().catch((err) => {
  console.error(err);
  process.exit(1);
});
