import React, {
   createContext,
   useContext,
   useReducer,
   useCallback,
   useEffect,
} from 'react';
import type { AppState, Action } from '@/types';
import { defaultState } from '@/types';
import { appReducer } from './appReducer';
import { loadInitialState, useLocalStorage } from '@/hooks/useLocalStorage';

interface AppContextValue {
   state: AppState;
   dispatch: React.Dispatch<Action>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
   const [state, dispatch] = useReducer(appReducer, defaultState, () => {
      return loadInitialState() ?? defaultState;
   });

   useLocalStorage(state);

   const stableDispatch = useCallback((action: Action) => dispatch(action), []);

   // Timer tick source: Electron Main Process (IPC) with fallback to local setInterval
   useEffect(() => {
      if (window.electronAPI) {
         // In Electron: listen for ticks from the Main Process (never throttled)
         window.electronAPI.onTimerTick(() => {
            stableDispatch({ type: 'TICK' });
         });
         return () => {
            window.electronAPI.removeAllTimerListeners();
         };
      } else {
         // Fallback for development/browser: local setInterval
         const interval = setInterval(() => {
            stableDispatch({ type: 'TICK' });
         }, 1000);
         return () => clearInterval(interval);
      }
   }, [stableDispatch]);

   return (
      <AppContext.Provider value={{ state, dispatch }}>
         {children}
      </AppContext.Provider>
   );
}

export function useAppContext(): AppContextValue {
   const ctx = useContext(AppContext);
   if (!ctx) {
      throw new Error('useAppContext must be used within AppProvider');
   }
   return ctx;
}
