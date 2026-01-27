import './WorldMap.css';
import { useUpdateCountdown } from '../hooks/useUpdateCountdown';
import { useUniqueUsers } from '../hooks/useUniqueUsers';
import { useAircraft } from '../contexts/AircraftContext';

function Footer() {
  const { nextUpdateIn, lastUpdateTime } = useUpdateCountdown();
  const { uniqueUsers } = useUniqueUsers();
  const { selectedAircraft, setSelectedAircraft, aircraftList } = useAircraft();

  const handleAircraftChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setSelectedAircraft(value === '' ? null : value);
  };

  return (
    <div className="footer-stats position-absolute bottom-0 start-0 m-3 bg-dark bg-opacity-75 text-white rounded shadow" style={{ minWidth: '230px' }}>
      <ul className="list-group list-group-flush small">
        <li className="list-group-item d-flex justify-content-between align-items-center px-3 py-2 bg-transparent text-white border-secondary">
          <span className="text-white-60">Last data update:</span>
          <span className="badge bg-light text-dark fw-bold">{lastUpdateTime}</span>
        </li>
        <li className="list-group-item d-flex justify-content-between align-items-center px-3 py-2 bg-transparent text-white border-secondary">
          <span className="text-white-60">Next data update:</span>
          <span className="badge bg-warning text-dark fw-bold">{nextUpdateIn}</span>
        </li>
        <li className="list-group-item d-flex justify-content-between align-items-center px-3 py-2 bg-transparent text-white border-secondary">
          <span className="text-white-60">Unique users:</span>
          <span className="badge bg-success fw-bold">{uniqueUsers.toLocaleString()}</span>
        </li>
        <li className="list-group-item px-3 py-2 bg-transparent text-white border-secondary">
          <label htmlFor="aircraft-select" className="text-white-60 d-block mb-2">Highlight aircraft model:</label>
          <select
            id="aircraft-select"
            className="form-select form-select-sm bg-dark text-white border-secondary"
            value={selectedAircraft || ''}
            onChange={handleAircraftChange}
          >
            <option value="">All aircraft models</option>
            {aircraftList.map((aircraft) => (
              <option key={aircraft} value={aircraft}>
                {aircraft}
              </option>
            ))}
          </select>
        </li>
      </ul>
    </div>
  );
}

export default Footer;
