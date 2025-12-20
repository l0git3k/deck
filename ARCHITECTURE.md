# Stream Deck - Architecture du projet

## Structure des fichiers

```
deck/
├── server.js              # Point d'entrée principal
├── config.json            # Configuration des boutons
├── package.json
├── routes/
│   ├── config.js         # Route GET /config
│   ├── apps.js           # Routes GET /find-app/:appName et /icon/:appName
│   └── run.js            # Route POST /run
├── utils/
│   ├── appFinder.js      # Logique de recherche d'applications
│   └── iconExtractor.js  # Extraction d'icônes Windows
├── public/
│   ├── index.html        # Interface Stream Deck
│   ├── css/
│   │   └── styles.css    # Styles de l'interface
│   ├── js/
│   │   └── app.js        # Logique frontend
│   └── icons/            # Cache des icônes extraites
└── temp/                 # Scripts PowerShell temporaires
```

## Modules Backend

### `utils/appFinder.js`
- **findApp(appName)** - Recherche intelligente d'applications
- **clearCache()** - Nettoie le cache des chemins
- **getCacheStats()** - Statistiques du cache

Méthodes de recherche (dans l'ordre):
1. Commande `where` (PATH système)
2. Registre Windows (App Paths)
3. Dossiers communs (Program Files, AppData)

### `utils/iconExtractor.js`
- **extractIcon(exePath, outputPath)** - Extrait l'icône d'un .exe
- **getSafeIconName(appName)** - Génère un nom de fichier sécurisé

### `routes/config.js`
- `GET /config` - Récupère la configuration des boutons

### `routes/apps.js`
- `GET /find-app/:appName` - Recherche une application
- `GET /icon/:appName` - Récupère/génère l'icône d'une app

### `routes/run.js`
- `POST /run` - Lance une application

## Modules Frontend

### `public/js/app.js`
- **createDeckButton(app)** - Crée un bouton complet
- **createIcon(app)** - Génère l'élément icône (img ou emoji)
- **createLabel(name)** - Génère l'élément label
- **handleButtonClick(button, app)** - Gère les clics et animations
- **runApplication(app)** - Appelle l'API pour lancer une app
- **loadDeck()** - Charge la config et génère tous les boutons

### `public/css/styles.css`
Styles pour l'interface Stream Deck :
- Layout en grille 8 colonnes
- Boutons avec gradients et ombres
- Animations au survol et au clic
- Icônes 48x48px