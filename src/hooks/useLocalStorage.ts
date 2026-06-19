import { useEffect, useRef } from 'react';
import type { AppState } from '@/types';
import { STORAGE_KEY } from '@/types';

export function useLocalStorage(state: AppState): void {
   const isFirstRender = useRef(true);

   // Debounced write to localStorage on state change
   const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

   useEffect(() => {
      // Skip the first render (state initialized from localStorage already)
      if (isFirstRender.current) {
         isFirstRender.current = false;
         return;
      }

      if (debounceRef.current) {
         clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
         try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
         } catch {
            console.error('Failed to save state to localStorage');
         }
      }, 500);

      return () => {
         if (debounceRef.current) {
            clearTimeout(debounceRef.current);
         }
      };
   }, [state]);
}

export function loadInitialState(): AppState | null {
   try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
         const parsed = JSON.parse(stored);
         if (
            parsed &&
            typeof parsed === 'object' &&
            'tasks' in parsed &&
            'breakSeconds' in parsed
         ) {
            const state = parsed as AppState;

            // When restoring state on page load, ensure no timers are actively running.
            // Running tasks are set to paused, break timer is stopped, activeTaskId cleared.
            const sanitizedTasks = state.tasks.map((t) => {
               if (t.status === 'running') {
                  return { ...t, status: 'paused' as const };
               }
               return t;
            });

            return {
               ...state,
               tasks: sanitizedTasks,
               activeTaskId: null,
               isBreakRunning: false,
            };
         }
      }
   } catch {
      // localStorage unavailable or corrupt
   }
   return null;
}
