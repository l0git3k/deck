# 🎮 Stream Deck Web

Une interface web élégante et minimaliste pour lancer vos applications préférées sous Windows, inspirée du Stream Deck d'Elgato.

![Stream Deck](https://img.shields.io/badge/Platform-Windows-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

## ✨ Fonctionnalités

- **🚀 Lancement d'applications** - Cliquez pour lancer n'importe quelle application Windows
- **🔍 Recherche intelligente** - Trouve automatiquement vos applications installées
- **🎨 Icônes automatiques** - Extrait les icônes officielles des applications
- **📦 Groupes d'applications** - Organisez vos apps par catégories
- **🎯 Interface minimaliste** - Design discret et moderne
- **⚡ Performances** - Cache intelligent pour un chargement rapide

## 📋 Prérequis

- Node.js 18 ou supérieur
- Windows 10/11
- PowerShell (inclus avec Windows)

## 🚀 Installation

```bash
# Cloner le repository
git clone https://github.com/l0git3k/deck.git
cd deck

# Installer les dépendances
npm install

# Lancer le serveur
npm start
```

Le Stream Deck sera accessible sur http://localhost:3000

## 📝 Configuration

Éditez le fichier `config.json` pour personnaliser vos applications :

```json
[
  {
    "type": "group",
    "name": "Développement",
    "color": "#3b82f6",
    "apps": [
      {
        "name": "VS Code",
        "path": "Code.exe"
      },
      {
        "name": "Git Bash",
        "path": "git-bash.exe",
        "icon": "🔧"
      }
    ]
  },
  {
    "type": "group",
    "name": "Communication",
    "color": "#8b5cf6",
    "apps": [
      {
        "name": "Teams",
        "path": "ms-teams"
      }
    ]
  }
]
```

### Propriétés

- `type`: `"group"` pour créer un groupe d'applications
- `name`: Nom du groupe ou de l'application
- `color`: Couleur d'accent du groupe (format hex)
- `path`: Nom ou chemin de l'exécutable
- `icon`: (Optionnel) Emoji de fallback si l'icône ne peut être extraite

## 🔍 Recherche d'applications

Le système trouve automatiquement vos applications via :

1. **PATH système** - Applications dans le PATH Windows
2. **Registre Windows** - Apps installées correctement (App Paths)
3. **Windows Store** - Applications du Microsoft Store
4. **Dossiers communs** - Program Files, AppData, etc.

### Exemples de chemins

Vous pouvez utiliser :
- `Code.exe` ou `code` pour VS Code
- `chrome` pour Google Chrome
- `ms-teams` pour Microsoft Teams
- Ou un chemin complet : `C:\Program Files\App\app.exe`

## 🏗️ Architecture

```
deck/
├── server.js              # Serveur Express
├── config.json            # Configuration des apps
├── routes/
│   ├── config.js         # API configuration
│   ├── apps.js           # API recherche et icônes
│   └── run.js            # API exécution
├── utils/
│   ├── appFinder.js      # Recherche intelligente
│   └── iconExtractor.js  # Extraction d'icônes
└── public/
    ├── index.html        # Interface
    ├── css/
    │   └── styles.css    # Styles
    └── js/
        └── app.js        # Logique frontend
```

Voir [ARCHITECTURE.md](ARCHITECTURE.md) pour plus de détails.

## 🎨 Personnalisation

### Couleurs de groupes

```json
{
  "color": "#3b82f6"  // Bleu
  "color": "#10b981"  // Vert
  "color": "#8b5cf6"  // Violet
  "color": "#ec4899"  // Rose
  "color": "#f59e0b"  // Orange
}
```

### Styles CSS

Éditez `public/css/styles.css` pour personnaliser :
- Taille des boutons
- Couleurs
- Animations
- Layout de la grille

## 🔧 API

### Endpoints

- `GET /config` - Récupère la configuration
- `GET /find-app/:appName` - Recherche une application
- `GET /icon/:appName` - Récupère l'icône d'une app
- `POST /run` - Lance une application

### Exemples

```bash
# Rechercher une application
curl http://localhost:3000/find-app/chrome

# Récupérer une icône
curl http://localhost:3000/icon/teams -o teams.png

# Lancer une application
curl -X POST http://localhost:3000/run \
  -H "Content-Type: application/json" \
  -d '{"appPath":"code"}'
```

## 🐛 Dépannage

### L'application ne se lance pas

1. Vérifiez que le chemin est correct dans `config.json`
2. Testez la recherche : http://localhost:3000/find-app/VOTRE_APP
3. Consultez les logs du serveur dans le terminal

### L'icône ne s'affiche pas

- L'icône sera extraite au premier accès
- Vérifiez le dossier `public/icons/` pour le cache
- Un emoji de fallback s'affichera si l'extraction échoue

### Port déjà utilisé

Modifiez le port dans `server.js` :
```javascript
const PORT = process.env.PORT || 3001;
```

## 📦 Scripts NPM

```bash
npm start          # Lance le serveur
npm run dev        # Mode développement avec auto-reload (à configurer)
```

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push sur la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🙏 Remerciements

- Inspiré par l'Elgato Stream Deck
- Icônes extraites via l'API Windows .NET
- Conçu pour améliorer la productivité

## 📞 Contact

GitHub: [@l0git3k](https://github.com/l0git3k)

---

⭐ N'oubliez pas de mettre une étoile si ce projet vous est utile !
