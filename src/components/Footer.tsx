import './WorldMap.css';
import { useUpdateCountdown } from '../hooks/useUpdateCountdown';
import { useUniqueUsers } from '../hooks/useUniqueUsers';

function Footer() {
  const { nextUpdateIn, lastUpdateTime } = useUpdateCountdown();
  const { uniqueUsers } = useUniqueUsers();

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
      </ul>
    </div>
  );
}

export default Footer;
