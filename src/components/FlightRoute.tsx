import { Polyline, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import { decodePolyline } from '../utils/polylineDecoder';
import type { FlightPlan } from '../hooks/useFlightPlanDecode';

interface FlightRouteProps {
  flightPlan: FlightPlan;
  color?: string;
  fitBounds?: boolean;
}

/**
 * Component to display a decoded flight route on the map
 */
export function FlightRoute({ 
  flightPlan, 
  color = '#3388ff',
  fitBounds = true 
}: FlightRouteProps) {
  const map = useMap();
  
  const { coordinates, bounds } = decodePolyline(flightPlan.encodedPolyline);

  useEffect(() => {
    if (fitBounds && coordinates.length > 0) {
      // Fit map to route bounds with padding
      map.fitBounds([
        [bounds.south, bounds.west],
        [bounds.north, bounds.east],
      ], { padding: [50, 50] });
    }
  }, [map, fitBounds, bounds, coordinates.length]);

  if (coordinates.length === 0) {
    return null;
  }

  return (
    <Polyline
      positions={coordinates}
      pathOptions={{
        color,
        weight: 3,
        opacity: 0.7,
        dashArray: '10, 5',
      }}
    />
  );
}
