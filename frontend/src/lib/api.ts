
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  const local = localStorage.getItem('admin_token');
  if (local && local.trim() && local !== 'null' && local !== 'undefined') {
    const clean = local.trim();
    if (isTokenValid(clean)) {
      if (!document.cookie.includes('admin_token=')) {
        document.cookie = `admin_token=${clean}; path=/; max-age=604800; SameSite=Lax`;
      }
      return clean;
    } else {
      localStorage.removeItem('admin_token');
      document.cookie = 'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
    }
  }

  // Parse from document.cookie
  const match = document.cookie.match(/(?:^|;\s*)admin_token=([^;]+)/);
  if (match && match[1] && match[1].trim() && match[1] !== 'null' && match[1] !== 'undefined') {
    const cookieVal = decodeURIComponent(match[1].trim());
    if (isTokenValid(cookieVal)) {
      localStorage.setItem('admin_token', cookieVal);
      return cookieVal;
    } else {
      document.cookie = 'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
    }
  }

  return null;
}

export function isTokenValid(token: string | null): boolean {
  if (!token || typeof token !== 'string') return false;
  const clean = token.trim();
  if (clean === '' || clean === 'null' || clean === 'undefined') return false;

  const parts = clean.split('.');
  if (parts.length !== 3) return false;

  try {
    const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonStr = atob(payloadBase64);
    const payload = JSON.parse(jsonStr);
    if (!payload || typeof payload !== 'object') return false;
    if (typeof payload.exp === 'number' && Date.now() >= payload.exp * 1000) {
      return false; // Expired
    }
    return true;
  } catch {
    return false;
  }
}

export function setStoredToken(token: string | null) {
  if (typeof window === 'undefined') return;
  if (token && token.trim() && token !== 'null' && token !== 'undefined') {
    localStorage.setItem('admin_token', token.trim());
    document.cookie = `admin_token=${token.trim()}; path=/; max-age=604800; SameSite=Lax`;
  } else {
    localStorage.removeItem('admin_token');
    document.cookie = 'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const token = getStoredToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token && isTokenValid(token)) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  // 45s safety timeout to accommodate Render free tier cold-start wakeups
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45000);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
      signal: options.signal || controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json().catch(() => ({
      success: false,
      message: 'Invalid response from server',
    }));

    if (!response.ok) {
      if (response.status === 401) {
        console.warn(`[API] 401 Unauthorized for ${endpoint}. Clearing token.`);
        setStoredToken(null);
      }
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      console.error(`[API] Request timed out for: ${endpoint}`);
      throw new Error(`Request timed out. Render backend may still be waking up. Please retry in a few seconds.`);
    }
    if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
      console.error(`[API Network Error] Could not connect to API at: ${url}`, error);
      throw new Error(`Cannot connect to backend API (${url}). Check if NEXT_PUBLIC_API_URL is configured on Vercel or if the backend is awake.`);
    }
    throw error;
  }
}

export const api = {
  // Authentication
  auth: {
    login: async (credentials: { email: string; password: string }) => {
      console.log(`[API Auth] Attempting login for: ${credentials.email}`);
      const res = await request<{
        success: boolean;
        token: string;
        user: any;
        message?: string;
      }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      if (res.token) {
        setStoredToken(res.token);
        console.log(`[API Auth] Login successful, token stored.`);
      }
      return res;
    },

    logout: async () => {
      try {
        await request('/auth/logout', { method: 'POST' });
      } finally {
        setStoredToken(null);
      }
    },

    getProfile: async () => {
      return request<{ success: boolean; user: any }>('/auth/profile');
    },

    changePassword: async (passwords: { currentPassword?: string; newPassword: string }) => {
      return request<{ success: boolean; message: string }>('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify(passwords),
      });
    },

    isAuthenticated: (): boolean => {
      if (typeof window === 'undefined') return false;
      const token = getStoredToken();
      return isTokenValid(token);
    },
  },

  // Projects CMS
  projects: {
    getAll: async (params?: { category?: string; featured?: boolean; search?: string }) => {
      try {
        const query = new URLSearchParams();
        if (params?.category) query.set('category', params.category);
        if (params?.featured) query.set('featured', 'true');
        if (params?.search) query.set('search', params.search);
        const res = await request<{ success: boolean; data: any[] }>(`/projects?${query.toString()}`);
        return res.data || [];
      } catch (err) {
        console.warn('api.projects.getAll notice:', err);
        return [];
      }
    },

    getOne: async (idOrSlug: string) => {
      const res = await request<{ success: boolean; data: any }>(`/projects/${idOrSlug}`);
      return res.data;
    },

    create: async (data: any) => {
      return request<{ success: boolean; data: any; message: string }>('/projects', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: async (idOrSlug: string, data: any) => {
      return request<{ success: boolean; data: any; message: string }>(`/projects/${idOrSlug}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    delete: async (idOrSlug: string) => {
      return request<{ success: boolean; message: string }>(`/projects/${idOrSlug}`, {
        method: 'DELETE',
      });
    },

    reorder: async (items: { id: string; order: number }[]) => {
      return request<{ success: boolean; message: string }>('/projects/reorder', {
        method: 'PATCH',
        body: JSON.stringify({ items }),
      });
    },
  },

  // Skills CMS
  skills: {
    getAll: async (category?: string) => {
      try {
        const query = category ? `?category=${encodeURIComponent(category)}` : '';
        const res = await request<{ success: boolean; data: any[] }>(`/skills${query}`);
        return res.data || [];
      } catch (err) {
        console.warn('api.skills.getAll notice:', err);
        return [];
      }
    },

    create: async (data: any) => {
      return request<{ success: boolean; data: any; message: string }>('/skills', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: async (idOrName: string, data: any) => {
      return request<{ success: boolean; data: any; message: string }>(`/skills/${encodeURIComponent(idOrName)}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    delete: async (idOrName: string) => {
      return request<{ success: boolean; message: string }>(`/skills/${encodeURIComponent(idOrName)}`, {
        method: 'DELETE',
      });
    },

    reorder: async (items: { id: string; order: number }[]) => {
      return request<{ success: boolean; message: string }>('/skills/reorder', {
        method: 'PATCH',
        body: JSON.stringify({ items }),
      });
    },
  },

  // Services CMS
  services: {
    getAll: async (all?: boolean) => {
      try {
        const query = all ? '?all=true' : '';
        const res = await request<{ success: boolean; data: any[] }>(`/services${query}`);
        return res.data || [];
      } catch (err) {
        console.warn('api.services.getAll notice:', err);
        return [];
      }
    },

    create: async (data: any) => {
      return request<{ success: boolean; data: any; message: string }>('/services', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: async (id: string, data: any) => {
      return request<{ success: boolean; data: any; message: string }>(`/services/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    delete: async (id: string) => {
      return request<{ success: boolean; message: string }>(`/services/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // Experiences CMS
  experiences: {
    getAll: async () => {
      try {
        const res = await request<{ success: boolean; data: any[] }>('/experiences');
        return res.data || [];
      } catch (err) {
        console.warn('api.experiences.getAll notice:', err);
        return [];
      }
    },

    create: async (data: any) => {
      return request<{ success: boolean; data: any; message: string }>('/experiences', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: async (id: string, data: any) => {
      return request<{ success: boolean; data: any; message: string }>(`/experiences/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    delete: async (id: string) => {
      return request<{ success: boolean; message: string }>(`/experiences/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // Education CMS
  education: {
    getAll: async () => {
      try {
        const res = await request<{ success: boolean; data: any[] }>('/education');
        return res.data || [];
      } catch (err) {
        console.warn('api.education.getAll notice:', err);
        return [];
      }
    },

    create: async (data: any) => {
      return request<{ success: boolean; data: any; message: string }>('/education', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: async (id: string, data: any) => {
      return request<{ success: boolean; data: any; message: string }>(`/education/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    delete: async (id: string) => {
      return request<{ success: boolean; message: string }>(`/education/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // Certifications CMS
  certifications: {
    getAll: async () => {
      try {
        const res = await request<{ success: boolean; data: any[] }>('/certifications');
        return res.data || [];
      } catch (err) {
        console.warn('api.certifications.getAll notice:', err);
        return [];
      }
    },

    create: async (data: any) => {
      return request<{ success: boolean; data: any; message: string }>('/certifications', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: async (id: string, data: any) => {
      return request<{ success: boolean; data: any; message: string }>(`/certifications/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    delete: async (id: string) => {
      return request<{ success: boolean; message: string }>(`/certifications/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // Testimonials CMS
  testimonials: {
    getAll: async () => {
      try {
        const res = await request<{ success: boolean; data: any[] }>('/testimonials');
        return res.data || [];
      } catch (err) {
        console.warn('api.testimonials.getAll notice:', err);
        return [];
      }
    },

    create: async (data: any) => {
      return request<{ success: boolean; data: any; message: string }>('/testimonials', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: async (id: string, data: any) => {
      return request<{ success: boolean; data: any; message: string }>(`/testimonials/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    delete: async (id: string) => {
      return request<{ success: boolean; message: string }>(`/testimonials/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // Blog CMS
  blogs: {
    getAll: async (params?: { category?: string; search?: string; all?: boolean }) => {
      try {
        const query = new URLSearchParams();
        if (params?.category) query.set('category', params.category);
        if (params?.search) query.set('search', params.search);
        if (params?.all) query.set('all', 'true');
        const res = await request<{ success: boolean; data: any[] }>(`/blogs?${query.toString()}`);
        return res.data || [];
      } catch (err) {
        console.warn('api.blogs.getAll notice:', err);
        return [];
      }
    },

    getOne: async (slug: string) => {
      const res = await request<{ success: boolean; data: any }>(`/blogs/${slug}`);
      return res.data;
    },

    create: async (data: any) => {
      return request<{ success: boolean; data: any; message: string }>('/blogs', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: async (idOrSlug: string, data: any) => {
      return request<{ success: boolean; data: any; message: string }>(`/blogs/${idOrSlug}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    delete: async (idOrSlug: string) => {
      return request<{ success: boolean; message: string }>(`/blogs/${idOrSlug}`, {
        method: 'DELETE',
      });
    },
  },

  // Messages CMS
  messages: {
    getAll: async (filter?: 'all' | 'unread' | 'read') => {
      let query = '';
      if (filter === 'unread') query = '?read=false';
      if (filter === 'read') query = '?read=true';
      return request<{ success: boolean; count: number; unreadCount: number; data: any[] }>(`/messages${query}`);
    },

    create: async (data: { name: string; email: string; subject?: string; projectType?: string; message: string }) => {
      return request<{ success: boolean; message: string; data?: any }>('/messages', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    toggleRead: async (id: string, read?: boolean) => {
      return request<{ success: boolean; message: string; data: any }>(`/messages/${id}/read`, {
        method: 'PATCH',
        body: JSON.stringify({ read }),
      });
    },

    delete: async (id: string) => {
      return request<{ success: boolean; message: string }>(`/messages/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // Site Settings CMS
  settings: {
    get: async () => {
      try {
        const res = await request<{ success: boolean; data: any }>('/settings');
        const settingsObj = res.data ? { ...res.data } : {};
        // Make .data point to itself so both `res.logo` and `res.data.logo` work universally
        try {
          Object.defineProperty(settingsObj, 'data', {
            value: settingsObj,
            enumerable: false,
            writable: true,
            configurable: true,
          });
        } catch {}
        return settingsObj;
      } catch {
        const fallback: any = {
          name: 'Muhammed Abdul Basith',
          location: 'Remote / Worldwide',
          role: 'Senior Full Stack Engineer',
          logo: '',
          favicon: '',
          heroTitle: 'Crafting High-Performance Full Stack Systems',
          heroSubtitle: 'Senior MERN & Next.js Engineer specializing in scalable distributed backends and premium web apps.',
          email: 'basi.dev@example.com',
          phone: '+91 8590882253',
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
          },
        };
        try {
          Object.defineProperty(fallback, 'data', {
            value: fallback,
            enumerable: false,
            writable: true,
            configurable: true,
          });
        } catch {}
        return fallback;
      }
    },

    update: async (data: any) => {
      const res = await request<{ success: boolean; data: any; message: string }>('/settings', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      if (res?.data && typeof window !== 'undefined') {
        try {
          localStorage.setItem('portfolio_settings', JSON.stringify(res.data));
          window.dispatchEvent(new CustomEvent('portfolio_settings_updated', { detail: res.data }));
        } catch {}
      }
      return res;
    },
  },

  // Analytics & Telemetry
  analytics: {
    getDashboard: async (refresh: boolean = false) => {
      const query = refresh ? '?refresh=true' : '';
      return request<{
        success: boolean;
        hasData: boolean;
        stats: {
          totalProjects: number;
          totalSkills: number;
          totalBlogs: number;
          totalServices: number;
          totalExperiences: number;
          totalEducation: number;
          totalCertifications: number;
          totalTestimonials: number;
          totalMessages: number;
          unreadMessages: number;
          totalVisitors: number;
          pageViews: number;
          projectViews: number;
          resumeDownloads: number;
          contactSubmissions: number;
        };
        charts: {
          visitorsLast7Days: { date: string; label: string; visitors: number; pageViews: number; downloads: number; inquiries: number }[];
          visitorsLast30Days: { date: string; label: string; visitors: number; pageViews: number; downloads: number; inquiries: number }[];
          topViewedProjects: { title: string; views: number; slug?: string }[];
          mostVisitedPages: { path: string; views: number }[];
          downloadTrends: { date: string; label: string; count: number }[];
          inquiryTrends: { date: string; label: string; count: number }[];
        };
        recentActivities: {
          id: string;
          type: 'visitor' | 'page_view' | 'project_view' | 'resume_download' | 'contact_submission';
          title: string;
          description: string;
          metadata?: any;
          ip?: string;
          timestamp: string;
        }[];
        recentMessages: any[];
        recentAudits?: any[];
        cachedAt?: string;
      }>(`/admin/dashboard${query}`);
    },

    recordVisitor: async (data?: { referrer?: string; sessionId?: string }) => {
      try {
        return await request('/analytics/visitor', {
          method: 'POST',
          body: data ? JSON.stringify(data) : undefined,
        });
      } catch {
        return null;
      }
    },

    recordPageView: async (data?: { path?: string; title?: string; referrer?: string; sessionId?: string }) => {
      try {
        return await request('/analytics/page-view', {
          method: 'POST',
          body: data ? JSON.stringify(data) : undefined,
        });
      } catch {
        return null;
      }
    },

    recordProjectView: async (data?: { projectId?: string; projectTitle?: string; projectSlug?: string; sessionId?: string }) => {
      try {
        return await request('/analytics/project-view', {
          method: 'POST',
          body: data ? JSON.stringify(data) : undefined,
        });
      } catch {
        return null;
      }
    },

    recordResumeDownload: async (data?: { source?: string }) => {
      try {
        return await request('/analytics/resume-download', {
          method: 'POST',
          body: data ? JSON.stringify(data) : undefined,
        });
      } catch {
        return null;
      }
    },

    getAuditLogs: async () => {
      const res = await request<{ success: boolean; data: any[] }>('/analytics/audit-logs');
      return res.data;
    },
  },

  // Cloudinary File Upload
  upload: {
    file: async (file: File, folder: string = 'uploads') => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      return request<{
        success: boolean;
        message: string;
        data: {
          url: string;
          public_id: string;
          bytes: number;
          mimetype: string;
          originalName: string;
        };
      }>('/upload', {
        method: 'POST',
        body: formData,
      });
    },
  },

  // Fallback defaults for initial hydration (empty collections)
  defaults: {
    projects: [],
    skills: [],
    blogs: [],
    services: [],
    experiences: [],
    education: [],
    testimonials: [],
    now: null,
    aiKb: [],
  },
};

export default api;
