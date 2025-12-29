// Crée une carte de groupe avec ses applications
function createGroupCard(group) {
  const card = document.createElement('div');
  card.className = 'group-card';
  card.style.setProperty('--group-color', group.color);
  
  const header = document.createElement('div');
  header.className = 'group-header';
  header.textContent = group.name;
  card.appendChild(header);
  
  const appsContainer = document.createElement('div');
  appsContainer.className = 'group-apps';
  
  group.apps.forEach(app => {
    const button = createDeckButton(app);
    appsContainer.appendChild(button);
  });
  
  card.appendChild(appsContainer);
  return card;
}

// Crée un bouton de deck avec son icône et son label
function createDeckButton(app) {
  const button = document.createElement('button');
  button.className = 'deck-button';
  button.dataset.path = app.path;
  
  const icon = createIcon(app);
  const label = createLabel(app.name);
  
  button.appendChild(icon);
  button.appendChild(label);
  
  button.addEventListener('click', () => handleButtonClick(button, app));
  
  return button;
}

// Crée l'élément icône (image ou emoji)
function createIcon(app) {
  const icon = document.createElement('div');
  icon.className = 'deck-button-icon';
  
  if (app.path) {
    const img = document.createElement('img');
    img.src = `/icon/${encodeURIComponent(app.path)}`;
    img.alt = app.name;
    
    // Fallback sur l'emoji si l'icône ne charge pas
    img.onerror = () => {
      icon.innerHTML = '';
      icon.textContent = app.icon;
    };
    
    icon.appendChild(img);
  } else {
    icon.textContent = app.icon;
  }
  
  return icon;
}

// Crée l'élément label
function createLabel(name) {
  const label = document.createElement('div');
  label.className = 'deck-button-label';
  label.textContent = name;
  return label;
}

// Gère le clic sur un bouton
async function handleButtonClick(button, app) {
  // Animation de clic
  button.classList.add('clicked');
  setTimeout(() => button.classList.remove('clicked'), 3000);
  
  // Exécuter l'application si elle a un chemin
  if (app.path) {
    await runApplication(app);
  } else {
    console.log(`${app.name} cliqué (pas de chemin configuré)`);
  }
}

// Exécute une application via l'API
async function runApplication(app) {
  try {
    const response = await fetch('/run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ appPath: app.path })
    });
    
    if (response.ok) {
      console.log(`✓ ${app.name} lancé avec succès`);
    } else {
      const error = await response.json();
      console.error(`✗ Erreur lors du lancement de ${app.name}:`, error.error);
    }
  } catch (error) {
    console.error(`✗ Erreur lors de l'exécution de ${app.name}:`, error);
  }
}

// Charge la configuration et génère les boutons
async function loadDeck() {
  try {
    const response = await fetch('/config');
    
    if (!response.ok) {
      throw new Error('Impossible de charger la configuration');
    }
    
    const items = await response.json();
    const container = document.getElementById('deckContainer');
    
    // Vider le conteneur
    container.innerHTML = '';
    
    let totalApps = 0;
    
    // Créer et ajouter chaque élément (groupe ou bouton)
    items.forEach(item => {
      if (item.type === 'group') {
        const groupCard = createGroupCard(item);
        container.appendChild(groupCard);
        totalApps += item.apps.length;
      } else {
        // Rétrocompatibilité : si pas de type, c'est une app simple
        const button = createDeckButton(item);
        container.appendChild(button);
        totalApps++;
      }
    });
    
    console.log(`✓ ${items.length} groupes chargés (${totalApps} apps au total)`);
  } catch (error) {
    console.error('✗ Erreur lors du chargement de la configuration:', error);
  }
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
  loadDeck();
  loadOpenWindows();
  
  // Actualiser les fenêtres toutes les 3 secondes
  setInterval(loadOpenWindows, 3000);
  
  // Bouton de rafraîchissement manuel
  const refreshButton = document.getElementById('refreshWindows');
  if (refreshButton) {
    refreshButton.addEventListener('click', loadOpenWindows);
  }
});

// ============================================
// Gestion des fenêtres ouvertes
// ============================================

// Charge et affiche les fenêtres ouvertes
async function loadOpenWindows() {
  try {
    const response = await fetch('/windows/grouped');
    
    if (!response.ok) {
      throw new Error('Impossible de charger les fenêtres ouvertes');
    }
    
    const data = await response.json();
    const windowsList = document.getElementById('windowsList');
    
    if (!windowsList) return;
    
    // Vider la liste
    windowsList.innerHTML = '';
    
    if (data.applications && data.applications.length > 0) {
      data.applications.forEach(app => {
        const windowItem = createWindowItem(app);
        windowsList.appendChild(windowItem);
      });
    } else {
      windowsList.innerHTML = '<div style="padding: 16px; color: rgba(255,255,255,0.4); text-align: center; font-size: 12px;">Aucune fenêtre ouverte</div>';
    }
  } catch (error) {
    console.error('✗ Erreur lors du chargement des fenêtres:', error);
  }
}

// Crée un élément de fenêtre dans la liste
function createWindowItem(app) {
  const item = document.createElement('div');
  item.className = 'window-item';
  
  // Icône (emoji par défaut, peut être remplacé par l'icône du processus)
  const icon = document.createElement('div');
  icon.className = 'window-icon';
  icon.textContent = getProcessIcon(app.processName);
  
  // Info
  const info = document.createElement('div');
  info.className = 'window-info';
  
  const title = document.createElement('div');
  title.className = 'window-title';
  title.textContent = app.windows[0]?.title || app.processName;
  title.title = app.windows[0]?.title || app.processName; // Tooltip
  
  const process = document.createElement('div');
  process.className = 'window-process';
  process.textContent = app.processName;
  
  info.appendChild(title);
  info.appendChild(process);
  
  item.appendChild(icon);
  item.appendChild(info);
  
  // Badge du nombre de fenêtres si > 1
  if (app.windowCount > 1) {
    const badge = document.createElement('div');
    badge.className = 'window-count';
    badge.textContent = app.windowCount;
    item.appendChild(badge);
  }
  
  // Click handler pour activer la fenêtre
  item.addEventListener('click', () => {
    if (app.windows && app.windows.length > 0) {
      focusWindow(app.windows[0].windowHandle);
    }
  });
  
  return item;
}

// Active/focus une fenêtre
async function focusWindow(windowHandle) {
  try {
    const response = await fetch('/windows/focus', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ windowHandle })
    });
    
    if (response.ok) {
      console.log('✓ Fenêtre activée');
    } else {
      console.error('✗ Erreur lors de l\'activation de la fenêtre');
    }
  } catch (error) {
    console.error('✗ Erreur:', error);
  }
}

// Retourne un emoji approprié pour le processus
function getProcessIcon(processName) {
  const icons = {
    'chrome': '🌐',
    'firefox': '🦊',
    'edge': '🌐',
    'msedge': '🌐',
    'brave': '🦁',
    'code': '📝',
    'vscode': '📝',
    'notepad': '📝',
    'notepad++': '📝',
    'explorer': '📁',
    'cmd': '⌨️',
    'powershell': '⚡',
    'terminal': '⌨️',
    'discord': '💬',
    'slack': '💬',
    'teams': '👥',
    'zoom': '📹',
    'spotify': '🎵',
    'vlc': '▶️',
    'excel': '📊',
    'word': '📄',
    'powerpoint': '📊',
    'outlook': '📧',
    'steam': '🎮',
    'epic': '🎮',
    'calculator': '🔢',
    'paint': '🎨',
    'obs64': '🎥',
    'obs': '🎥',
    'photoshop': '🖼️',
    'illustrator': '✏️',
    'gimp': '🖼️'
  };
  
  const lowerName = processName.toLowerCase();
  for (const [key, icon] of Object.entries(icons)) {
    if (lowerName.includes(key)) {
      return icon;
    }
  }
  
  return '📱'; // Icône par défaut
}

// ============================================
// Gestion du Stream Deck (code existant)
// ============================================

