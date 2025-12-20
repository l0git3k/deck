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
document.addEventListener('DOMContentLoaded', loadDeck);
