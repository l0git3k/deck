import { promisify } from "util";
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fonction pour extraire l'icône d'un .exe via PowerShell
export async function extractIcon(exePath, outputPath) {
  const psScript = `
Add-Type -AssemblyName System.Drawing
try {
  $icon = [System.Drawing.Icon]::ExtractAssociatedIcon("${exePath.replace(/\\/g, '\\\\')}")
  if ($icon) {
    $bitmap = $icon.ToBitmap()
    $bitmap.Save("${outputPath.replace(/\\/g, '\\\\')}", [System.Drawing.Imaging.ImageFormat]::Png)
    $bitmap.Dispose()
    $icon.Dispose()
    Write-Output "SUCCESS"
  } else {
    Write-Output "ERROR"
  }
} catch {
  Write-Output "ERROR: $_"
}
`;

  const scriptPath = path.join(path.dirname(__dirname), 'temp', 'extract-icon.ps1');
  
  try {
    // Créer le dossier temp si nécessaire
    const tempDir = path.dirname(scriptPath);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Écrire le script dans un fichier temporaire
    fs.writeFileSync(scriptPath, psScript, 'utf8');
    
    // Exécuter le script
    const { stdout } = await execAsync(
      `powershell -ExecutionPolicy Bypass -File "${scriptPath}"`, 
      { encoding: 'utf8', timeout: 5000 }
    );
    
    // Supprimer le script temporaire
    fs.unlinkSync(scriptPath);
    
    return stdout.trim().startsWith('SUCCESS');
  } catch (e) {
    console.error('Erreur extraction icône:', e.message);
    // Nettoyer le script temporaire en cas d'erreur
    try { 
      if (fs.existsSync(scriptPath)) {
        fs.unlinkSync(scriptPath);
      }
    } catch {}
    return false;
  }
}

// Génère un nom de fichier sécurisé pour le cache
export function getSafeIconName(appName) {
  return appName.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.png';
}
