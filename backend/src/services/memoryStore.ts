export interface MemoryStoreData {
  projects: any[];
  skills: any[];
  blogs: any[];
  services: any[];
  experiences: any[];
  education: any[];
  certifications: any[];
  testimonials: any[];
  messages: any[];
  settings: any;
  now: any;
  aiKb: any[];
  auditLogs: any[];
}

export const memoryStore: MemoryStoreData = {
  projects: [],
  skills: [],
  services: [],
  experiences: [],
  education: [],
  certifications: [],
  testimonials: [],
  blogs: [],
  messages: [],
  settings: {
    heroTitle: 'Crafting High-Performance Full Stack Systems',
    heroSubtitle: 'Senior MERN & Next.js Engineer specializing in scalable distributed backends and premium web apps.',
    email: 'abdulbasith.dev@gmail.com',
    phone: '',
    github: 'https://github.com/Basiibnumoideen',
    linkedin: 'https://linkedin.com',
    resumeURL: '/resume.pdf',
    resumeUrl: '/resume.pdf',
    footerDescription: 'Designed with precision. Engineered for resilience.',
    footerContent: 'Designed with precision. Engineered for resilience.',
    socialLinks: {
      github: 'https://github.com/Basiibnumoideen',
      linkedin: 'https://linkedin.com',
      twitter: 'https://x.com',
      discord: '',
      leetcode: '',
    },
    stats: {
      totalVisitors: 0,
      pageViews: 0,
      projectViews: 0,
      resumeDownloads: 0,
      contactSubmissions: 0,
    },
  },
  now: {
    lastUpdated: 'Current',
    currentFocus: 'High-throughput full-stack architectures and agentic AI systems.',
    building: [],
    learning: [],
    reading: [],
    seeking: 'Open to select high-impact Senior Full Stack / Backend engineering positions.',
  },
  aiKb: [],
  auditLogs: [],
};
