# VATSIM Dashboard 🌍✈️

Application de visualisation en temps réel des pilotes actifs sur le réseau VATSIM (Virtual Air Traffic Simulation Network).

## 🚀 Fonctionnalités

- 🗺️ Carte interactive mondiale avec markers des pilotes
- ✈️ Clustering intelligent des markers pour les performances
- 📊 Informations détaillées sur chaque vol (plan de vol, altitude, vitesse, etc.)
- 🛣️ Affichage des routes de vol décodées sur la carte
- 📍 Visualisation des waypoints (points de navigation) sur les routes
- ⏱️ Compte à rebours avant la prochaine mise à jour
- 👥 Statistiques des utilisateurs uniques connectés
- 💾 Sauvegarde automatique de la position et du zoom de la carte

## 🛠️ Technologies

- **React 19** + **TypeScript**
- **Vite** - Build tool ultra-rapide
- **Leaflet** + **React-Leaflet** - Cartographie interactive
- **TanStack Query** - Gestion du cache et des requêtes API
- **VATSIM API** - Données en temps réel du réseau VATSIM
- **FlightPlan Database API** - Décodage des routes de vol

## 📦 Installation

### Avec Docker (recommandé)

```bash
# Lancer l'application
docker-compose up

# Ou en mode détaché
docker-compose up -d
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

### Installation locale

**Prérequis** : Node.js 25+

```bash
# Installer les dépendances
npm install

# Créer le fichier de configuration des variables d'environnement
cp .env.example .env.local

# Éditer .env.local et ajouter votre clé API FlightPlan Database
# VITE_FLIGHTPLAN_DB_API_KEY=your_api_key_here

# Lancer en mode développement
npm run dev

# Build de production
npm run build

# Preview du build de production
npm run preview
```

### Variables d'environnement

L'application nécessite une clé API pour FlightPlan Database :

- `VITE_FLIGHTPLAN_DB_API_KEY` : Clé API pour l'accès à FlightPlan Database (pour le décodage des routes)

Obtenez une clé API gratuite sur [FlightPlan Database](https://flightplandatabase.com/).

## 🐳 Docker

Le projet inclut une configuration Docker optimisée :

- **Dockerfile** : Image multi-stage pour le développement
- **docker-compose.yml** : Orchestration simple avec hot-reload
- **Non-root user** : Sécurité renforcée
- **Volumes** : Hot-reload préservé

## 🔧 Scripts disponibles

- `npm run dev` - Démarre le serveur de développement
- `npm run build` - Compile le projet pour la production
- `npm run preview` - Preview du build de production
- `npm run lint` - Vérifie le code avec ESLint
- `npm test` - Lance les tests en mode watch
- `npm run test:ui` - Interface web pour les tests
- `npm run test:run` - Exécute les tests une fois
- `npm run test:coverage` - Génère le rapport de couverture

## 🧪 Tests

Le projet utilise **Vitest** avec **React Testing Library** pour garantir la qualité du code.

### Configuration

- **Framework** : Vitest 4.x avec React Testing Library
- **Environnement** : jsdom pour simuler le DOM
- **Couverture** : v8 coverage provider (objectif : 80%+)
- **CI/CD** : Hooks Git pré-commit pour validation automatique

### Lancer les tests

```bash
# Mode watch (recommandé en développement)
npm test

# Interface web interactive
npm run test:ui

# Exécution unique (CI/CD)
npm run test:run

# Rapport de couverture détaillé
npm run test:coverage
```

### Structure des tests

Les tests sont co-localisés avec le code source pour faciliter la maintenance :

```
src/
├── components/
│   ├── Footer.tsx
│   └── Footer.test.tsx              # Tests du composant
├── contexts/
│   ├── AircraftContext.tsx
│   └── AircraftContext.test.tsx     # Tests du contexte
├── hooks/
│   ├── useVatsimData.ts
│   ├── useFlightPlanDecode.ts       # Décodage des routes de vol
│   ├── useFlightPlanDecode.test.ts  # Tests du décodage
│   ├── useUpdateCountdown.test.tsx  # Tests du hook
│   └── useUniqueUsers.test.tsx
├── utils/
│   ├── pilotPopupContent.ts
│   ├── pilotPopupContent.test.ts    # Tests de la fonction
│   ├── polylineDecoder.ts           # Décodeur de polyline
│   └── polylineDecoder.test.ts      # Tests du décodeur
└── test-setup.ts                     # Configuration globale Vitest
```

## 📁 Structure du projet

```
vatsim-dashboard/
├── src/
│   ├── components/           # Composants React
│   │   ├── Footer.tsx
│   │   ├── Footer.test.tsx
│   │   ├── FlightRoute.tsx   # Affichage des routes
│   │   ├── FlightRoute.test.tsx
│   │   ├── WaypointMarkers.tsx  # Affichage des waypoints
│   │   ├── WaypointMarkers.test.tsx
│   │   ├── WorldMap.tsx
│   │   └── WorldMap.css
│   ├── contexts/             # React contexts
│   │   ├── AircraftContext.tsx
│   │   └── AircraftContext.test.tsx
│   ├── hooks/                # Custom React hooks
│   │   ├── useVatsimData.ts
│   │   ├── useFlightPlanDecode.ts  # Décodage routes de vol
│   │   ├── useFlightPlanDecode.test.ts
│   │   ├── useNavaidSearch.ts  # Recherche de navaids
│   │   ├── useNavaidSearch.test.tsx
│   │   ├── useUpdateCountdown.ts
│   │   ├── useUpdateCountdown.test.tsx
│   │   ├── useUniqueUsers.ts
│   │   └── useUniqueUsers.test.tsx
│   ├── utils/                # Fonctions utilitaires
│   │   ├── pilotPopupContent.ts
│   │   ├── pilotPopupContent.test.ts
│   │   ├── polylineDecoder.ts      # Décodeur de polyline
│   │   └── polylineDecoder.test.ts
│   ├── test-setup.ts         # Configuration globale Vitest
│   ├── App.tsx
│   └── main.tsx
├── public/                   # Assets statiques
├── .husky/                   # Git hooks (pre-commit, commit-msg)
├── .env.example              # Exemple de configuration
├── .env.local                # Configuration locale (non commité)
├── vitest.config.ts          # Configuration Vitest
├── vite.config.ts            # Configuration Vite + proxy API
├── Dockerfile
├── docker-compose.yml
└── package.json
```

## 🌐 API

L'application utilise deux APIs :

### VATSIM API (données en temps réel)
- Endpoint : `https://data.vatsim.net/v3/vatsim-data.json`
- Refresh : Toutes les 60 secondes
- Aucune authentification requise

### FlightPlan Database API (décodage des routes et navaids)
- **Décodage de routes** :
  - Endpoint : `https://api.flightplandatabase.com/auto/decode`
  - Méthode : POST
  - Cache : 5 minutes par route
  - Utilisé pour décoder les routes de vol et afficher les trajectoires sur la carte

- **Recherche de navaids** :
  - Endpoint : `https://api.flightplandatabase.com/search/nav?q={waypoint}`
  - Méthode : GET
  - Cache : 24 heures par waypoint
  - Utilisé pour récupérer les coordonnées des waypoints et les afficher sur la carte

- Authentification : Basic Auth (via proxy Vite)
- Documentation : [FlightPlan Database API](https://flightplandatabase.com/dev/api)

## 📝 License

MIT

## 👨‍💻 Développement

Le projet utilise :
- **ESLint** pour la qualité du code
- **TypeScript** strict mode
- **React Hooks** optimisés (useCallback, useMemo)
- **TanStack Query** pour le cache intelligent