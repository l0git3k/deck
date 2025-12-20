import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";

const execAsync = promisify(exec);

// Cache pour les chemins d'applications trouvées
const appPathCache = new Map();

// Variations de noms à essayer
function getNameVariations(appName) {
  return [
    appName,
    `${appName}.exe`,
    appName.toLowerCase(),
    `${appName.toLowerCase()}.exe`
  ];
}

// Méthode 1: Utiliser 'where' (rapide, pour apps dans PATH)
async function findInPath(appName) {
  try {
    const { stdout } = await execAsync(`where ${appName}`);
    const foundPath = stdout.trim().split('\n')[0];
    if (foundPath && fs.existsSync(foundPath)) {
      return foundPath;
    }
  } catch (e) {
    return null;
  }
}

// Méthode 2: Chercher dans le registre Windows
async function findInRegistry(appName) {
  const registryLocations = [
    'HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths',
    'HKEY_CURRENT_USER\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths'
  ];

  const variations = getNameVariations(appName);

  for (const location of registryLocations) {
    for (const variation of variations) {
      try {
        const { stdout } = await execAsync(`reg query "${location}\\${variation}" /ve`, { encoding: 'utf8' });
        const match = stdout.match(/REG_SZ\s+(.+)/);
        if (match) {
          const foundPath = match[1].trim();
          if (fs.existsSync(foundPath)) {
            return foundPath;
          }
        }
      } catch (e) {
        // Continue
      }
    }
  }
  return null;
}

// Méthode 3: Chercher dans WindowsApps (apps Windows Store)
async function findInWindowsApps(appName) {
  const windowsAppsPath = path.join(process.env.LOCALAPPDATA, 'Microsoft', 'WindowsApps');
  const variations = getNameVariations(appName);
  
  // Ajouter des variations pour les apps Windows Store
  const storeVariations = [
    ...variations,
    `ms-${appName.toLowerCase()}.exe`,
    `${appName.toLowerCase()}.exe`
  ];

  try {
    const files = fs.readdirSync(windowsAppsPath);
    
    for (const variation of storeVariations) {
      const possiblePath = path.join(windowsAppsPath, variation);
      if (fs.existsSync(possiblePath)) {
        return possiblePath;
      }
    }
  } catch (e) {
    // Ignore les erreurs d'accès
  }
  
  return null;
}

// Méthode 4: Chercher dans les dossiers communs
async function findInCommonPaths(appName) {
  const commonPaths = [
    process.env.ProgramFiles,
    process.env['ProgramFiles(x86)'],
    path.join(process.env.LOCALAPPDATA, 'Programs'),
    path.join(process.env.APPDATA, 'Local', 'Programs')
  ];

  const variations = getNameVariations(appName);

  for (const basePath of commonPaths) {
    if (!basePath) continue;
    
    try {
      const dirs = fs.readdirSync(basePath, { withFileTypes: true });
      
      for (const dir of dirs) {
        if (!dir.isDirectory()) continue;
        
        const appDir = path.join(basePath, dir.name);
        
        for (const variation of variations) {
          const possiblePath = path.join(appDir, variation);
          if (fs.existsSync(possiblePath)) {
            return possiblePath;
          }
        }
      }
    } catch (e) {
      // Ignore les erreurs d'accès
    }
  }
  return null;
}

// Fonction principale de recherche d'application
export async function findApp(appName) {
  // Vérifier le cache d'abord
  if (appPathCache.has(appName)) {
    return appPathCache.get(appName);
  }

  // Si c'est déjà un chemin complet qui existe, le retourner
  if (fs.existsSync(appName)) {
    appPathCache.set(appName, appName);
    return appName;
  }

  // Essayer les différentes méthodes dans l'ordre
  let foundPath = await findInPath(appName);
  
  if (!foundPath) {
    foundPath = await findInRegistry(appName);
  }
  
  if (!foundPath) {
    foundPath = await findInWindowsApps(appName);
  }
  
  if (!foundPath) {
    foundPath = await findInCommonPaths(appName);
  }

  // Mettre en cache si trouvé
  if (foundPath) {
    appPathCache.set(appName, foundPath);
  }

  return foundPath;
}

// Nettoyer le cache
export function clearCache() {
  appPathCache.clear();
}

// Obtenir les stats du cache
export function getCacheStats() {
  return {
    size: appPathCache.size,
    keys: Array.from(appPathCache.keys())
  };
}
