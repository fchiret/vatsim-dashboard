import './WorldMap.css';
import { useUpdateCountdown } from '../hooks/useUpdateCountdown';
import { useUniqueUsers } from '../hooks/useUniqueUsers';

function Footer() {
  const { nextUpdateIn, lastUpdateTime } = useUpdateCountdown();
  const { uniqueUsers } = useUniqueUsers();

  return (
    <div className="footer-stats position-absolute bottom-0 start-0 m-3 bg-dark bg-opacity-75 text-white rounded p-3 shadow">
      <div className="d-flex flex-column gap-2 small">
        <div className="d-flex justify-content-between align-items-center">
          <span className="text-white">Last data update:</span>
          <span className="badge rounded-pill bg-light text-dark fw-bold">{lastUpdateTime}</span>
        </div>
        <div className="d-flex justify-content-between align-items-center">
          <span className="text-white">Next data update:</span>
          <span className="badge rounded-pill bg-warning text-dark fw-bold">{nextUpdateIn}</span>
        </div>
        <div className="d-flex justify-content-between align-items-center">
          <span className="text-white">Unique users:</span>
          <span className="badge rounded-pill bg-success text-light fw-bold">{uniqueUsers.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

export default Footer;
