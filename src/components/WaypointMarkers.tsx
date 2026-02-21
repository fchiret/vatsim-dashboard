import { CircleMarker, Popup } from 'react-leaflet';
import { useNavaidSearch } from '../hooks/useNavaidSearch';
import type { WaypointWithCoords } from '../hooks/useFlightPlanDecode';

interface WaypointMarkerProps {
  waypoint: WaypointWithCoords;
}

/**
 * Renders a CircleMarker for a single waypoint.
 * Uses pre-loaded coordinates when available (from the decode response) to
 * avoid an extra navaid search request. Falls back to useNavaidSearch only
 * when the decode step didn't supply lat/lon for this ident.
 */
function WaypointMarker({ waypoint }: WaypointMarkerProps) {
  const hasPreloadedCoords =
    Number.isFinite(waypoint.lat) && Number.isFinite(waypoint.lon);

  // Only trigger a navaid search when coordinates weren't already provided.
  const { data: navaid, isLoading, error } = useNavaidSearch(
    hasPreloadedCoords ? null : { waypoint: waypoint.ident }
  );

  // Resolve the coordinate source: preloaded coords take priority.
  const resolved = hasPreloadedCoords
    ? { ident: waypoint.ident, lat: waypoint.lat as number, lon: waypoint.lon as number, name: waypoint.name, type: waypoint.type }
    : navaid;

  const hasValidCoordinates =
    resolved != null && Number.isFinite(resolved.lat) && Number.isFinite(resolved.lon);

  if ((!hasPreloadedCoords && (isLoading || error)) || !hasValidCoordinates) {
    return null;
  }

  return (
    <CircleMarker
      center={[resolved!.lat, resolved!.lon]}
      radius={6}
      pathOptions={{
        color: '#ab0000',
        fillColor: '#bb5555',
        fillOpacity: 0.8,
        weight: 2,
      }}
    >
      <Popup>
        <div className="card border-0" style={{ minWidth: '250px' }}>
          <div className="card-header bg-danger text-white py-2">
            <h6 className="mb-0">{resolved!.ident}</h6>
          </div>
          <div className="card-body p-2">
            <ul className="list-group list-group-flush small">
              {resolved!.name && (
                <li className="list-group-item d-flex justify-content-between align-items-center px-2 py-1">
                  <span className="text-muted">Name</span>
                  <strong>{resolved!.name}</strong>
                </li>
              )}
              {resolved!.type && (
                <li className="list-group-item d-flex justify-content-between align-items-center px-2 py-1">
                  <span className="text-muted">Type</span>
                  <span className="badge bg-secondary">{resolved!.type}</span>
                </li>
              )}
              <li className="list-group-item d-flex justify-content-between align-items-center px-2 py-1">
                <span className="text-muted">Position</span>
                <small className="font-monospace">
                  {resolved!.lat.toFixed(4)}, {resolved!.lon.toFixed(4)}
                </small>
              </li>
            </ul>
          </div>
        </div>
      </Popup>
    </CircleMarker>
  );
}

interface WaypointMarkersProps {
  waypoints: WaypointWithCoords[];
}

/**
 * Renders all waypoint markers for a flight route.
 * Waypoints with pre-loaded coordinates (from the decode response) are
 * rendered immediately without any extra HTTP requests.
 */
export function WaypointMarkers({ waypoints }: WaypointMarkersProps) {
  if (!waypoints || waypoints.length === 0) {
    return null;
  }

  return (
    <>
      {waypoints.map((waypoint, index) => (
        <WaypointMarker key={`${waypoint.ident}-${index}`} waypoint={waypoint} />
      ))}
    </>
  );
}
