import mongoose, { Schema, Document } from 'mongoose';

export interface ISiteSettings extends Document {
  logo?: string;
  avatar?: string;
  favicon?: string;
  heroTitle: string;
  heroSubtitle: string;
  email: string;
  phone?: string;
  github: string;
  linkedin: string;
  resumeURL: string;
  footerDescription: string;
  name?: string;
  location?: string;
  role?: string;
  // Aliases for compatibility
  resumeUrl?: string;
  footerContent?: string;
  socialLinks?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    discord?: string;
    leetcode?: string;
  };
  navLinks?: {
    home?: boolean;
    about?: boolean;
    projects?: boolean;
    skills?: boolean;
    experience?: boolean;
    services?: boolean;
    blog?: boolean;
    now?: boolean;
    uses?: boolean;
    contact?: boolean;
  };
  stats: {
    totalVisitors: number;
    pageViews: number;
    projectViews: number;
    resumeDownloads: number;
    contactSubmissions: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const SiteSettingsSchema = new Schema<ISiteSettings>(
  {
    name: { type: String, default: 'Muhammed Abdul Basith' },
    location: { type: String, default: 'Remote / Worldwide' },
    role: { type: String, default: 'Senior Full Stack Engineer' },
    logo: { type: String, default: '/basi-portrait.jpg' },
    avatar: { type: String, default: '/basi-portrait.jpg' },
    favicon: { type: String, default: '' },
    heroTitle: { type: String, default: 'Crafting High-Performance Full Stack Systems' },
    heroSubtitle: { type: String, default: 'Senior MERN & Next.js Engineer specializing in scalable distributed backends and premium web apps.' },
    email: { type: String, default: 'basi.dev@example.com' },
    phone: { type: String, default: '+91 8590882253' },
    github: { type: String, default: 'https://github.com/Basiibnumoideen' },
    linkedin: { type: String, default: 'https://linkedin.com' },
    resumeURL: { type: String, default: '/resume.pdf' },
    footerDescription: { type: String, default: 'Designed with precision. Engineered for resilience.' },
    resumeUrl: { type: String, default: '/resume.pdf' },
    footerContent: { type: String, default: 'Designed with precision. Engineered for resilience.' },
    socialLinks: {
      github: { type: String, default: 'https://github.com/Basiibnumoideen' },
      linkedin: { type: String, default: 'https://linkedin.com' },
      twitter: { type: String, default: 'https://x.com' },
      discord: { type: String, default: '' },
      leetcode: { type: String, default: '' },
    },
    navLinks: {
      home: { type: Boolean, default: true },
      about: { type: Boolean, default: true },
      projects: { type: Boolean, default: true },
      skills: { type: Boolean, default: true },
      experience: { type: Boolean, default: true },
      services: { type: Boolean, default: true },
      blog: { type: Boolean, default: true },
      now: { type: Boolean, default: true },
      uses: { type: Boolean, default: true },
      contact: { type: Boolean, default: true },
    },
    stats: {
      totalVisitors: { type: Number, default: 1420 },
      pageViews: { type: Number, default: 4890 },
      projectViews: { type: Number, default: 1820 },
      resumeDownloads: { type: Number, default: 342 },
      contactSubmissions: { type: Number, default: 28 },
    },
  },
  { timestamps: true }
);

export const SiteSettings = mongoose.models.SiteSettings || mongoose.model<ISiteSettings>('SiteSettings', SiteSettingsSchema);
export default SiteSettings;
