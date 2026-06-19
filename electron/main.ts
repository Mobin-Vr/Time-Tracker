import { app, BrowserWindow, Menu, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// The built output lives in out/renderer
const isDev = process.env.NODE_ENV === 'development' || process.env.ELECTRON_VITE_DEV === 'true';

let mainWindow: BrowserWindow | null = null;
let tickInterval: ReturnType<typeof setInterval> | null = null;

function createWindow() {
  // Remove the default menu bar entirely
  Menu.setApplicationMenu(null);

  mainWindow = new BrowserWindow({
    width: 800,
    height: 700,
    minWidth: 500,
    minHeight: 400,
    // Custom frame — we provide our own title bar with window controls
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, '..', 'preload', 'index.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
    // ⭐ CRITICAL: prevents timer throttling when window is minimized/hidden
    backgroundThrottling: false,
    title: 'Time Tracker',
    icon: path.join(__dirname, '..', '..', 'public', 'clock-favicon.png'),
  });

  if (isDev) {
    // In dev mode, load the Vite dev server
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load the built renderer
    mainWindow.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// ⭐ Start the tick interval in the Main Process (Node.js)
// This NEVER throttles regardless of window visibility
function startTimerTick() {
  if (tickInterval) return; // already running

  tickInterval = setInterval(() => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('timer-tick');
    }
  }, 1000);
}

function stopTimerTick() {
  if (tickInterval) {
    clearInterval(tickInterval);
    tickInterval = null;
  }
}

// IPC Handlers — Window Controls
ipcMain.on('window-minimize', () => {
  mainWindow?.minimize();
});

ipcMain.on('window-maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});

ipcMain.on('window-close', () => {
  mainWindow?.close();
});

// App lifecycle
app.whenReady().then(() => {
  createWindow();
  startTimerTick();

  app.on('activate', () => {
    // macOS: re-create window when dock icon clicked and no windows open
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  stopTimerTick();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  stopTimerTick();
});