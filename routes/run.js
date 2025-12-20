import { Router } from "express";
import { exec } from "child_process";
import { findApp } from "../utils/appFinder.js";

const router = Router();

// Endpoint pour exécuter une application
router.post("/run", async (req, res) => {
  const { appPath } = req.body;
  
  if (!appPath) {
    return res.status(400).json({ error: "Chemin d'application manquant" });
  }
  
  try {
    // Essayer de trouver l'application si ce n'est pas un chemin complet
    const resolvedPath = await findApp(appPath);
    
    if (!resolvedPath) {
      return res.status(404).json({ error: "Application non trouvée" });
    }
    
    exec(`"${resolvedPath}"`, (error) => {
      if (error) {
        console.error(`Erreur d'exécution: ${error.message}`);
      }
    });
    
    res.json({ ok: true, path: resolvedPath });
  } catch (error) {
    console.error(`Erreur: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
});

export default router;
