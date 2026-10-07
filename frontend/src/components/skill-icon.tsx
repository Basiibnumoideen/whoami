'use client';

import React from 'react';
import { 
  Code2, 
  Layers, 
  Cpu, 
  Database, 
  Server, 
  Terminal, 
  Boxes, 
  Zap, 
  Globe, 
  GitBranch, 
  Cloud,
  FileCode,
  Shield,
  Palette,
  Workflow,
  Radio,
  CheckCircle2,
  Container,
  Flame,
  Layout,
  Network
} from 'lucide-react';

interface SkillIconProps {
  name: string;
  icon?: string;
  className?: string;
  size?: number;
}

export function SkillIcon({ name, icon, className = 'w-6 h-6', size = 24 }: SkillIconProps) {
  // If a custom image URL is provided (Cloudinary / external URL / data URI / absolute path)
  if (icon && (icon.startsWith('http://') || icon.startsWith('https://') || icon.startsWith('data:') || icon.startsWith('/'))) {
    return (
      <img
        src={icon}
        alt={name || 'Skill icon'}
        className={`${className} object-contain`}
        onError={(e) => {
          // Hide or fallback on broken image
          (e.target as HTMLElement).style.display = 'none';
        }}
      />
    );
  }

  const query = `${name || ''} ${icon || ''}`.toLowerCase().trim();

  // 1. React / React.js
  if (query.includes('react') && !query.includes('native')) {
    return (
      <svg className={className} viewBox="-11.5 -10.23174 23 20.46348" fill="none">
        <circle cx="0" cy="0" r="2.05" fill="#61DAFB" />
        <g stroke="#61DAFB" strokeWidth="1" fill="none">
          <ellipse rx="11" ry="4.2" />
          <ellipse rx="11" ry="4.2" transform="rotate(60)" />
          <ellipse rx="11" ry="4.2" transform="rotate(120)" />
        </g>
      </svg>
    );
  }

  // 2. Next.js
  if (query.includes('next') || query.includes('nextjs')) {
    return (
      <svg className={className} viewBox="0 0 180 180" fill="none">
        <mask id="nextMask" maskUnits="userSpaceOnUse" x="0" y="0" width="180" height="180" style={{ maskType: 'alpha' }}>
          <circle cx="90" cy="90" r="90" fill="black" />
        </mask>
        <g mask="url(#nextMask)">
          <circle cx="90" cy="90" r="90" fill="#000" />
          <path d="M149.508 157.52L69.142 54H54V125.97H66.602V69.756L140.098 164.846C143.434 162.622 146.592 160.16 149.508 157.52Z" fill="url(#nextGrad)" />
          <rect x="115" y="54" width="12" height="72" fill="url(#nextGrad2)" />
        </g>
        <defs>
          <linearGradient id="nextGrad" x1="109" y1="116.5" x2="144.5" y2="160.5" gradientUnits="userSpaceOnUse">
            <stop stopColor="white" />
            <stop offset="1" stopColor="white" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="nextGrad2" x1="121" y1="54" x2="120.799" y2="106.875" gradientUnits="userSpaceOnUse">
            <stop stopColor="white" />
            <stop offset="1" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  // 3. TypeScript
  if (query.includes('typescript') || query === 'ts') {
    return (
      <svg className={className} viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="6" fill="#3178C6" />
        <path d="M12.5 13H8V11H19V13H14.5V23H12.5V13Z" fill="white" />
        <path d="M25 15.5C25 13.8 23.5 12.8 21.3 12.8C19 12.8 17.5 14 17.5 15.8C17.5 19.3 22.8 17.8 22.8 20.2C22.8 21.2 21.8 21.8 20.6 21.8C19 21.8 17.8 20.8 17.6 19.5H15.6C15.8 21.8 17.8 23.5 20.6 23.5C23.2 23.5 24.8 22.2 24.8 20.2C24.8 16.5 19.5 18 19.5 15.6C19.5 14.8 20.3 14.3 21.3 14.3C22.4 14.3 23.2 15 23.3 15.8H25V15.5Z" fill="white" />
      </svg>
    );
  }

  // 4. JavaScript
  if (query.includes('javascript') || query === 'js') {
    return (
      <svg className={className} viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="6" fill="#F7DF1E" />
        <path d="M13.5 21.5C13.5 23 12.2 24 10.5 24C8.8 24 7.8 23 7.5 21.8L9.2 21C9.4 21.8 9.9 22.4 10.6 22.4C11.3 22.4 11.7 22 11.7 21.2V13H13.5V21.5Z" fill="#000" />
        <path d="M22.5 17C22.5 14.5 20.8 13 18.5 13C16 13 14.5 14.5 14.5 17H16.3C16.3 15.3 17.2 14.5 18.5 14.5C19.7 14.5 20.7 15.2 20.7 16.5C20.7 19.8 14.5 18 14.5 21.8C14.5 23.5 16.2 24.5 18.5 24.5C21.2 24.5 22.5 23 22.5 21.2H20.7C20.7 22.2 19.8 23 18.5 23C17.2 23 16.3 22.4 16.3 21.5C16.3 18.5 22.5 19.8 22.5 17Z" fill="#000" />
      </svg>
    );
  }

  // 5. Node.js
  if (query.includes('node')) {
    return (
      <svg className={className} viewBox="0 0 32 32" fill="none">
        <path d="M16 2L28 8.9V22.8L16 29.7L4 22.8V8.9L16 2Z" fill="#339933" />
        <path d="M16 5L25 10.2V20.6L16 25.8L7 20.6V10.2L16 5Z" fill="#050816" />
        <path d="M16 9L21.5 12.2V18.6L16 21.8L10.5 18.6V12.2L16 9Z" fill="#339933" />
      </svg>
    );
  }

  // 6. Express.js
  if (query.includes('express')) {
    return (
      <svg className={className} viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="6" fill="#1C1C1E" stroke="#38BDF8" strokeWidth="1" />
        <text x="16" y="21" fontSize="12" fontWeight="bold" fill="#38BDF8" fontFamily="monospace" textAnchor="middle">
          ex
        </text>
      </svg>
    );
  }

  // 7. MongoDB Atlas
  if (query.includes('mongo')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <path d="M12 1.5C12 1.5 6.5 6.8 6.5 13.5C6.5 18.5 9.8 21.8 12 22.5C14.2 21.8 17.5 18.5 17.5 13.5C17.5 6.8 12 1.5 12 1.5Z" fill="#13AA52" />
        <path d="M12 2.5V22.2C12.5 22 17 18.8 17 13.5C17 7.2 12 2.5 12 2.5Z" fill="#00ED64" />
        <path d="M11.8 11.5C11.8 11.5 11.2 16.5 11.8 21.5C11.8 21.5 12 17.2 12.2 11.5H11.8Z" fill="#E8EDEB" />
      </svg>
    );
  }

  // 8. Tailwind CSS
  if (query.includes('tailwind')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <path d="M12 6C9.333 6 7.667 7.333 7 10C8 8.667 9.167 8.167 10.5 8.5C11.5 8.75 12.222 9.5 13 10.3C14.267 11.6 15.733 13.1 19 13.1C21.667 13.1 23.333 11.767 24 9.1C23 10.433 21.833 10.933 20.5 10.6C19.5 10.35 18.778 9.6 18 8.8C16.733 7.5 15.267 6 12 6ZM5 12C2.333 12 0.667 13.333 0 16C1 14.667 2.167 14.167 3.5 14.5C4.5 14.75 5.222 15.5 6 16.3C7.267 17.6 8.733 19.1 12 19.1C14.667 19.1 16.333 17.767 17 15.1C16 16.433 14.833 16.933 13.5 16.6C12.5 16.35 11.778 15.6 11 14.8C9.733 13.5 8.267 12 5 12Z" fill="#06B6D4" />
      </svg>
    );
  }

  // 9. Docker
  if (query.includes('docker')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <path d="M13 10.5H15V12.5H13V10.5ZM10.5 10.5H12.5V12.5H10.5V10.5ZM8 10.5H10V12.5H8V10.5ZM10.5 8H12.5V10H10.5V8ZM8 8H10V10H8V8ZM5.5 10.5H7.5V12.5H5.5V10.5ZM13 8H15V10H13V8ZM15.5 8H17.5V10H15.5V8ZM15.5 10.5H17.5V12.5H15.5V10.5Z" fill="#2496ED" />
        <path d="M22.5 11.5C21.8 11.5 21.2 11.8 20.8 12.3C19.8 11.8 18.7 11.8 17.8 12.3V12H3.5C2.7 12 2 12.7 2 13.5C2 17.5 5 19.5 8.5 19.5C13.5 19.5 17.5 16.5 18.5 13.5C19.5 13.7 20.8 13.8 22 12.8C22.5 12.4 22.8 11.8 22.5 11.5Z" fill="#2496ED" />
      </svg>
    );
  }

  // 10. PostgreSQL
  if (query.includes('postgres') || (query.includes('sql') && !query.includes('no') && !query.includes('mongo') && !query.includes('my'))) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <path d="M12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2ZM17.2 16.8C16.8 17.3 15.5 18 13.8 18C11.5 18 9.5 16.5 9.5 14C9.5 11.5 11.5 10 13.8 10C15.2 10 16.5 10.8 17 11.5L15.5 12.8C15.2 12.3 14.5 11.8 13.8 11.8C12.5 11.8 11.5 12.8 11.5 14C11.5 15.2 12.5 16.2 13.8 16.2C14.8 16.2 15.5 15.5 15.8 15.2L17.2 16.8Z" fill="#4169E1" />
      </svg>
    );
  }

  // 11. Redis
  if (query.includes('redis')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="4" fill="#DC382D" />
        <path d="M6 10L12 7L18 10L12 13L6 10Z" fill="white" />
        <path d="M6 14L12 17L18 14" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  // 12. Git / GitHub
  if (query.includes('git')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <path d="M21.7 10.8L13.2 2.3C12.8 1.9 12.2 1.9 11.8 2.3L9.7 4.4L12.3 7C12.9 6.8 13.6 7 14 7.4C14.5 7.9 14.6 8.7 14.3 9.3L16.8 11.8C17.4 11.5 18.2 11.6 18.7 12.1C19.3 12.7 19.3 13.7 18.7 14.3C18.1 14.9 17.1 14.9 16.5 14.3C16.1 13.9 15.9 13.2 16.1 12.6L13.8 10.3V16.2C14 16.4 14.2 16.8 14.2 17.2C14.2 18 13.5 18.7 12.7 18.7C11.9 18.7 11.2 18 11.2 17.2C11.2 16.6 11.6 16.1 12.1 15.9V9.8C11.6 9.6 11.2 9.1 11.2 8.5C11.2 8 11.4 7.6 11.8 7.3L9.3 4.8L2.3 11.8C1.9 12.2 1.9 12.8 2.3 13.2L10.8 21.7C11.2 22.1 11.8 22.1 12.2 21.7L21.7 12.2C22.1 11.8 22.1 11.2 21.7 10.8Z" fill="#F05032" />
      </svg>
    );
  }

  // 13. Python
  if (query.includes('python') || query.includes('django') || query.includes('fastapi') || query.includes('flask')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <path d="M11.9 2C8.7 2 8.9 3.4 8.9 3.4L8.9 4.8H12V5.3H5.5C4 5.3 2.7 6.6 2.7 8.7C2.7 10.8 3.5 11.9 5 11.9H6.2V10.3C6.2 8.4 7.8 8.4 7.8 8.4H11.9C13.6 8.4 13.8 6.9 13.8 6.9V3.5C13.8 3.5 13.8 2 11.9 2ZM10.5 3C10.9 3 11.2 3.3 11.2 3.7C11.2 4.1 10.9 4.4 10.5 4.4C10.1 4.4 9.8 4.1 9.8 3.7C9.8 3.3 10.1 3 10.5 3Z" fill="#3776AB" />
        <path d="M12.1 22C15.3 22 15.1 20.6 15.1 20.6V19.2H12V18.7H18.5C20 18.7 21.3 17.4 21.3 15.3C21.3 13.2 20.5 12.1 19 12.1H17.8V13.7C17.8 15.6 16.2 15.6 16.2 15.6H12.1C10.4 15.6 10.2 17.1 10.2 17.1V20.5C10.2 20.5 10.2 22 12.1 22ZM13.5 21C13.1 21 12.8 20.7 12.8 20.3C12.8 19.9 13.1 19.6 13.5 19.6C13.9 19.6 14.2 19.9 14.2 20.3C14.2 20.7 13.9 21 13.5 21Z" fill="#FFD43B" />
      </svg>
    );
  }

  // 14. GraphQL
  if (query.includes('graphql')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <path d="M12 2L20.66 7V17L12 22L3.34 17V7L12 2Z" stroke="#E10098" strokeWidth="1.5" />
        <circle cx="12" cy="2" r="2" fill="#E10098" />
        <circle cx="20.66" cy="7" r="2" fill="#E10098" />
        <circle cx="20.66" cy="17" r="2" fill="#E10098" />
        <circle cx="12" cy="22" r="2" fill="#E10098" />
        <circle cx="3.34" cy="17" r="2" fill="#E10098" />
        <circle cx="3.34" cy="7" r="2" fill="#E10098" />
        <path d="M12 4L19 16.5H5L12 4Z" stroke="#E10098" strokeWidth="1" />
      </svg>
    );
  }

  // 15. HTML / HTML5
  if (query.includes('html')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <path d="M3 2L5 20L12 22L19 20L21 2H3Z" fill="#E34F26" />
        <path d="M12 3.8V20.2L17.5 18.7L19.1 3.8H12Z" fill="#EF652A" />
        <path d="M12 7.7H7.7L8 10.7H12V13.7H8.3L8.6 16.5L12 17.5V14.7" fill="white" />
        <path d="M12 7.7H16.3L15.9 11.7H12V7.7ZM12 13.7H15.7L15.3 16.5L12 17.5V13.7Z" fill="#EBEBEB" />
      </svg>
    );
  }

  // 16. CSS / CSS3 / SCSS / Sass
  if (query.includes('css') || query.includes('sass') || query.includes('scss')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <path d="M3 2L5 20L12 22L19 20L21 2H3Z" fill="#1572B6" />
        <path d="M12 3.8V20.2L17.5 18.7L19.1 3.8H12Z" fill="#33A9DC" />
        <path d="M12 7.7H7.7L8 10.7H12V13.7H8.3L8.6 16.5L12 17.5V14.7" fill="white" />
        <path d="M12 7.7H16.3L15.9 11.7H12V7.7ZM12 13.7H15.7L15.3 16.5L12 17.5V13.7Z" fill="#EBEBEB" />
      </svg>
    );
  }

  // 17. Cloud / AWS / GCP / Azure
  if (query.includes('aws') || query.includes('cloud') || query.includes('gcp') || query.includes('azure')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4C9.11 4 6.6 5.64 5.35 8.04C2.34 8.36 0 10.91 0 14C0 17.31 2.69 20 6 20H19C21.76 20 24 17.76 24 15C24 12.36 21.95 10.22 19.35 10.04Z" fill="#FF9900" />
      </svg>
    );
  }

  // 18. WebSockets / Real-time / Socket.io
  if (query.includes('socket') || query.includes('websocket') || query.includes('realtime') || query.includes('real-time')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="#00F0FF" strokeWidth="1.5" />
        <path d="M8 12L12 8L16 12M12 8V16" stroke="#00F0FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  // 19. Redux / State Management / Zustand
  if (query.includes('redux') || query.includes('state') || query.includes('zustand')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM15.5 13.5C14.67 14.33 13.5 14.83 12 14.83C10.5 14.83 9.33 14.33 8.5 13.5L9.91 12.09C10.42 12.6 11.16 12.92 12 12.92C12.84 12.92 13.58 12.6 14.09 12.09L15.5 13.5Z" fill="#764ABC" />
      </svg>
    );
  }

  // 20. Supabase / Firebase
  if (query.includes('supabase') || query.includes('firebase')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <path d="M12 2L3 19H12L11 22L21 9H12L12 2Z" fill="#3ECF8E" />
      </svg>
    );
  }

  // 21. Linux / Terminal / Bash
  if (query.includes('linux') || query.includes('bash') || query.includes('shell') || query.includes('terminal')) {
    return <Terminal className={`${className} text-emerald-400`} />;
  }

  // 22. CI/CD / DevOps / GitHub Actions
  if (query.includes('ci') || query.includes('cd') || query.includes('action') || query.includes('devops')) {
    return <Workflow className={`${className} text-cyan-400`} />;
  }

  // 23. Security / Auth / JWT / OAuth
  if (query.includes('auth') || query.includes('jwt') || query.includes('security') || query.includes('oauth')) {
    return <Shield className={`${className} text-indigo-400`} />;
  }

  // 24. API / REST / Microservices
  if (query.includes('api') || query.includes('rest') || query.includes('microservice')) {
    return <Globe className={`${className} text-emerald-400`} />;
  }

  // 25. UI / UX / Figma / Design
  if (query.includes('ui') || query.includes('ux') || query.includes('figma') || query.includes('design')) {
    return <Palette className={`${className} text-pink-400`} />;
  }

  // 26. Database Fallback
  if (query.includes('data') || query.includes('db') || query.includes('sql') || query.includes('nosql')) {
    return <Database className={`${className} text-emerald-400`} />;
  }

  // 27. Backend / Server Fallback
  if (query.includes('back') || query.includes('server')) {
    return <Server className={`${className} text-secondary`} />;
  }

  // Universal Default Code Icon matching neon site aesthetics
  return <Code2 className={`${className} text-primary`} />;
}
