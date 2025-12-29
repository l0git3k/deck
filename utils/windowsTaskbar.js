import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import { fileURLToPath } from "url";

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Récupère la liste des fenêtres ouvertes visibles dans la barre des tâches Windows
 * @returns {Promise<Array>} Liste des applications avec leurs informations
 */
export async function getTaskbarWindows() {
  try {
    const scriptPath = path.join(__dirname, '..', 'temp', 'get-windows.ps1');
    
    const { stdout } = await execAsync(
      `powershell -NoProfile -ExecutionPolicy Bypass -File "${scriptPath}"`,
      { encoding: 'utf8', maxBuffer: 1024 * 1024 * 10 }
    );

    if (!stdout || stdout.trim() === '') {
      return [];
    }

    let windows = JSON.parse(stdout);
    
    // S'assurer que c'est toujours un tableau
    if (!Array.isArray(windows)) {
      windows = [windows];
    }

    // Filtrer et nettoyer les résultats
    return windows
      .filter(w => w.Title && w.ProcessName)
      .map(w => ({
        title: w.Title,
        processName: w.ProcessName,
        processId: w.ProcessId,
        executablePath: w.ExecutablePath || null,
        windowHandle: w.MainWindowHandle
      }));

  } catch (error) {
    console.error("Erreur lors de la récupération des fenêtres:", error);
    return [];
  }
}

/**
 * Récupère les fenêtres regroupées par application
 * @returns {Promise<Array>} Applications avec leurs fenêtres
 */
export async function getGroupedTaskbarWindows() {
  const windows = await getTaskbarWindows();
  const grouped = new Map();

  for (const window of windows) {
    const key = window.processName;
    
    if (!grouped.has(key)) {
      grouped.set(key, {
        processName: window.processName,
        executablePath: window.executablePath,
        windowCount: 0,
        windows: []
      });
    }

    const group = grouped.get(key);
    group.windowCount++;
    group.windows.push({
      title: window.title,
      processId: window.processId,
      windowHandle: window.windowHandle
    });
  }

  return Array.from(grouped.values());
}

/**
 * Récupère uniquement les noms des applications ouvertes (sans doublons)
 * @returns {Promise<Array>} Liste des noms d'applications uniques
 */
export async function getRunningApplicationNames() {
  const grouped = await getGroupedTaskbarWindows();
  return grouped.map(app => ({
    name: app.processName,
    path: app.executablePath,
    windowCount: app.windowCount
  }));
}

/**
 * Active/focus une fenêtre spécifique par son handle
 * @param {number} windowHandle - Handle de la fenêtre
 * @returns {Promise<boolean>} True si succès
 */
export async function focusWindow(windowHandle) {
  try {
    const scriptPath = path.join(__dirname, '..', 'temp', 'focus-window.ps1');

    const { stdout } = await execAsync(
      `powershell -NoProfile -ExecutionPolicy Bypass -File "${scriptPath}" ${windowHandle}`,
      { encoding: 'utf8' }
    );

    return stdout.trim() === 'True';
  } catch (error) {
    console.error("Erreur lors du focus de la fenêtre:", error);
    return false;
  }
}
