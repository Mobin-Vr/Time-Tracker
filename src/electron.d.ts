/**
 * Type declarations for the Electron preload API exposed via contextBridge.
 * This provides type safety when using `window.electronAPI` in the renderer.
 */
interface ElectronAPI {
  onTimerTick: (callback: () => void) => void;
  removeAllTimerListeners: () => void;

  // Window controls
  minimizeWindow: () => void;
  maximizeWindow: () => void;
  closeWindow: () => void;
}

interface Window {
  electronAPI?: ElectronAPI;
}