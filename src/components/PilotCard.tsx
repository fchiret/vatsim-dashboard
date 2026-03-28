import type { Pilot, PilotRating } from '../hooks/useVatsimData';

const NA = 'N/A';

const getPilotRating = (
  ratingId: number | undefined,
  ratings?: PilotRating[]
): PilotRating | undefined => {
  if (ratingId === undefined || !ratings || ratings.length === 0) return undefined;
  return ratings.find(r => r.id === ratingId);
};

export function PilotCard({ pilot, pilotRatings }: { pilot: Pilot; pilotRatings?: PilotRating[] }) {
  const rating = getPilotRating(pilot.pilot_rating, pilotRatings);

  return (
    <div className="card border-0" style={{ minWidth: '300px' }}>
      <div className="card-header bg-primary text-white py-2">
        <h6 className="mb-0">{pilot.callsign}</h6>
      </div>
      <div className="card-body p-2">
        <ul className="list-group list-group-flush small">
          <li className="list-group-item d-flex justify-content-between align-items-center px-2 py-1">
            <span className="text-muted">Pilot</span>
            <strong>{pilot.name}</strong>
          </li>
          <li className="list-group-item d-flex justify-content-between align-items-center px-2 py-1">
            <span className="text-muted">Transponder</span>
            <span className="badge bg-dark">{pilot.transponder || NA}</span>
          </li>
          <li className="list-group-item d-flex justify-content-between align-items-center px-2 py-1">
            <span className="text-muted">Heading</span>
            <span className="badge bg-info">{pilot.heading || NA}°</span>
          </li>
          <li className="list-group-item d-flex justify-content-between align-items-center px-2 py-1">
            <span className="text-muted">Altitude</span>
            <span className="badge bg-success">{pilot.altitude.toLocaleString()} ft</span>
          </li>
          <li className="list-group-item d-flex justify-content-between align-items-center px-2 py-1">
            <span className="text-muted">Speed</span>
            <span className="badge bg-warning text-dark">{pilot.groundspeed} kts</span>
          </li>
          <li className="list-group-item d-flex justify-content-between align-items-center px-2 py-1">
            <span className="text-muted">Position</span>
            <small className="font-monospace">{pilot.latitude.toFixed(4)}, {pilot.longitude.toFixed(4)}</small>
          </li>
          <li className="list-group-item d-flex justify-content-between align-items-center px-2 py-1">
            <span className="text-muted">Rating</span>
            <span className="badge bg-secondary" title={rating?.short_name || NA}>{rating?.long_name || NA}</span>
          </li>
          <li className="list-group-item d-flex justify-content-between align-items-center px-2 py-1">
            <span className="text-muted">Server</span>
            <span className="badge bg-secondary">{pilot.server || NA}</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
