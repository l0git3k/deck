const { app, BrowserWindow, Tray, Menu } = require('electron');
const { spawn } = require('child_process');
const path = require('path');

let mainWindow;
let tray;
let serverProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, 'public/icons/main.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    },
    autoHideMenuBar: true
  });

  mainWindow.loadURL('http://localhost:3000');

  // Minimiser dans la barre d'état au lieu de fermer
  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
    return false;
  });
}

function createTray() {
  const iconPath = path.join(__dirname, 'public/icons/main.png');
  tray = new Tray(iconPath);
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Ouvrir Stream Deck',
      click: () => {
        mainWindow.show();
      }
    },
    {
      label: 'Quitter',
      click: () => {
        app.isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setToolTip('Stream Deck');
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    mainWindow.show();
  });
}

function startServer() {
  return new Promise((resolve, reject) => {
    const serverPath = app.isPackaged 
      ? path.join(process.resourcesPath, 'app.asar', 'server.js')
      : path.join(__dirname, 'server.js');
    
    // Utiliser 'node' directement du PATH système
    const nodeCommand = app.isPackaged 
      ? process.execPath.replace('electron.exe', 'node.exe')
      : 'node';
    
    serverProcess = spawn(nodeCommand, [serverPath], {
      cwd: app.isPackaged ? process.resourcesPath : __dirname,
      stdio: 'pipe',
      shell: true // Permet de trouver node dans le PATH
    });

    serverProcess.stdout.on('data', (data) => {
      console.log(`[Server] ${data}`);
      if (data.toString().includes('en écoute')) {
        resolve();
      }
    });

    serverProcess.stderr.on('data', (data) => {
      console.error(`[Server Error] ${data}`);
    });

    serverProcess.on('error', (error) => {
      console.error('Erreur lors du démarrage du serveur:', error);
      reject(error);
    });

    // Timeout de sécurité
    setTimeout(() => resolve(), 3000);
  });
}

app.whenReady().then(async () => {
  console.log('🚀 Démarrage de Stream Deck...');
  
  // Désactiver l'accélération GPU pour éviter les erreurs de cache
  app.disableHardwareAcceleration();
  
  // Démarrer le serveur Node.js
  await startServer();
  console.log('✅ Serveur démarré');
  
  // Créer la fenêtre et la barre d'état
  createWindow();
  createTray();
  console.log('✅ Interface prête');

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', (event) => {
  event.preventDefault();
});

app.on('before-quit', () => {
  app.isQuitting = true;
});

app.on('quit', () => {
  if (serverProcess) {
    console.log('🛑 Arrêt du serveur...');
    serverProcess.kill();
  }
});

// Configurer l'auto-start au démarrage
app.setLoginItemSettings({
  openAtLogin: true,
  openAsHidden: false,
  path: process.execPath,
  args: []
});
