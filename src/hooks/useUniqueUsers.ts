import { useEffect, useState } from 'react';
import { useVatsimData } from './useVatsimData';

export function useUniqueUsers() {
  const [uniqueUsers, setUniqueUsers] = useState<number>(0);
  const { data } = useVatsimData();

  useEffect(() => {
    if (data?.general?.unique_users) {
      setUniqueUsers(data.general.unique_users);
    }
  }, [data?.general?.unique_users]);

  return { uniqueUsers };
}
