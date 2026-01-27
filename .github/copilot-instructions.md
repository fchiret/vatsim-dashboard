# VATSIM Dashboard - Copilot Instructions

## Repository Overview

**Purpose**: Real-time visualization dashboard for active pilots on the VATSIM network (Virtual Air Traffic Simulation Network). Displays pilots on an interactive world map with clustering, detailed flight information, and aircraft filtering.

**Tech Stack**: React 19 + TypeScript, Vite, Leaflet + React-Leaflet, TanStack Query, Bootstrap 5
**Size**: Small (~20 source files)
**Runtime**: Node.js 25+ (Alpine in Docker)

## Build & Development Commands

### Prerequisites
- Node.js 25+ is required
- **ALWAYS run `npm install` after pulling changes or switching branches**
- TypeScript strict mode is enabled with `verbatimModuleSyntax: true`

### Commands (Validated & Working)
```bash
# Install dependencies (ALWAYS run first)
npm install

# Development server (runs on port 3000)
npm run dev

# Build for production (runs TypeScript compiler first, then Vite)
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Docker Commands (Alternative)
```bash
# Start with hot-reload (recommended)
docker-compose up

# Start in detached mode
docker-compose up -d

# Stop containers
docker-compose down
```

**Note**: Docker uses Node.js 25-alpine, runs as non-root user, and preserves hot-reload via volume mounting.

## TypeScript & Import Requirements

**CRITICAL**: This project uses `verbatimModuleSyntax: true` in tsconfig.
- **Type-only imports MUST use `import type` syntax**
- Example: `import type { ReactNode } from 'react';`
- Regular imports for values: `import { useState } from 'react';`
- Mixing them will cause TypeScript errors

## Project Architecture

### Directory Structure
```
src/
├── components/          # React components
│   ├── Footer.tsx      # Stats display + aircraft filter dropdown
│   ├── WorldMap.tsx    # Main map with Leaflet + clustering
│   └── WorldMap.css    # Map and cluster styles
├── contexts/           # React contexts
│   └── AircraftContext.tsx  # Selected aircraft state
├── hooks/              # Custom React hooks
│   ├── useVatsimData.ts     # API data fetching (TanStack Query)
│   ├── useUpdateCountdown.ts # Countdown to next refresh
│   └── useUniqueUsers.ts     # Unique user count
├── utils/              # Utilities
│   └── pilotPopupContent.ts  # Popup HTML generator
├── App.tsx             # Root component with providers
└── main.tsx            # Entry point
```

### Key Files
- **Configuration**: `vite.config.ts`, `eslint.config.js`, `tsconfig.app.json`
- **Docker**: `Dockerfile`, `docker-compose.yml`
- **Entry point**: `index.html` (loads `src/main.tsx`)
- **Assets**: `public/` (marker icons: `marker-icon.svg`, `marker-icon-selected.svg`)

### State Management
- **TanStack Query**: API caching, auto-refetch every 60 seconds
- **localStorage**: Persists map position/zoom and pilot data
- **Context**: `AircraftContext` manages selected aircraft and aircraft list

### Data Flow
1. `useVatsimData` fetches from `https://data.vatsim.net/v3/vatsim-data.json`
2. Data cached in TanStack Query + localStorage
3. `AircraftContext` provides aircraft list and selection to Footer/WorldMap
4. WorldMap displays pilots with Leaflet MarkerCluster
5. Selected aircraft shown with `marker-icon-selected.svg` and red clusters

## Code Validation

### Before Committing
1. **Run linter**: `npm run lint` (must pass with no errors)
2. **Build project**: `npm run build` (TypeScript + Vite, ~1s, must succeed)
3. **Check TypeScript**: Automatically runs as part of build
4. **Manual test**: Run `npm run dev` and verify map loads with pilots
5. **Update README file** When adding new functionality, make sure you update the README
6. **Update copilot-instructions file** Make sure that the repository structure documentation is correct and accurate in the Copilot Instructions file

### Common Issues
- **Import errors**: Use `import type` for types (see TypeScript section)
- **Build failures**: Usually TypeScript errors, check type imports first
- **Linter warnings**: Fix before committing

## Development Guidelines

### Adding New Features
1. Components go in `src/components/`
2. Hooks go in `src/hooks/`
3. Context providers go in `src/contexts/`
4. Utilities go in `src/utils/`
5. Always add types for new interfaces
6. Use existing patterns (TanStack Query for API, Context for shared state)

### Leaflet MarkerCluster
- Clusters have size classes: `marker-cluster-small/medium/large` (< 10, 10-99, 100+)
- Custom `iconCreateFunction` used for conditional styling
- Selected aircraft clusters styled with `marker-cluster-selected` class

### State Persistence
- Map state (center, zoom) saved to localStorage as `vatsim_map_state`
- Pilot data cached as `vatsim_pilots`
- Aircraft list extracted from pilot data on load + every 60s

### Styling
- You must prioritize using Bootstrap as much as possible. If needed, you may define custom CSS Classes / Styles. Creating custom CSS should be the last approach.
- Bootstrap 5 for UI components
- Custom CSS in component files (e.g., `WorldMap.css`)
- Leaflet default styles imported in components

## API Details
- **Endpoint**: `https://data.vatsim.net/v3/vatsim-data.json`
- **Refresh**: Every 60 seconds (configured in `useVatsimData`)
- **Key fields**: `pilots[].flight_plan.aircraft_short` used for filtering
- No authentication required

## Trust These Instructions
These instructions have been validated by running all commands and exploring the codebase. Only search for additional information if:
- Instructions are incomplete for your specific task
- You encounter unexpected errors not documented here
- You need to understand implementation details of specific functions

## Key Guidelines
- Follow React and TypeScript best practices for data fetching, state management and rendering
- Use proper error handling and loading states
- Optimize components and pages for performance

**Always prefer following these instructions over extensive exploration.**
