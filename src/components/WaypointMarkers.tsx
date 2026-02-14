import { CircleMarker, Popup } from 'react-leaflet';
import { useNavaidSearch } from '../hooks/useNavaidSearch';

interface WaypointMarkerProps {
  waypoint: string;
}

/**
 * Single waypoint marker that fetches navaid data
 */
function WaypointMarker({ waypoint }: WaypointMarkerProps) {
  const { data: navaid, isLoading, error } = useNavaidSearch({ waypoint });

  // Ne rien afficher si on n'a pas de coordonnées ou en cas d'erreur
  if (isLoading || error || !navaid?.lat || !navaid?.lon) {
    return null;
  }

  return (
    <CircleMarker
      center={[navaid.lat, navaid.lon]}
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
            <h6 className="mb-0">{navaid.ident}</h6>
          </div>
          <div className="card-body p-2">
            <ul className="list-group list-group-flush small">
              {navaid.name && (
                <li className="list-group-item d-flex justify-content-between align-items-center px-2 py-1">
                  <span className="text-muted">Name</span>
                  <strong>{navaid.name}</strong>
                </li>
              )}
              {navaid.type && (
                <li className="list-group-item d-flex justify-content-between align-items-center px-2 py-1">
                  <span className="text-muted">Type</span>
                  <span className="badge bg-secondary">{navaid.type}</span>
                </li>
              )}
              <li className="list-group-item d-flex justify-content-between align-items-center px-2 py-1">
                <span className="text-muted">Position</span>
                <small className="font-monospace">
                  {navaid.lat.toFixed(4)}, {navaid.lon.toFixed(4)}
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
  waypoints: string[];
}

/**
 * Component to display all waypoints from a flight route
 */
export function WaypointMarkers({ waypoints }: WaypointMarkersProps) {
  if (!waypoints || waypoints.length === 0) {
    return null;
  }

  return (
    <>
      {waypoints.map((waypoint, index) => (
        <WaypointMarker key={`${waypoint}-${index}`} waypoint={waypoint} />
      ))}
    </>
  );
}
