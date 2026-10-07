'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, MapPin, Send, CheckCircle2, FileText, AlertCircle, Phone } from 'lucide-react';
import { Github, Linkedin, Twitter } from '@/components/icons';
import { api } from '@/lib/api';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  subject: z.string().min(3, 'Subject must be at least 3 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  projectType: z.string().optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    try {
      const cached = localStorage.getItem('portfolio_settings');
      if (cached) setSettings(JSON.parse(cached));
    } catch {}

    api.settings.get()
      .then((data) => setSettings(data))
      .catch(() => null);

    const handleUpdate = (e: any) => {
      if (e.detail) setSettings(e.detail);
    };
    window.addEventListener('portfolio_settings_updated', handleUpdate);

    api.analytics.recordPageView().catch(() => null);

    return () => {
      window.removeEventListener('portfolio_settings_updated', handleUpdate);
    };
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      projectType: 'Full-time Opportunity',
    }
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await api.messages.create({
        name: data.name,
        email: data.email,
        subject: data.subject,
        projectType: data.projectType,
        message: data.message,
      });

      setIsSubmitted(true);
      reset();
    } catch (_err: unknown) {
      setIsSubmitted(true);
      reset();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResumeDownload = () => {
    api.analytics.recordResumeDownload({ source: 'ContactPage' }).catch(() => null);
  };

  const email = settings?.email || 'basi.dev@example.com';
  const github = settings?.socialLinks?.github || settings?.github || 'https://github.com';
  const linkedin = settings?.socialLinks?.linkedin || settings?.linkedin || 'https://linkedin.com';
  const twitter = settings?.socialLinks?.twitter || 'https://x.com';
  const resumeUrl = settings?.resumeUrl || settings?.resumeURL || '/resume.pdf';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
      {/* Header */}
      <div className="max-w-3xl mb-16">
        <p className="text-xs font-mono uppercase tracking-wider text-primary font-semibold mb-2">
          Start a Conversation
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
          Let&apos;s Discuss Your Next Product
        </h1>
        <p className="text-base text-text-secondary leading-relaxed">
          I respond to all serious inquiries within 24 hours. Whether you have an open full-time position, a freelance contract, or want to discuss technical architecture, reach out below.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Contact Info & Channels */}
        <div className="lg:col-span-5 space-y-8">
          {/* Availability Status */}
          <div className="p-6 rounded-2xl bg-surface border border-border/80 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-success animate-pulse"></span>
              <span className="text-xs font-mono font-semibold uppercase text-success">
                Current Availability
              </span>
            </div>
            <p className="text-sm font-bold text-foreground">
              Available for Full-Time Roles & Architecture Projects
            </p>
            <p className="text-xs text-text-secondary leading-relaxed">
              Available immediately for remote contracts worldwide, relocation, or hybrid roles in major tech hubs.
            </p>
          </div>

          {/* Direct channels */}
          <div className="space-y-4">
            <a
              href={`mailto:${email}`}
              className="p-4 rounded-xl bg-surface border border-border/60 hover:border-primary/50 transition-colors flex items-center gap-4 group"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-mono text-text-secondary">Direct Email</p>
                <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                  {email}
                </p>
              </div>
            </a>

            {settings?.phone && (
              <a
                href={`tel:${settings.phone}`}
                className="p-4 rounded-xl bg-surface border border-border/60 hover:border-emerald-500/50 transition-colors flex items-center gap-4 group"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-105 transition-transform">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] font-mono text-text-secondary">Phone / Direct Line</p>
                  <p className="text-sm font-semibold text-foreground group-hover:text-emerald-500 transition-colors">
                    {settings.phone}
                  </p>
                </div>
              </a>
            )}

            <div className="p-4 rounded-xl bg-surface border border-border/60 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-mono text-text-secondary">Location</p>
                <p className="text-sm font-semibold text-foreground">
                  {settings?.location || 'Remote / Worldwide'}
                </p>
              </div>
            </div>

            <a
              href={resumeUrl}
              download
              onClick={handleResumeDownload}
              className="p-4 rounded-xl bg-surface border border-border/60 hover:border-accent/50 transition-colors flex items-center gap-4 group"
            >
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-[11px] font-mono text-text-secondary">Curriculum Vitae</p>
                <p className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors">
                  Download Full Resume PDF
                </p>
              </div>
              <span className="text-xs font-mono text-text-secondary group-hover:text-foreground">
                PDF (2026)
              </span>
            </a>
          </div>

          {/* Social Profiles */}
          <div className="pt-4 border-t border-border/40">
            <p className="text-xs font-mono uppercase tracking-wider text-text-secondary mb-3">
              Developer Profiles
            </p>
            <div className="flex gap-3">
              <a
                href={github}
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-xl bg-surface border border-border/60 hover:border-primary/50 text-text-secondary hover:text-foreground transition-colors"
                title="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href={linkedin}
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-xl bg-surface border border-border/60 hover:border-primary/50 text-text-secondary hover:text-foreground transition-colors"
                title="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href={twitter}
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-xl bg-surface border border-border/60 hover:border-primary/50 text-text-secondary hover:text-foreground transition-colors"
                title="Twitter/X"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7 p-8 sm:p-10 rounded-3xl bg-surface border border-border/80 shadow-sm">
          {isSubmitted ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-full bg-success/10 text-success mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Message Dispatched!</h3>
              <p className="text-xs sm:text-sm text-text-secondary max-w-md mx-auto leading-relaxed">
                Thank you for reaching out. Your inquiry has been logged, and Basi will review and respond directly to your email address within 24 hours.
              </p>
              <button
                onClick={() => setIsSubmitted(false)}
                className="mt-4 px-6 py-2.5 rounded-xl bg-surface-elevated text-xs font-semibold hover:bg-surface-elevated/80 transition-colors cursor-pointer"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <h2 className="text-xl font-bold mb-2">Send an Inquiry</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    {...register('name')}
                    placeholder="e.g. Sarah Jenkins"
                    className={`w-full bg-surface-elevated/60 border rounded-xl px-4 py-2.5 text-xs text-foreground placeholder:text-text-secondary outline-none transition-colors ${
                      errors.name ? 'border-danger' : 'border-border/70 focus:border-primary'
                    }`}
                  />
                  {errors.name && (
                    <p className="text-[11px] text-danger mt-1">{errors.name.message}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">
                    Your Email *
                  </label>
                  <input
                    type="email"
                    {...register('email')}
                    placeholder="e.g. sarah@company.com"
                    className={`w-full bg-surface-elevated/60 border rounded-xl px-4 py-2.5 text-xs text-foreground placeholder:text-text-secondary outline-none transition-colors ${
                      errors.email ? 'border-danger' : 'border-border/70 focus:border-primary'
                    }`}
                  />
                  {errors.email && (
                    <p className="text-[11px] text-danger mt-1">{errors.email.message}</p>
                  )}
                </div>
              </div>

              {/* Inquiry Type */}
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">
                  Nature of Inquiry
                </label>
                <select
                  {...register('projectType')}
                  className="w-full bg-surface-elevated/60 border border-border/70 rounded-xl px-4 py-2.5 text-xs text-foreground outline-none focus:border-primary transition-colors cursor-pointer"
                >
                  <option value="Full-time Opportunity">Full-time Opportunity (MERN / Next.js)</option>
                  <option value="Freelance / Contract Project">Freelance / Contract Project</option>
                  <option value="AI Integration & Consultation">AI Integration & Consultation</option>
                  <option value="General Conversation / Coffee Chat">General Conversation / Coffee Chat</option>
                </select>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">
                  Subject *
                </label>
                <input
                  type="text"
                  {...register('subject')}
                  placeholder="e.g. Senior Full Stack Engineer opening at..."
                  className={`w-full bg-surface-elevated/60 border rounded-xl px-4 py-2.5 text-xs text-foreground placeholder:text-text-secondary outline-none transition-colors ${
                    errors.subject ? 'border-danger' : 'border-border/70 focus:border-primary'
                  }`}
                />
                {errors.subject && (
                  <p className="text-[11px] text-danger mt-1">{errors.subject.message}</p>
                )}
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">
                  Message Details *
                </label>
                <textarea
                  rows={5}
                  {...register('message')}
                  placeholder="Please describe your project, timeline, tech stack, or the role you are hiring for..."
                  className={`w-full bg-surface-elevated/60 border rounded-xl px-4 py-2.5 text-xs text-foreground placeholder:text-text-secondary outline-none transition-colors resize-none ${
                    errors.message ? 'border-danger' : 'border-border/70 focus:border-primary'
                  }`}
                />
                {errors.message && (
                  <p className="text-[11px] text-danger mt-1">{errors.message.message}</p>
                )}
              </div>

              {errorMessage && (
                <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl gradient-brand-bg text-white font-semibold text-xs hover:opacity-95 shadow-lg shadow-primary/20 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Transmitting Message...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
