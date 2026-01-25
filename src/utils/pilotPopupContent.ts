interface FlightPlan {
  aircraft?: string;
  departure?: string;
  arrival?: string;
  route?: string;
  remarks?: string;
}

interface Pilot {
  cid: number;
  name: string;
  callsign: string;
  latitude: number;
  longitude: number;
  altitude: number;
  groundspeed: number;
  heading?: number;
  flight_plan?: FlightPlan;
}

export const generatePilotPopupContent = (pilot: Pilot): string => {
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
          <li class="list-group-item d-flex justify-content-between align-items-center px-2 py-1">
            <span class="text-muted">Heading</span>
            <span class="badge bg-info">${pilot.heading || 'N/A'}°</span>
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
        </ul>
        ${
          pilot.flight_plan
            ? `
          <div class="mt-2">
            <h6 class="border-bottom pb-1 mb-2 text-primary">Flight Plan</h6>
            <ul class="list-group list-group-flush small">
              <li class="list-group-item d-flex justify-content-between align-items-center px-2 py-1">
                <span class="text-muted">Aircraft</span>
                <strong>${pilot.flight_plan.aircraft || 'N/A'}</strong>
              </li>
              <li class="list-group-item d-flex justify-content-between align-items-center px-2 py-1">
                <span class="text-muted">Route</span>
                <strong>${pilot.flight_plan.departure || 'N/A'} → ${pilot.flight_plan.arrival || 'N/A'}</strong>
              </li>
              ${pilot.flight_plan.route ? `
              <li class="list-group-item px-2 py-1">
                <div class="text-muted mb-1">Route</div>
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
