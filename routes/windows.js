import { Router } from "express";
import { 
  getTaskbarWindows, 
  getGroupedTaskbarWindows, 
  getRunningApplicationNames,
  focusWindow 
} from "../utils/windowsTaskbar.js";

const router = Router();

// Endpoint pour obtenir toutes les fenêtres ouvertes
router.get("/windows", async (req, res) => {
  try {
    const windows = await getTaskbarWindows();
    res.json({ 
      success: true, 
      count: windows.length,
      windows 
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des fenêtres:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Endpoint pour obtenir les fenêtres regroupées par application
router.get("/windows/grouped", async (req, res) => {
  try {
    const grouped = await getGroupedTaskbarWindows();
    res.json({ 
      success: true, 
      count: grouped.length,
      applications: grouped 
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des fenêtres groupées:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Endpoint pour obtenir uniquement les noms des applications en cours
router.get("/windows/running-apps", async (req, res) => {
  try {
    const apps = await getRunningApplicationNames();
    res.json({ 
      success: true, 
      count: apps.length,
      applications: apps 
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des applications:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Endpoint pour activer/focus une fenêtre spécifique
router.post("/windows/focus", async (req, res) => {
  const { windowHandle } = req.body;
  
  if (!windowHandle) {
    return res.status(400).json({ 
      success: false, 
      error: "windowHandle manquant" 
    });
  }

  try {
    const success = await focusWindow(windowHandle);
    res.json({ 
      success, 
      message: success ? "Fenêtre activée" : "Échec de l'activation" 
    });
  } catch (error) {
    console.error("Erreur lors du focus de la fenêtre:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

export default router;
