import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import configRoutes from "./routes/config.js";
import appsRoutes from "./routes/apps.js";
import runRoutes from "./routes/run.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use(configRoutes);
app.use(appsRoutes);
app.use(runRoutes);

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({ error: "Route non trouvée" });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🎮 Stream Deck en écoute sur http://localhost:${PORT}`);
  console.log(`📁 Répertoire public: ${path.join(__dirname, "public")}`);
});
