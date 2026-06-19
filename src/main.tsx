import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Apply saved theme immediately to prevent flash of wrong theme
(function () {
   try {
      const key = 'timeTrackerTheme';
      const stored = localStorage.getItem(key);
      let isDark = false;

      if (stored === 'dark') {
         isDark = true;
      } else if (stored === 'system' || !stored) {
         isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }

      document.documentElement.classList.toggle('dark', isDark);
   } catch {
      // localStorage unavailable
   }
})();

ReactDOM.createRoot(document.getElementById('root')!).render(
   <React.StrictMode>
      <App />
   </React.StrictMode>,
);