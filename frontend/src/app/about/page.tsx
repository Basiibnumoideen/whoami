'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Award, GraduationCap, Code, GitCommit, GitPullRequest, ArrowRight, ExternalLink, RefreshCw } from 'lucide-react';
import { Github } from '@/components/icons';
import Link from 'next/link';

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
}

export default function AboutPage() {
  const [educationList, setEducationList] = useState<EducationItem[]>([]);
  const [certificationsList, setCertificationsList] = useState<CertificationItem[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
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
      api.education.getAll(),
      api.certifications.getAll(),
      api.settings.get(),
    ])
      .then(([edu, certs, set]) => {
        setEducationList(Array.isArray(edu) ? edu : []);
        setCertificationsList(Array.isArray(certs) ? certs : []);
        setSettings(set);
      })
      .catch((err) => {
        console.error('Error loading about data:', err);
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

      {/* Certifications & Industry Credentials (Problem 6) */}
      <section className="mb-20">
        <div className="flex items-center gap-2 mb-6">
          <Award className="w-5 h-5 text-secondary" />
          <h2 className="text-2xl font-bold">Certifications & Accreditations</h2>
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
            {certificationsList.map((cert, idx) => (
              <div
                key={cert._id || cert.id || idx}
                className="p-6 rounded-2xl bg-surface border border-border/80 flex flex-col justify-between hover:border-primary/50 transition-colors shadow-sm"
              >
                <div>
                  {cert.image && (
                    <div className="h-32 w-full rounded-xl overflow-hidden mb-4 bg-surface-elevated">
                      <img src={cert.image} alt={cert.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono text-text-secondary">{cert.issueDate}</span>
                    {cert.credentialID && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                        {cert.credentialID}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-foreground mb-1">{cert.title}</h3>
                  <p className="text-xs font-medium text-primary mb-3">{cert.provider}</p>
                </div>

                {cert.verifyURL && (
                  <div className="pt-4 border-t border-border/40 mt-3">
                    <a
                      href={cert.verifyURL}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary font-semibold hover:underline"
                    >
                      <span>Verify Credential</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            ))}
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
    </div>
  );
}
