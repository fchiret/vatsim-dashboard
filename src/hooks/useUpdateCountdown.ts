import { useEffect, useState, useRef, useCallback } from 'react';
import { useVatsimData } from './useVatsimData';

const REFRESH_INTERVAL = 1 * 60 * 1000; // 1 minute in milliseconds

export function useUpdateCountdown() {
  const [nextUpdateIn, setNextUpdateIn] = useState<string>('--:--');
  const [lastUpdateTime, setLastUpdateTime] = useState<string>('');
  const lastSecondRef = useRef<number>(-1);
  const fetchTimeRef = useRef<number>(Date.now());
  const { data } = useVatsimData();

  const updateCountdown = useCallback((fetchTime: number, updateTimestamp?: string) => {
    if (!updateTimestamp) return;

    try {
      const now = Date.now();
      const timeSinceLastUpdate = now - fetchTime;
      const timeUntilNextUpdate = Math.max(0, REFRESH_INTERVAL - timeSinceLastUpdate);

      // Only update if the second has changed
      const currentSecond = Math.floor(timeUntilNextUpdate / 1000);
      if (currentSecond === lastSecondRef.current) return;

      lastSecondRef.current = currentSecond;

      // Convert to MM:SS format
      const minutes = Math.floor(timeUntilNextUpdate / 60000);
      const seconds = Math.floor((timeUntilNextUpdate % 60000) / 1000);
      const timeString = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

      setNextUpdateIn(timeString);
      setLastUpdateTime(new Date(updateTimestamp).toLocaleTimeString());
    } catch (error) {
      console.error('Error calculating countdown:', error);
    }
  }, []);

  // Update when data from API changes - record fetch time
  useEffect(() => {
    if (data?.general?.update_timestamp) {
      lastSecondRef.current = -1; // Reset to force update
      fetchTimeRef.current = Date.now(); // Mark exact moment data arrived
      updateCountdown(fetchTimeRef.current, data.general.update_timestamp);
    }
  }, [data?.general?.update_timestamp]);

  // Update countdown every second
  useEffect(() => {
    const interval = setInterval(() => {
      updateCountdown(fetchTimeRef.current, data?.general?.update_timestamp);
    }, 1000);

    return () => clearInterval(interval);
  }, [data?.general?.update_timestamp, updateCountdown]);

  return { nextUpdateIn, lastUpdateTime };
}
