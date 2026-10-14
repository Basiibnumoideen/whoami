'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ThemeProviderProps } from 'next-themes';

// Filter out the React 19 / Next.js 16 false-positive warning for next-themes script tag injection
const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Encountered a script tag') ||
      args[0].includes('Scripts inside React components are never executed'))
  ) {
    return;
  }
  originalConsoleError.apply(console, args);
};

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

