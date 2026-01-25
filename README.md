# VATSIM Dashboard 🌍✈️

Application de visualisation en temps réel des pilotes actifs sur le réseau VATSIM (Virtual Air Traffic Simulation Network).

## 🚀 Fonctionnalités

- 🗺️ Carte interactive mondiale avec markers des pilotes
- ✈️ Clustering intelligent des markers pour les performances
- 📊 Informations détaillées sur chaque vol (plan de vol, altitude, vitesse, etc.)
- ⏱️ Compte à rebours avant la prochaine mise à jour
- 👥 Statistiques des utilisateurs uniques connectés
- 💾 Sauvegarde automatique de la position et du zoom de la carte

## 🛠️ Technologies

- **React 19** + **TypeScript**
- **Vite** - Build tool ultra-rapide
- **Leaflet** + **React-Leaflet** - Cartographie interactive
- **TanStack Query** - Gestion du cache et des requêtes API
- **VATSIM API** - Données en temps réel du réseau VATSIM

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

```bash
# Installer les dépendances
npm install

# Lancer en mode développement
npm run dev

# Build de production
npm run build

# Preview du build de production
npm run preview
```

## 🐳 Docker

Le projet inclut une configuration Docker optimisée :

- **Dockerfile** : Image multi-stage pour le développement
- **docker-compose.yml** : Orchestration simple avec hot-reload
- **Non-root user** : Sécurité renforcée
- **Volumes** : Hot-reload préservé

## 🔧 Scripts disponibles

- \`npm run dev\` - Démarre le serveur de développement
- \`npm run build\` - Compile le projet pour la production
- \`npm run preview\` - Preview du build de production
- \`npm run lint\` - Vérifie le code avec ESLint

## 📁 Structure du projet

```
vatsim-dashboard/
├── src/
│   ├── components/      # Composants React
│   │   ├── Footer.tsx
│   │   ├── WorldMap.tsx
│   │   └── WorldMap.css
│   ├── hooks/           # Custom React hooks
│   │   ├── useVatsimData.ts
│   │   ├── useUpdateCountdown.ts
│   │   └── useUniqueUsers.ts
│   ├── App.tsx
│   └── main.tsx
├── public/              # Assets statiques
├── Dockerfile
├── docker-compose.yml
└── package.json
```

## 🌐 API

L'application utilise l'API publique VATSIM :
- Endpoint : \`https://data.vatsim.net/v3/vatsim-data.json\`
- Refresh : Toutes les 60 secondes
- Aucune authentification requise

## 📝 License

MIT

## 👨‍💻 Développement

Le projet utilise :
- **ESLint** pour la qualité du code
- **TypeScript** strict mode
- **React Hooks** optimisés (useCallback, useMemo)
- **TanStack Query** pour le cache intelligent