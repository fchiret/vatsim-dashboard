import { useQuery } from '@tanstack/react-query';

export interface RouteNode {
  ident: string
  type: string
  lat: number
  lon: number
  alt: number
  name: string | null
  via: {
    ident: string
    type: string
  } | null
}

export interface Route {
  nodes: RouteNode[]
}

/**
 * Waypoint enriched with coordinates when available from the decode response.
 * When lat/lon are present, navaid search can be skipped entirely.
 */
export interface WaypointWithCoords {
  ident: string
  lat?: number
  lon?: number
  name?: string | null
  type?: string | null
}

/**
 * Parse the notes field to extract waypoints from the "Requested:" line.
 * Excludes tokens listed under "Unmatched points:" as they are known-invalid
 * waypoints that would cause guaranteed-failing navaid lookups.
 */
export function parseWaypointsFromNotes(notes: string): string[] {
  if (!notes) return [];

  const lines = notes.split('\n');

  // Extract the "Requested:" line
  const requestedLine = lines.find(line => line.startsWith('Requested:'));
  if (!requestedLine) return [];

  // Build a set of known-unmatched tokens to exclude
  const unmatchedLine = lines.find(line => line.startsWith('Unmatched points:'));
  const unmatchedIdents = new Set<string>();
  if (unmatchedLine) {
    const unmatchedPart = unmatchedLine.replace('Unmatched points:', '').trim();
    if (unmatchedPart.length > 0) {
      for (const token of unmatchedPart.split(/\s+/)) {
        const normalized = token.trim();
        if (normalized) {
          unmatchedIdents.add(normalized.toUpperCase());
        }
      }
    }
  }

  // Extract waypoints after "Requested:", excluding known-unmatched tokens
  const route = requestedLine.replace('Requested:', '').trim();
  return route
    .split(/\s+/)
    .filter(wp => wp.length > 0)
    .filter(wp => !unmatchedIdents.has(wp.toUpperCase()));
}

export interface FlightPlan {
  id: number
  fromICAO: string | null
  toICAO: string | null
  fromName: string | null
  toName: string | null
  flightNumber: string | null
  distance: number
  maxAltitude: number
  waypoints: number
  likes: number
  downloads: number
  popularity: number
  notes: string
  encodedPolyline: string
  route?: Route
  createdAt: string
  updatedAt: string
  tags: string[]
  user: {
    id: number
    username?: string
    gravatarHash?: string
    location: string | null
  } | null
  application?: unknown | null
  cycle?: {
    id: number
    ident: string
    year: number
    release: number
  }
}

interface DecodeParams {
  route: string
}

export function useFlightPlanDecode(params: DecodeParams | null) {
  const query = useQuery<FlightPlan>({
    queryKey: ['flightPlanDecode', params?.route],
    queryFn: async () => {
      if (!params?.route) {
        throw new Error('Route parameter is required');
      }

      // Utiliser le proxy Vite local (pas d'auth côté client, géré par le proxy)
      const response = await fetch('/api/flightplan/auto/decode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ route: params.route }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(`Failed to decode route: ${response.status} ${response.statusText}`, {
          cause: error,
        });
      }

      const data = await response.json();
      return data;
    },
    enabled: !!params?.route, // Only run query if route is provided
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 1, // Only retry once on failure
  });

  const parsedWaypoints: WaypointWithCoords[] = (() => {
    if (!query.data) return [];

    const identifiers = parseWaypointsFromNotes(query.data.notes);
    if (identifiers.length === 0) return [];

    // Build a lookup map of ident -> RouteNode from the already-decoded route nodes.
    // These coordinates come for free from the decode response so we can avoid
    // a navaid search request for every waypoint that's already resolved.
    const nodeByIdent = new Map<string, RouteNode>();
    for (const node of query.data.route?.nodes ?? []) {
      nodeByIdent.set(node.ident.toUpperCase(), node);
    }

    return identifiers.map((ident) => {
      const node = nodeByIdent.get(ident.toUpperCase());
      if (node && Number.isFinite(node.lat) && Number.isFinite(node.lon)) {
        return { ident, lat: node.lat, lon: node.lon, name: node.name, type: node.type };
      }
      // Fallback: coordinates unknown — WaypointMarker will trigger navaid search
      return { ident };
    });
  })();

  return { ...query, parsedWaypoints };
}
