import { contextBridge, ipcRenderer } from 'electron';

/**
 * Securely expose IPC APIs to the renderer (React) via contextBridge.
 * The renderer can access these through `window.electronAPI`.
 */
contextBridge.exposeInMainWorld('electronAPI', {
  /**
   * Register a callback that fires every second when the main process timer ticks.
   */
  onTimerTick: (callback: () => void) => {
    ipcRenderer.on('timer-tick', () => {
      callback();
    });
  },

  /**
   * Remove all 'timer-tick' listeners.
   */
  removeAllTimerListeners: () => {
    ipcRenderer.removeAllListeners('timer-tick');
  },

  // ── Window Controls ──────────────────────────────────────────────────

  minimizeWindow: () => {
    ipcRenderer.send('window-minimize');
  },

  maximizeWindow: () => {
    ipcRenderer.send('window-maximize');
  },

  closeWindow: () => {
    ipcRenderer.send('window-close');
  },
});