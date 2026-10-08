import type { Metadata } from 'next';
import { Outfit, Inter, Caveat } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Navbar, Footer } from '@/components/layout';
import { AiAssistant } from '@/components/ai-assistant';
import { ScrollProgress } from '@/components/scroll-progress';
import { MouseGlow } from '@/components/mouse-glow';
import { FloatingDock } from '@/components/floating-dock';
import { DynamicBranding } from '@/components/dynamic-branding';
import { Suspense } from 'react';
import { TelemetryTracker } from '@/components/telemetry-tracker';

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
  display: 'swap',
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const caveat = Caveat({
  variable: '--font-caveat',
  subsets: ['latin'],
  weight: ['600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://basi.world'),
  title: 'Muhammed Abdul Basith (Basi) — Senior MERN & Next.js Engineer',
  description: 'Production-grade full-stack portfolio & architecture platform. Engineered with Next.js 16, React 19, TypeScript, and Claude Haiku.',
  alternates: {
    canonical: 'https://basi.world',
  },
  openGraph: {
    title: 'Muhammed Abdul Basith (Basi) — Senior MERN & Next.js Engineer',
    description: 'Production-grade full-stack portfolio & architecture platform.',
    url: 'https://basi.world',
    siteName: 'Basi Portfolio',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${outfit.variable} ${inter.variable} ${caveat.variable} font-sans antialiased bg-background text-foreground selection:bg-primary/20 selection:text-primary`}>
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Suspense fallback={null}>
            <TelemetryTracker />
          </Suspense>
          <DynamicBranding />
          <ScrollProgress />
          <MouseGlow />
          <div className="min-h-screen flex flex-col relative">
            <Navbar />
            <main className="flex-1 pt-16">
              {children}
            </main>
            <Footer />
            <FloatingDock />
            <AiAssistant />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
