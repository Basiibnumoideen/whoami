'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import { CommandPalette } from '@/components/command-palette';
import { Search, Menu, X, ArrowRight } from 'lucide-react';

import { api } from '@/lib/api';

export function Navbar() {
  const pathname = usePathname();
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logo, setLogo] = useState<string | null>(null);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    let mounted = true;

    const applyData = (data: any) => {
      if (!mounted || !data) return;
      setSettings(data);
      const logoUrl = data.logo || data.data?.logo;
      if (logoUrl) setLogo(logoUrl);
    };

    // Cached check
    try {
      const cached = localStorage.getItem('portfolio_settings');
      if (cached) applyData(JSON.parse(cached));
    } catch {}

    api.settings.get().then(applyData).catch(() => {});

    const handleUpdate = (e: any) => {
      if (e.detail) applyData(e.detail);
    };
    window.addEventListener('portfolio_settings_updated', handleUpdate);

    return () => {
      mounted = false;
      window.removeEventListener('portfolio_settings_updated', handleUpdate);
    };
  }, []);

  const allLinks = [
    { key: 'home', href: '/', label: 'Home' },
    { key: 'about', href: '/about', label: 'About' },
    { key: 'projects', href: '/projects', label: 'Projects' },
    { key: 'skills', href: '/skills', label: 'Skills' },
    { key: 'experience', href: '/experience', label: 'Experience' },
    { key: 'services', href: '/services', label: 'Services' },
    { key: 'blog', href: '/blog', label: 'Blog' },
    { key: 'now', href: '/now', label: 'Now' },
    { key: 'uses', href: '/uses', label: 'Uses' },
  ];

  const navConfig = settings?.navLinks || {};
  const links = allLinks.filter(l => (navConfig as any)[l.key] !== false);
  const showContactCta = (navConfig as any).contact !== false;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 border-b border-border/50 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg gradient-brand-bg flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:scale-105 transition-transform overflow-hidden">
              {logo ? (
                <img src={logo} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                settings?.name?.[0] || 'B'
              )}
            </div>
            <span className="font-semibold tracking-tight text-lg text-foreground">
              Basi<span className="text-primary font-bold">.dev</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1 bg-surface-elevated/40 p-1 rounded-full border border-border/40 text-xs font-medium text-text-secondary">
            {links.map(link => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-full transition-all duration-200 ${
                    isActive
                      ? 'bg-surface text-foreground shadow-sm font-semibold border border-border/60'
                      : 'hover:text-foreground hover:bg-surface/50'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Actions: Search, Theme Toggle, CTA */}
          <div className="flex items-center gap-2.5">
            {/* Command Palette Trigger */}
            <button
              onClick={() => setIsCommandOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/50 bg-surface/60 text-text-secondary hover:text-foreground hover:bg-surface-elevated transition-colors text-xs font-medium cursor-pointer"
              title="Search and ask AI (Cmd+K)"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Search</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-surface-elevated rounded border border-border/40 text-text-secondary">
                ⌘K
              </kbd>
            </button>

            {/* Dark/Light Mode Switcher */}
            <ThemeToggle />

            {/* Contact CTA */}
            {showContactCta && (
              <Link
                href="/contact"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full gradient-brand-bg text-white hover:opacity-95 shadow-sm transition-all hover:scale-105"
              >
                <span>Get in touch</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg border border-border/50 bg-surface/50 text-foreground cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-b border-border/50 bg-surface/95 backdrop-blur-md px-4 py-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-2 gap-2 pb-2">
              {links.map(link => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`p-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary/10 text-primary font-semibold border border-primary/20'
                        : 'text-text-secondary hover:bg-surface-elevated hover:text-foreground'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
            {showContactCta && (
              <div className="pt-2 border-t border-border/40 flex items-center justify-between">
                <Link
                  href="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl gradient-brand-bg text-white font-medium text-xs shadow-sm"
                >
                  Get in touch with Basi
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Global Command Palette */}
      <CommandPalette isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />
    </>
  );
}
