import { app, BrowserWindow, shell, ipcMain } from 'electron';
import Store from 'electron-store';
import * as path from 'path';
import * as fs from 'fs';

let mainWindow: BrowserWindow | null = null;
let nextJsServer: any = null;

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

// Persistent store for user settings
const store = new Store<{
  geminiApiKey?: string;
  theme?: 'light' | 'dark' | 'system';
  lastOpenRunId?: string;
}>({
  name: 'settings',
  defaults: {
    theme: 'system',
  },
});

// Database path setup
function getDatabasePath(): string {
  const userDataPath = app.getPath('userData');
  const dbDir = path.join(userDataPath, 'database');
  
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  
  return path.join(dbDir, 'dev.db');
}

// Copy default database if not exists
function initializeDatabase(): void {
  const dbPath = getDatabasePath();
  
  if (!fs.existsSync(dbPath)) {
    // In production, copy from resources
    if (app.isPackaged) {
      const defaultDbPath = path.join(process.resourcesPath, 'prisma', 'dev.db');
      if (fs.existsSync(defaultDbPath)) {
        fs.copyFileSync(defaultDbPath, dbPath);
      } else {
        // Create empty database
        fs.writeFileSync(dbPath, '');
      }
    } else {
      // In dev, use local dev.db
      const localDbPath = path.join(__dirname, '..', 'prisma', 'dev.db');
      if (fs.existsSync(localDbPath) && !fs.existsSync(dbPath)) {
        fs.copyFileSync(localDbPath, dbPath);
      }
    }
  }
  
  // Set env variable for Prisma
  process.env.DATABASE_URL = `file:${dbPath}`;
}

// Files directory for attachments
function getFilesPath(): string {
  const userDataPath = app.getPath('userData');
  const filesDir = path.join(userDataPath, 'files');
  
  if (!fs.existsSync(filesDir)) {
    fs.mkdirSync(filesDir, { recursive: true });
  }
  
  return filesDir;
}

async function createWindow(): Promise<void> {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    title: 'Test Plan Manager',
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 15, y: 15 },
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // Open external links in default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  if (isDev) {
    // Development: load from Next.js dev server
    const port = process.env.PORT || 3000;
    await mainWindow.loadURL(`http://localhost:${port}`);
    mainWindow.webContents.openDevTools();
  } else {
    // Production: load from built files
    const indexPath = path.join(__dirname, '..', '.next', 'server', 'app', 'page.html');
    await mainWindow.loadFile(indexPath);
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App lifecycle
app.whenReady().then(async () => {
  initializeDatabase();
  process.env.FILES_PATH = getFilesPath();
  
  await createWindow();

  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (nextJsServer) {
    nextJsServer.kill();
  }
});

// Security: prevent navigation to external URLs
app.on('web-contents-created', (_, contents) => {
  contents.on('will-navigate', (event, url) => {
    if (!url.startsWith('http://localhost') && !url.startsWith('file://')) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });
});

// IPC Handlers for renderer process
ipcMain.handle('get-app-path', () => app.getAppPath());
ipcMain.handle('get-version', () => app.getVersion());
ipcMain.handle('get-database-path', () => getDatabasePath());
ipcMain.handle('get-files-path', () => getFilesPath());

// Store handlers
ipcMain.handle('store-get', (_, key: string) => (store as any).get(key));
ipcMain.handle('store-set', (_, key: string, value: any) => {
  (store as any).set(key, value);
  return true;
});
ipcMain.handle('store-delete', (_, key: string) => {
  (store as any).delete(key);
  return true;
});
ipcMain.handle('store-clear', () => {
  (store as any).reset();
  return true;
});

// Shell handlers
ipcMain.handle('open-external', (_, url: string) => {
  shell.openExternal(url);
  return true;
});
ipcMain.handle('show-item-in-folder', (_, filePath: string) => {
  shell.showItemInFolder(filePath);
  return true;
});
