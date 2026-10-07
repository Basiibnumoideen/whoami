export interface Project {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  metrics: string;
  featured: boolean;
  bentoSpan?: string;
  problem: string;
  approach: string;
  result: string;
  demoUrl: string;
  githubUrl: string;
  image: string;
  keyFeatures: string[];
}

export interface Skill {
  name: string;
  category: string;
  level: number;
  experience: string;
  projects: string[];
  iconName?: string;
}

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  location: string;
  period: string;
  type: 'Full-time' | 'Freelance' | 'Internship' | 'Contract';
  description: string;
  achievements: string[];
  skills: string[];
}

export interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  period: string;
  grade: string;
  highlights: string[];
}

export interface AchievementItem {
  id: string;
  title: string;
  organization: string;
  year: string;
  description: string;
  badge?: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  category: string;
  tags: string[];
  publishedAt: string;
  readingTime: string;
  content: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  deliverables: string[];
  timeline: string;
  technologies: string[];
  icon: string;
}

export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  role: string;
  company: string;
  avatar: string;
}

export const PERSONAL_INFO = {
  name: 'Muhammed Abdul Basith',
  shortName: 'Basi',
  role: 'MERN Stack Developer & Product Engineer',
  tagline: 'Building production-grade, beautifully crafted web software that elevates user experience and delivers measurable business impact.',
  bio: 'Passionate full-stack developer specializing in modern MERN stack, Next.js, and AI-enabled web applications. I bridge the gap between engineering rigor and aesthetic perfection, creating intuitive tools that solve real problems.',
  location: 'Kozhikode, India / Remote Worldwide',
  email: 'abdulbasith.dev@gmail.com',
  github: 'https://github.com/Basiibnumoideen',
  linkedin: 'https://linkedin.com',
  twitter: 'https://x.com',
  availableForWork: true,
  status: 'Open to Full-Time Roles & High-Impact Contracts',
  stats: [
    { label: 'Projects Completed', value: '18+' },
    { label: 'Core Technologies', value: '25+' },
    { label: 'Client Satisfaction', value: '100%' },
    { label: 'Codebase Uptime', value: '99.9%' },
  ],
};

export const PROJECTS: Project[] = [
  {
    id: 'nexus-ai',
    slug: 'nexus-ai-workspaces',
    title: 'Nexus AI Workspaces',
    description: 'Collaborative engineering workspace featuring real-time AI code review, semantic search, and multi-user document synchronization.',
    category: 'AI / MERN',
    tags: ['Next.js 16', 'Express.js', 'MongoDB', 'Anthropic Claude', 'WebSockets', 'Tailwind CSS'],
    metrics: '62% Faster Code Review · 2,400+ Active Docs',
    featured: true,
    bentoSpan: 'col-span-1 md:col-span-2 row-span-1',
    problem: 'Engineering teams suffered from context fragmentation when jumping between code repositories, documentation, and external AI chat interfaces.',
    approach: 'Engineered a unified MERN application utilizing streaming Anthropic Claude Haiku API, live WebSockets for operational transforms, and MongoDB Atlas Vector Search for instant context grounding.',
    result: 'Reduced average pull request review turnaround by 62% and achieved sub-80ms real-time typing synchronization across concurrent team members.',
    demoUrl: 'https://demo.nexus-ai.dev',
    githubUrl: 'https://github.com/basi-dev/nexus-ai-workspaces',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
    keyFeatures: [
      'Interactive AI Assistant powered by Claude Haiku with grounded context',
      'Real-time collaborative editing with operational transform protocol',
      'MongoDB Vector Indexing for instant knowledge retrieval',
      'End-to-end encrypted project workspaces and role-based permissions'
    ]
  },
  {
    id: 'pulse-commerce',
    slug: 'pulse-commerce-enterprise',
    title: 'PulseCommerce Platform',
    description: 'Ultra-fast headless e-commerce store with edge-rendered catalog, instant search, and integrated Stripe Connect checkout.',
    category: 'Full Stack',
    tags: ['React 19', 'Next.js 16', 'TypeScript', 'Node.js', 'Redis', 'Stripe'],
    metrics: '-48% Page Load Time · 99.98% Peak Uptime',
    featured: true,
    bentoSpan: 'col-span-1 md:col-span-1 row-span-1',
    problem: 'Traditional monolithic storefront suffered from a sluggish 4.2s mobile load time and unacceptable cart abandonment rates over 45%.',
    approach: 'Architected a decoupled headless frontend on Next.js 16 App Router using Partial Prerendering (PPR), paired with an Express microservice backend backed by Redis sub-millisecond caching.',
    result: 'Decreased First Contentful Paint (FCP) from 4.2s to 0.8s, driving a 28% increase in checkout conversions during high-traffic flash campaigns.',
    demoUrl: 'https://pulse-commerce.demo',
    githubUrl: 'https://github.com/basi-dev/pulse-commerce',
    image: 'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=800&q=80',
    keyFeatures: [
      'Next.js 16 Partial Prerendering for lightning-fast product pages',
      'Sub-50ms fuzzy product search powered by Redis Search',
      'Dynamic inventory locking during concurrent checkout flows',
      'Complete merchant analytics dashboard with real-time sales graphs'
    ]
  },
  {
    id: 'devflow-canvas',
    slug: 'devflow-canvas',
    title: 'DevFlow Visual Automation',
    description: 'Node-based interactive workflow canvas for orchestrating backend microservices, webhooks, and third-party API pipelines.',
    category: 'Tools',
    tags: ['React 19', 'Node.js', 'MongoDB', 'GSAP', 'Tailwind CSS', 'Docker'],
    metrics: '3x Faster CI/CD Setup · Zero YAML Syntax Errors',
    featured: true,
    bentoSpan: 'col-span-1 md:col-span-1 row-span-1',
    problem: 'Developers spent hours debugging convoluted multi-stage YAML pipelines and manual API glue scripts for internal backend services.',
    approach: 'Constructed an intuitive visual canvas with GSAP hardware-accelerated pan-zoom, instant schema validation, and an automatic Node.js runtime code generator.',
    result: 'Cut developer pipeline scaffolding time by 66%, completely eliminating human syntax errors across 50+ deployed microservice instances.',
    demoUrl: 'https://devflow.demo',
    githubUrl: 'https://github.com/basi-dev/devflow-canvas',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    keyFeatures: [
      'Infinite canvas with smooth GPU acceleration using GSAP and Canvas API',
      'Real-time dependency graph cycle detection algorithm',
      'One-click export to production-ready Express.js middleware stacks',
      'Integrated mock execution playground with simulated payload tracing'
    ]
  },
  {
    id: 'apex-finance',
    slug: 'apex-financial-analytics',
    title: 'Apex Financial Intelligence',
    description: 'High-frequency market intelligence platform visualizing crypto and equity streams with sub-50ms tick updates and predictive charting.',
    category: 'Frontend',
    tags: ['Next.js 16', 'TypeScript', 'WebSockets', 'Tailwind CSS', 'Motion'],
    metrics: '60 FPS Charting · Sub-50ms Live Tick Sync',
    featured: true,
    bentoSpan: 'col-span-1 md:col-span-2 row-span-1',
    problem: 'Financial traders experienced severe UI freezes and frame drops when rendering high-volume tick data over standard HTTP polling.',
    approach: 'Implemented streaming WebSocket subscriptions with typed binary packet decoding and throttled render buffers, decoupled into lightweight requestAnimationFrame render cycles.',
    result: 'Achieved rock-solid 60 FPS performance without memory leaks, handling upwards of 15,000 tick updates per minute flawlessly.',
    demoUrl: 'https://apex-finance.demo',
    githubUrl: 'https://github.com/basi-dev/apex-finance',
    image: 'https://images.unsplash.com/photo-1642543491849-c1f93f655648?auto=format&fit=crop&w=1200&q=80',
    keyFeatures: [
      'Custom financial candlestick and depth chart render engine',
      'Real-time WebSocket data stream with automated reconnection exponential backoff',
      'Portfolio risk simulation calculator with customizable volatility levers',
      'Dark-mode optimized UI designed for extended viewing comfort'
    ]
  },
  {
    id: 'cloudpulse',
    slug: 'cloudpulse-infrastructure-apm',
    title: 'CloudPulse APM Suite',
    description: 'Lightweight application performance monitoring with real-time error tracking, distributed request tracing, and JWT-secured RBAC.',
    category: 'Full Stack',
    tags: ['Express.js', 'MongoDB', 'Node.js', 'JWT', 'Tailwind CSS'],
    metrics: '80% Cost Reduction vs Datadog · 10k req/s Tested',
    featured: false,
    problem: 'Small startups and independent creators were priced out of enterprise APM tools with exorbitant monthly per-seat pricing models.',
    approach: 'Built a lightweight Node.js telemetry collector utilizing MongoDB time-series collections, automated index expiration, and an intuitive management dashboard.',
    result: 'Delivered 80% cost savings for early-stage teams while maintaining full distributed trace visibility and sub-second anomaly alert delivery.',
    demoUrl: 'https://cloudpulse.demo',
    githubUrl: 'https://github.com/basi-dev/cloudpulse-apm',
    image: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=800&q=80',
    keyFeatures: [
      'Drop-in Express.js middleware SDK with automatic route instrumentation',
      'MongoDB time-series bucket storage with automatic data compaction',
      'Role-based access control (Admin, Developer, Viewer) with JWT refresh tokens',
      'Custom webhook notifications to Slack, Discord, and Telegram'
    ]
  }
];

export const SKILLS: Skill[] = [
  // Frontend
  { name: 'React 19', category: 'Frontend', level: 95, experience: '3+ Years', projects: ['nexus-ai-workspaces', 'pulse-commerce-enterprise', 'devflow-canvas', 'apex-financial-analytics'] },
  { name: 'Next.js 16', category: 'Frontend', level: 92, experience: '2+ Years', projects: ['nexus-ai-workspaces', 'pulse-commerce-enterprise', 'apex-financial-analytics'] },
  { name: 'TypeScript', category: 'Frontend', level: 90, experience: '3+ Years', projects: ['nexus-ai-workspaces', 'pulse-commerce-enterprise', 'devflow-canvas', 'apex-financial-analytics'] },
  { name: 'Tailwind CSS v4', category: 'Frontend', level: 95, experience: '3+ Years', projects: ['nexus-ai-workspaces', 'pulse-commerce-enterprise', 'devflow-canvas', 'apex-financial-analytics'] },
  { name: 'Motion / Framer Motion', category: 'Frontend', level: 88, experience: '2+ Years', projects: ['apex-financial-analytics', 'pulse-commerce-enterprise'] },
  { name: 'GSAP + ScrollTrigger', category: 'Frontend', level: 85, experience: '2+ Years', projects: ['devflow-canvas'] },
  { name: 'HTML5 / Modern CSS', category: 'Frontend', level: 98, experience: '4+ Years', projects: ['nexus-ai-workspaces', 'pulse-commerce-enterprise', 'devflow-canvas'] },

  // Backend
  { name: 'Node.js 24', category: 'Backend', level: 92, experience: '3+ Years', projects: ['nexus-ai-workspaces', 'pulse-commerce-enterprise', 'devflow-canvas', 'cloudpulse-infrastructure-apm'] },
  { name: 'Express.js', category: 'Backend', level: 94, experience: '3+ Years', projects: ['nexus-ai-workspaces', 'pulse-commerce-enterprise', 'devflow-canvas', 'cloudpulse-infrastructure-apm'] },
  { name: 'RESTful API Design', category: 'Backend', level: 95, experience: '3+ Years', projects: ['nexus-ai-workspaces', 'pulse-commerce-enterprise', 'cloudpulse-infrastructure-apm'] },
  { name: 'JWT & OAuth Auth', category: 'Backend', level: 90, experience: '2+ Years', projects: ['cloudpulse-infrastructure-apm', 'nexus-ai-workspaces'] },
  { name: 'WebSockets', category: 'Backend', level: 86, experience: '2+ Years', projects: ['nexus-ai-workspaces', 'apex-financial-analytics'] },

  // Database & Cloud
  { name: 'MongoDB Atlas', category: 'Database & Cloud', level: 92, experience: '3+ Years', projects: ['nexus-ai-workspaces', 'devflow-canvas', 'cloudpulse-infrastructure-apm'] },
  { name: 'Mongoose ODM', category: 'Database & Cloud', level: 94, experience: '3+ Years', projects: ['nexus-ai-workspaces', 'devflow-canvas', 'cloudpulse-infrastructure-apm'] },
  { name: 'Redis Caching', category: 'Database & Cloud', level: 82, experience: '1+ Years', projects: ['pulse-commerce-enterprise'] },
  { name: 'Cloudinary CDN', category: 'Database & Cloud', level: 88, experience: '2+ Years', projects: ['nexus-ai-workspaces', 'pulse-commerce-enterprise'] },
  { name: 'Docker Containerization', category: 'Database & Cloud', level: 80, experience: '1+ Years', projects: ['devflow-canvas'] },
  { name: 'Vercel & Render', category: 'Database & Cloud', level: 90, experience: '3+ Years', projects: ['nexus-ai-workspaces', 'pulse-commerce-enterprise'] },

  // AI & Tools
  { name: 'Anthropic Claude API', category: 'AI & Tools', level: 88, experience: '1+ Years', projects: ['nexus-ai-workspaces'] },
  { name: 'Zod Validation', category: 'AI & Tools', level: 92, experience: '2+ Years', projects: ['nexus-ai-workspaces', 'pulse-commerce-enterprise', 'cloudpulse-infrastructure-apm'] },
  { name: 'Git & GitHub Workflows', category: 'AI & Tools', level: 94, experience: '4+ Years', projects: ['nexus-ai-workspaces', 'pulse-commerce-enterprise', 'devflow-canvas'] },
  { name: 'Postman & API Testing', category: 'AI & Tools', level: 90, experience: '3+ Years', projects: ['cloudpulse-infrastructure-apm', 'nexus-ai-workspaces'] },
];

export const EXPERIENCES: ExperienceItem[] = [
  {
    id: 'exp-1',
    role: 'Full Stack MERN Developer',
    company: 'Independent Contractor / Freelancer',
    location: 'Remote',
    period: '2024 — Present',
    type: 'Freelance',
    description: 'Delivering end-to-end web applications, custom API microservices, and AI-powered interfaces for startup founders and business clients.',
    achievements: [
      'Shipped 10+ custom web applications with Next.js and Node.js with 100% 5-star client ratings.',
      'Constructed scalable MongoDB schemas with custom compound indexing, cutting query latencies by up to 55%.',
      'Implemented robust JWT authentication with rotating refresh tokens, rate limiting, and RBAC.',
      'Integrated Anthropic and OpenAI LLM endpoints for contextual customer assistants.'
    ],
    skills: ['Next.js 16', 'Express.js', 'MongoDB', 'TypeScript', 'Tailwind CSS', 'Claude API']
  },
  {
    id: 'exp-2',
    role: 'MERN Stack Engineering Intern',
    company: 'TechVanguard Labs',
    location: 'Hybrid',
    period: '2023 — 2024',
    type: 'Internship',
    description: 'Collaborated with senior software architects to develop enterprise client portals and high-throughput REST APIs.',
    achievements: [
      'Assisted in refactoring legacy Express monolithic routes into decoupled controller-service architectures.',
      'Built automated unit and integration tests covering critical user authentication and billing paths.',
      'Reduced frontend bundle sizes by 35% through tree shaking, dynamic imports, and image pipeline optimization.'
    ],
    skills: ['React', 'Node.js', 'Express.js', 'MongoDB', 'Git', 'REST APIs']
  }
];

export const EDUCATION: EducationItem[] = [
  {
    id: 'edu-1',
    degree: 'Bachelor of Technology (B.Tech) in Computer Science & Engineering',
    institution: 'APJ Abdul Kalam Technological University',
    period: '2020 — 2024',
    grade: 'First Class with Distinction',
    highlights: [
      'Core coursework: Data Structures, Algorithms, Database Management Systems, Computer Networks, Operating Systems',
      'Led the Departmental Web Development and Open-Source Technology Student Chapter',
      'Final year capstone: Distributed Real-time Collaborative Engine with MERN Stack'
    ]
  }
];

export const ACHIEVEMENTS: AchievementItem[] = [
  {
    id: 'ach-1',
    title: 'Winner — State Level Web Hackathon 2024',
    organization: 'Kerala Tech Conclave',
    year: '2024',
    description: 'Built an emergency response coordination platform utilizing real-time geolocation tracking and WebSockets under 24 hours.',
    badge: '1st Place'
  },
  {
    id: 'ach-2',
    title: '500+ Algorithmic Problems Solved',
    organization: 'LeetCode & GeeksforGeeks',
    year: '2023 — 2024',
    description: 'Demonstrated deep problem-solving skills across Graphs, Dynamic Programming, Trees, and System Design fundamentals.',
    badge: 'Top 8%'
  },
  {
    id: 'ach-3',
    title: 'Meta Certified Frontend Developer',
    organization: 'Meta / Coursera',
    year: '2023',
    description: 'Rigorous 9-course certification covering React architecture, responsive design, UI testing, and modern JavaScript standards.',
    badge: 'Certified'
  }
];

export const SERVICES: ServiceItem[] = [
  {
    id: 'srv-1',
    title: 'Full-Stack MERN Application Development',
    description: 'Turn your concept into a robust, high-performance production web app. Engineered with Next.js 16, Express, and MongoDB Atlas for scale.',
    deliverables: [
      'Custom responsive web application (SSR + Client interactivity)',
      'Secure RESTful API backend with JWT + Refresh token auth',
      'Optimized MongoDB database schema design & indexing',
      'Deployment to Vercel/Render with automated CI/CD pipeline'
    ],
    timeline: '2 — 6 Weeks',
    technologies: ['Next.js 16', 'React 19', 'Node.js', 'Express.js', 'MongoDB Atlas'],
    icon: 'Layers'
  },
  {
    id: 'srv-2',
    title: 'AI Integration & Intelligent Assistants',
    description: 'Empower your web products with contextual AI assistants, semantic search, and automated workflows backed by Anthropic Claude and OpenAI APIs.',
    deliverables: [
      'Context-grounded AI chat assistants (no hallucinations)',
      'Vector search integration using MongoDB Atlas Vector Search',
      'Prompt engineering & token-efficient streaming response UI',
      'Strict safety controls, rate limits, and fallback routines'
    ],
    timeline: '1 — 3 Weeks',
    technologies: ['Anthropic Claude API', 'OpenAI', 'LangChain', 'Next.js', 'Node.js'],
    icon: 'Sparkles'
  },
  {
    id: 'srv-3',
    title: 'Custom CMS & Admin Dashboards',
    description: 'Take full control of your website content and business analytics with a handcrafted, lightning-fast administrative dashboard.',
    deliverables: [
      'Comprehensive CRUD interfaces with validation & optimistic updates',
      'Role-based access control (Admin, Editor, Staff)',
      'Media management with Cloudinary CDN integration',
      'Real-time analytics graphs and audit logs'
    ],
    timeline: '2 — 4 Weeks',
    technologies: ['React 19', 'Tailwind CSS v4', 'Express', 'Mongoose', 'Cloudinary'],
    icon: 'ShieldCheck'
  },
  {
    id: 'srv-4',
    title: 'Performance & SEO Optimization',
    description: 'Revamp existing web properties to achieve sub-second load times, 95+ Google Lighthouse scores, and top search engine rankings.',
    deliverables: [
      'Core Web Vitals audit & remediation (LCP, CLS, INP)',
      'Next.js image pipeline and asset preloading setup',
      'Structured JSON-LD schema metadata implementation',
      'Database query bottleneck profiling and caching layer'
    ],
    timeline: '1 — 2 Weeks',
    technologies: ['Next.js', 'Redis', 'Lighthouse', 'Vercel Analytics'],
    icon: 'Zap'
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 'test-1',
    quote: 'Basith is an extraordinary engineer who blends deep backend competence with world-class frontend finesse. He delivered our SaaS dashboard two weeks ahead of schedule and the performance is flawless.',
    name: 'Alexander Reed',
    role: 'Founder & CTO',
    company: 'HyperScale AI',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'test-2',
    quote: 'Finding a fresher developer with this level of architectural maturity and design taste is rare. His understanding of MERN stack and Next.js App Router easily matches senior engineers.',
    name: 'Sarah Chen',
    role: 'Lead Product Manager',
    company: 'Veloce Digital',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'test-3',
    quote: 'The attention to detail in his animations, typography, and API resilience blew our team away. When we launched our MVP, we had zero downtime and our users constantly praise the interface.',
    name: 'David O\'Connor',
    role: 'Managing Director',
    company: 'Aura Interactive',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
  }
];

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'nextjs-16-app-router-and-ppr',
    title: 'Mastering Next.js 16 App Router & Partial Prerendering (PPR)',
    excerpt: 'An in-depth guide to leveraging Next.js 16 Partial Prerendering to combine static shell speed with dynamic runtime streaming.',
    coverImage: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?auto=format&fit=crop&w=1000&q=80',
    category: 'Architecture',
    tags: ['Next.js 16', 'React 19', 'Performance', 'PPR'],
    publishedAt: 'September 18, 2026',
    readingTime: '6 min read',
    content: `Next.js 16 has officially brought Partial Prerendering (PPR) into General Availability, fundamentally changing how full-stack developers think about web performance.

Instead of choosing between fully static builds (SSG) or purely dynamic server-side rendering (SSR), PPR allows you to deliver both within the exact same HTTP response.

### Why PPR Changes the Equation

In traditional architectures, having a single dynamic component forced the entire route to opt into dynamic SSR. This resulted in slower TTFB and heavier server workloads.

With Next.js 16 PPR, the static HTML shell is served instantly from the edge cache, while dynamic components wrapped in React Suspense boundaries stream in asynchronously without blocking the initial paint.

### Key Architectural Takeaways
1. Keep dynamic boundaries granular around personalized widgets.
2. Fetch independent data requests concurrently without cascading waterfalls.
3. Keep Core Web Vitals optimized with minimal Cumulative Layout Shift (CLS).`
  },
  {
    slug: 'production-grade-mern-stack-patterns-2026',
    title: 'Production-Grade MERN Architecture: Scalable Patterns for 2026',
    excerpt: 'How to structure Node.js and Express backends with MongoDB Atlas for rock-solid security, testability, and developer velocity.',
    coverImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1000&q=80',
    category: 'Backend',
    tags: ['MERN', 'Node.js', 'Express', 'MongoDB', 'Architecture'],
    publishedAt: 'September 10, 2026',
    readingTime: '8 min read',
    content: `The MERN stack (MongoDB, Express, React, Node.js) remains a dominant choice for rapid full-stack product iteration. However, high-scale applications require strict separation of concerns.

### 1. Strict Layered Architecture
Never place business logic directly in route handlers:
- **Routes / Controllers:** Handle HTTP status codes, parse queries, and invoke domain services.
- **Services:** Pure domain logic, orchestration, and business rules.
- **Models / Repositories:** Mongoose schemas, indexes, and queries.

### 2. JWT Rotation & RBAC
Use short-lived access tokens (15m) paired with secure HttpOnly refresh tokens stored in MongoDB with automated TTL indexes.`
  },
  {
    slug: 'building-ai-portfolio-assistant-claude-haiku',
    title: 'Grounding AI in Structured Data: Building "Ask About Basi"',
    excerpt: 'How I integrated Anthropic Claude Haiku 4.5 into this portfolio to create an interactive assistant that never hallucinates.',
    coverImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1000&q=80',
    category: 'AI & Web',
    tags: ['Anthropic API', 'Claude Haiku', 'AI', 'Prompt Engineering'],
    publishedAt: 'September 02, 2026',
    readingTime: '5 min read',
    content: `Recruiters and hiring managers spend an average of 30 to 60 seconds reviewing a portfolio. Sifting through multiple pages to answer specific questions creates friction.

To solve this, I designed "Ask About Basi" — an interactive AI assistant integrated directly into this portfolio website.

### Architectural Principles
- Strict context grounding prevents hallucinations.
- Powered by Anthropic's Claude Haiku model for sub-second responses.
- Structured facts editable from the CMS admin dashboard.`
  }
];

export const NOW_DATA = {
  lastUpdated: 'September 2026',
  currentFocus: 'Full-Stack Developer Roles & Next.js 16 Architecture',
  building: [
    'Shipping production enhancements to this portfolio and custom CMS dashboard',
    'Developing an open-source AI micro-agent tool for automated GitHub PR summaries',
    'Refining full-stack performance blueprints with Next.js 16 PPR and Redis'
  ],
  learning: [
    'Deepening expertise in MongoDB Atlas Vector Search and hybrid search indexing',
    'Exploring GSAP advanced physics-based timeline animations for interactive storytelling',
    'Advanced Web Performance profiling with Google Chrome DevTools Performance panel'
  ],
  reading: [
    '"Designing Data-Intensive Applications" by Martin Kleppmann',
    '"Refactoring UI" by Adam Wathan & Steve Schoger'
  ],
  seeking: 'Open to Full-time Full Stack Developer roles, MERN / Next.js engineering positions, and high-impact remote freelance contracts.'
};

export const USES_DATA = {
  categories: [
    {
      name: 'Workstation & Hardware',
      items: [
        { name: 'MacBook Pro M-Series', desc: 'Primary work machine for rapid development, battery efficiency, and local Docker containers.' },
        { name: 'Custom Linux Rig', desc: 'Dual-boot workstation used for distributed backend benchmarking, microservices, and deep builds.' },
        { name: 'LG 34" Ultrawide Curved Monitor', desc: 'Gives ample horizontal real estate for side-by-side IDE, terminal, and browser dev tools.' },
        { name: 'Keychron Q1 Pro Mechanical Keyboard', desc: 'Custom tactile switches for effortless all-day typing.' },
        { name: 'Logitech MX Master 3S', desc: 'Ergonomic precision mouse with smooth magnetic scrolling.' }
      ]
    },
    {
      name: 'Code Editor & Terminal',
      items: [
        { name: 'VS Code & Cursor', desc: 'Primary code editors configured with Tokyo Night Dark theme and tailored snippets.' },
        { name: 'Geist Mono Font', desc: 'Super crisp, modern monospace typography with exceptional readability for programming.' },
        { name: 'Warp & iTerm2', desc: 'Modern GPU-accelerated terminal with Zsh, Oh My Zsh, and Starship prompt.' },
        { name: 'Git & GitHub CLI', desc: 'Daily driver for commit hygiene, branch management, and PR reviews.' }
      ]
    },
    {
      name: 'Development & Design Stack',
      items: [
        { name: 'Next.js 16 + React 19', desc: 'The backbone of modern frontend web applications.' },
        { name: 'Node.js 24 + Express', desc: 'Fast, flexible, and battle-tested backend foundation.' },
        { name: 'MongoDB Atlas & Compass', desc: 'Versatile document database with lightning-fast aggregation and vector search.' },
        { name: 'Tailwind CSS v4 + Motion', desc: 'Expressive, token-driven styling and high-performance micro-animations.' },
        { name: 'Postman & Bruno', desc: 'API design, automated request collection testing, and environment variable handling.' },
        { name: 'Figma', desc: 'Wireframing layouts, component prototyping, and visual design tokens before writing code.' }
      ]
    },
    {
      name: 'Hosting & Infrastructure',
      items: [
        { name: 'Vercel', desc: 'Zero-config edge deployment for Next.js frontend with preview environments.' },
        { name: 'Render / Railway', desc: 'Automated hosting for Node.js Express APIs and background jobs.' },
        { name: 'Cloudinary CDN', desc: 'Automated responsive image optimization, transformation, and media hosting.' },
        { name: 'GitHub Actions', desc: 'Automated CI/CD pipelines for linting, type-checking, and seamless deployment.' }
      ]
    }
  ]
};

export const AI_KNOWLEDGE_BASE = [
  {
    topic: "Identity & Overview",
    content: `
Muhammed Abdul Basith (Basi) is a Full Stack Developer from Kerala, India.
He specializes in building scalable web applications using React, Next.js, Node.js, Express.js, MongoDB, and TypeScript.
His focus is on creating responsive user experiences, efficient backend systems, and production-ready full-stack applications.
    `,
  },

  {
    topic: "Technical Skills",
    content: `
Frontend:
React.js, Next.js, TypeScript, JavaScript, HTML5, CSS3, Tailwind CSS, Bootstrap.

Backend:
Node.js, Express.js, REST APIs, Authentication, JWT, Middleware Architecture.

Database:
MongoDB, Mongoose.

Tools:
Git, GitHub, Postman, VS Code, Cloudinary, Vercel, Netlify.

Additional:
Responsive Design, API Integration, State Management, Performance Optimization.
    `,
  },

  {
    topic: "MERN Stack Expertise",
    content: `
Experienced in developing full-stack applications using MongoDB, Express.js, React.js, and Node.js.

Capable of:
- Building RESTful APIs
- Authentication & Authorization
- CRUD Applications
- Admin Dashboards
- CMS Platforms
- File Upload Systems
- Database Design
- API Integration
- Deployment & Hosting
    `,
  },

  {
    topic: "Projects",
    content: `
Portfolio CMS Platform:
A dynamic portfolio website with a complete admin dashboard for managing projects, skills, education, certifications, blogs, and inquiries.

HandPortal:
A full-stack web application built using MERN technologies demonstrating frontend and backend integration.

Personal Portfolio:
A modern developer portfolio showcasing projects, technical skills, experience, certifications, and contact information.
    `,
  },

  {
    topic: "GitHub & Open Source",
    content: `
GitHub Username: Basiibnumoideen

GitHub Profile:
https://github.com/Basiibnumoideen

Repositories include:
- MERN Stack Projects
- React Applications
- Full Stack Applications
- Portfolio CMS Development
- JavaScript & TypeScript Projects

The GitHub profile reflects ongoing learning, project development, and practical implementation of modern web technologies.
    `,
  },

  {
    topic: "Education",
    content: `
Bachelor's Degree Student under Calicut University.

Focused on software development, web technologies, databases, and full-stack engineering.
    `,
  },

  {
    topic: "Career Goals",
    content: `
Seeking opportunities as:
- MERN Stack Developer
- Full Stack Developer
- React Developer
- Next.js Developer

Open to:
- Full-Time Roles
- Remote Opportunities
- Freelance Projects
- Startup Teams
    `,
  },

  {
    topic: "Availability",
    content: `
Available for freelance work, contract projects, internships, and full-time developer opportunities.

Interested in building scalable products, business applications, SaaS platforms, and modern web experiences.
    `,
  },

  {
    topic: "Contact Information",
    content: `
Name: Muhammed Abdul Basith

Location:
Kerala, India

GitHub:
https://github.com/Basiibnumoideen

Portfolio:
https://portfolio-tau-roan-46.vercel.app/

Available for collaboration, freelance projects, and developer opportunities.
    `,
  },
];