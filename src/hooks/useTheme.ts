import { useEffect, useState, useCallback } from 'react';

export type Theme = 'light' | 'dark' | 'system';

const THEME_STORAGE_KEY = 'timeTrackerTheme';

function getSystemTheme(): 'light' | 'dark' {
   if (typeof window === 'undefined') return 'light';
   return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
}

function getStoredTheme(): Theme {
   try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
         return stored as Theme;
      }
   } catch {
      // localStorage unavailable
   }
   return 'light';
}

function applyTheme(theme: Theme) {
   const resolved = theme === 'system' ? getSystemTheme() : theme;
   document.documentElement.classList.toggle('dark', resolved === 'dark');
}

export function useTheme() {
   const [theme, setThemeState] = useState<Theme>(getStoredTheme);

   const setTheme = useCallback((newTheme: Theme) => {
      setThemeState(newTheme);
      try {
         localStorage.setItem(THEME_STORAGE_KEY, newTheme);
      } catch {
         // localStorage unavailable
      }
      applyTheme(newTheme);
   }, []);

   // Apply theme on mount and when theme changes
   useEffect(() => {
      applyTheme(theme);
   }, [theme]);

   // Listen for system theme changes when in 'system' mode
   useEffect(() => {
      if (theme !== 'system') return;

      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => {
         document.documentElement.classList.toggle('dark', mediaQuery.matches);
      };

      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
   }, [theme]);

   const resolvedTheme = theme === 'system' ? getSystemTheme() : theme;

   return { theme, setTheme, resolvedTheme };
}