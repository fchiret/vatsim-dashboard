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
  createdAt: string
  updatedAt: string
  tags: string[]
  user: {
    id: number
    username: string
    gravatarHash: string
    location: string | null
  } | null
  route: Route
}

interface DecodeParams {
  route: string
}

export function useFlightPlanDecode(params: DecodeParams | null) {
  return useQuery<FlightPlan>({
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
}
