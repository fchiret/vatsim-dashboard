# VATSIM Dashboard - Copilot Instructions

## Repository Overview

**Purpose**: Real-time visualization dashboard for active pilots on the VATSIM network (Virtual Air Traffic Simulation Network). Displays pilots on an interactive world map with clustering, detailed flight information, and aircraft filtering.

**Tech Stack**: React 19 + TypeScript, Vite, Leaflet + React-Leaflet, TanStack Query, Bootstrap 5
**Size**: Small (~20 source files)
**Runtime**: Node.js 25+ (Alpine in Docker)
**Testing**: Vitest 4.x + React Testing Library (80%+ coverage target)

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

# Run tests in watch mode (recommended for development)
npm test

# Run tests with UI interface
npm run test:ui

# Run tests once (for CI/CD)
npm run test:run

# Generate coverage report
npm run test:coverage
```

### Docker Commands (Alternative)
```bash
# Start with hot-reload (recommended)
docker compose up

# Start in detached mode
docker compose up -d

# Stop containers
docker compose down
```

**Note**: Docker uses Node.js 25-alpine, runs as non-root user, and preserves hot-reload via volume mounting. The application runs on port 3000.

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
│   ├── Footer.test.tsx # Footer component tests
│   ├── FlightRoute.tsx # Flight route display on map
│   ├── FlightRoute.test.tsx # Flight route tests
│   ├── WaypointMarkers.tsx # Waypoint markers on map
│   ├── WaypointMarkers.test.tsx # Waypoint markers tests
│   ├── WorldMap.tsx    # Main map with Leaflet + clustering
│   └── WorldMap.css    # Map and cluster styles
├── contexts/           # React contexts
│   ├── AircraftContext.tsx      # Selected aircraft state + visible routes
│   └── AircraftContext.test.tsx # Context tests
├── hooks/              # Custom React hooks
│   ├── useVatsimData.ts         # API data fetching (TanStack Query)
│   ├── useFlightPlanDecode.ts   # FlightPlan API route decoding
│   ├── useFlightPlanDecode.test.ts # Route decode tests
│   ├── useNavaidSearch.ts       # Navaid search API
│   ├── useNavaidSearch.test.tsx # Navaid search tests
│   ├── useUpdateCountdown.ts    # Countdown to next refresh
│   ├── useUpdateCountdown.test.tsx # Countdown hook tests
│   ├── useUniqueUsers.ts        # Unique user count
│   └── useUniqueUsers.test.tsx  # Unique users hook tests
├── utils/              # Utilities
│   ├── pilotPopupContent.ts     # Popup HTML generator
│   ├── pilotPopupContent.test.ts # Popup content tests
│   ├── polylineDecoder.ts       # Polyline decoder for routes
│   └── polylineDecoder.test.ts  # Decoder tests
├── assets/             # Static assets
├── test-setup.ts       # Global Vitest configuration
├── App.tsx             # Root component with providers
├── App.css             # App styles
├── main.tsx            # Entry point
└── index.css           # Global styles
```

### Key Files
- **Configuration**: `vite.config.ts`, `vitest.config.ts`, `eslint.config.js`, `tsconfig.app.json`
- **Environment**: `.env.example`, `.env.local` (not committed - contains API keys)
- **Docker**: `Dockerfile`, `docker-compose.yml`
- **Entry point**: `index.html` (loads `src/main.tsx`)
- **Assets**: `public/` (marker icons: `marker-icon.svg`, `marker-icon-selected.svg`)
- **Tests**: `test-setup.ts` (global Vitest configuration)
- **Git Hooks**: `.husky/` (pre-commit validation with linting and tests)

### State Management
- **TanStack Query**: API caching, auto-refetch every 60 seconds
- **localStorage**: Persists map position/zoom and pilot data
- **Context**: `AircraftContext` manages selected aircraft, aircraft list, and visible routes

### Data Flow
1. `useVatsimData` fetches from `https://data.vatsim.net/v3/vatsim-data.json`
2. Data cached in TanStack Query + localStorage
3. `AircraftContext` provides aircraft list and selection to Footer/WorldMap
4. WorldMap displays pilots with Leaflet MarkerCluster
5. Selected aircraft shown with `marker-icon-selected.svg` and red clusters
6. Flight routes decoded via `useFlightPlanDecode` and displayed with `FlightRoute` component
7. Waypoints from decoded routes displayed via `WaypointMarkers` component
8. Missing waypoint coordinates fetched via `useNavaidSearch` from FlightPlan Database API

## Code Validation

### Testing
**Framework**: Vitest 4.x with React Testing Library
- **Environment**: jsdom for DOM simulation
- **Coverage**: v8 coverage provider (target: 80%+)
- **Location**: Tests are co-located with source files (e.g., `Footer.test.tsx` next to `Footer.tsx`)

**Run tests**:
- Watch mode: `npm test` (recommended for development)
- Interactive UI: `npm run test:ui`
- Single run: `npm run test:run` (CI/CD)
- Coverage report: `npm run test:coverage`

**Best Practices & Security**:

**General Testing Principles**:
- **Avoid Duplicates**: Eliminate code repetition by using test utilities and factories (see `test-utils.tsx` and `test-factories.ts`)
- **File Naming**: Use `.test.tsx` for files with JSX, `.test.ts` otherwise (required for TypeScript `verbatimModuleSyntax`)
- **Descriptive Names**: Write clear, descriptive test names that explain what is being tested (e.g., `'should generate popup with pilot basic info'`)
- **Arrange-Act-Assert**: Structure tests with clear setup, execution, and assertion phases
- **One Assertion Per Test**: Focus each test on a single behavior or outcome when possible

**Queries & Accessibility** (React Testing Library):
- **Query Priority**: Follow Testing Library's query priority order:
  1. `getByRole` - Queries that reflect accessibility tree (most preferred)
  2. `getByLabelText` - Best for form fields
  3. `getByPlaceholderText` - Use only if no label exists
  4. `getByText` - For non-interactive elements
  5. `getByDisplayValue` - For form elements with values
  6. `getByTestId` - Last resort when semantic queries aren't possible
- **Avoid Implementation Details**: Don't query by class names or element IDs - test how users interact with your UI
- **Use `screen`**: Import from `@testing-library/react` and use `screen.getByRole()` instead of destructuring from `render()`

**Environment & Mocking**:
- **Global Mocking**: Use `globalThis` instead of `global` for browser APIs (e.g., `globalThis.fetch = vi.fn()`)
- **Reset Mocks**: Always clear/reset mocks in `afterEach` to prevent test pollution
- **Mock External Dependencies**: Use `vi.mock()` for module mocks, `vi.fn()` for function mocks
- **Avoid Real API Calls**: Never make actual HTTP requests in tests - use mocks or MSW (Mock Service Worker)

**Type Safety & Data**:
- **Type Everything**: Always type mock data, function returns, and test parameters
- **Use Factories**: Create reusable mock data factories for consistent test data (see `test-factories.ts`)
- **Partial Mocks**: Use TypeScript's `Partial<T>` for flexible mock objects with required fields

**Security**:
- **No Hardcoded Credentials**: Never hardcode API keys, tokens, or passwords in tests
- **Environment Variables**: Use `import.meta.env` for sensitive configuration
- **Sanitize Test Data**: Prevent injection attacks by sanitizing user input in test data
- **Mock Authentication**: Always mock authentication/authorization flows

**Test Isolation & Lifecycle**:
- **Independent Tests**: Each test must run independently - no shared state between tests
- **Setup/Teardown**: Use `beforeEach`/`afterEach` for test setup and cleanup
- **Cleanup Hooks**: Use `onTestFinished` for resource cleanup (databases, timers, event listeners)
- **Avoid `beforeAll`**: Prefer `beforeEach` unless the setup is expensive and truly immutable

**Async Testing**:
- **Use `async`/`await`**: Prefer `async`/`await` over callbacks or promises `.then()`
- **`waitFor` with Timeouts**: Always specify appropriate timeouts for `waitFor` (default: 1000ms)
- **`findBy` Queries**: Use `findBy*` queries for elements that appear asynchronously (combines `getBy` + `waitFor`)
- **Avoid `act()` Warnings**: React Testing Library handles `act()` automatically - if you see warnings, review your test structure

**Test Organization**:
- **Group with `describe`**: Use `describe` blocks to group related tests logically
- **Test Edge Cases**: Test happy path, error cases, empty states, and boundary conditions
- **Skip/Only Sparingly**: Use `test.skip` and `test.only` temporarily for debugging, but don't commit them
- **Use `test.todo`**: Stub unimplemented tests with `test.todo('description')` to track missing coverage

**Coverage & Performance**:
- **80%+ Coverage Target**: Aim for high coverage, but prioritize critical paths over 100% coverage
- **Test User Journeys**: Focus on real user workflows, not code coverage metrics
- **Concurrent Tests**: Use `test.concurrent` for independent tests that can run in parallel (with caution)
- **Avoid Brittle Tests**: Don't test implementation details - test behavior and outcomes

### Before Committing
1. **Run tests**: `npm test:run` (all tests must pass)
2. **Run linter**: `npm run lint` (must pass with no errors)
3. **Build project**: `npm run build` (TypeScript + Vite, ~1s, must succeed)
4. **Manual test**: Run `npm run dev` and verify map loads with pilots
5. **Update README file**: When adding new functionality, make sure you update the README
6. **Update copilot-instructions file**: Make sure that the repository structure documentation is correct and accurate in the Copilot Instructions file

**Note**: Git hooks (`.husky/`) automatically run linting and tests on pre-commit.

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
- **Bootstrap 5** is the primary UI framework - always use it first for styling
- Custom CSS classes/styles only when Bootstrap is insufficient
- Component-specific styles in dedicated files (e.g., `WorldMap.css`)
- Leaflet default styles imported in components

## API Details
- **VATSIM API**
  - Endpoint: `https://data.vatsim.net/v3/vatsim-data.json`
  - Refresh: Every 60 seconds (configured in `useVatsimData`)
  - Key fields: `pilots[].flight_plan.aircraft_short` used for filtering
  - No authentication required

- **FlightPlan Database API**
  - **Route Decode Endpoint**: `/api/flightplan/auto/decode` (proxied via Vite to `https://api.flightplandatabase.com`)
    - Method: POST with `{ route: string }` body
    - Authentication: Basic Auth (handled by Vite proxy using `VITE_FLIGHTPLAN_DB_API_KEY`)
    - Cache: 5 minutes per route (TanStack Query)
    - Used for decoding flight routes to display on map
  
  - **Navaid Search Endpoint**: `/api/flightplan/search/nav?q={waypoint}` (proxied via Vite to `https://api.flightplandatabase.com`)
    - Method: GET
    - Authentication: Basic Auth (handled by Vite proxy using `VITE_FLIGHTPLAN_DB_API_KEY`)
    - Cache: 24 hours per waypoint (TanStack Query)
    - Used for fetching waypoint coordinates (lat, lon) when not in decoded route
    - Returns array of navaids, first result is used

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
