'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  KeyRound, 
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { api } from '@/lib/api';

function AdminLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('from') || '/admin/dashboard';

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Force password change state
  const [showForceModal, setShowForceModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);

  // Auto-redirect if already authenticated
  useEffect(() => {
    if (api.auth.isAuthenticated()) {
      console.log('[Admin Login] Already authenticated, redirecting to /admin/dashboard');
      router.replace('/admin/dashboard');
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      console.log('[Admin Login] Verifying credentials...');
      const res = await api.auth.login({ 
        email: identifier.trim(), 
        password 
      });
      
      if (res.user?.forcePasswordChange) {
        setShowForceModal(true);
        setIsLoading(false);
        return;
      }

      setSuccess('Security credentials verified. Accessing dashboard...');
      setTimeout(() => {
        router.replace(returnTo);
      }, 350);
    } catch (err: any) {
      console.error('[Admin Login] Login failed:', err);
      setError(err.message || 'Invalid username/email or password. Access denied.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForceChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsChangingPass(true);
    try {
      await api.auth.changePassword({ newPassword });
      setSuccess('Password updated successfully. Redirecting...');
      setTimeout(() => {
        router.replace(returnTo);
      }, 500);
    } catch (err: any) {
      setError(err.message || 'Failed to update password.');
    } finally {
      setIsChangingPass(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050816] text-foreground flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-accent/15 rounded-full blur-[110px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/30 text-primary mb-4 shadow-lg shadow-primary/10">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Admin Gateway</h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Sign in with administrator credentials to manage portfolio CMS
          </p>
        </div>

        {/* Card */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-border/80 shadow-2xl backdrop-blur-xl relative">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-danger/10 border border-danger/30 text-danger text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-5 p-3.5 rounded-xl bg-success/10 border border-success/30 text-success text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase text-text-secondary mb-1.5 font-medium">
                Admin Username or Email
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  autoComplete="username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Enter admin username or email"
                  className="w-full bg-surface-elevated/70 border border-border/70 rounded-xl pl-10 pr-4 py-2.5 text-xs text-foreground outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-text-secondary mb-1.5 font-medium">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-surface-elevated/70 border border-border/70 rounded-xl pl-10 pr-10 py-2.5 text-xs text-foreground outline-none focus:border-primary transition-colors font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-secondary hover:text-foreground transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl gradient-brand-bg text-white text-xs font-bold shadow-lg shadow-primary/20 hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 p-3 rounded-xl bg-surface-elevated/50 border border-border/60 text-[11px] text-text-secondary flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-foreground font-medium">Secured Environment Access</p>
              <p className="text-[10px] text-text-secondary mt-0.5 leading-relaxed">
                Credentials sync dynamically from <code className="text-primary font-mono bg-primary/10 px-1 py-0.5 rounded">backend/.env</code>. Default username: <code className="text-foreground font-mono font-semibold">basi</code> or email: <code className="text-foreground font-mono font-semibold">admin@basi.dev</code>.
              </p>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-border/60 text-center">
            <Link
              href="/"
              className="text-xs text-text-secondary hover:text-foreground transition-colors"
            >
              ← Return to Public Portfolio
            </Link>
          </div>
        </div>
      </div>

      {/* Force Password Change Modal */}
      {showForceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-surface p-6 sm:p-8 rounded-3xl border border-primary/40 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-warning/15 text-warning flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Update Password</h3>
                <p className="text-xs text-text-secondary">A password update is required before accessing the dashboard.</p>
              </div>
            </div>

            <form onSubmit={handleForceChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-text-secondary mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="w-full bg-surface-elevated border border-border/70 rounded-xl px-3.5 py-2 text-xs text-foreground outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-text-secondary mb-1">Confirm Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full bg-surface-elevated border border-border/70 rounded-xl px-3.5 py-2 text-xs text-foreground outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isChangingPass}
                  className="w-full py-2.5 rounded-xl gradient-brand-bg text-white text-xs font-bold hover:opacity-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isChangingPass ? 'Updating...' : 'Save & Enter Dashboard'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050816] flex items-center justify-center text-xs text-text-secondary">Loading security gateway...</div>}>
      <AdminLoginContent />
    </Suspense>
  );
}
