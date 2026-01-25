import { useVatsimData } from './useVatsimData';

export function useUniqueUsers() {
  const { data } = useVatsimData();
  const uniqueUsers = data?.general?.unique_users ?? 0;

  return { uniqueUsers };
}
