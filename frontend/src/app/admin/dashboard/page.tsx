'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  Code2,
  FolderGit2,
  BookOpen,
  MessageSquare,
  Clock,
  Sparkles,
  Search,
  Plus,
  Edit2,
  Trash2,
  LogOut,
  ExternalLink,
  CheckCircle2,
  Layers,
  Briefcase,
  GraduationCap,
  Award,
  Star,
  History,
  Download,
  Users,
  LayoutGrid,
  List,
  Upload,
  Settings,
  X,
  RefreshCw,
  Eye,
  Mail,
  Menu,
} from 'lucide-react';
import { api, setStoredToken } from '@/lib/api';
import { AnalyticsOverview } from '@/components/admin/analytics-overview';
import { SkillIcon } from '@/components/skill-icon';

type AdminTab =
  | 'overview'
  | 'skills'
  | 'projects'
  | 'blog'
  | 'services'
  | 'experience'
  | 'education'
  | 'certifications'
  | 'testimonials'
  | 'messages'
  | 'settings'
  | 'now'
  | 'ai-kb'
  | 'audit';

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as AdminTab) || 'overview';

  // Auth state
  const [isVerifying, setIsVerifying] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Active tab state
  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);

  // Sync tab with URL if search param changes
  useEffect(() => {
    const tabParam = searchParams.get('tab') as AdminTab;
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [searchParams, activeTab]);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string, type?: 'success' | 'error') => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Auth Guard
  useEffect(() => {
    let isMounted = true;

    if (!api.auth.isAuthenticated()) {
      console.warn('[Dashboard AuthGuard] Not authenticated, redirecting to /admin/login');
      setIsVerifying(false);
      router.replace('/admin/login');
      return;
    }

    // Token is valid: render the dashboard immediately without blocking on network
    setIsVerifying(false);

    // Fetch user profile in background
    api.auth.getProfile()
      .then((res) => {
        if (!isMounted) return;
        if (res?.user) {
          setCurrentUser(res.user);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.warn('[Dashboard AuthGuard] Profile check notice:', err);
        // Only if 401 unauthorized
        if (err?.message?.includes('401') || err?.message?.includes('Unauthorized')) {
          setStoredToken(null);
          router.replace('/admin/login');
        }
      });

    return () => {
      isMounted = false;
    };
  }, [router]);

  // =========================================================================
  // DATA STATES
  // =========================================================================
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalSkills: 0,
    totalBlogs: 0,
    totalServices: 0,
    totalExperiences: 0,
    totalEducation: 0,
    totalCertifications: 0,
    totalTestimonials: 0,
    totalMessages: 0,
    unreadMessages: 0,
    totalVisitors: 0,
    pageViews: 0,
    projectViews: 0,
    resumeDownloads: 0,
    contactSubmissions: 0,
  });

  const [skillsList, setSkillsList] = useState<any[]>([]);
  const [projectsList, setProjectsList] = useState<any[]>([]);
  const [blogsList, setBlogsList] = useState<any[]>([]);
  const [servicesList, setServicesList] = useState<any[]>([]);
  const [experienceList, setExperienceList] = useState<any[]>([]);
  const [educationList, setEducationList] = useState<any[]>([]);
  const [certificationsList, setCertificationsList] = useState<any[]>([]);
  const [testimonialsList, setTestimonialsList] = useState<any[]>([]);
  const [messagesList, setMessagesList] = useState<any[]>([]);
  const [auditLogsList, setAuditLogsList] = useState<any[]>([]);
  const [siteSettings, setSiteSettings] = useState<any>({
    logo: '',
    favicon: '',
    heroTitle: 'Crafting High-Performance Full Stack Systems',
    heroSubtitle: 'Senior MERN & Next.js Engineer specializing in scalable distributed backends and premium web apps.',
    email: 'basi.dev@example.com',
    phone: '+1 (555) 019-2834',
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
    resumeURL: '/resume.pdf',
    resumeUrl: '/resume.pdf',
    footerDescription: 'Designed with precision. Engineered for resilience.',
    footerContent: 'Designed with precision. Engineered for resilience.',
    socialLinks: { github: 'https://github.com', linkedin: 'https://linkedin.com', twitter: 'https://x.com' },
    navLinks: {
      home: true,
      about: true,
      projects: true,
      skills: true,
      experience: true,
      services: true,
      blog: true,
      now: true,
      uses: true,
      contact: true,
    },
  });

  // Now status
  const [nowFocus, setNowFocus] = useState('High-throughput event streaming architectures and React 19 concurrent state systems.');
  const [nowSeeking, setNowSeeking] = useState('Open to select high-impact Senior Full Stack / Backend engineering positions.');
  const [nowBuilding, setNowBuilding] = useState('Nexus AI Workspaces v2.0\nDistributed CRDT document synchronizer');
  const [nowLearning, setNowLearning] = useState('Rust systems programming for high-concurrency micro-daemons\neBPF network packet tracing');

  // AI KB
  const [aiKbList, setAiKbList] = useState<any[]>([]);
  const [newKbTopic, setNewKbTopic] = useState('');
  const [newKbCategory, setNewKbCategory] = useState('Technical');
  const [newKbContent, setNewKbContent] = useState('');

  // Load backend data from MongoDB Atlas
  const refreshAllData = async () => {
    try {
      const [dash, sk, pr, bl, msg, set, srv, exp, edu, certs, tests] = await Promise.all([
        api.analytics.getDashboard().catch(() => null),
        api.skills.getAll().catch(() => []),
        api.projects.getAll().catch(() => []),
        api.blogs.getAll({ all: true }).catch(() => []),
        api.messages.getAll().catch(() => ({ data: [], unreadCount: 0 })),
        api.settings.get().catch(() => null),
        api.services.getAll(true).catch(() => []),
        api.experiences.getAll().catch(() => []),
        api.education.getAll().catch(() => []),
        api.certifications.getAll().catch(() => []),
        api.testimonials.getAll().catch(() => []),
      ]);

      if (dash?.stats) {
        setStats(dash.stats);
        if (dash.recentAudits) setAuditLogsList(dash.recentAudits);
      }
      if (Array.isArray(sk)) setSkillsList(sk);
      if (Array.isArray(pr)) setProjectsList(pr);
      if (Array.isArray(bl)) setBlogsList(bl);
      if (msg?.data) setMessagesList(msg.data);
      if (set) setSiteSettings(set);
      if (Array.isArray(srv)) setServicesList(srv);
      if (Array.isArray(exp)) setExperienceList(exp);
      if (Array.isArray(edu)) setEducationList(edu);
      if (Array.isArray(certs)) setCertificationsList(certs);
      if (Array.isArray(tests)) setTestimonialsList(tests);

      // Now data fetch
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/experiences/now`)
        .then(res => res.json())
        .then(d => {
          if (d?.data) {
            if (d.data.currentFocus) setNowFocus(d.data.currentFocus);
            if (d.data.seeking) setNowSeeking(d.data.seeking);
            if (d.data.building) setNowBuilding(d.data.building.join('\n'));
            if (d.data.learning) setNowLearning(d.data.learning.join('\n'));
          }
        })
        .catch(() => null);

      // AI KB fetch
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/experiences/ai-kb`)
        .then(res => res.json())
        .then(d => {
          if (d?.data) setAiKbList(d.data);
        })
        .catch(() => null);

    } catch (err) {
      console.warn('Refresh error:', err);
    }
  };

  useEffect(() => {
    if (!isVerifying) {
      refreshAllData();
    }
  }, [isVerifying]);

  const handleLogout = async () => {
    await api.auth.logout();
    router.replace('/admin/login');
  };

  // Generic Cloudinary file uploader helper
  const uploadToCloudinary = async (file: File, folder: string): Promise<string | null> => {
    try {
      const res = await api.upload.file(file, folder);
      if (res?.data?.url) {
        showToast('Image uploaded to Cloudinary successfully!');
        return res.data.url;
      }
      return null;
    } catch (err: any) {
      alert('Upload notice: ' + (err?.message || 'Check Cloudinary credentials in .env'));
      return null;
    }
  };

  // =========================================================================
  // 1. SKILLS CMS
  // =========================================================================
  const [selectedSkillCategory, setSelectedSkillCategory] = useState<string>('All');
  const [skillSearch, setSkillSearch] = useState('');
  const [skillsViewMode, setSkillsViewMode] = useState<'grid' | 'table'>('grid');
  const [editingSkill, setEditingSkill] = useState<any | null>(null);
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [skillFormName, setSkillFormName] = useState('');
  const [skillFormCategory, setSkillFormCategory] = useState('Frontend');
  const [skillFormIsCustomCat, setSkillFormIsCustomCat] = useState(false);
  const [skillFormCustomCat, setSkillFormCustomCat] = useState('');
  const [skillFormLevel, setSkillFormLevel] = useState(85);
  const [skillFormExperience, setSkillFormExperience] = useState('2+ Years');
  const [skillFormProjects, setSkillFormProjects] = useState('');
  const [skillFormIcon, setSkillFormIcon] = useState('');
  const [isUploadingSkillIcon, setIsUploadingSkillIcon] = useState(false);

  const distinctSkillCategories = useMemo(() => {
    const cats = new Set<string>();
    skillsList.forEach((s) => s.category && cats.add(s.category));
    return Array.from(cats).sort();
  }, [skillsList]);

  const filteredSkills = useMemo(() => {
    return skillsList.filter((s) => {
      const matchCat = selectedSkillCategory === 'All' || s.category === selectedSkillCategory;
      const matchSearch =
        s.name.toLowerCase().includes(skillSearch.toLowerCase()) ||
        s.category.toLowerCase().includes(skillSearch.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [skillsList, selectedSkillCategory, skillSearch]);

  const openAddSkillModal = () => {
    setEditingSkill(null);
    setSkillFormName('');
    setSkillFormCategory(distinctSkillCategories[0] || 'Frontend');
    setSkillFormIsCustomCat(false);
    setSkillFormCustomCat('');
    setSkillFormLevel(85);
    setSkillFormExperience('2+ Years');
    setSkillFormProjects('');
    setSkillFormIcon('');
    setIsSkillModalOpen(true);
  };

  const openEditSkillModal = (skill: any) => {
    setEditingSkill(skill);
    setSkillFormName(skill.name);
    if (distinctSkillCategories.includes(skill.category)) {
      setSkillFormCategory(skill.category);
      setSkillFormIsCustomCat(false);
      setSkillFormCustomCat('');
    } else {
      setSkillFormCategory('__CUSTOM__');
      setSkillFormIsCustomCat(true);
      setSkillFormCustomCat(skill.category);
    }
    setSkillFormLevel(skill.level);
    setSkillFormExperience(skill.experience || '1+ Years');
    setSkillFormProjects((skill.projects || []).join(', '));
    setSkillFormIcon(skill.icon || '');
    setIsSkillModalOpen(true);
  };

  const handleSaveSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalCategory = skillFormIsCustomCat
      ? skillFormCustomCat.trim() || 'General'
      : skillFormCategory;

    const skillData = {
      name: skillFormName.trim(),
      category: finalCategory,
      level: Number(skillFormLevel),
      experience: skillFormExperience.trim(),
      icon: skillFormIcon.trim(),
      projects: skillFormProjects
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean),
    };

    if (editingSkill) {
      await api.skills.update(editingSkill._id || editingSkill.name, skillData).catch(() => null);
      setSkillsList((prev) =>
        prev.map((s) => ((s._id === editingSkill._id || s.name === editingSkill.name) ? { ...s, ...skillData } : s))
      );
      showToast(`Skill "${skillData.name}" updated successfully!`);
    } else {
      const res = await api.skills.create(skillData).catch(() => null);
      setSkillsList((prev) => [...prev, res?.data || skillData]);
      setStats(prev => ({ ...prev, totalSkills: prev.totalSkills + 1 }));
      showToast(`Skill "${skillData.name}" created successfully!`);
    }
    setIsSkillModalOpen(false);
    refreshAllData();
  };

  const handleDeleteSkill = async (skillIdentifier: string) => {
    if (!confirm(`Are you sure you want to delete this skill?`)) return;
    await api.skills.delete(skillIdentifier).catch(() => null);
    setSkillsList((prev) => prev.filter((s) => s.name !== skillIdentifier && s._id !== skillIdentifier));
    setStats(prev => ({ ...prev, totalSkills: Math.max(0, prev.totalSkills - 1) }));
    showToast(`Skill deleted successfully.`);
    refreshAllData();
  };

  const handleQuickLevelChange = async (skillName: string, newLevel: number) => {
    setSkillsList((prev) =>
      prev.map((s) => (s.name === skillName ? { ...s, level: newLevel } : s))
    );
    await api.skills.update(skillName, { level: newLevel }).catch(() => null);
  };

  // =========================================================================
  // 2. PROJECTS CMS
  // =========================================================================
  const [selectedProjCategory, setSelectedProjCategory] = useState<string>('All');
  const [projSearch, setProjSearch] = useState('');
  const [editingProject, setEditingProject] = useState<any | null>(null);
  const [isProjModalOpen, setIsProjModalOpen] = useState(false);
  const [projFormTitle, setProjFormTitle] = useState('');
  const [projFormDescription, setProjFormDescription] = useState('');
  const [projFormCategory, setProjFormCategory] = useState('Full Stack');
  const [projFormIsCustomCat, setProjFormIsCustomCat] = useState(false);
  const [projFormCustomCat, setProjFormCustomCat] = useState('');
  const [projFormTags, setProjFormTags] = useState('');
  const [projFormMetrics, setProjFormMetrics] = useState('');
  const [projFormDemoUrl, setProjFormDemoUrl] = useState('');
  const [projFormGithubUrl, setProjFormGithubUrl] = useState('');
  const [projFormImage, setProjFormImage] = useState('');
  const [projFormThumbnailImage, setProjFormThumbnailImage] = useState('');
  const [projFormVideoUrl, setProjFormVideoUrl] = useState('');
  const [projFormImages, setProjFormImages] = useState('');
  const [projFormVideos, setProjFormVideos] = useState('');
  const [projFormCarouselAutoPlay, setProjFormCarouselAutoPlay] = useState(true);
  const [projFormCarouselInterval, setProjFormCarouselInterval] = useState(4000);
  const [projFormFeatured, setProjFormFeatured] = useState(false);
  const [projFormProblem, setProjFormProblem] = useState('');
  const [projFormApproach, setProjFormApproach] = useState('');
  const [projFormResult, setProjFormResult] = useState('');
  const [projFormKeyFeatures, setProjFormKeyFeatures] = useState('');
  const [isUploadingProjImg, setIsUploadingProjImg] = useState(false);
  const [isUploadingProjVideo, setIsUploadingProjVideo] = useState(false);

  const distinctProjCategories = useMemo(() => {
    const cats = new Set<string>();
    projectsList.forEach((p) => p.category && cats.add(p.category));
    return Array.from(cats).sort();
  }, [projectsList]);

  const filteredProjects = useMemo(() => {
    return projectsList.filter((p) => {
      const matchCat = selectedProjCategory === 'All' || p.category === selectedProjCategory;
      const matchSearch =
        p.title.toLowerCase().includes(projSearch.toLowerCase()) ||
        p.description.toLowerCase().includes(projSearch.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [projectsList, selectedProjCategory, projSearch]);

  const openAddProjModal = () => {
    setEditingProject(null);
    setProjFormTitle('');
    setProjFormDescription('');
    setProjFormCategory(distinctProjCategories[0] || 'Full Stack');
    setProjFormIsCustomCat(false);
    setProjFormCustomCat('');
    setProjFormTags('');
    setProjFormMetrics('');
    setProjFormDemoUrl('');
    setProjFormGithubUrl('');
    setProjFormImage('');
    setProjFormThumbnailImage('');
    setProjFormVideoUrl('');
    setProjFormImages('');
    setProjFormVideos('');
    setProjFormCarouselAutoPlay(true);
    setProjFormCarouselInterval(4000);
    setProjFormFeatured(false);
    setProjFormProblem('');
    setProjFormApproach('');
    setProjFormResult('');
    setProjFormKeyFeatures('');
    setIsProjModalOpen(true);
  };

  const openEditProjModal = (p: any) => {
    setEditingProject(p);
    setProjFormTitle(p.title);
    setProjFormDescription(p.description);
    if (distinctProjCategories.includes(p.category)) {
      setProjFormCategory(p.category);
      setProjFormIsCustomCat(false);
      setProjFormCustomCat('');
    } else {
      setProjFormCategory('__CUSTOM__');
      setProjFormIsCustomCat(true);
      setProjFormCustomCat(p.category);
    }
    setProjFormTags((p.tags || []).join(', '));
    setProjFormMetrics(p.metrics || '');
    setProjFormDemoUrl(p.demoUrl || '');
    setProjFormGithubUrl(p.githubUrl || '');
    setProjFormImage(p.image || '');
    setProjFormThumbnailImage(p.thumbnailImage || p.image || '');
    setProjFormVideoUrl(p.videoUrl || '');
    setProjFormImages(Array.isArray(p.images) ? p.images.join('\n') : (p.image ? p.image : ''));
    setProjFormVideos(Array.isArray(p.videos) ? p.videos.join('\n') : (p.videoUrl ? p.videoUrl : ''));
    setProjFormCarouselAutoPlay(p.carouselAutoPlay !== undefined ? Boolean(p.carouselAutoPlay) : true);
    setProjFormCarouselInterval(Number(p.carouselInterval) || 4000);
    setProjFormFeatured(Boolean(p.featured));
    setProjFormProblem(p.problem || '');
    setProjFormApproach(p.approach || '');
    setProjFormResult(p.result || '');
    setProjFormKeyFeatures((p.keyFeatures || []).join('\n'));
    setIsProjModalOpen(true);
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalCategory = projFormIsCustomCat
      ? projFormCustomCat.trim() || 'General'
      : projFormCategory;

    // Parse gallery images
    const rawImages = projFormImages.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
    const primaryImg = projFormThumbnailImage.trim() || projFormImage.trim();
    if (primaryImg && !rawImages.includes(primaryImg)) {
      rawImages.unshift(primaryImg);
    }

    // Parse gallery videos
    const rawVideos = projFormVideos.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
    if (projFormVideoUrl.trim() && !rawVideos.includes(projFormVideoUrl.trim())) {
      rawVideos.unshift(projFormVideoUrl.trim());
    }

    const projData = {
      title: projFormTitle.trim(),
      slug: projFormTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, ''),
      description: projFormDescription.trim(),
      category: finalCategory,
      tags: projFormTags.split(',').map((t) => t.trim()).filter(Boolean),
      metrics: projFormMetrics.trim(),
      demoUrl: projFormDemoUrl.trim(),
      githubUrl: projFormGithubUrl.trim(),
      image: primaryImg || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
      thumbnailImage: primaryImg || '',
      videoUrl: projFormVideoUrl.trim(),
      images: rawImages,
      videos: rawVideos,
      carouselAutoPlay: projFormCarouselAutoPlay,
      carouselInterval: Number(projFormCarouselInterval) || 4000,
      featured: projFormFeatured,
      problem: projFormProblem.trim(),
      approach: projFormApproach.trim(),
      result: projFormResult.trim(),
      keyFeatures: projFormKeyFeatures.split('\n').map((k) => k.trim()).filter(Boolean),
    };

    if (editingProject) {
      await api.projects.update(editingProject._id || editingProject.slug, projData).catch(() => null);
      setProjectsList((prev) =>
        prev.map((p) => ((p._id === editingProject._id || p.slug === editingProject.slug) ? { ...p, ...projData } : p))
      );
      showToast(`Project "${projData.title}" updated!`);
    } else {
      const res = await api.projects.create(projData).catch(() => null);
      setProjectsList((prev) => [res?.data || projData, ...prev]);
      setStats(prev => ({ ...prev, totalProjects: prev.totalProjects + 1 }));
      showToast(`Project "${projData.title}" created!`);
    }
    setIsProjModalOpen(false);
    refreshAllData();
  };

  const handleDeleteProject = async (idOrSlug: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    await api.projects.delete(idOrSlug).catch(() => null);
    setProjectsList((prev) => prev.filter((p) => p.slug !== idOrSlug && p._id !== idOrSlug));
    setStats(prev => ({ ...prev, totalProjects: Math.max(0, prev.totalProjects - 1) }));
    showToast('Project deleted successfully.');
    refreshAllData();
  };

  // =========================================================================
  // 3. SERVICES CMS (Problem 3)
  // =========================================================================
  const [editingService, setEditingService] = useState<any | null>(null);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [srvFormTitle, setSrvFormTitle] = useState('');
  const [srvFormIcon, setSrvFormIcon] = useState('Layers');
  const [srvFormDescription, setSrvFormDescription] = useState('');
  const [srvFormFeatures, setSrvFormFeatures] = useState('');
  const [srvFormStatus, setSrvFormStatus] = useState<'active' | 'inactive'>('active');
  const [srvFormSla, setSrvFormSla] = useState('2-4 Weeks');

  const openAddServiceModal = () => {
    setEditingService(null);
    setSrvFormTitle('');
    setSrvFormIcon('Layers');
    setSrvFormDescription('');
    setSrvFormFeatures('');
    setSrvFormStatus('active');
    setSrvFormSla('2-4 Weeks');
    setIsServiceModalOpen(true);
  };

  const openEditServiceModal = (srv: any) => {
    setEditingService(srv);
    setSrvFormTitle(srv.title);
    setSrvFormIcon(srv.icon || 'Layers');
    setSrvFormDescription(srv.description);
    setSrvFormFeatures((srv.features || srv.deliverables || []).join('\n'));
    setSrvFormStatus(srv.status || 'active');
    setSrvFormSla(srv.sla || srv.timeline || '2-4 Weeks');
    setIsServiceModalOpen(true);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    const srvData = {
      title: srvFormTitle.trim(),
      icon: srvFormIcon.trim(),
      description: srvFormDescription.trim(),
      features: srvFormFeatures.split('\n').map(f => f.trim()).filter(Boolean),
      deliverables: srvFormFeatures.split('\n').map(f => f.trim()).filter(Boolean),
      status: srvFormStatus,
      sla: srvFormSla.trim(),
    };

    if (editingService) {
      await api.services.update(editingService._id || editingService.id, srvData).catch(() => null);
      setServicesList(prev => prev.map(s => (s._id === editingService._id || s.id === editingService.id) ? { ...s, ...srvData } : s));
      showToast(`Service "${srvData.title}" updated!`);
    } else {
      const res = await api.services.create(srvData).catch(() => null);
      setServicesList(prev => [res?.data || srvData, ...prev]);
      setStats(prev => ({ ...prev, totalServices: prev.totalServices + 1 }));
      showToast(`Service "${srvData.title}" created!`);
    }
    setIsServiceModalOpen(false);
    refreshAllData();
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    await api.services.delete(id).catch(() => null);
    setServicesList(prev => prev.filter(s => s._id !== id && s.id !== id));
    setStats(prev => ({ ...prev, totalServices: Math.max(0, prev.totalServices - 1) }));
    showToast('Service deleted.');
    refreshAllData();
  };

  // =========================================================================
  // 4. EXPERIENCE CMS (Problem 4)
  // =========================================================================
  const [editingExperience, setEditingExperience] = useState<any | null>(null);
  const [isExpModalOpen, setIsExpModalOpen] = useState(false);
  const [expFormRole, setExpFormRole] = useState('');
  const [expFormCompany, setExpFormCompany] = useState('');
  const [expFormDuration, setExpFormDuration] = useState('');
  const [expFormLocation, setExpFormLocation] = useState('Remote');
  const [expFormType, setExpFormType] = useState('Full-time');
  const [expFormDescription, setExpFormDescription] = useState('');
  const [expFormTechnologies, setExpFormTechnologies] = useState('');
  const [expFormAchievements, setExpFormAchievements] = useState('');

  const openAddExpModal = () => {
    setEditingExperience(null);
    setExpFormRole('');
    setExpFormCompany('');
    setExpFormDuration('2023 - Present');
    setExpFormLocation('Remote');
    setExpFormType('Full-time');
    setExpFormDescription('');
    setExpFormTechnologies('Next.js, Node.js, TypeScript, MongoDB');
    setExpFormAchievements('');
    setIsExpModalOpen(true);
  };

  const openEditExpModal = (exp: any) => {
    setEditingExperience(exp);
    setExpFormRole(exp.role);
    setExpFormCompany(exp.company);
    setExpFormDuration(exp.duration || exp.period || '');
    setExpFormLocation(exp.location || 'Remote');
    setExpFormType(exp.type || 'Full-time');
    setExpFormDescription(exp.description);
    setExpFormTechnologies((exp.technologies || exp.skills || []).join(', '));
    setExpFormAchievements((exp.achievements || []).join('\n'));
    setIsExpModalOpen(true);
  };

  const handleSaveExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    const expData = {
      role: expFormRole.trim(),
      company: expFormCompany.trim(),
      duration: expFormDuration.trim(),
      period: expFormDuration.trim(),
      location: expFormLocation.trim(),
      type: expFormType,
      description: expFormDescription.trim(),
      technologies: expFormTechnologies.split(',').map(t => t.trim()).filter(Boolean),
      skills: expFormTechnologies.split(',').map(t => t.trim()).filter(Boolean),
      achievements: expFormAchievements.split('\n').map(a => a.trim()).filter(Boolean),
    };

    if (editingExperience) {
      await api.experiences.update(editingExperience._id || editingExperience.id, expData).catch(() => null);
      setExperienceList(prev => prev.map(exp => (exp._id === editingExperience._id || exp.id === editingExperience.id) ? { ...exp, ...expData } : exp));
      showToast('Career experience entry updated!');
    } else {
      const res = await api.experiences.create(expData).catch(() => null);
      setExperienceList(prev => [res?.data || expData, ...prev]);
      setStats(prev => ({ ...prev, totalExperiences: prev.totalExperiences + 1 }));
      showToast('Career experience entry created!');
    }
    setIsExpModalOpen(false);
    refreshAllData();
  };

  const handleDeleteExperience = async (id: string) => {
    if (!confirm('Are you sure you want to delete this work experience?')) return;
    await api.experiences.delete(id).catch(() => null);
    setExperienceList(prev => prev.filter(e => e._id !== id && e.id !== id));
    setStats(prev => ({ ...prev, totalExperiences: Math.max(0, prev.totalExperiences - 1) }));
    showToast('Experience deleted.');
    refreshAllData();
  };

  // =========================================================================
  // 5. EDUCATION CMS (Problem 5)
  // =========================================================================
  const [editingEducation, setEditingEducation] = useState<any | null>(null);
  const [isEduModalOpen, setIsEduModalOpen] = useState(false);
  const [eduFormDegree, setEduFormDegree] = useState('');
  const [eduFormSchool, setEduFormSchool] = useState('');
  const [eduFormPeriod, setEduFormPeriod] = useState('2019 - 2023');
  const [eduFormGrade, setEduFormGrade] = useState('3.8 / 4.0');
  const [eduFormHighlights, setEduFormHighlights] = useState('');

  const openAddEduModal = () => {
    setEditingEducation(null);
    setEduFormDegree('');
    setEduFormSchool('');
    setEduFormPeriod('2019 - 2023');
    setEduFormGrade('3.8 / 4.0');
    setEduFormHighlights('');
    setIsEduModalOpen(true);
  };

  const openEditEduModal = (edu: any) => {
    setEditingEducation(edu);
    setEduFormDegree(edu.degree);
    setEduFormSchool(edu.school || edu.institution || '');
    setEduFormPeriod(edu.period);
    setEduFormGrade(edu.grade || edu.gpa || '');
    setEduFormHighlights((edu.highlights || []).join('\n'));
    setIsEduModalOpen(true);
  };

  const handleSaveEducation = async (e: React.FormEvent) => {
    e.preventDefault();
    const eduData = {
      degree: eduFormDegree.trim(),
      school: eduFormSchool.trim(),
      institution: eduFormSchool.trim(),
      period: eduFormPeriod.trim(),
      grade: eduFormGrade.trim(),
      gpa: eduFormGrade.trim(),
      highlights: eduFormHighlights.split('\n').map(h => h.trim()).filter(Boolean),
    };

    if (editingEducation) {
      await api.education.update(editingEducation._id || editingEducation.id, eduData).catch(() => null);
      setEducationList(prev => prev.map(edu => (edu._id === editingEducation._id || edu.id === editingEducation.id) ? { ...edu, ...eduData } : edu));
      showToast('Education record updated!');
    } else {
      const res = await api.education.create(eduData).catch(() => null);
      setEducationList(prev => [res?.data || eduData, ...prev]);
      setStats(prev => ({ ...prev, totalEducation: prev.totalEducation + 1 }));
      showToast('Education record added!');
    }
    setIsEduModalOpen(false);
    refreshAllData();
  };

  const handleDeleteEducation = async (id: string) => {
    if (!confirm('Delete this education record?')) return;
    await api.education.delete(id).catch(() => null);
    setEducationList(prev => prev.filter(e => e._id !== id && e.id !== id));
    setStats(prev => ({ ...prev, totalEducation: Math.max(0, prev.totalEducation - 1) }));
    showToast('Education record deleted.');
    refreshAllData();
  };

  // =========================================================================
  // 6. CERTIFICATIONS CMS (Problem 6 & Problem 13 Cloudinary)
  // =========================================================================
  const [editingCert, setEditingCert] = useState<any | null>(null);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [certFormTitle, setCertFormTitle] = useState('');
  const [certFormProvider, setCertFormProvider] = useState('');
  const [certFormIssueDate, setCertFormIssueDate] = useState('2024');
  const [certFormCredentialID, setCertFormCredentialID] = useState('');
  const [certFormImage, setCertFormImage] = useState('');
  const [certFormVerifyURL, setCertFormVerifyURL] = useState('');
  const [isUploadingCertImg, setIsUploadingCertImg] = useState(false);

  const openAddCertModal = () => {
    setEditingCert(null);
    setCertFormTitle('');
    setCertFormProvider('');
    setCertFormIssueDate('2024');
    setCertFormCredentialID('');
    setCertFormImage('');
    setCertFormVerifyURL('');
    setIsCertModalOpen(true);
  };

  const openEditCertModal = (cert: any) => {
    setEditingCert(cert);
    setCertFormTitle(cert.title);
    setCertFormProvider(cert.provider);
    setCertFormIssueDate(cert.issueDate);
    setCertFormCredentialID(cert.credentialID || '');
    setCertFormImage(cert.image || '');
    setCertFormVerifyURL(cert.verifyURL || '');
    setIsCertModalOpen(true);
  };

  const handleSaveCertification = async (e: React.FormEvent) => {
    e.preventDefault();
    const certData = {
      title: certFormTitle.trim(),
      provider: certFormProvider.trim(),
      issueDate: certFormIssueDate.trim(),
      credentialID: certFormCredentialID.trim(),
      image: certFormImage.trim(),
      verifyURL: certFormVerifyURL.trim(),
    };

    if (editingCert) {
      await api.certifications.update(editingCert._id || editingCert.id, certData).catch(() => null);
      setCertificationsList(prev => prev.map(c => (c._id === editingCert._id || c.id === editingCert.id) ? { ...c, ...certData } : c));
      showToast(`Certification "${certData.title}" updated!`);
    } else {
      const res = await api.certifications.create(certData).catch(() => null);
      setCertificationsList(prev => [res?.data || certData, ...prev]);
      setStats(prev => ({ ...prev, totalCertifications: prev.totalCertifications + 1 }));
      showToast(`Certification "${certData.title}" added!`);
    }
    setIsCertModalOpen(false);
    refreshAllData();
  };

  const handleDeleteCertification = async (id: string) => {
    if (!confirm('Delete this certification?')) return;
    await api.certifications.delete(id).catch(() => null);
    setCertificationsList(prev => prev.filter(c => c._id !== id && c.id !== id));
    setStats(prev => ({ ...prev, totalCertifications: Math.max(0, prev.totalCertifications - 1) }));
    showToast('Certification deleted.');
    refreshAllData();
  };

  // =========================================================================
  // 7. TESTIMONIALS CMS (Problem 7)
  // =========================================================================
  const [editingTestimonial, setEditingTestimonial] = useState<any | null>(null);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testFormName, setTestFormName] = useState('');
  const [testFormRole, setTestFormRole] = useState('');
  const [testFormCompany, setTestFormCompany] = useState('');
  const [testFormAvatar, setTestFormAvatar] = useState('');
  const [testFormContent, setTestFormContent] = useState('');
  const [testFormRating, setTestFormRating] = useState(5);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const openAddTestModal = () => {
    setEditingTestimonial(null);
    setTestFormName('');
    setTestFormRole('');
    setTestFormCompany('');
    setTestFormAvatar('');
    setTestFormContent('');
    setTestFormRating(5);
    setIsTestModalOpen(true);
  };

  const openEditTestModal = (t: any) => {
    setEditingTestimonial(t);
    setTestFormName(t.name);
    setTestFormRole(t.role);
    setTestFormCompany(t.company);
    setTestFormAvatar(t.avatar || '');
    setTestFormContent(t.content || t.quote || '');
    setTestFormRating(t.rating || 5);
    setIsTestModalOpen(true);
  };

  const handleSaveTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    const testData = {
      name: testFormName.trim(),
      role: testFormRole.trim(),
      company: testFormCompany.trim(),
      avatar: testFormAvatar.trim(),
      content: testFormContent.trim(),
      rating: Number(testFormRating),
    };

    if (editingTestimonial) {
      await api.testimonials.update(editingTestimonial._id || editingTestimonial.id, testData).catch(() => null);
      setTestimonialsList(prev => prev.map(t => (t._id === editingTestimonial._id || t.id === editingTestimonial.id) ? { ...t, ...testData } : t));
      showToast(`Testimonial from ${testData.name} updated!`);
    } else {
      const res = await api.testimonials.create(testData).catch(() => null);
      setTestimonialsList(prev => [res?.data || testData, ...prev]);
      setStats(prev => ({ ...prev, totalTestimonials: prev.totalTestimonials + 1 }));
      showToast(`Testimonial from ${testData.name} added!`);
    }
    setIsTestModalOpen(false);
    refreshAllData();
  };

  const handleDeleteTestimonial = async (id: string) => {
    if (!confirm('Delete this testimonial?')) return;
    await api.testimonials.delete(id).catch(() => null);
    setTestimonialsList(prev => prev.filter(t => t._id !== id && t.id !== id));
    setStats(prev => ({ ...prev, totalTestimonials: Math.max(0, prev.totalTestimonials - 1) }));
    showToast('Testimonial deleted.');
    refreshAllData();
  };

  // =========================================================================
  // 8. BLOGS CMS
  // =========================================================================
  const [editingBlog, setEditingBlog] = useState<any | null>(null);
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);
  const [blogFormTitle, setBlogFormTitle] = useState('');
  const [blogFormExcerpt, setBlogFormExcerpt] = useState('');
  const [blogFormContent, setBlogFormContent] = useState('');
  const [blogFormCategory, setBlogFormCategory] = useState('Architecture');
  const [blogFormTags, setBlogFormTags] = useState('Node.js, Next.js');
  const [blogFormReadingTime, setBlogFormReadingTime] = useState('5 min read');
  const [blogFormPublished, setBlogFormPublished] = useState(true);
  const [blogFormCoverImage, setBlogFormCoverImage] = useState('');
  const [isUploadingBlogImg, setIsUploadingBlogImg] = useState(false);

  const openAddBlogModal = () => {
    setEditingBlog(null);
    setBlogFormTitle('');
    setBlogFormExcerpt('');
    setBlogFormContent('');
    setBlogFormCategory('Architecture');
    setBlogFormTags('Node.js, Next.js, Systems');
    setBlogFormReadingTime('5 min read');
    setBlogFormPublished(true);
    setBlogFormCoverImage('');
    setIsBlogModalOpen(true);
  };

  const openEditBlogModal = (b: any) => {
    setEditingBlog(b);
    setBlogFormTitle(b.title);
    setBlogFormExcerpt(b.excerpt);
    setBlogFormContent(b.content || '');
    setBlogFormCategory(b.category);
    setBlogFormTags((b.tags || []).join(', '));
    setBlogFormReadingTime(b.readingTime || '5 min read');
    setBlogFormPublished(b.published !== false);
    setBlogFormCoverImage(b.coverImage || '');
    setIsBlogModalOpen(true);
  };

  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    const blogData = {
      title: blogFormTitle.trim(),
      slug: blogFormTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, ''),
      excerpt: blogFormExcerpt.trim(),
      content: blogFormContent.trim(),
      category: blogFormCategory.trim(),
      tags: blogFormTags.split(',').map(t => t.trim()).filter(Boolean),
      readingTime: blogFormReadingTime.trim(),
      published: blogFormPublished,
      coverImage: blogFormCoverImage.trim(),
    };

    if (editingBlog) {
      await api.blogs.update(editingBlog._id || editingBlog.slug, blogData).catch(() => null);
      setBlogsList(prev => prev.map(b => (b._id === editingBlog._id || b.slug === editingBlog.slug) ? { ...b, ...blogData } : b));
      showToast(`Article "${blogData.title}" updated!`);
    } else {
      const res = await api.blogs.create(blogData).catch(() => null);
      setBlogsList(prev => [res?.data || blogData, ...prev]);
      setStats(prev => ({ ...prev, totalBlogs: prev.totalBlogs + 1 }));
      showToast(`Article "${blogData.title}" published!`);
    }
    setIsBlogModalOpen(false);
    refreshAllData();
  };

  const handleDeleteBlog = async (idOrSlug: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;
    await api.blogs.delete(idOrSlug).catch(() => null);
    setBlogsList(prev => prev.filter(b => b._id !== idOrSlug && b.slug !== idOrSlug));
    setStats(prev => ({ ...prev, totalBlogs: Math.max(0, prev.totalBlogs - 1) }));
    showToast('Article deleted.');
    refreshAllData();
  };

  // =========================================================================
  // 9. MESSAGES CMS (Problem 8)
  // =========================================================================
  const [messageFilter, setMessageFilter] = useState<'all' | 'unread' | 'read'>('all');

  const filteredMessages = useMemo(() => {
    if (messageFilter === 'unread') return messagesList.filter((m) => !m.read);
    if (messageFilter === 'read') return messagesList.filter((m) => m.read);
    return messagesList;
  }, [messagesList, messageFilter]);

  const toggleMessageRead = async (id: string, currentRead: boolean) => {
    await api.messages.toggleRead(id, !currentRead).catch(() => null);
    setMessagesList((prev) =>
      prev.map((m) => (m._id === id || m.id === id ? { ...m, read: !currentRead } : m))
    );
    setStats(prev => ({
      ...prev,
      unreadMessages: currentRead ? prev.unreadMessages + 1 : Math.max(0, prev.unreadMessages - 1)
    }));
    showToast(`Inquiry marked as ${!currentRead ? 'Read' : 'Unread'}.`);
  };

  const handleDeleteMessage = async (id: string) => {
    if (!confirm('Delete this inquiry?')) return;
    await api.messages.delete(id).catch(() => null);
    setMessagesList((prev) => prev.filter((m) => m._id !== id && m.id !== id));
    setStats(prev => ({ ...prev, totalMessages: Math.max(0, prev.totalMessages - 1) }));
    showToast('Inquiry removed.');
  };

  // =========================================================================
  // 10. SITE SETTINGS CMS (Problem 9)
  // =========================================================================
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.settings.update(siteSettings);
      if (res?.success) {
        if (res.data) setSiteSettings(res.data);
        showToast('Site settings updated and saved to MongoDB Atlas!');
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('portfolio_settings_updated', { detail: res.data }));
        }
        refreshAllData();
      } else {
        showToast('Failed to save settings: ' + (res?.message || 'Error'), 'error');
      }
    } catch (err: any) {
      showToast('Error updating settings: ' + (err?.message || 'Network error'), 'error');
    }
  };

  // =========================================================================
  // 11. NOW STATUS
  // =========================================================================
  const handleSaveNow = async () => {
    const updated = {
      currentFocus: nowFocus,
      seeking: nowSeeking,
      building: nowBuilding.split('\n').map((s: string) => s.trim()).filter(Boolean),
      learning: nowLearning.split('\n').map((s: string) => s.trim()).filter(Boolean),
      lastUpdated: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    };

    await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/experiences/now`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('admin_token') || ''}`,
      },
      body: JSON.stringify(updated),
    }).catch(() => null);

    showToast('Now status published to public /now page!');
  };

  // =========================================================================
  // 12. AI GROUNDING KNOWLEDGE BASE
  // =========================================================================
  const handleAddKb = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKbTopic || !newKbContent) return;

    const payload = {
      topic: newKbTopic.trim(),
      category: newKbCategory.trim(),
      content: newKbContent.trim(),
    };

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/experiences/ai-kb`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('admin_token') || ''}`,
      },
      body: JSON.stringify(payload),
    }).then(r => r.json()).catch(() => null);

    if (res?.data) {
      setAiKbList(prev => [res.data, ...prev]);
      setNewKbTopic('');
      setNewKbContent('');
      showToast('AI Grounding entry created!');
    }
  };

  const handleDeleteKb = async (id: string) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/experiences/ai-kb/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('admin_token') || ''}`,
      },
    }).catch(() => null);

    setAiKbList(prev => prev.filter(k => k._id !== id));
    showToast('AI knowledge entry removed.');
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-[#050816] text-foreground flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary animate-spin">
            <RefreshCw className="w-6 h-6" />
          </div>
          <p className="text-xs font-mono text-text-secondary tracking-widest uppercase">
            Securing CMS Session...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050816] text-foreground pb-24">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-surface border border-primary/40 shadow-2xl flex items-center gap-3 text-xs font-medium animate-in slide-in-from-bottom duration-300">
          <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#050816]/90 backdrop-blur-xl border-b border-border/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-tight">CMS Command Engine</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-success/15 text-success font-semibold border border-success/30">
                MONGODB LIVE
              </span>
            </div>
            <p className="text-[11px] text-text-secondary">
              Logged in as <strong className="text-foreground">{currentUser?.email || currentUser?.username || 'Administrator'}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={refreshAllData}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-elevated/70 border border-border text-xs text-text-secondary hover:text-foreground transition-colors cursor-pointer"
            title="Force refresh database state"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sync DB</span>
          </button>

          <Link
            href="/"
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-elevated/70 border border-border text-xs text-text-secondary hover:text-foreground transition-colors"
          >
            <span>Live Portfolio</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-danger/10 border border-danger/25 text-danger text-xs font-semibold hover:bg-danger/20 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-6">
        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-6 border-b border-border/60 scrollbar-none">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutGrid },
            { id: 'skills', label: `Skills (${skillsList.length})`, icon: Code2 },
            { id: 'projects', label: `Projects (${projectsList.length})`, icon: FolderGit2 },
            { id: 'blog', label: `Blogs (${blogsList.length})`, icon: BookOpen },
            { id: 'services', label: `Services (${servicesList.length})`, icon: Layers },
            { id: 'experience', label: `Career (${experienceList.length})`, icon: Briefcase },
            { id: 'education', label: `Education (${educationList.length})`, icon: GraduationCap },
            { id: 'certifications', label: `Certs (${certificationsList.length})`, icon: Award },
            { id: 'testimonials', label: `Reviews (${testimonialsList.length})`, icon: Star },
            { id: 'messages', label: `Inquiries (${messagesList.length})`, icon: MessageSquare, badge: stats.unreadMessages || messagesList.filter(m => !m.read).length },
            { id: 'settings', label: 'Site Settings', icon: Settings },
            { id: 'now', label: 'Now Status', icon: Clock },
            { id: 'ai-kb', label: 'AI Grounding', icon: Sparkles },
            { id: 'audit', label: 'Audit Trail', icon: History },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AdminTab)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                  isActive
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'text-text-secondary hover:text-foreground hover:bg-surface-elevated/70'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {Boolean(tab.badge) && (
                  <span className="px-1.5 py-0.2 rounded-full bg-danger text-white text-[10px] font-bold">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: OVERVIEW & ANALYTICS                                               */}
        {/* ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Production MongoDB Telemetry, Charts & Live Activity Stream */}
            <AnalyticsOverview onNavigateTab={(tab) => setActiveTab(tab as AdminTab)} />

            {/* Quick Actions & Recent Messages */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 glass-card p-6 rounded-3xl border border-border/80">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold">Recent Inquiries</h3>
                  <button
                    onClick={() => setActiveTab('messages')}
                    className="text-xs text-primary hover:underline font-mono cursor-pointer"
                  >
                    View All ({messagesList.length}) →
                  </button>
                </div>

                {messagesList.length === 0 ? (
                  <p className="text-xs text-text-secondary py-6 text-center">No messages received yet.</p>
                ) : (
                  <div className="space-y-2.5">
                    {messagesList.slice(0, 4).map((msg) => (
                      <div
                        key={msg._id || msg.id}
                        className="p-3.5 rounded-2xl bg-surface-elevated/60 border border-border/50 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground truncate">{msg.name}</span>
                            {!msg.read && (
                              <span className="px-1.5 py-0.5 rounded-full bg-success/15 text-success text-[10px] font-bold">
                                NEW
                              </span>
                            )}
                          </div>
                          <p className="text-text-secondary truncate text-[11px] mt-0.5">{msg.subject}</p>
                        </div>
                        <span className="text-[10px] font-mono text-text-secondary shrink-0">
                          {msg.projectType || 'General'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Jump Operations Panel */}
              <div className="glass-card p-6 rounded-3xl border border-border/80 space-y-3">
                <h3 className="text-base font-bold">Quick Operations</h3>
                <div className="space-y-2">
                  <button
                    onClick={openAddSkillModal}
                    className="w-full py-2.5 px-3 rounded-xl bg-surface-elevated/70 border border-border/60 hover:border-primary/50 text-xs font-semibold text-left flex items-center justify-between cursor-pointer"
                  >
                    <span>+ Add Skill</span>
                    <Code2 className="w-3.5 h-3.5 text-primary" />
                  </button>
                  <button
                    onClick={openAddProjModal}
                    className="w-full py-2.5 px-3 rounded-xl bg-surface-elevated/70 border border-border/60 hover:border-primary/50 text-xs font-semibold text-left flex items-center justify-between cursor-pointer"
                  >
                    <span>+ Add Project</span>
                    <FolderGit2 className="w-3.5 h-3.5 text-accent" />
                  </button>
                  <button
                    onClick={openAddServiceModal}
                    className="w-full py-2.5 px-3 rounded-xl bg-surface-elevated/70 border border-border/60 hover:border-primary/50 text-xs font-semibold text-left flex items-center justify-between cursor-pointer"
                  >
                    <span>+ Add Service</span>
                    <Layers className="w-3.5 h-3.5 text-success" />
                  </button>
                  <button
                    onClick={openAddExpModal}
                    className="w-full py-2.5 px-3 rounded-xl bg-surface-elevated/70 border border-border/60 hover:border-primary/50 text-xs font-semibold text-left flex items-center justify-between cursor-pointer"
                  >
                    <span>+ Add Career Role</span>
                    <Briefcase className="w-3.5 h-3.5 text-yellow-400" />
                  </button>
                  <button
                    onClick={openAddCertModal}
                    className="w-full py-2.5 px-3 rounded-xl bg-surface-elevated/70 border border-border/60 hover:border-primary/50 text-xs font-semibold text-left flex items-center justify-between cursor-pointer"
                  >
                    <span>+ Add Certification</span>
                    <Award className="w-3.5 h-3.5 text-pink-400" />
                  </button>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className="w-full py-2.5 px-3 rounded-xl bg-surface-elevated/70 border border-border/60 hover:border-primary/50 text-xs font-semibold text-left flex items-center justify-between cursor-pointer"
                  >
                    <span>Configure Site Settings</span>
                    <Settings className="w-3.5 h-3.5 text-text-secondary" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: SKILLS CMS                                                         */}
        {/* ========================================================================= */}
        {activeTab === 'skills' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">Skills Catalog ({skillsList.length})</h2>
                <p className="text-xs text-text-secondary">Manage proficiency percentages, categories, and proof evidence.</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={skillSearch}
                    onChange={(e) => setSkillSearch(e.target.value)}
                    placeholder="Search skills..."
                    className="bg-surface-elevated/70 border border-border/70 rounded-xl pl-8 pr-3 py-1.5 text-xs text-foreground outline-none focus:border-primary"
                  />
                </div>

                <div className="flex items-center p-1 rounded-xl bg-surface-elevated/70 border border-border">
                  <button
                    onClick={() => setSkillsViewMode('grid')}
                    className={`p-1.5 rounded-lg cursor-pointer ${skillsViewMode === 'grid' ? 'bg-primary text-white' : 'text-text-secondary'}`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setSkillsViewMode('table')}
                    className={`p-1.5 rounded-lg cursor-pointer ${skillsViewMode === 'table' ? 'bg-primary text-white' : 'text-text-secondary'}`}
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={openAddSkillModal}
                  className="px-3.5 py-1.5 rounded-xl gradient-brand-bg text-white text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Skill</span>
                </button>
              </div>
            </div>

            {/* Dynamic Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              <button
                onClick={() => setSelectedSkillCategory('All')}
                className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                  selectedSkillCategory === 'All'
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-surface-elevated/60 text-text-secondary hover:text-foreground'
                }`}
              >
                All ({skillsList.length})
              </button>
              {distinctSkillCategories.map((cat) => {
                const count = skillsList.filter((s) => s.category === cat).length;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedSkillCategory(cat)}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                      selectedSkillCategory === cat
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-surface-elevated/60 text-text-secondary hover:text-foreground'
                    }`}
                  >
                    {cat} ({count})
                  </button>
                );
              })}
            </div>

            {skillsViewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSkills.map((skill) => (
                  <div key={skill._id || skill.name} className="glass-card p-5 rounded-2xl border border-border/70 relative group">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-surface-elevated border border-border/60 flex items-center justify-center shrink-0">
                          <SkillIcon name={skill.name} icon={skill.icon} className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-semibold">
                            {skill.category}
                          </span>
                          <h3 className="text-base font-bold text-foreground mt-1">{skill.name}</h3>
                          <p className="text-[11px] text-text-secondary">{skill.experience || '1+ Years experience'}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditSkillModal(skill)}
                          className="p-1.5 rounded-lg text-text-secondary hover:text-foreground hover:bg-surface-elevated transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSkill(skill._id || skill.name)}
                          className="p-1.5 rounded-lg text-danger hover:bg-danger/10 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-text-secondary text-[10px] font-mono">Proficiency</span>
                        <span className="font-mono font-bold text-primary">{skill.level}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={skill.level}
                        onChange={(e) => handleQuickLevelChange(skill.name, Number(e.target.value))}
                        className="w-full accent-primary h-1.5 bg-surface-elevated rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-card rounded-2xl border border-border/80 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-elevated/80 border-b border-border text-text-secondary font-mono uppercase text-[10px]">
                    <tr>
                      <th className="p-3.5">Skill Name</th>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5">Level</th>
                      <th className="p-3.5">Experience</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {filteredSkills.map((skill) => (
                      <tr key={skill._id || skill.name} className="hover:bg-surface-elevated/40">
                        <td className="p-3.5 font-bold text-foreground flex items-center gap-2.5">
                          <SkillIcon name={skill.name} icon={skill.icon} className="w-4 h-4 shrink-0" />
                          <span>{skill.name}</span>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-mono text-[10px]">
                            {skill.category}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono font-bold">{skill.level}%</td>
                        <td className="p-3.5 text-text-secondary">{skill.experience || '1+ Years'}</td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => openEditSkillModal(skill)}
                            className="p-1 text-text-secondary hover:text-foreground mr-2 cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5 inline" />
                          </button>
                          <button
                            onClick={() => handleDeleteSkill(skill._id || skill.name)}
                            className="p-1 text-danger hover:opacity-80 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5 inline" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: PROJECTS CMS                                                       */}
        {/* ========================================================================= */}
        {activeTab === 'projects' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">Projects Portfolio ({projectsList.length})</h2>
                <p className="text-xs text-text-secondary">Manage case studies, metrics, problem/solution, and tags.</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={projSearch}
                    onChange={(e) => setProjSearch(e.target.value)}
                    placeholder="Search projects..."
                    className="bg-surface-elevated/70 border border-border/70 rounded-xl pl-8 pr-3 py-1.5 text-xs text-foreground outline-none focus:border-primary"
                  />
                </div>

                <button
                  onClick={openAddProjModal}
                  className="px-3.5 py-1.5 rounded-xl gradient-brand-bg text-white text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Project</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              <button
                onClick={() => setSelectedProjCategory('All')}
                className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                  selectedProjCategory === 'All'
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-surface-elevated/60 text-text-secondary hover:text-foreground'
                }`}
              >
                All ({projectsList.length})
              </button>
              {distinctProjCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedProjCategory(cat)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                    selectedProjCategory === cat
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-surface-elevated/60 text-text-secondary hover:text-foreground'
                  }`}
                >
                  {cat} ({projectsList.filter((p) => p.category === cat).length})
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProjects.map((p) => (
                <div key={p._id || p.slug} className="glass-card rounded-3xl border border-border/70 overflow-hidden flex flex-col justify-between">
                  <div>
                    {p.image && (
                      <div className="h-40 w-full overflow-hidden relative bg-surface-elevated">
                        <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                        {p.featured && (
                          <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-primary text-white text-[10px] font-bold shadow-md">
                            Featured
                          </span>
                        )}
                      </div>
                    )}
                    <div className="p-5">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-semibold">
                        {p.category}
                      </span>
                      <h3 className="text-base font-bold text-foreground mt-2">{p.title}</h3>
                      <p className="text-xs text-text-secondary mt-1 line-clamp-2">{p.description}</p>
                      {p.metrics && (
                        <div className="mt-3 text-[11px] font-mono font-bold text-accent">
                          ⚡ {p.metrics}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-5 pt-0 flex items-center justify-between border-t border-border/40 mt-3 pt-3">
                    <div className="flex items-center gap-2">
                      {p.demoUrl && (
                        <a href={p.demoUrl} target="_blank" className="text-xs text-primary hover:underline flex items-center gap-1">
                          <span>Live</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {p.githubUrl && (
                        <a href={p.githubUrl} target="_blank" className="text-xs text-text-secondary hover:text-foreground flex items-center gap-1">
                          <span>Code</span>
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditProjModal(p)}
                        className="p-1.5 rounded-lg text-text-secondary hover:text-foreground hover:bg-surface-elevated transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProject(p._id || p.slug)}
                        className="p-1.5 rounded-lg text-danger hover:bg-danger/10 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: SERVICES CMS (Problem 3)                                           */}
        {/* ========================================================================= */}
        {activeTab === 'services' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Services & Capabilities ({servicesList.length})</h2>
                <p className="text-xs text-text-secondary">Configure service offerings, deliverables, SLA timeline, and live status.</p>
              </div>

              <button
                onClick={openAddServiceModal}
                className="px-3.5 py-1.5 rounded-xl gradient-brand-bg text-white text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Service</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {servicesList.map((srv) => (
                <div key={srv._id || srv.id} className="glass-card p-6 rounded-3xl border border-border/80 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                        srv.status === 'inactive' ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'
                      }`}>
                        {srv.status || 'active'}
                      </span>
                      <span className="text-xs font-mono text-text-secondary">{srv.sla || srv.timeline || '2-4 Weeks'}</span>
                    </div>

                    <h3 className="text-lg font-bold text-foreground mb-2">{srv.title}</h3>
                    <p className="text-xs text-text-secondary line-clamp-3 mb-4">{srv.description}</p>

                    {(srv.features || srv.deliverables) && (
                      <div className="space-y-1 mb-4">
                        <p className="text-[10px] font-mono text-text-secondary uppercase">Features:</p>
                        {(srv.features || srv.deliverables).slice(0, 3).map((f: string, i: number) => (
                          <p key={i} className="text-xs text-foreground/80 flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-primary" />
                            <span className="truncate">{f}</span>
                          </p>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-1 pt-4 border-t border-border/40">
                    <button
                      onClick={() => openEditServiceModal(srv)}
                      className="p-1.5 rounded-lg text-text-secondary hover:text-foreground hover:bg-surface-elevated transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteService(srv._id || srv.id)}
                      className="p-1.5 rounded-lg text-danger hover:bg-danger/10 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: CAREER / EXPERIENCE CMS (Problem 4)                                */}
        {/* ========================================================================= */}
        {activeTab === 'experience' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Career & Work History ({experienceList.length})</h2>
                <p className="text-xs text-text-secondary">Manage employment history, duration, locations, and technologies.</p>
              </div>

              <button
                onClick={openAddExpModal}
                className="px-3.5 py-1.5 rounded-xl gradient-brand-bg text-white text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Position</span>
              </button>
            </div>

            <div className="space-y-4">
              {experienceList.map((exp) => (
                <div key={exp._id || exp.id} className="p-6 rounded-2xl glass-card border border-border/80 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                        {exp.type || 'Full-time'}
                      </span>
                      <span className="text-xs font-mono text-text-secondary">{exp.duration || exp.period}</span>
                      <span className="text-xs text-text-secondary">· {exp.location || 'Remote'}</span>
                    </div>

                    <h3 className="text-lg font-bold text-foreground">{exp.role}</h3>
                    <p className="text-xs font-medium text-primary">{exp.company}</p>
                    <p className="text-xs text-text-secondary leading-relaxed">{exp.description}</p>

                    {(exp.technologies || exp.skills) && (
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {(exp.technologies || exp.skills).map((t: string) => (
                          <span key={t} className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-elevated text-text-secondary">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => openEditExpModal(exp)}
                      className="p-2 rounded-lg text-text-secondary hover:text-foreground hover:bg-surface-elevated transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteExperience(exp._id || exp.id)}
                      className="p-2 rounded-lg text-danger hover:bg-danger/10 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: EDUCATION CMS (Problem 5)                                          */}
        {/* ========================================================================= */}
        {activeTab === 'education' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Education & Foundational Engineering ({educationList.length})</h2>
                <p className="text-xs text-text-secondary">Degrees, institutions, GPA, and foundational coursework.</p>
              </div>

              <button
                onClick={openAddEduModal}
                className="px-3.5 py-1.5 rounded-xl gradient-brand-bg text-white text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Education</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {educationList.map((edu) => (
                <div key={edu._id || edu.id} className="p-6 rounded-2xl glass-card border border-border/80 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono text-text-secondary">{edu.period}</span>
                      {(edu.grade || edu.gpa) && (
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-success/15 text-success font-bold">
                          {edu.grade || edu.gpa}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-foreground">{edu.degree}</h3>
                    <p className="text-xs font-medium text-primary mt-1">{edu.school || edu.institution}</p>
                    {edu.highlights && edu.highlights.length > 0 && (
                      <div className="mt-3 space-y-1">
                        {edu.highlights.map((h: string, i: number) => (
                          <p key={i} className="text-xs text-text-secondary">· {h}</p>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-1 pt-4 border-t border-border/40 mt-4">
                    <button
                      onClick={() => openEditEduModal(edu)}
                      className="p-1.5 rounded-lg text-text-secondary hover:text-foreground hover:bg-surface-elevated transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteEducation(edu._id || edu.id)}
                      className="p-1.5 rounded-lg text-danger hover:bg-danger/10 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 7: CERTIFICATIONS CMS (Problem 6 & 13)                                */}
        {/* ========================================================================= */}
        {activeTab === 'certifications' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Certifications & Credentials ({certificationsList.length})</h2>
                <p className="text-xs text-text-secondary">Manage verified credentials, verification links, and Cloudinary badges.</p>
              </div>

              <button
                onClick={openAddCertModal}
                className="px-3.5 py-1.5 rounded-xl gradient-brand-bg text-white text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Certification</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {certificationsList.map((cert) => (
                <div key={cert._id || cert.id} className="p-6 rounded-2xl glass-card border border-border/80 flex flex-col justify-between">
                  <div>
                    {cert.image && (
                      <div className="h-28 w-full rounded-xl overflow-hidden mb-3 bg-surface-elevated">
                        <img src={cert.image} alt={cert.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono text-text-secondary">{cert.issueDate}</span>
                      {cert.credentialID && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary/10 text-primary">
                          {cert.credentialID}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-foreground">{cert.title}</h3>
                    <p className="text-xs font-medium text-primary mt-1">{cert.provider}</p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border/40 mt-3">
                    {cert.verifyURL ? (
                      <a href={cert.verifyURL} target="_blank" className="text-xs text-primary hover:underline flex items-center gap-1">
                        <span>Verify</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : <span />}

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditCertModal(cert)}
                        className="p-1.5 rounded-lg text-text-secondary hover:text-foreground hover:bg-surface-elevated transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCertification(cert._id || cert.id)}
                        className="p-1.5 rounded-lg text-danger hover:bg-danger/10 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 8: TESTIMONIALS CMS (Problem 7)                                       */}
        {/* ========================================================================= */}
        {activeTab === 'testimonials' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Client Testimonials ({testimonialsList.length})</h2>
                <p className="text-xs text-text-secondary">Manage reviews, star ratings, client photos, and endorsements.</p>
              </div>

              <button
                onClick={openAddTestModal}
                className="px-3.5 py-1.5 rounded-xl gradient-brand-bg text-white text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Review</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {testimonialsList.map((test) => (
                <div key={test._id || test.id} className="p-6 rounded-2xl glass-card border border-border/80 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1 mb-3">
                      {[...Array(test.rating || 5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-warning fill-warning" />
                      ))}
                    </div>

                    <p className="text-xs sm:text-sm text-foreground italic mb-4">
                      &quot;{test.content || test.quote}&quot;
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border/40">
                    <div className="flex items-center gap-3">
                      {test.avatar ? (
                        <img src={test.avatar} alt={test.name} className="w-10 h-10 rounded-full object-cover border border-primary/40" />
                      ) : (
                        <div className="w-10 h-10 rounded-full gradient-brand-bg flex items-center justify-center text-white font-bold text-xs">
                          {test.name?.[0] || 'C'}
                        </div>
                      )}
                      <div>
                        <h4 className="text-sm font-bold text-foreground">{test.name}</h4>
                        <p className="text-xs text-text-secondary">{test.role} · {test.company}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditTestModal(test)}
                        className="p-1.5 rounded-lg text-text-secondary hover:text-foreground hover:bg-surface-elevated transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTestimonial(test._id || test.id)}
                        className="p-1.5 rounded-lg text-danger hover:bg-danger/10 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 9: BLOGS CMS                                                          */}
        {/* ========================================================================= */}
        {activeTab === 'blog' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Articles & Engineering Logs ({blogsList.length})</h2>
                <p className="text-xs text-text-secondary">Publish technical essays, architecture deep-dives, and guides.</p>
              </div>

              <button
                onClick={openAddBlogModal}
                className="px-3.5 py-1.5 rounded-xl gradient-brand-bg text-white text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Write Article</span>
              </button>
            </div>

            <div className="space-y-4">
              {blogsList.map((blog) => (
                <div key={blog._id || blog.slug} className="p-6 rounded-2xl glass-card border border-border/80 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                        {blog.category}
                      </span>
                      <span className="text-xs font-mono text-text-secondary">{blog.readingTime || '5 min read'}</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                        blog.published !== false ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning'
                      }`}>
                        {blog.published !== false ? 'Published' : 'Draft'}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-foreground">{blog.title}</h3>
                    <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">{blog.excerpt}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/blog/${blog.slug}`}
                      target="_blank"
                      className="p-2 rounded-lg text-text-secondary hover:text-foreground hover:bg-surface-elevated transition-colors"
                      title="View on site"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      onClick={() => openEditBlogModal(blog)}
                      className="p-2 rounded-lg text-text-secondary hover:text-foreground hover:bg-surface-elevated transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteBlog(blog._id || blog.slug)}
                      className="p-2 rounded-lg text-danger hover:bg-danger/10 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 10: MESSAGES CMS (Problem 8)                                          */}
        {/* ========================================================================= */}
        {activeTab === 'messages' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Client Inquiries & Recruitment Leads ({messagesList.length})</h2>
                <p className="text-xs text-text-secondary">Messages received from the contact form stored in MongoDB Atlas.</p>
              </div>

              <div className="flex items-center gap-1.5 p-1 rounded-xl glass-panel border border-border/60">
                <button
                  onClick={() => setMessageFilter('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                    messageFilter === 'all' ? 'bg-surface text-foreground shadow-sm' : 'text-text-secondary'
                  }`}
                >
                  All ({messagesList.length})
                </button>
                <button
                  onClick={() => setMessageFilter('unread')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                    messageFilter === 'unread' ? 'bg-surface text-foreground shadow-sm' : 'text-text-secondary'
                  }`}
                >
                  Unread ({messagesList.filter((m) => !m.read).length})
                </button>
                <button
                  onClick={() => setMessageFilter('read')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                    messageFilter === 'read' ? 'bg-surface text-foreground shadow-sm' : 'text-text-secondary'
                  }`}
                >
                  Read ({messagesList.filter((m) => m.read).length})
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {filteredMessages.map((msg) => (
                <div
                  key={msg._id || msg.id}
                  className={`p-6 rounded-3xl glass-card border transition-all ${
                    msg.read ? 'border-border/60 opacity-80' : 'border-primary/50 shadow-lg'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono uppercase px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-bold">
                          {msg.projectType || 'General Inquiry'}
                        </span>
                        {!msg.read && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-success/15 text-success font-bold">
                            NEW
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-foreground mt-1.5">{msg.subject}</h3>
                      <p className="text-xs text-text-secondary">
                        From: <strong className="text-foreground">{msg.name}</strong> ({msg.email})
                      </p>
                    </div>
                    <span className="text-xs font-mono text-text-secondary">
                      {msg.createdAt ? new Date(msg.createdAt).toLocaleDateString() : 'Recent'}
                    </span>
                  </div>

                  <p className="text-xs text-text-secondary leading-relaxed bg-surface-elevated/70 p-4 rounded-2xl border border-border/40">
                    {msg.message}
                  </p>

                  <div className="flex items-center justify-between pt-4 mt-2">
                    <button
                      onClick={() => toggleMessageRead(msg._id || msg.id, msg.read)}
                      className="text-xs text-text-secondary hover:text-foreground font-mono cursor-pointer"
                    >
                      {msg.read ? 'Mark as Unread' : 'Mark as Read'}
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDeleteMessage(msg._id || msg.id)}
                        className="p-2 rounded-xl text-danger hover:bg-danger/10 transition-colors cursor-pointer"
                        title="Delete inquiry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <a
                        href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject)}`}
                        className="px-4 py-2 rounded-xl gradient-brand-bg text-white text-xs font-bold shadow-md cursor-pointer"
                      >
                        Reply to {msg.name}
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 11: SITE SETTINGS CMS (Problem 9)                                     */}
        {/* ========================================================================= */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettings} className="p-8 rounded-3xl glass-card border border-border/80 space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-bold mb-1">Global Site Configuration (Problem 9)</h2>
              <p className="text-xs text-text-secondary">
                Fields: logo, favicon, heroTitle, heroSubtitle, email, phone, github, linkedin, resumeURL, footerDescription.
              </p>
            </div>

            {/* Profile Avatar / Hero Photo Showcase Card */}
            <div className="p-5 rounded-2xl bg-surface-elevated/40 border border-border/80 flex flex-col sm:flex-row items-center gap-6">
              <div className="relative group shrink-0">
                <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-primary via-indigo-500 to-cyan-400 shadow-xl shadow-primary/25">
                  <div className="w-full h-full rounded-full overflow-hidden bg-surface-elevated">
                    <img
                      src={siteSettings.avatar || siteSettings.logo || '/basi-portrait.jpg'}
                      alt="Profile Avatar"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/basi-portrait.jpg';
                      }}
                    />
                  </div>
                </div>
                <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-success border-2 border-[#050816]"></span>
              </div>

              <div className="flex-1 space-y-2 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h3 className="text-sm font-bold text-foreground">Hero Profile Photo / Avatar</h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    Live on Hero & Navbar
                  </span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Update your public profile photo shown in the Hero developer card widget. Upload directly or paste an image URL.
                </p>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-1">
                  <label className="px-4 py-2 rounded-xl gradient-brand-bg text-white text-xs font-semibold hover:opacity-90 cursor-pointer flex items-center gap-2 shadow-md shadow-primary/20 transition-all">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload New Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          showToast('Uploading photo to Cloudinary...');
                          const url = await uploadToCloudinary(file, 'branding');
                          if (url) {
                            setSiteSettings({ ...siteSettings, avatar: url, logo: url });
                            showToast('Photo uploaded! Click "Save Settings" below to publish.');
                          }
                        }
                      }}
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      setSiteSettings({ ...siteSettings, avatar: '/basi-portrait.jpg', logo: '/basi-portrait.jpg' });
                      showToast('Photo reset to default /basi-portrait.jpg. Remember to save!');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-surface border border-border/80 text-xs text-text-secondary hover:text-foreground transition-colors cursor-pointer"
                  >
                    Reset to Default Photo
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-mono uppercase text-text-secondary mb-1">Avatar / Logo Image URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={siteSettings.avatar || siteSettings.logo || ''}
                    onChange={(e) => setSiteSettings({ ...siteSettings, avatar: e.target.value, logo: e.target.value })}
                    placeholder="/basi-portrait.jpg or https://..."
                    className="flex-1 bg-surface-elevated/70 border border-border/70 rounded-xl px-4 py-2.5 text-xs text-foreground outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-text-secondary mb-1">Favicon URL / Cloudinary</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={siteSettings.favicon || ''}
                    onChange={(e) => setSiteSettings({ ...siteSettings, favicon: e.target.value })}
                    placeholder="/favicon.ico or Cloudinary URL"
                    className="flex-1 bg-surface-elevated/70 border border-border/70 rounded-xl px-4 py-2.5 text-xs text-foreground outline-none focus:border-primary"
                  />
                  <label className="px-3.5 py-2.5 rounded-xl bg-surface-elevated border border-border text-xs text-text-secondary hover:text-foreground cursor-pointer flex items-center gap-1.5 shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = await uploadToCloudinary(file, 'branding');
                          if (url) setSiteSettings({ ...siteSettings, favicon: url });
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-text-secondary mb-1">Hero Title</label>
                <input
                  type="text"
                  value={siteSettings.heroTitle || ''}
                  onChange={(e) => setSiteSettings({ ...siteSettings, heroTitle: e.target.value })}
                  className="w-full bg-surface-elevated/70 border border-border/70 rounded-xl px-4 py-2.5 text-xs text-foreground outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-text-secondary mb-1">Hero Subtitle</label>
                <input
                  type="text"
                  value={siteSettings.heroSubtitle || ''}
                  onChange={(e) => setSiteSettings({ ...siteSettings, heroSubtitle: e.target.value })}
                  className="w-full bg-surface-elevated/70 border border-border/70 rounded-xl px-4 py-2.5 text-xs text-foreground outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-text-secondary mb-1">Contact Email</label>
                <input
                  type="email"
                  value={siteSettings.email || ''}
                  onChange={(e) => setSiteSettings({ ...siteSettings, email: e.target.value })}
                  className="w-full bg-surface-elevated/70 border border-border/70 rounded-xl px-4 py-2.5 text-xs text-foreground outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-text-secondary mb-1">Phone Number</label>
                <input
                  type="text"
                  value={siteSettings.phone || ''}
                  onChange={(e) => setSiteSettings({ ...siteSettings, phone: e.target.value })}
                  className="w-full bg-surface-elevated/70 border border-border/70 rounded-xl px-4 py-2.5 text-xs text-foreground outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-text-secondary mb-1">Resume File / URL</label>
                <input
                  type="text"
                  value={siteSettings.resumeURL || siteSettings.resumeUrl || ''}
                  onChange={(e) => setSiteSettings({ ...siteSettings, resumeURL: e.target.value, resumeUrl: e.target.value })}
                  className="w-full bg-surface-elevated/70 border border-border/70 rounded-xl px-4 py-2.5 text-xs text-foreground outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-text-secondary mb-1">GitHub Profile</label>
                <input
                  type="text"
                  value={siteSettings.github || siteSettings.socialLinks?.github || ''}
                  onChange={(e) =>
                    setSiteSettings({
                      ...siteSettings,
                      github: e.target.value,
                      socialLinks: { ...siteSettings.socialLinks, github: e.target.value },
                    })
                  }
                  className="w-full bg-surface-elevated/70 border border-border/70 rounded-xl px-4 py-2.5 text-xs text-foreground outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-text-secondary mb-1">LinkedIn Profile</label>
                <input
                  type="text"
                  value={siteSettings.linkedin || siteSettings.socialLinks?.linkedin || ''}
                  onChange={(e) =>
                    setSiteSettings({
                      ...siteSettings,
                      linkedin: e.target.value,
                      socialLinks: { ...siteSettings.socialLinks, linkedin: e.target.value },
                    })
                  }
                  className="w-full bg-surface-elevated/70 border border-border/70 rounded-xl px-4 py-2.5 text-xs text-foreground outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-text-secondary mb-1">Footer Description</label>
                <input
                  type="text"
                  value={siteSettings.footerDescription || siteSettings.footerContent || ''}
                  onChange={(e) => setSiteSettings({ ...siteSettings, footerDescription: e.target.value, footerContent: e.target.value })}
                  className="w-full bg-surface-elevated/70 border border-border/70 rounded-xl px-4 py-2.5 text-xs text-foreground outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-text-secondary mb-1">Full Name</label>
                <input
                  type="text"
                  value={siteSettings.name || ''}
                  onChange={(e) => setSiteSettings({ ...siteSettings, name: e.target.value })}
                  placeholder="Muhammed Abdul Basith"
                  className="w-full bg-surface-elevated/70 border border-border/70 rounded-xl px-4 py-2.5 text-xs text-foreground outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-text-secondary mb-1">Location / Working Preference</label>
                <input
                  type="text"
                  value={siteSettings.location || ''}
                  onChange={(e) => setSiteSettings({ ...siteSettings, location: e.target.value })}
                  placeholder="Remote / Worldwide"
                  className="w-full bg-surface-elevated/70 border border-border/70 rounded-xl px-4 py-2.5 text-xs text-foreground outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-text-secondary mb-1">Twitter / X Profile</label>
                <input
                  type="text"
                  value={siteSettings.socialLinks?.twitter || ''}
                  onChange={(e) =>
                    setSiteSettings({
                      ...siteSettings,
                      socialLinks: { ...siteSettings.socialLinks, twitter: e.target.value },
                    })
                  }
                  placeholder="https://x.com/username"
                  className="w-full bg-surface-elevated/70 border border-border/70 rounded-xl px-4 py-2.5 text-xs text-foreground outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* Navigation Menu Visibility & Enable/Disable Controls */}
            <div className="pt-6 border-t border-border/60">
              <div className="mb-4">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Menu className="w-4 h-4 text-primary" />
                  Navigation Links Visibility Controls
                </h3>
                <p className="text-xs text-text-secondary">
                  Enable or disable specific navigation tabs across the desktop navbar and mobile menu.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {[
                  { key: 'home', label: 'Home Page (/)' },
                  { key: 'about', label: 'About (/about)' },
                  { key: 'projects', label: 'Projects (/projects)' },
                  { key: 'skills', label: 'Skills (/skills)' },
                  { key: 'experience', label: 'Experience (/experience)' },
                  { key: 'services', label: 'Services (/services)' },
                  { key: 'blog', label: 'Blog (/blog)' },
                  { key: 'now', label: 'Now (/now)' },
                  { key: 'uses', label: 'Uses (/uses)' },
                  { key: 'contact', label: 'Contact CTA (/contact)' },
                ].map((navItem) => {
                  const isEnabled = (siteSettings.navLinks as any)?.[navItem.key] !== false;
                  return (
                    <label
                      key={navItem.key}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isEnabled 
                          ? 'bg-surface-elevated/70 border-primary/50 text-foreground shadow-sm' 
                          : 'bg-surface-elevated/20 border-border/40 text-text-secondary opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold">{navItem.label}</span>
                        <input
                          type="checkbox"
                          checked={isEnabled}
                          onChange={(e) => {
                            setSiteSettings({
                              ...siteSettings,
                              navLinks: {
                                ...(siteSettings.navLinks || {}),
                                [navItem.key]: e.target.checked,
                              },
                            });
                          }}
                          className="accent-primary w-4 h-4 cursor-pointer"
                        />
                      </div>
                      <span className={`text-[10px] font-mono ${isEnabled ? 'text-success font-bold' : 'text-text-secondary'}`}>
                        {isEnabled ? '● Active in Nav' : '○ Hidden from Nav'}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl gradient-brand-bg text-white text-xs font-bold shadow-md cursor-pointer hover:opacity-95"
              >
                Save Site Settings
              </button>
            </div>
          </form>
        )}

        {/* ========================================================================= */}
        {/* TAB 12: NOW STATUS                                                        */}
        {/* ========================================================================= */}
        {activeTab === 'now' && (
          <div className="p-8 rounded-3xl glass-card border border-border/80 space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-bold mb-1">Edit /now Single-Record Status</h2>
              <p className="text-xs text-text-secondary">Directly synchronizes to the public /now page.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-text-secondary mb-1">Current Focus</label>
                <input
                  type="text"
                  value={nowFocus}
                  onChange={(e) => setNowFocus(e.target.value)}
                  className="w-full bg-surface-elevated/70 border border-border/70 rounded-xl px-4 py-2.5 text-xs text-foreground outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-text-secondary mb-1">Seeking Status</label>
                <textarea
                  rows={2}
                  value={nowSeeking}
                  onChange={(e) => setNowSeeking(e.target.value)}
                  className="w-full bg-surface-elevated/70 border border-border/70 rounded-xl px-4 py-2.5 text-xs text-foreground outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-text-secondary mb-1">Currently Building (1 per line)</label>
                  <textarea
                    rows={4}
                    value={nowBuilding}
                    onChange={(e) => setNowBuilding(e.target.value)}
                    className="w-full bg-surface-elevated/70 border border-border/70 rounded-xl p-3 text-xs text-foreground font-mono outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-text-secondary mb-1">Currently Learning (1 per line)</label>
                  <textarea
                    rows={4}
                    value={nowLearning}
                    onChange={(e) => setNowLearning(e.target.value)}
                    className="w-full bg-surface-elevated/70 border border-border/70 rounded-xl p-3 text-xs text-foreground font-mono outline-none focus:border-primary"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveNow}
                className="px-6 py-2.5 rounded-xl gradient-brand-bg text-white text-xs font-bold shadow-md cursor-pointer hover:opacity-95"
              >
                Save /now Status
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 13: AI GROUNDING                                                      */}
        {/* ========================================================================= */}
        {activeTab === 'ai-kb' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="p-8 rounded-3xl glass-card border border-border/80 space-y-4">
              <h2 className="text-xl font-bold mb-1">AI Grounding Knowledge Base (Problem 11)</h2>
              <p className="text-xs text-text-secondary">Strict database facts used to prevent chatbot hallucinations.</p>

              <form onSubmit={handleAddKb} className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-mono uppercase text-text-secondary mb-1">Topic</label>
                    <input
                      type="text"
                      required
                      value={newKbTopic}
                      onChange={e => setNewKbTopic(e.target.value)}
                      placeholder="e.g. Database Indexing Philosophy"
                      className="w-full bg-surface-elevated/70 border border-border/70 rounded-xl px-3.5 py-2 text-xs text-foreground outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase text-text-secondary mb-1">Category</label>
                    <select
                      value={newKbCategory}
                      onChange={e => setNewKbCategory(e.target.value)}
                      className="w-full bg-surface-elevated/70 border border-border/70 rounded-xl px-3.5 py-2 text-xs text-foreground outline-none focus:border-primary"
                    >
                      <option value="Technical">Technical</option>
                      <option value="Career">Career</option>
                      <option value="General">General</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-text-secondary mb-1">Factual Context</label>
                  <textarea
                    rows={3}
                    required
                    value={newKbContent}
                    onChange={e => setNewKbContent(e.target.value)}
                    placeholder="Provide grounded facts that AI can answer questions with..."
                    className="w-full bg-surface-elevated/70 border border-border/70 rounded-xl p-3 text-xs text-foreground outline-none focus:border-primary"
                  />
                </div>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl gradient-brand-bg text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Add Fact to AI Memory
                </button>
              </form>
            </div>

            <div className="space-y-3">
              {aiKbList.map((kb) => (
                <div key={kb._id} className="p-5 rounded-2xl glass-card border border-border/80 flex items-start justify-between gap-4 text-xs">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                        {kb.category}
                      </span>
                      <h4 className="font-bold text-foreground">{kb.topic}</h4>
                    </div>
                    <p className="text-text-secondary mt-1">{kb.content}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteKb(kb._id)}
                    className="p-1.5 rounded-lg text-danger hover:bg-danger/10 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 14: AUDIT TRAIL                                                       */}
        {/* ========================================================================= */}
        {activeTab === 'audit' && (
          <div className="glass-card p-6 rounded-3xl border border-border/80 space-y-4 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-bold mb-1">Audit Trail & Security Log</h2>
              <p className="text-xs text-text-secondary">Immutable log of system modifications and administrative events.</p>
            </div>

            <div className="space-y-2">
              {auditLogsList.map((log, i) => (
                <div key={i} className="p-3.5 rounded-2xl bg-surface-elevated/50 border border-border/40 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                      {log.action}
                    </span>
                    <span className="font-semibold text-foreground">{log.target}</span>
                  </div>
                  <div className="flex items-center gap-4 text-text-secondary text-[11px] font-mono">
                    <span>{log.author}</span>
                    <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT SKILL                                                   */}
      {/* ========================================================================= */}
      {isSkillModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-surface p-6 sm:p-8 rounded-3xl border border-primary/30 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold">{editingSkill ? 'Edit Skill' : 'Add New Skill'}</h3>
              <button onClick={() => setIsSkillModalOpen(false)} className="p-1 rounded-lg text-text-secondary hover:text-foreground cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSkill} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-text-secondary mb-1">Skill Name</label>
                <input
                  type="text"
                  required
                  value={skillFormName}
                  onChange={(e) => setSkillFormName(e.target.value)}
                  placeholder="e.g. GraphQL, Tailwind CSS, Docker"
                  className="w-full bg-surface-elevated/70 border border-border/70 rounded-xl px-3.5 py-2 text-xs text-foreground outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-text-secondary mb-1">Category</label>
                <div className="space-y-2">
                  <select
                    value={skillFormIsCustomCat ? '__CUSTOM__' : skillFormCategory}
                    onChange={(e) => {
                      if (e.target.value === '__CUSTOM__') {
                        setSkillFormIsCustomCat(true);
                      } else {
                        setSkillFormIsCustomCat(false);
                        setSkillFormCategory(e.target.value);
                      }
                    }}
                    className="w-full bg-surface-elevated/70 border border-border/70 rounded-xl px-3.5 py-2 text-xs text-foreground outline-none focus:border-primary"
                  >
                    {distinctSkillCategories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                    <option value="__CUSTOM__">+ Custom Category...</option>
                  </select>

                  {skillFormIsCustomCat && (
                    <input
                      type="text"
                      required
                      value={skillFormCustomCat}
                      onChange={(e) => setSkillFormCustomCat(e.target.value)}
                      placeholder="Type custom category name..."
                      className="w-full bg-surface-elevated/70 border border-primary/50 rounded-xl px-3.5 py-2 text-xs text-foreground outline-none focus:border-primary"
                    />
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-mono text-text-secondary">Proficiency Level</span>
                  <span className="font-mono font-bold text-primary">{skillFormLevel}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={skillFormLevel}
                  onChange={(e) => setSkillFormLevel(Number(e.target.value))}
                  className="w-full accent-primary h-2 bg-surface-elevated rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-text-secondary mb-1">Experience Duration</label>
                <input
                  type="text"
                  value={skillFormExperience}
                  onChange={(e) => setSkillFormExperience(e.target.value)}
                  placeholder="e.g. 3+ Years"
                  className="w-full bg-surface-elevated/70 border border-border/70 rounded-xl px-3.5 py-2 text-xs text-foreground outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-text-secondary mb-1">Evidence Projects (Comma-separated slugs)</label>
                <input
                  type="text"
                  value={skillFormProjects}
                  onChange={(e) => setSkillFormProjects(e.target.value)}
                  placeholder="e.g. nexus-ai-workspaces, pulse-commerce"
                  className="w-full bg-surface-elevated/70 border border-border/70 rounded-xl px-3.5 py-2 text-xs text-foreground outline-none focus:border-primary"
                />
              </div>

              {/* Cloudinary Icon Upload (Problem 13) */}
              <div>
                <label className="block text-xs font-mono uppercase text-text-secondary mb-1">Skill Icon URL / Cloudinary</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={skillFormIcon}
                    onChange={(e) => setSkillFormIcon(e.target.value)}
                    placeholder="https://... or upload"
                    className="flex-1 bg-surface-elevated/70 border border-border/70 rounded-xl px-3.5 py-2 text-xs text-foreground outline-none focus:border-primary"
                  />
                  <label className="px-3 py-2 rounded-xl bg-surface-elevated border border-border text-xs text-text-secondary hover:text-foreground cursor-pointer flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setIsUploadingSkillIcon(true);
                          const url = await uploadToCloudinary(file, 'skills');
                          if (url) setSkillFormIcon(url);
                          setIsUploadingSkillIcon(false);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSkillModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface-elevated text-text-secondary text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploadingSkillIcon}
                  className="px-5 py-2 rounded-xl gradient-brand-bg text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  {editingSkill ? 'Save Changes' : 'Create Skill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT PROJECT                                                 */}
      {/* ========================================================================= */}
      {isProjModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-xl bg-surface p-6 sm:p-8 rounded-3xl border border-primary/30 shadow-2xl animate-in zoom-in-95 duration-200 my-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold">{editingProject ? 'Edit Project' : 'Add New Project'}</h3>
              <button onClick={() => setIsProjModalOpen(false)} className="p-1 rounded-lg text-text-secondary hover:text-foreground cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-text-secondary mb-1">Project Title</label>
                <input
                  type="text"
                  required
                  value={projFormTitle}
                  onChange={(e) => setProjFormTitle(e.target.value)}
                  placeholder="e.g. Distributed Telemetry Pipeline"
                  className="w-full bg-surface-elevated/70 border border-border/70 rounded-xl px-3.5 py-2 text-xs text-foreground outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-text-secondary mb-1">Short Description</label>
                <textarea
                  rows={2}
                  required
                  value={projFormDescription}
                  onChange={(e) => setProjFormDescription(e.target.value)}
                  className="w-full bg-surface-elevated/70 border border-border/70 rounded-xl px-3.5 py-2 text-xs text-foreground outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-text-secondary mb-1">Category</label>
                  <select
                    value={projFormIsCustomCat ? '__CUSTOM__' : projFormCategory}
                    onChange={(e) => {
                      if (e.target.value === '__CUSTOM__') {
                        setProjFormIsCustomCat(true);
                      } else {
                        setProjFormIsCustomCat(false);
                        setProjFormCategory(e.target.value);
                      }
                    }}
                    className="w-full bg-surface-elevated/70 border border-border/70 rounded-xl px-3.5 py-2 text-xs text-foreground outline-none focus:border-primary"
                  >
                    {distinctProjCategories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                    <option value="__CUSTOM__">+ Custom Category...</option>
                  </select>

                  {projFormIsCustomCat && (
                    <input
                      type="text"
                      required
                      value={projFormCustomCat}
                      onChange={(e) => setProjFormCustomCat(e.target.value)}
                      placeholder="Category name..."
                      className="w-full mt-1.5 bg-surface-elevated/70 border border-primary/50 rounded-xl px-3.5 py-2 text-xs text-foreground outline-none focus:border-primary"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-text-secondary mb-1">Metric Tag</label>
                  <input
                    type="text"
                    value={projFormMetrics}
                    onChange={(e) => setProjFormMetrics(e.target.value)}
                    placeholder="e.g. 4.2M events/sec"
                    className="w-full bg-surface-elevated/70 border border-border/70 rounded-xl px-3.5 py-2 text-xs text-foreground outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-text-secondary mb-1">Technologies / Tags (Comma-separated)</label>
                <input
                  type="text"
                  value={projFormTags}
                  onChange={(e) => setProjFormTags(e.target.value)}
                  placeholder="e.g. Next.js 16, Redis, MongoDB, TypeScript"
                  className="w-full bg-surface-elevated/70 border border-border/70 rounded-xl px-3.5 py-2 text-xs text-foreground outline-none focus:border-primary"
                />
              </div>

              {/* Media: Thumbnail / Cover Image */}
              <div>
                <label className="block text-xs font-mono uppercase text-text-secondary mb-1">Thumbnail / Cover Image (Cloudinary)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={projFormThumbnailImage || projFormImage}
                    onChange={(e) => {
                      setProjFormThumbnailImage(e.target.value);
                      setProjFormImage(e.target.value);
                    }}
                    placeholder="Paste image URL or upload thumbnail"
                    className="flex-1 bg-surface-elevated/70 border border-border/70 rounded-xl px-3.5 py-2 text-xs text-foreground outline-none focus:border-primary"
                  />
                  <label className="px-4 py-2 rounded-xl bg-surface-elevated border border-border text-xs text-text-secondary hover:text-foreground cursor-pointer flex items-center gap-1.5 shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Thumb</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setIsUploadingProjImg(true);
                          const url = await uploadToCloudinary(file, 'projects');
                          if (url) {
                            setProjFormThumbnailImage(url);
                            setProjFormImage(url);
                          }
                          setIsUploadingProjImg(false);
                        }
                      }}
                    />
                  </label>
                </div>

                {/* Live Container Auto-Adjust Preview for Thumbnail */}
                {(projFormThumbnailImage || projFormImage) && (
                  <div className="mt-2.5 p-3 rounded-2xl bg-surface-elevated/50 border border-border/70 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-text-secondary flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                        <span>Container Auto-Adjust Preview (Atmospheric glow, 100% visible)</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setProjFormThumbnailImage('');
                          setProjFormImage('');
                        }}
                        className="text-danger hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="relative aspect-[16/10] max-h-44 w-full rounded-xl overflow-hidden border border-border/80 bg-surface-elevated flex items-center justify-center">
                      <div
                        className="absolute inset-0 bg-cover bg-center blur-2xl opacity-40 scale-125 pointer-events-none"
                        style={{ backgroundImage: `url(${projFormThumbnailImage || projFormImage})` }}
                      />
                      <img
                        src={projFormThumbnailImage || projFormImage}
                        alt="Uploaded Thumbnail Preview"
                        className="relative z-10 max-h-full max-w-full w-auto h-auto object-contain drop-shadow-md"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Media: Demo Video URL & Upload */}
              <div>
                <label className="block text-xs font-mono uppercase text-text-secondary mb-1">Demo Video URL (MP4 / YouTube / Vimeo / Cloudinary)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={projFormVideoUrl}
                    onChange={(e) => setProjFormVideoUrl(e.target.value)}
                    placeholder="https://... (direct video file or YouTube/Vimeo embed)"
                    className="flex-1 bg-surface-elevated/70 border border-border/70 rounded-xl px-3.5 py-2 text-xs text-foreground outline-none focus:border-primary"
                  />
                  <label className="px-4 py-2 rounded-xl bg-surface-elevated border border-border text-xs text-text-secondary hover:text-foreground cursor-pointer flex items-center gap-1.5 shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Video</span>
                    <input
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setIsUploadingProjVideo(true);
                          const url = await uploadToCloudinary(file, 'project_videos');
                          if (url) setProjFormVideoUrl(url);
                          setIsUploadingProjVideo(false);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Media: Multiple Gallery Images (One per line or comma-separated) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-mono uppercase text-text-secondary">
                    Gallery Images (Multiple for Auto-Carousel)
                  </label>
                  <label className="text-[11px] font-mono text-primary hover:underline cursor-pointer flex items-center gap-1">
                    <Upload className="w-3 h-3" />
                    <span>+ Upload & Append</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = await uploadToCloudinary(file, 'projects');
                          if (url) {
                            setProjFormImages(prev => prev ? `${prev}\n${url}` : url);
                          }
                        }
                      }}
                    />
                  </label>
                </div>
                <textarea
                  rows={2}
                  value={projFormImages}
                  onChange={(e) => setProjFormImages(e.target.value)}
                  placeholder="Paste multiple image URLs (one per line or comma-separated)..."
                  className="w-full bg-surface-elevated/70 border border-border/70 rounded-xl px-3.5 py-2 text-xs text-foreground outline-none focus:border-primary font-mono"
                />

                {/* Gallery Images Auto-Adjust Preview Strip */}
                {projFormImages.trim() && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {projFormImages.split(/[\n,]+/).map((u) => u.trim()).filter(Boolean).map((imgUrl, i) => (
                      <div key={i} className="relative w-20 h-14 rounded-lg overflow-hidden border border-border bg-surface-elevated flex items-center justify-center group shadow-sm">
                        <div
                          className="absolute inset-0 bg-cover bg-center blur-md opacity-40 scale-125"
                          style={{ backgroundImage: `url(${imgUrl})` }}
                        />
                        <img src={imgUrl} alt={`Gallery item ${i + 1}`} className="relative z-10 max-h-full max-w-full object-contain" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Media: Multiple Gallery Videos */}
              <div>
                <label className="block text-xs font-mono uppercase text-text-secondary mb-1">
                  Gallery Videos (Additional video URLs, one per line)
                </label>
                <textarea
                  rows={2}
                  value={projFormVideos}
                  onChange={(e) => setProjFormVideos(e.target.value)}
                  placeholder="Paste additional video URLs (MP4 / YouTube / Vimeo)..."
                  className="w-full bg-surface-elevated/70 border border-border/70 rounded-xl px-3.5 py-2 text-xs text-foreground outline-none focus:border-primary font-mono"
                />
              </div>

              {/* Carousel Configuration */}
              <div className="p-3.5 rounded-2xl bg-surface-elevated/40 border border-border/60 grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium">
                  <input
                    type="checkbox"
                    checked={projFormCarouselAutoPlay}
                    onChange={(e) => setProjFormCarouselAutoPlay(e.target.checked)}
                    className="rounded accent-primary w-4 h-4 cursor-pointer"
                  />
                  <span>Automatic Slide Transition (AutoPlay)</span>
                </label>

                <div>
                  <label className="block text-[11px] font-mono text-text-secondary mb-1">Slide Interval (ms)</label>
                  <input
                    type="number"
                    min={1500}
                    step={500}
                    value={projFormCarouselInterval}
                    onChange={(e) => setProjFormCarouselInterval(Number(e.target.value) || 4000)}
                    placeholder="4000"
                    className="w-full bg-surface-elevated border border-border/60 rounded-xl px-3 py-1.5 text-xs text-foreground outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-text-secondary mb-1">Live Demo URL</label>
                  <input
                    type="url"
                    value={projFormDemoUrl}
                    onChange={(e) => setProjFormDemoUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-surface-elevated/70 border border-border/70 rounded-xl px-3.5 py-2 text-xs text-foreground outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-text-secondary mb-1">GitHub Repo URL</label>
                  <input
                    type="url"
                    value={projFormGithubUrl}
                    onChange={(e) => setProjFormGithubUrl(e.target.value)}
                    placeholder="https://github.com/..."
                    className="w-full bg-surface-elevated/70 border border-border/70 rounded-xl px-3.5 py-2 text-xs text-foreground outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium">
                  <input
                    type="checkbox"
                    checked={projFormFeatured}
                    onChange={(e) => setProjFormFeatured(e.target.checked)}
                    className="rounded accent-primary w-4 h-4 cursor-pointer"
                  />
                  <span>Feature on Homepage Hero & Top Bento</span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-text-secondary mb-1">Problem Statement</label>
                <textarea
                  rows={2}
                  value={projFormProblem}
                  onChange={(e) => setProjFormProblem(e.target.value)}
                  className="w-full bg-surface-elevated/70 border border-border/70 rounded-xl px-3.5 py-2 text-xs text-foreground outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-text-secondary mb-1">Architectural Approach</label>
                <textarea
                  rows={2}
                  value={projFormApproach}
                  onChange={(e) => setProjFormApproach(e.target.value)}
                  className="w-full bg-surface-elevated/70 border border-border/70 rounded-xl px-3.5 py-2 text-xs text-foreground outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-text-secondary mb-1">Measurable Result & Impact</label>
                <textarea
                  rows={2}
                  value={projFormResult}
                  onChange={(e) => setProjFormResult(e.target.value)}
                  className="w-full bg-surface-elevated/70 border border-border/70 rounded-xl px-3.5 py-2 text-xs text-foreground outline-none focus:border-primary"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsProjModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface-elevated text-text-secondary text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploadingProjImg}
                  className="px-5 py-2 rounded-xl gradient-brand-bg text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  {editingProject ? 'Save Changes' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT SERVICE (Problem 3)                                      */}
      {/* ========================================================================= */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-surface p-6 sm:p-8 rounded-3xl border border-primary/30 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold">{editingService ? 'Edit Service' : 'Add New Service'}</h3>
              <button onClick={() => setIsServiceModalOpen(false)} className="p-1 rounded-lg text-text-secondary hover:text-foreground cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-text-secondary mb-1">Service Title</label>
                <input
                  type="text"
                  required
                  value={srvFormTitle}
                  onChange={(e) => setSrvFormTitle(e.target.value)}
                  placeholder="e.g. Full Stack Architecture & Web Apps"
                  className="w-full bg-surface-elevated/70 border border-border/70 rounded-xl px-3.5 py-2 text-xs text-foreground outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-text-secondary mb-1">Status</label>
                  <select
                    value={srvFormStatus}
                    onChange={(e: any) => setSrvFormStatus(e.target.value)}
                    className="w-full bg-surface-elevated/70 border border-border/70 rounded-xl px-3.5 py-2 text-xs text-foreground outline-none focus:border-primary"
                  >
                    <option value="active">Active (Visible)</option>
                    <option value="inactive">Inactive (Hidden)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-text-secondary mb-1">Estimated Timeline / SLA</label>
                  <input
                    type="text"
                    value={srvFormSla}
                    onChange={(e) => setSrvFormSla(e.target.value)}
                    placeholder="e.g. 2-4 Weeks"
                    className="w-full bg-surface-elevated/70 border border-border/70 rounded-xl px-3.5 py-2 text-xs text-foreground outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-text-secondary mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={srvFormDescription}
                  onChange={(e) => setSrvFormDescription(e.target.value)}
                  placeholder="Detailed explanation of the engineering service..."
                  className="w-full bg-surface-elevated/70 border border-border/70 rounded-xl px-3.5 py-2 text-xs text-foreground outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-text-secondary mb-1">Features / Deliverables (1 per line)</label>
                <textarea
                  rows={4}
                  value={srvFormFeatures}
                  onChange={(e) => setSrvFormFeatures(e.target.value)}
                  placeholder="Production Next.js App\nREST & GraphQL APIs\nCI/CD Deployment"
                  className="w-full bg-surface-elevated/70 border border-border/70 rounded-xl px-3.5 py-2 text-xs text-foreground font-mono outline-none focus:border-primary"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsServiceModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface-elevated text-text-secondary text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl gradient-brand-bg text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  {editingService ? 'Save Changes' : 'Create Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT EXPERIENCE (Problem 4)                                   */}
      {/* ========================================================================= */}
      {isExpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-surface p-6 sm:p-8 rounded-3xl border border-primary/30 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold">{editingExperience ? 'Edit Position' : 'Add Position'}</h3>
              <button onClick={() => setIsExpModalOpen(false)} className="p-1 rounded-lg text-text-secondary hover:text-foreground cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveExperience} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-text-secondary mb-1">Role / Job Title</label>
                  <input
                    type="text"
                    required
                    value={expFormRole}
                    onChange={(e) => setExpFormRole(e.target.value)}
                    placeholder="e.g. Senior Backend Engineer"
                    className="w-full bg-surface-elevated/70 border border-border/70 rounded-xl px-3.5 py-2 text-xs text-foreground outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-text-secondary mb-1">Company</label>
                  <input
                    type="text"
                    required
                    value={expFormCompany}
                    onChange={(e) => setExpFormCompany(e.target.value)}
                    placeholder="e.g. Nexus Tech Labs"
                    className="w-full bg-surface-elevated/70 border border-border/70 rounded-xl px-3.5 py-2 text-xs text-foreground outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-text-secondary mb-1">Duration</label>
                  <input
                    type="text"
                    required
                    value={expFormDuration}
                    onChange={(e) => setExpFormDuration(e.target.value)}
                    placeholder="2023 - Present"
                    className="w-full bg-surface-elevated/70 border border-border/70 rounded-xl px-3.5 py-2 text-xs text-foreground outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-text-secondary mb-1">Location</label>
                  <input
                    type="text"
                    value={expFormLocation}
                    onChange={(e) => setExpFormLocation(e.target.value)}
                    placeholder="Remote"
                    className="w-full bg-surface-elevated/70 border border-border/70 rounded-xl px-3.5 py-2 text-xs text-foreground outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-text-secondary mb-1">Type</label>
                  <select
                    value={expFormType}
                    onChange={(e) => setExpFormType(e.target.value)}
                    className="w-full bg-surface-elevated/70 border border-border/70 rounded-xl px-3.5 py-2 text-xs text-foreground outline-none focus:border-primary"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Freelance">Freelance</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-text-secondary mb-1">Description</label>
                <textarea
                  rows={2}
                  required
                  value={expFormDescription}
                  onChange={(e) => setExpFormDescription(e.target.value)}
                  className="w-full bg-surface-elevated/70 border border-border/70 rounded-xl px-3.5 py-2 text-xs text-foreground outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-text-secondary mb-1">Technologies (Comma-separated)</label>
                <input
                  type="text"
                  value={expFormTechnologies}
                  onChange={(e) => setExpFormTechnologies(e.target.value)}
                  placeholder="Node.js, Next.js, Redis, MongoDB"
                  className="w-full bg-surface-elevated/70 border border-border/70 rounded-xl px-3.5 py-2 text-xs text-foreground outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-text-secondary mb-1">Achievements (1 per line)</label>
                <textarea
                  rows={3}
                  value={expFormAchievements}
                  onChange={(e) => setExpFormAchievements(e.target.value)}
                  placeholder="Cut p99 latency by 85%\nScaled to 4.2M events/day"
                  className="w-full bg-surface-elevated/70 border border-border/70 rounded-xl px-3.5 py-2 text-xs text-foreground font-mono outline-none focus:border-primary"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsExpModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface-elevated text-text-secondary text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl gradient-brand-bg text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  {editingExperience ? 'Save Changes' : 'Create Position'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT EDUCATION (Problem 5)                                    */}
      {/* ========================================================================= */}
      {isEduModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-surface p-6 sm:p-8 rounded-3xl border border-primary/30 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold">{editingEducation ? 'Edit Education' : 'Add Education'}</h3>
              <button onClick={() => setIsEduModalOpen(false)} className="p-1 rounded-lg text-text-secondary hover:text-foreground cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEducation} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-text-secondary mb-1">Degree Title</label>
                <input
                  type="text"
                  required
                  value={eduFormDegree}
                  onChange={(e) => setEduFormDegree(e.target.value)}
                  placeholder="Bachelor of Science in Computer Science"
                  className="w-full bg-surface-elevated/70 border border-border/70 rounded-xl px-3.5 py-2 text-xs text-foreground outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-text-secondary mb-1">Institution / University</label>
                <input
                  type="text"
                  required
                  value={eduFormSchool}
                  onChange={(e) => setEduFormSchool(e.target.value)}
                  placeholder="Institute of Engineering & Technology"
                  className="w-full bg-surface-elevated/70 border border-border/70 rounded-xl px-3.5 py-2 text-xs text-foreground outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-text-secondary mb-1">Period</label>
                  <input
                    type="text"
                    required
                    value={eduFormPeriod}
                    onChange={(e) => setEduFormPeriod(e.target.value)}
                    placeholder="2019 - 2023"
                    className="w-full bg-surface-elevated/70 border border-border/70 rounded-xl px-3.5 py-2 text-xs text-foreground outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-text-secondary mb-1">Grade / GPA</label>
                  <input
                    type="text"
                    value={eduFormGrade}
                    onChange={(e) => setEduFormGrade(e.target.value)}
                    placeholder="3.8 / 4.0"
                    className="w-full bg-surface-elevated/70 border border-border/70 rounded-xl px-3.5 py-2 text-xs text-foreground outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-text-secondary mb-1">Course Highlights (1 per line)</label>
                <textarea
                  rows={3}
                  value={eduFormHighlights}
                  onChange={(e) => setEduFormHighlights(e.target.value)}
                  placeholder="Algorithms & Data Structures\nDistributed Systems"
                  className="w-full bg-surface-elevated/70 border border-border/70 rounded-xl px-3.5 py-2 text-xs text-foreground font-mono outline-none focus:border-primary"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEduModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface-elevated text-text-secondary text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl gradient-brand-bg text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  {editingEducation ? 'Save Changes' : 'Create Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT CERTIFICATION (Problem 6 & 13)                           */}
      {/* ========================================================================= */}
      {isCertModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-surface p-6 sm:p-8 rounded-3xl border border-primary/30 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold">{editingCert ? 'Edit Certification' : 'Add Certification'}</h3>
              <button onClick={() => setIsCertModalOpen(false)} className="p-1 rounded-lg text-text-secondary hover:text-foreground cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCertification} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-text-secondary mb-1">Certificate Title</label>
                <input
                  type="text"
                  required
                  value={certFormTitle}
                  onChange={(e) => setCertFormTitle(e.target.value)}
                  placeholder="AWS Solutions Architect - Associate"
                  className="w-full bg-surface-elevated/70 border border-border/70 rounded-xl px-3.5 py-2 text-xs text-foreground outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-text-secondary mb-1">Provider</label>
                  <input
                    type="text"
                    required
                    value={certFormProvider}
                    onChange={(e) => setCertFormProvider(e.target.value)}
                    placeholder="Amazon Web Services"
                    className="w-full bg-surface-elevated/70 border border-border/70 rounded-xl px-3.5 py-2 text-xs text-foreground outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-text-secondary mb-1">Issue Date / Year</label>
                  <input
                    type="text"
                    required
                    value={certFormIssueDate}
                    onChange={(e) => setCertFormIssueDate(e.target.value)}
                    placeholder="2024"
                    className="w-full bg-surface-elevated/70 border border-border/70 rounded-xl px-3.5 py-2 text-xs text-foreground outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-text-secondary mb-1">Credential ID</label>
                <input
                  type="text"
                  value={certFormCredentialID}
                  onChange={(e) => setCertFormCredentialID(e.target.value)}
                  placeholder="AWS-SAA-839210"
                  className="w-full bg-surface-elevated/70 border border-border/70 rounded-xl px-3.5 py-2 text-xs text-foreground outline-none focus:border-primary"
                />
              </div>

              {/* Cloudinary Certificate Image Upload (Problem 13) */}
              <div>
                <label className="block text-xs font-mono uppercase text-text-secondary mb-1">Badge Image (Cloudinary)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={certFormImage}
                    onChange={(e) => setCertFormImage(e.target.value)}
                    placeholder="Paste URL or upload"
                    className="flex-1 bg-surface-elevated/70 border border-border/70 rounded-xl px-3.5 py-2 text-xs text-foreground outline-none focus:border-primary"
                  />
                  <label className="px-3.5 py-2 rounded-xl bg-surface-elevated border border-border text-xs text-text-secondary hover:text-foreground cursor-pointer flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setIsUploadingCertImg(true);
                          const url = await uploadToCloudinary(file, 'certifications');
                          if (url) setCertFormImage(url);
                          setIsUploadingCertImg(false);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-text-secondary mb-1">Verification URL</label>
                <input
                  type="url"
                  value={certFormVerifyURL}
                  onChange={(e) => setCertFormVerifyURL(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-surface-elevated/70 border border-border/70 rounded-xl px-3.5 py-2 text-xs text-foreground outline-none focus:border-primary"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCertModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface-elevated text-text-secondary text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploadingCertImg}
                  className="px-5 py-2 rounded-xl gradient-brand-bg text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  {editingCert ? 'Save Changes' : 'Create Certification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT TESTIMONIAL (Problem 7)                                  */}
      {/* ========================================================================= */}
      {isTestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-surface p-6 sm:p-8 rounded-3xl border border-primary/30 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold">{editingTestimonial ? 'Edit Testimonial' : 'Add Testimonial'}</h3>
              <button onClick={() => setIsTestModalOpen(false)} className="p-1 rounded-lg text-text-secondary hover:text-foreground cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTestimonial} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-text-secondary mb-1">Client Name</label>
                  <input
                    type="text"
                    required
                    value={testFormName}
                    onChange={(e) => setTestFormName(e.target.value)}
                    placeholder="Sarah Chen"
                    className="w-full bg-surface-elevated/70 border border-border/70 rounded-xl px-3.5 py-2 text-xs text-foreground outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-text-secondary mb-1">Company</label>
                  <input
                    type="text"
                    required
                    value={testFormCompany}
                    onChange={(e) => setTestFormCompany(e.target.value)}
                    placeholder="Nexus Scale Labs"
                    className="w-full bg-surface-elevated/70 border border-border/70 rounded-xl px-3.5 py-2 text-xs text-foreground outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-text-secondary mb-1">Role</label>
                  <input
                    type="text"
                    required
                    value={testFormRole}
                    onChange={(e) => setTestFormRole(e.target.value)}
                    placeholder="VP of Engineering"
                    className="w-full bg-surface-elevated/70 border border-border/70 rounded-xl px-3.5 py-2 text-xs text-foreground outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-text-secondary mb-1">Rating (Stars)</label>
                  <select
                    value={testFormRating}
                    onChange={(e) => setTestFormRating(Number(e.target.value))}
                    className="w-full bg-surface-elevated/70 border border-border/70 rounded-xl px-3.5 py-2 text-xs text-foreground outline-none focus:border-primary"
                  >
                    <option value="5">5 Stars ★★★★★</option>
                    <option value="4">4 Stars ★★★★</option>
                    <option value="3">3 Stars ★★★</option>
                  </select>
                </div>
              </div>

              {/* Cloudinary Avatar Upload */}
              <div>
                <label className="block text-xs font-mono uppercase text-text-secondary mb-1">Avatar Photo (Cloudinary)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={testFormAvatar}
                    onChange={(e) => setTestFormAvatar(e.target.value)}
                    placeholder="Paste URL or upload"
                    className="flex-1 bg-surface-elevated/70 border border-border/70 rounded-xl px-3.5 py-2 text-xs text-foreground outline-none focus:border-primary"
                  />
                  <label className="px-3.5 py-2 rounded-xl bg-surface-elevated border border-border text-xs text-text-secondary hover:text-foreground cursor-pointer flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setIsUploadingAvatar(true);
                          const url = await uploadToCloudinary(file, 'testimonials');
                          if (url) setTestFormAvatar(url);
                          setIsUploadingAvatar(false);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-text-secondary mb-1">Quote / Review</label>
                <textarea
                  rows={3}
                  required
                  value={testFormContent}
                  onChange={(e) => setTestFormContent(e.target.value)}
                  placeholder="Testimonial endorsement content..."
                  className="w-full bg-surface-elevated/70 border border-border/70 rounded-xl px-3.5 py-2 text-xs text-foreground outline-none focus:border-primary"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTestModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface-elevated text-text-secondary text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploadingAvatar}
                  className="px-5 py-2 rounded-xl gradient-brand-bg text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  {editingTestimonial ? 'Save Changes' : 'Create Testimonial'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT BLOG                                                    */}
      {/* ========================================================================= */}
      {isBlogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-xl bg-surface p-6 sm:p-8 rounded-3xl border border-primary/30 shadow-2xl animate-in zoom-in-95 duration-200 my-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold">{editingBlog ? 'Edit Article' : 'Write Article'}</h3>
              <button onClick={() => setIsBlogModalOpen(false)} className="p-1 rounded-lg text-text-secondary hover:text-foreground cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBlog} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-text-secondary mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={blogFormTitle}
                  onChange={(e) => setBlogFormTitle(e.target.value)}
                  placeholder="e.g. Architecting Resilient Real-Time Microservices"
                  className="w-full bg-surface-elevated/70 border border-border/70 rounded-xl px-3.5 py-2 text-xs text-foreground outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-text-secondary mb-1">Category</label>
                  <input
                    type="text"
                    required
                    value={blogFormCategory}
                    onChange={(e) => setBlogFormCategory(e.target.value)}
                    placeholder="Architecture"
                    className="w-full bg-surface-elevated/70 border border-border/70 rounded-xl px-3.5 py-2 text-xs text-foreground outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-text-secondary mb-1">Reading Time</label>
                  <input
                    type="text"
                    value={blogFormReadingTime}
                    onChange={(e) => setBlogFormReadingTime(e.target.value)}
                    placeholder="5 min read"
                    className="w-full bg-surface-elevated/70 border border-border/70 rounded-xl px-3.5 py-2 text-xs text-foreground outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-text-secondary mb-1">Excerpt / Summary</label>
                <textarea
                  rows={2}
                  required
                  value={blogFormExcerpt}
                  onChange={(e) => setBlogFormExcerpt(e.target.value)}
                  className="w-full bg-surface-elevated/70 border border-border/70 rounded-xl px-3.5 py-2 text-xs text-foreground outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-text-secondary mb-1">Full Article Content (Markdown)</label>
                <textarea
                  rows={6}
                  required
                  value={blogFormContent}
                  onChange={(e) => setBlogFormContent(e.target.value)}
                  placeholder="## Section 1\n\nContent here..."
                  className="w-full bg-surface-elevated/70 border border-border/70 rounded-xl p-3 text-xs text-foreground font-mono outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-text-secondary mb-1">Tags (Comma-separated)</label>
                <input
                  type="text"
                  value={blogFormTags}
                  onChange={(e) => setBlogFormTags(e.target.value)}
                  placeholder="Node.js, Redis, Architecture"
                  className="w-full bg-surface-elevated/70 border border-border/70 rounded-xl px-3.5 py-2 text-xs text-foreground outline-none focus:border-primary"
                />
              </div>

              {/* Cloudinary Blog Cover Upload (Problem 13) */}
              <div>
                <label className="block text-xs font-mono uppercase text-text-secondary mb-1">Cover Image (Cloudinary)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={blogFormCoverImage}
                    onChange={(e) => setBlogFormCoverImage(e.target.value)}
                    placeholder="Paste URL or upload"
                    className="flex-1 bg-surface-elevated/70 border border-border/70 rounded-xl px-3.5 py-2 text-xs text-foreground outline-none focus:border-primary"
                  />
                  <label className="px-3.5 py-2 rounded-xl bg-surface-elevated border border-border text-xs text-text-secondary hover:text-foreground cursor-pointer flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setIsUploadingBlogImg(true);
                          const url = await uploadToCloudinary(file, 'blogs');
                          if (url) setBlogFormCoverImage(url);
                          setIsUploadingBlogImg(false);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium">
                  <input
                    type="checkbox"
                    checked={blogFormPublished}
                    onChange={(e) => setBlogFormPublished(e.target.checked)}
                    className="rounded accent-primary w-4 h-4 cursor-pointer"
                  />
                  <span>Publish immediately to public website</span>
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBlogModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface-elevated text-text-secondary text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploadingBlogImg}
                  className="px-5 py-2 rounded-xl gradient-brand-bg text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  {editingBlog ? 'Save Changes' : 'Publish Article'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050816] flex items-center justify-center text-xs text-text-secondary">Loading CMS Dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
