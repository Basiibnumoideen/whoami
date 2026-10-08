'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { 
  Award, 
  GraduationCap, 
  Code, 
  GitCommit, 
  GitPullRequest, 
  ArrowRight, 
  ExternalLink, 
  RefreshCw,
  Maximize2,
  FileText,
  Check,
  Copy,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  X,
  Eye,
  ShieldCheck,
  Calendar,
  Hash
} from 'lucide-react';
import { Github } from '@/components/icons';
import Link from 'next/link';
import { isPdfDocument, getCertificateThumbnailUrl, getPdfViewerUrl } from '@/lib/certificate-utils';

interface EducationItem {
  _id?: string;
  id?: string;
  degree: string;
  institution?: string;
  school?: string;
  period: string;
  grade?: string;
  gpa?: string;
  highlights?: string[];
}

interface CertificationItem {
  _id?: string;
  id?: string;
  title: string;
  provider: string;
  issueDate: string;
  credentialID?: string;
  image?: string;
  verifyURL?: string;
  description?: string;
  skills?: string[];
}


export default function AboutPage() {
  const [educationList, setEducationList] = useState<EducationItem[]>([]);
  const [certificationsList, setCertificationsList] = useState<CertificationItem[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modals & Fullscreen State
  const [selectedCert, setSelectedCert] = useState<CertificationItem | null>(null);
  const [fullscreenMedia, setFullscreenMedia] = useState<{ url: string; title: string; isPdf: boolean } | null>(null);
  const [pdfViewerMode, setPdfViewerMode] = useState<'reader' | 'image'>('reader');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const isPdf = (url?: string): boolean => {
    return isPdfDocument(url);
  };

  const handleCopyCredentialID = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(id);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (fullscreenMedia) {
          setFullscreenMedia(null);
          setZoomLevel(1);
        } else if (selectedCert) {
          setSelectedCert(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    if (fullscreenMedia || selectedCert) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [fullscreenMedia, selectedCert]);

  const [githubStats, setGithubStats] = useState({
    repos: 15,
    stars: 1,
    activeYears: '4+ Years',
    username: 'Basiibnumoideen',
    languages: [
      { name: 'JavaScript', percent: 45, color: '#F7DF1E' },
      { name: 'Python', percent: 27, color: '#3776AB' },
      { name: 'TypeScript', percent: 18, color: '#3178C6' },
      { name: 'HTML/CSS', percent: 10, color: '#E34F26' },
    ],
  });

  useEffect(() => {
    try {
      const cached = localStorage.getItem('portfolio_settings');
      if (cached) setSettings(JSON.parse(cached));
    } catch {}

    Promise.all([
      api.education.getAll().catch(() => []),
      api.certifications.getAll().catch(() => []),
      api.settings.get().catch(() => null),
    ])
      .then(([edu, certs, set]) => {
        setEducationList(Array.isArray(edu) ? edu : []);
        setCertificationsList(Array.isArray(certs) ? certs : []);
        if (set) setSettings(set);
      })
      .catch((err) => {
        console.error('Error loading about data:', err);
        setCertificationsList([]);
      })
      .finally(() => setLoading(false));

    // Live GitHub data fetch for Basiibnumoideen
    const fetchGitHubData = async () => {
      try {
        const username = 'Basiibnumoideen';
        const [userRes, reposRes] = await Promise.all([
          fetch(`https://api.github.com/users/${username}`).catch(() => null),
          fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`).catch(() => null),
        ]);

        if (userRes && userRes.ok) {
          const userData = await userRes.json();
          if (userData && typeof userData.public_repos === 'number') {
            setGithubStats(prev => ({
              ...prev,
              repos: userData.public_repos,
              username: userData.login || 'Basiibnumoideen',
            }));
          }
        }

        if (reposRes && reposRes.ok) {
          const reposData = await reposRes.json();
          if (Array.isArray(reposData) && reposData.length > 0) {
            let totalStars = 0;
            const langCounts: Record<string, number> = {};
            let totalWithLang = 0;

            reposData.forEach((r: any) => {
              totalStars += (r.stargazers_count || 0);
              if (r.language) {
                langCounts[r.language] = (langCounts[r.language] || 0) + 1;
                totalWithLang += 1;
              }
            });

            if (totalWithLang > 0) {
              const langColorMap: Record<string, string> = {
                JavaScript: '#F7DF1E',
                Python: '#3776AB',
                TypeScript: '#3178C6',
                HTML: '#E34F26',
                CSS: '#563D7C',
              };

              const parsedLangs = Object.entries(langCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 4)
                .map(([lang, count]) => ({
                  name: lang === 'HTML' ? 'HTML/CSS' : lang,
                  percent: Math.round((count / totalWithLang) * 100),
                  color: langColorMap[lang] || '#6366F1',
                }));

              setGithubStats(prev => ({
                ...prev,
                stars: Math.max(1, totalStars),
                languages: parsedLangs.length > 0 ? parsedLangs : prev.languages,
              }));
            }
          }
        }
      } catch {}
    };

    fetchGitHubData();

    const handleUpdate = (e: any) => {
      if (e.detail) setSettings(e.detail);
    };
    window.addEventListener('portfolio_settings_updated', handleUpdate);

    api.analytics.recordPageView().catch(() => null);

    return () => {
      window.removeEventListener('portfolio_settings_updated', handleUpdate);
    };
  }, []);

  const rawGithub = settings?.socialLinks?.github || settings?.github || '';
  const githubUrl = (!rawGithub || rawGithub === 'https://github.com' || rawGithub === 'https://github.com/')
    ? 'https://github.com/Basiibnumoideen'
    : rawGithub;
  const fullName = settings?.name || 'Muhammed Abdul Basith';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
      {/* Intro Header */}
      <div className="max-w-3xl mb-16">
        <p className="text-xs font-mono uppercase tracking-wider text-primary font-semibold mb-2">
          Origin & Philosophy
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
          Architecting resilient software at the intersection of craft and utility.
        </h1>
        <p className="text-base sm:text-lg text-text-secondary leading-relaxed mb-4">
          I&apos;m {fullName}. I fell in love with software development because of the rare ability to translate conceptual architecture into real-world tools that users rely upon daily.
        </p>
        <p className="text-sm text-text-secondary leading-relaxed">
          My philosophy revolves around Linear&apos;s restraint and production discipline: write strict TypeScript, design normalized database schemas before writing endpoints, test edge cases, and ensure every visual interaction feels responsive and alive.
        </p>
      </div>

      {/* Live GitHub Stats Component (§5.2) */}
      <section className="mb-20 p-8 rounded-2xl bg-surface border border-border/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Github className="w-5 h-5 text-foreground" />
              <h2 className="text-xl font-bold">Live GitHub Activity & Open Source</h2>
            </div>
            <p className="text-xs text-text-secondary mt-1">
              Real-time stats from <span className="font-mono text-primary font-semibold">@{githubStats.username}</span>.
            </p>
          </div>
          <a
            href={githubUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-border/60 bg-surface-elevated hover:bg-surface-elevated/80 transition-colors"
          >
            <span>Follow on GitHub</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* GitHub Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-xl bg-surface-elevated/60 border border-border/50 text-center">
            <GitCommit className="w-4 h-4 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold font-mono">{githubStats.activeYears}</p>
            <p className="text-[11px] text-text-secondary">Active on GitHub</p>
          </div>
          <div className="p-4 rounded-xl bg-surface-elevated/60 border border-border/50 text-center">
            <Code className="w-4 h-4 text-secondary mx-auto mb-2" />
            <p className="text-2xl font-bold font-mono">{githubStats.repos}</p>
            <p className="text-[11px] text-text-secondary">Public Repositories</p>
          </div>
          <div className="p-4 rounded-xl bg-surface-elevated/60 border border-border/50 text-center">
            <GitPullRequest className="w-4 h-4 text-accent mx-auto mb-2" />
            <p className="text-2xl font-bold font-mono">JS & Python</p>
            <p className="text-[11px] text-text-secondary">Primary Ecosystems</p>
          </div>
          <div className="p-4 rounded-xl bg-surface-elevated/60 border border-border/50 text-center">
            <Award className="w-4 h-4 text-warning mx-auto mb-2" />
            <p className="text-2xl font-bold font-mono">{githubStats.stars}+ Stars</p>
            <p className="text-[11px] text-text-secondary">Verified Projects</p>
          </div>
        </div>

        {/* Language Breakdown Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-text-secondary font-mono">
            <span>Primary Languages</span>
            <span>{githubStats.languages.map(l => `${l.name} ${l.percent}%`).join(' · ')}</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-surface-elevated flex overflow-hidden">
            {githubStats.languages.map((l, i) => (
              <div
                key={i}
                style={{ width: `${l.percent}%`, backgroundColor: l.color }}
                title={`${l.name} ${l.percent}%`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Education & Academic Rigor */}
      <section className="mb-20">
        <div className="flex items-center gap-2 mb-6">
          <GraduationCap className="w-5 h-5 text-primary" />
          <h2 className="text-2xl font-bold">Education & Foundational Engineering</h2>
        </div>

        {loading ? (
          <div className="py-10 flex justify-center">
            <RefreshCw className="w-5 h-5 text-primary animate-spin" />
          </div>
        ) : educationList.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-surface border border-border/80 text-text-secondary text-xs">
            No education records available yet.
          </div>
        ) : (
          <div className="space-y-6">
            {educationList.map((edu, idx) => (
              <div key={edu._id || edu.id || idx} className="p-6 rounded-2xl bg-surface border border-border/80">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                  <h3 className="text-lg font-bold text-foreground">{edu.degree}</h3>
                  <span className="text-xs font-mono text-text-secondary">{edu.period}</span>
                </div>
                <p className="text-sm font-medium text-primary mb-2">{edu.school || edu.institution}</p>
                {(edu.grade || edu.gpa) && (
                  <div className="inline-block px-2.5 py-1 rounded bg-success/10 text-success text-xs font-medium mb-4">
                    {edu.grade || edu.gpa}
                  </div>
                )}
                {edu.highlights && edu.highlights.length > 0 && (
                  <ul className="space-y-2 text-xs text-text-secondary">
                    {edu.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/60 mt-1.5 shrink-0"></span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Certifications & Industry Credentials (Problem 6 & Enhanced Fullscreen Viewer) */}
      <section className="mb-20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-secondary" />
            <h2 className="text-2xl font-bold">Certifications & Accreditations</h2>
          </div>
          <span className="text-xs font-mono text-text-secondary hidden sm:inline-block">
            Click any certificate for details & full-screen view
          </span>
        </div>

        {loading ? (
          <div className="py-10 flex justify-center">
            <RefreshCw className="w-5 h-5 text-primary animate-spin" />
          </div>
        ) : certificationsList.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-surface border border-border/80 text-text-secondary text-xs">
            No certifications available yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificationsList.map((cert, idx) => {
              const hasMedia = Boolean(cert.image);
              const certIsPdf = isPdf(cert.image);
              const pdfThumb = getCertificateThumbnailUrl(cert.image);

              return (
                <div
                  key={cert._id || cert.id || idx}
                  onClick={() => setSelectedCert(cert)}
                  className="group relative p-6 rounded-3xl bg-surface/90 hover:bg-surface border border-border/80 hover:border-primary/60 transition-all duration-300 flex flex-col justify-between shadow-sm hover:shadow-xl hover:-translate-y-1 cursor-pointer"
                >
                  <div>
                    {/* Media Preview Thumbnail / Document Card */}
                    {hasMedia ? (
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          setFullscreenMedia({
                            url: cert.image!,
                            title: cert.title,
                            isPdf: certIsPdf
                          });
                          setZoomLevel(1);
                        }}
                        className="relative h-44 w-full rounded-2xl overflow-hidden mb-4 bg-surface-elevated/70 border border-border/60 group/media cursor-zoom-in"
                        title="Click to view full screen"
                      >
                        {/* Display real visual graphic (image or PDF page-1 render) */}
                        {pdfThumb ? (
                          <>
                            <img 
                              src={pdfThumb} 
                              alt={cert.title} 
                              className="w-full h-full object-contain p-2 group-hover/media:scale-105 transition-transform duration-500 bg-black/10" 
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/media:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-md text-white text-[11px] font-mono font-semibold flex items-center gap-1.5 border border-white/20 shadow-lg">
                                <Maximize2 className="w-3.5 h-3.5" />
                                <span>Fullscreen Preview</span>
                              </span>
                            </div>
                          </>
                        ) : certIsPdf ? (
                          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-red-500/10 via-surface-elevated to-surface">
                            <div className="p-3.5 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-400 mb-2 group-hover/media:scale-110 transition-transform">
                              <FileText className="w-8 h-8" />
                            </div>
                            <span className="text-xs font-mono font-semibold text-foreground">Official PDF Document</span>
                            <span className="text-[10px] text-text-secondary mt-0.5">Click for Fullscreen Reader</span>
                          </div>
                        ) : (
                          <>
                            <img 
                              src={cert.image} 
                              alt={cert.title} 
                              className="w-full h-full object-cover group-hover/media:scale-105 transition-transform duration-500" 
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/media:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-md text-white text-[11px] font-mono font-semibold flex items-center gap-1.5 border border-white/20 shadow-lg">
                                <Maximize2 className="w-3.5 h-3.5" />
                                <span>Fullscreen Preview</span>
                              </span>
                            </div>
                          </>
                        )}

                        {/* Media Type Pill Badge */}
                        <div className="absolute top-2.5 left-2.5">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold uppercase tracking-wider backdrop-blur-md bg-black/60 text-white border border-white/10">
                            {certIsPdf ? 'PDF' : 'Certificate'}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="relative h-28 w-full rounded-2xl overflow-hidden mb-4 bg-gradient-to-br from-primary/10 via-surface-elevated to-surface border border-border/60 flex items-center justify-center">
                        <Award className="w-10 h-10 text-primary/40" />
                      </div>
                    )}

                    {/* Header & Meta */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono text-text-secondary flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-text-secondary/70" />
                        <span>{cert.issueDate}</span>
                      </span>
                      {cert.credentialID && (
                        <button
                          type="button"
                          onClick={(e) => handleCopyCredentialID(e, cert.credentialID!)}
                          className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 flex items-center gap-1 transition-colors"
                          title="Click to copy Credential ID"
                        >
                          {copiedId === cert.credentialID ? (
                            <>
                              <Check className="w-2.5 h-2.5 text-success" />
                              <span className="text-success font-semibold">Copied</span>
                            </>
                          ) : (
                            <>
                              <Hash className="w-2.5 h-2.5 text-primary/70" />
                              <span>{cert.credentialID}</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-2">
                      {cert.title}
                    </h3>
                    <p className="text-xs font-medium text-primary mb-2 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-secondary" />
                      <span>{cert.provider}</span>
                    </p>

                    {cert.description && (
                      <p className="text-xs text-text-secondary line-clamp-2 mb-3">
                        {cert.description}
                      </p>
                    )}
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="pt-4 border-t border-border/50 mt-4 flex items-center justify-between">
                    <span className="text-xs font-mono text-primary font-semibold flex items-center gap-1.5 group-hover:translate-x-0.5 transition-transform">
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Details</span>
                    </span>

                    {cert.verifyURL && (
                      <a
                        href={cert.verifyURL}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-[11px] text-text-secondary hover:text-primary font-mono transition-colors"
                      >
                        <span>Verify</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Experience Overview Link */}
      <div className="p-8 rounded-2xl bg-surface-elevated/40 border border-border/70 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold">Want to see my full work history?</h3>
          <p className="text-xs text-text-secondary mt-1">Explore my detailed role breakdowns, contracts, and accomplishments.</p>
        </div>
        <Link
          href="/experience"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-brand-bg text-white text-xs font-semibold hover:opacity-95 transition-opacity"
        >
          <span>View Experience Timeline</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: CERTIFICATE DETAILS MODAL                                        */}
      {/* ========================================================================= */}
      {selectedCert && (
        <div 
          onClick={() => setSelectedCert(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl max-h-[92vh] bg-surface border border-primary/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
          >
            {/* Header */}
            <div className="px-6 py-4 sm:px-8 border-b border-border/70 flex items-center justify-between shrink-0 bg-surface/95 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Certificate Details</h3>
                  <p className="text-xs text-text-secondary">{selectedCert.provider}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCert(null)}
                className="p-1.5 rounded-xl bg-surface-elevated text-text-secondary hover:text-foreground transition-colors cursor-pointer"
                title="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
              {/* Certificate Media Banner */}
              {selectedCert.image ? (
                <div className="space-y-2">
                  {(() => {
                    const certIsPdf = isPdf(selectedCert.image);
                    const pdfThumb = getCertificateThumbnailUrl(selectedCert.image);

                    return (
                      <div 
                        onClick={() => {
                          setFullscreenMedia({
                            url: selectedCert.image!,
                            title: selectedCert.title,
                            isPdf: certIsPdf
                          });
                          setZoomLevel(1);
                        }}
                        className="group relative w-full h-56 rounded-2xl overflow-hidden bg-surface-elevated/80 border border-border/80 flex items-center justify-center cursor-pointer shadow-inner"
                        title="Click to view full screen"
                      >
                        {pdfThumb ? (
                          <>
                            <img
                              src={pdfThumb}
                              alt={selectedCert.title}
                              className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300 bg-black/10"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="px-4 py-2 rounded-xl bg-black/80 backdrop-blur-md text-white text-xs font-mono font-semibold flex items-center gap-2 border border-white/20 shadow-xl">
                                <Maximize2 className="w-4 h-4" />
                                <span>{certIsPdf ? 'View Fullscreen PDF Document' : 'View Fullscreen Image'}</span>
                              </span>
                            </div>
                            {certIsPdf && (
                              <div className="absolute top-3 left-3">
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold uppercase tracking-wider backdrop-blur-md bg-black/60 text-white border border-white/10">
                                  PDF Document
                                </span>
                              </div>
                            )}
                          </>
                        ) : certIsPdf ? (
                          <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-red-500/10 via-surface-elevated to-surface text-center">
                            <div className="p-4 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-400 mb-2.5 group-hover:scale-110 transition-transform">
                              <FileText className="w-10 h-10" />
                            </div>
                            <p className="text-sm font-bold text-foreground">Official PDF Document</p>
                            <p className="text-xs text-text-secondary mt-0.5">Click to view fullscreen interactive PDF reader</p>
                          </div>
                        ) : (
                          <>
                            <img
                              src={selectedCert.image}
                              alt={selectedCert.title}
                              className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="px-4 py-2 rounded-xl bg-black/80 backdrop-blur-md text-white text-xs font-mono font-semibold flex items-center gap-2 border border-white/20 shadow-xl">
                                <Maximize2 className="w-4 h-4" />
                                <span>View Fullscreen Image</span>
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })()}

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setFullscreenMedia({
                          url: selectedCert.image!,
                          title: selectedCert.title,
                          isPdf: isPdf(selectedCert.image)
                        });
                        setZoomLevel(1);
                      }}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-surface-elevated hover:bg-surface-elevated/80 border border-border/80 text-xs font-mono font-semibold text-foreground flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <Maximize2 className="w-4 h-4 text-primary" />
                      <span>{isPdf(selectedCert.image) ? 'Open Fullscreen PDF Viewer' : 'Open Fullscreen Certificate Image'}</span>
                    </button>
                    {isPdf(selectedCert.image) && (
                      <a
                        href={selectedCert.image}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2.5 px-3 rounded-xl bg-surface-elevated hover:bg-surface-elevated/80 border border-border/80 text-xs font-mono text-text-secondary hover:text-foreground flex items-center gap-1.5 transition-colors"
                        title="Open direct file in new tab"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              ) : null}

              {/* Certificate Title */}
              <div>
                <h2 className="text-xl font-bold text-foreground leading-snug">{selectedCert.title}</h2>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs">
                  <span className="font-semibold text-primary flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-secondary" />
                    <span>{selectedCert.provider}</span>
                  </span>
                  <span className="text-border">•</span>
                  <span className="text-text-secondary font-mono flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Issued {selectedCert.issueDate}</span>
                  </span>
                </div>
              </div>

              {/* Credential ID info block */}
              {selectedCert.credentialID && (
                <div className="p-4 rounded-2xl bg-surface-elevated/60 border border-border/70 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-mono text-text-secondary uppercase tracking-wider block">Credential ID</span>
                    <span className="text-sm font-mono font-semibold text-foreground">{selectedCert.credentialID}</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleCopyCredentialID(e, selectedCert.credentialID!)}
                    className="px-3 py-1.5 rounded-xl bg-surface border border-border hover:border-primary/50 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedId === selectedCert.credentialID ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-success" />
                        <span className="text-success font-semibold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-text-secondary" />
                        <span>Copy ID</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Description / Curriculum */}
              {selectedCert.description && (
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-text-secondary mb-2">Overview & Rigor</h4>
                  <p className="text-xs text-text-secondary leading-relaxed bg-surface-elevated/30 p-4 rounded-2xl border border-border/60">
                    {selectedCert.description}
                  </p>
                </div>
              )}

              {/* Skills Covered (if any) */}
              {selectedCert.skills && selectedCert.skills.length > 0 && (
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-text-secondary mb-2">Validated Competencies</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCert.skills.map((skill, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-surface-elevated border border-border/70 text-[11px] font-mono text-text-secondary">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Footer */}
            <div className="px-6 py-4 sm:px-8 border-t border-border/70 flex items-center justify-between shrink-0 bg-surface/95 backdrop-blur-md">
              <button
                type="button"
                onClick={() => setSelectedCert(null)}
                className="px-4 py-2 rounded-xl bg-surface-elevated text-text-secondary hover:text-foreground text-xs font-semibold cursor-pointer transition-colors"
              >
                Close
              </button>

              {selectedCert.verifyURL && (
                <a
                  href={selectedCert.verifyURL}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2 rounded-xl gradient-brand-bg text-white text-xs font-bold shadow-md hover:opacity-95 transition-opacity flex items-center gap-2 cursor-pointer"
                >
                  <span>Verify on Issuer Site</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: FULLSCREEN CERTIFICATE VIEWER (Images & PDFs)                     */}
      {/* ========================================================================= */}
      {fullscreenMedia && (
        <div 
          onClick={() => {
            setFullscreenMedia(null);
            setZoomLevel(1);
          }}
          className="fixed inset-0 z-[70] bg-black/95 backdrop-blur-2xl flex flex-col animate-in fade-in duration-200"
        >
          {/* Fullscreen Toolbar */}
          <div 
            onClick={(e) => e.stopPropagation()}
            className="h-16 px-4 sm:px-8 border-b border-white/10 flex items-center justify-between shrink-0 bg-black/60 backdrop-blur-md text-white"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-white/10 border border-white/20 text-white shrink-0">
                {fullscreenMedia.isPdf ? 'PDF Document' : 'Certificate Image'}
              </span>
              <h3 className="text-sm font-semibold truncate text-white/90">
                {fullscreenMedia.title}
              </h3>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* PDF Viewer Mode Switch */}
              {fullscreenMedia.isPdf && (
                <div className="flex items-center gap-1 bg-white/10 rounded-xl p-1 border border-white/10 mr-1">
                  <button
                    type="button"
                    onClick={() => setPdfViewerMode('reader')}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                      pdfViewerMode === 'reader'
                        ? 'bg-primary text-white shadow-md'
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    PDF Document
                  </button>
                  <button
                    type="button"
                    onClick={() => setPdfViewerMode('image')}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                      pdfViewerMode === 'image'
                        ? 'bg-primary text-white shadow-md'
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    High-Res Image
                  </button>
                </div>
              )}

              {/* Zoom Controls (shown for images or when in PDF image mode) */}
              {(!fullscreenMedia.isPdf || pdfViewerMode === 'image') && (
                <div className="flex items-center gap-1 mr-2 bg-white/10 rounded-xl p-1 border border-white/10">
                  <button
                    type="button"
                    onClick={() => setZoomLevel(prev => Math.max(0.75, prev - 0.25))}
                    className="p-1.5 rounded-lg hover:bg-white/20 transition-colors text-white/80 hover:text-white cursor-pointer"
                    title="Zoom out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-[11px] font-mono px-2 text-white/80 min-w-12 text-center">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setZoomLevel(prev => Math.min(3, prev + 0.25))}
                    className="p-1.5 rounded-lg hover:bg-white/20 transition-colors text-white/80 hover:text-white cursor-pointer"
                    title="Zoom in"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoomLevel(1)}
                    className="p-1.5 rounded-lg hover:bg-white/20 transition-colors text-white/80 hover:text-white cursor-pointer"
                    title="Reset zoom"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <a
                href={fullscreenMedia.url}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white/80 hover:text-white cursor-pointer"
                title="Open original in new tab"
              >
                <ExternalLink className="w-4 h-4" />
              </a>

              <a
                href={fullscreenMedia.url}
                download
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white/80 hover:text-white cursor-pointer"
                title="Download file"
              >
                <Download className="w-4 h-4" />
              </a>

              <button
                type="button"
                onClick={() => {
                  setFullscreenMedia(null);
                  setZoomLevel(1);
                  setPdfViewerMode('reader');
                }}
                className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors text-white ml-2 cursor-pointer"
                title="Close fullscreen (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Fullscreen Viewport */}
          <div 
            className="flex-1 overflow-auto p-4 sm:p-8 flex items-center justify-center relative select-none"
          >
            {fullscreenMedia.isPdf ? (
              <div 
                onClick={(e) => e.stopPropagation()}
                className="w-full h-full max-w-5xl rounded-2xl overflow-hidden bg-surface border border-white/20 flex flex-col shadow-2xl"
              >
                {pdfViewerMode === 'reader' ? (
                  <div className="w-full h-full flex flex-col bg-white">
                    <iframe
                      src={getPdfViewerUrl(fullscreenMedia.url)}
                      className="w-full flex-1 border-none bg-white"
                      title={fullscreenMedia.title}
                    />
                    <div className="px-4 py-2 bg-surface text-xs text-text-secondary border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2">
                      <span>Google Docs PDF Viewer Engine</span>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setPdfViewerMode('image')}
                          className="text-primary hover:underline font-mono text-[11px] cursor-pointer"
                        >
                          Switch to High-Res Image View →
                        </button>
                        <a
                          href={fullscreenMedia.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary hover:underline font-mono text-[11px]"
                        >
                          Direct PDF Link ↗
                        </a>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center overflow-auto p-4 bg-black/40">
                    <div 
                      className="transition-transform duration-200 ease-out flex items-center justify-center"
                      style={{ transform: `scale(${zoomLevel})` }}
                    >
                      <img
                        src={getCertificateThumbnailUrl(fullscreenMedia.url) || fullscreenMedia.url}
                        alt={fullscreenMedia.title}
                        className="max-w-[85vw] max-h-[75vh] object-contain rounded-xl shadow-2xl border border-white/10"
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div 
                onClick={(e) => e.stopPropagation()}
                className="transition-transform duration-200 ease-out flex items-center justify-center max-w-full max-h-full"
                style={{ transform: `scale(${zoomLevel})` }}
              >
                <img
                  src={fullscreenMedia.url}
                  alt={fullscreenMedia.title}
                  className="max-w-[90vw] max-h-[82vh] object-contain rounded-xl shadow-2xl border border-white/10"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
