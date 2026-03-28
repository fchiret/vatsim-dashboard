import { useEffect, useRef } from 'react';
import { useAircraft } from '../contexts/AircraftContext';
import { useVatsimData } from '../hooks/useVatsimData';
import { PilotCard } from './PilotCard';

export function PilotList() {
  const { visiblePilots, highlightedPilot, setHighlightedPilot } = useAircraft();
  const { data } = useVatsimData();
  const cardRefsMap = useRef<Map<string, HTMLDivElement>>(new Map());

  // Auto-scroll to highlighted card
  useEffect(() => {
    if (!highlightedPilot) return;
    const el = cardRefsMap.current.get(highlightedPilot);
    if (el) {
      el.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
    }
  }, [highlightedPilot]);

  return (
    <div className="bg-light" style={{ width: '350px', height: '100vh', overflowY: 'auto', flexShrink: 0, fontSize: '13px' }}>
      <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom sticky-top bg-light">
        <h6 className="mb-0">
          Visible Pilots
          <span className="badge bg-primary ms-2">{visiblePilots.length}</span>
        </h6>
      </div>
      <div className="p-2">
        {visiblePilots.length === 0 ? (
          <p className="text-center text-muted py-3 small">
            No pilots visible in the current map view
          </p>
        ) : (
          visiblePilots.map(pilot => (
            <div
              key={pilot.callsign}
              ref={el => {
                if (el) {
                  cardRefsMap.current.set(pilot.callsign, el);
                } else {
                  cardRefsMap.current.delete(pilot.callsign);
                }
              }}
              className={`mb-2 pilot-card${highlightedPilot === pilot.callsign ? ' pilot-card-highlighted' : ''}`}
              style={{ cursor: 'pointer' }}
              role="button"
              tabIndex={0}
              aria-label={`Pilot ${pilot.callsign}`}
              onClick={() => setHighlightedPilot(pilot.callsign)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setHighlightedPilot(pilot.callsign);
                }
              }}
            >
              <PilotCard pilot={pilot} pilotRatings={data?.pilot_ratings} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
