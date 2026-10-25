import React from 'react';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === 'dark';
  const Icon = isDark ? Sun : Moon;

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      aria-pressed={isDark}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-current/20 text-current transition-colors hover:bg-slate-500/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-400"
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}