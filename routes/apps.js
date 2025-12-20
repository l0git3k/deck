import { Router } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { findApp } from "../utils/appFinder.js";
import { extractIcon, getSafeIconName } from "../utils/iconExtractor.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = Router();

// Endpoint pour rechercher une application
router.get("/find-app/:appName", async (req, res) => {
  const { appName } = req.params;
  
  if (!appName) {
    return res.status(400).json({ error: "Nom d'application manquant" });
  }

  try {
    const foundPath = await findApp(appName);
    
    if (foundPath) {
      res.json({ found: true, path: foundPath });
    } else {
      res.json({ found: false, message: "Application non trouvée" });
    }
  } catch (error) {
    console.error("Erreur lors de la recherche:", error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint pour obtenir l'icône d'une application
router.get("/icon/:appName", async (req, res) => {
  const { appName } = req.params;
  
  if (!appName) {
    return res.status(400).json({ error: "Nom d'application manquant" });
  }

  try {
    // Nom de fichier sécurisé pour le cache
    const safeName = getSafeIconName(appName);
    const cachedIconPath = path.join(__dirname, '..', 'public', 'icons', safeName);
    
    // Vérifier si l'icône est déjà en cache
    if (fs.existsSync(cachedIconPath)) {
      return res.sendFile(cachedIconPath);
    }
    
    // Trouver l'application
    const appPath = await findApp(appName);
    
    if (!appPath) {
      return res.status(404).json({ error: "Application non trouvée" });
    }
    
    // Extraire l'icône
    const success = await extractIcon(appPath, cachedIconPath);
    
    if (success && fs.existsSync(cachedIconPath)) {
      res.sendFile(cachedIconPath);
    } else {
      res.status(500).json({ error: "Impossible d'extraire l'icône" });
    }
  } catch (error) {
    console.error("Erreur lors de l'extraction de l'icône:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
