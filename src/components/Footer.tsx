import './WorldMap.css';
import { useUpdateCountdown } from '../hooks/useUpdateCountdown';
import { useUniqueUsers } from '../hooks/useUniqueUsers';

function Footer() {
  const { nextUpdateIn, lastUpdateTime } = useUpdateCountdown();
  const { uniqueUsers } = useUniqueUsers();

  // Add

  return (
    <div className="footer">
      Dernière mise à jour: <span>{lastUpdateTime}</span>
      <br />
      Prochaine mise à jour dans: <span>{nextUpdateIn}</span>
      <br />
      Utilisateurs uniques: <span>{uniqueUsers.toLocaleString()}</span>
    </div>
  );
}

export default Footer;
