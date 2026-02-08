import type { Pilot, PilotRating } from '../hooks/useVatsimData';

const NA = 'N/A';

const getPilotRating = (
  ratingId: number | undefined,
  ratings?: PilotRating[]
): { short_name: string; long_name: string } | null => {
  if (ratingId === undefined || !ratings || ratings.length === 0) return null;
  return ratings.find(r => r.id === ratingId) || null;
};

export const generatePilotPopupContent = (
  pilot: Pilot, 
  pilotRatings?: PilotRating[],
  isRouteVisible?: boolean
): string => {
  const rating = getPilotRating(pilot.pilot_rating, pilotRatings);
  
  return `
    <div class="card border-0" style="min-width: 300px;">
      <div class="card-header bg-primary text-white py-2">
        <h6 class="mb-0">${pilot.callsign}</h6>
      </div>
      <div class="card-body p-2">
        <ul class="list-group list-group-flush small">
          <li class="list-group-item d-flex justify-content-between align-items-center px-2 py-1">
            <span class="text-muted">Pilot</span>
            <strong>${pilot.name}</strong>
          </li>
          <li class="list-group-item d-flex justify-content-between align-items-center px-2 py-1">            <span class="text-muted">Transponder</span>
            <span class="badge bg-dark">${pilot.transponder || NA}</span>
          </li>
          <li class="list-group-item d-flex justify-content-between align-items-center px-2 py-1">            <span class="text-muted">Heading</span>
            <span class="badge bg-info">${pilot.heading || NA}°</span>
          </li>
          <li class="list-group-item d-flex justify-content-between align-items-center px-2 py-1">
            <span class="text-muted">Altitude</span>
            <span class="badge bg-success">${pilot.altitude.toLocaleString()} ft</span>
          </li>
          <li class="list-group-item d-flex justify-content-between align-items-center px-2 py-1">
            <span class="text-muted">Speed</span>
            <span class="badge bg-warning text-dark">${pilot.groundspeed} kts</span>
          </li>
          <li class="list-group-item d-flex justify-content-between align-items-center px-2 py-1">
            <span class="text-muted">Position</span>
            <small class="font-monospace">${pilot.latitude.toFixed(4)}, ${pilot.longitude.toFixed(4)}</small>
          </li>
          <li class="list-group-item d-flex justify-content-between align-items-center px-2 py-1">
            <span class="text-muted">Rating</span>
            <span class="badge bg-secondary" title="${rating?.short_name || NA}">${rating?.long_name || NA}</span>
          </li>
          <li class="list-group-item d-flex justify-content-between align-items-center px-2 py-1">
            <span class="text-muted">Server</span>
            <span class="badge bg-secondary">${pilot.server || NA}</span>
          </li>
        </ul>
        ${
          pilot.flight_plan
            ? `
          <div class="mt-2">
            <h6 class="border-bottom pb-1 mb-2 text-primary">Flight Plan</h6>
            <ul class="list-group list-group-flush small">
              <li class="list-group-item d-flex justify-content-between align-items-center px-2 py-1">
                <span class="text-muted">Aircraft</span>
                <strong>${pilot.flight_plan.aircraft || NA}</strong>
              </li>
              <li class="list-group-item d-flex justify-content-between align-items-center px-2 py-1">
                <span class="text-muted">Route</span>
                <strong>${pilot.flight_plan.departure || NA} → ${pilot.flight_plan.arrival || NA}</strong>
              </li>
              ${pilot.flight_plan.route ? `
              <li class="list-group-item px-2 py-1">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <span class="text-muted">Route</span>
                  <div class="form-check form-switch">
                    <input 
                      class="form-check-input toggle-route-btn" 
                      type="checkbox" 
                      role="switch"
                      data-callsign="${pilot.callsign}"
                      data-route="${(pilot.flight_plan.departure + ' ' + pilot.flight_plan.route + ' ' + pilot.flight_plan.arrival).replace(/"/g, '&quot;')}"
                      id="route-toggle-${pilot.callsign}"
                      ${isRouteVisible ? 'checked' : ''}
                    >
                    <label class="form-check-label small" for="route-toggle-${pilot.callsign}">
                      Show on map
                    </label>
                  </div>
                </div>
                <small class="font-monospace text-break">${pilot.flight_plan.route}</small>
              </li>
              ` : ''}
              ${pilot.flight_plan.remarks ? `
              <li class="list-group-item px-2 py-1">
                <div class="text-muted mb-1">Remarks</div>
                <small class="text-break">${pilot.flight_plan.remarks}</small>
              </li>
              ` : ''}
            </ul>
          </div>
        `
            : ''
        }
      </div>
    </div>
  `;
};
