import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { app, BrowserWindow } from 'electron';
import { logger } from './services/logger.js';

const isDev = process.env.NODE_ENV !== 'production';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function resolveDatabaseUrl() {
  const dbPath = path.join(app.getPath('userData'), 'agent-battery.db');
  process.env.DATABASE_URL = `file:${dbPath}`;
}

async function createWindow() {
  const window = new BrowserWindow({
    width: 1200,
    height: 760,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  if (isDev) {
    await window.loadURL('http://localhost:5173');
    window.webContents.openDevTools({ mode: 'detach' });
  } else {
    await window.loadFile(path.join(__dirname, '../renderer/index.html'));
  }
}

app.whenReady().then(async () => {
  resolveDatabaseUrl();
  const [{ registerIpcHandlers }, { syncService }] = await Promise.all([
    import('./ipc/index.js'),
    import('./services/syncService.js')
  ]);

  registerIpcHandlers();
  await createWindow();
  await syncService.start();

  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createWindow();
    }
  });
});

app.on('before-quit', async () => {
  const [{ syncService }, { prisma }] = await Promise.all([
    import('./services/syncService.js'),
    import('@agent-battery/db')
  ]);
  syncService.stop();
  await prisma.$disconnect();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

process.on('unhandledRejection', (error) => {
  logger.error('Unhandled rejection', { error: String(error) });
});
