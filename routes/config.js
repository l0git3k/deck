import { Router } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = Router();

// Endpoint pour récupérer la configuration
router.get("/config", (req, res) => {
  try {
    const configPath = path.join(__dirname, "..", "config.json");
    const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    res.json(config);
  } catch (error) {
    console.error("Erreur lors de la lecture de config.json:", error);
    res.status(500).json({ error: "Impossible de charger la configuration" });
  }
});

export default router;
