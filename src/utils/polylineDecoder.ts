import polyline from '@mapbox/polyline';
import type { LatLngTuple } from 'leaflet';

export interface DecodedRoute {
  coordinates: LatLngTuple[];
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

/**
 * Decode Google/Mapbox encoded polyline to Leaflet coordinates
 * @param encoded - Encoded polyline string from FlightPlan API
 * @returns Decoded coordinates and bounds
 */
export function decodePolyline(encoded: string): DecodedRoute {
  // Decode polyline to [lat, lng] array
  const decoded = polyline.decode(encoded);
  
  // Calculate bounds
  const lats = decoded.map(([lat]) => lat);
  const lngs = decoded.map(([, lng]) => lng);
  
  return {
    coordinates: decoded as LatLngTuple[],
    bounds: {
      north: Math.max(...lats),
      south: Math.min(...lats),
      east: Math.max(...lngs),
      west: Math.min(...lngs),
    },
  };
}
