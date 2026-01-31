import { useQuery } from '@tanstack/react-query';

export interface Pilot {
  cid: number
  name: string
  callsign: string
  server: string
  latitude: number
  longitude: number
  altitude: number
  groundspeed: number
  transponder: string
  heading: number
  pilot_rating: number
  flight_plan?: {
    flight_rules: string
    aircraft: string
    aircraft_short: string
    departure: string
    arrival: string
    alternate: string
    cruise_tas: string
    altitude: string
    deptime: string
    enroute_time: string
    fuel_time: string
    remarks: string
    route: string
  }
}

export interface PilotRating {
  id: number
  short_name: string
  long_name: string
}

interface VatsimData {
  pilots: Pilot[]
  pilot_ratings: PilotRating[]
  controllers: Array<{
    cid: number
    name: string
    callsign: string
    frequency: string
    facility: number
    rating: number
    server: string
  }>
  atis: Array<{
    cid: number
    name: string
    callsign: string
    frequency: string
    facility: number
    rating: number
    server: string
  }>
  servers: Array<{
    ident: string
    hostname_or_ip: string
    location: string
    name: string
    clients_on_server: number
  }>
  general: {
    version: number
    reload: number
    update_timestamp: string
    connected_clients: number
    unique_users: number
  }
  pilot_positions: Array<{
    cid: number
    latitude: number
    longitude: number
  }>
}

export function useVatsimData() {
  return useQuery<VatsimData>({
    queryKey: ['vatsimData'],
    queryFn: async () => {
      const response = await fetch('https://data.vatsim.net/v3/vatsim-data.json');
      if (!response.ok) {
        throw new Error('Failed to fetch VATSIM data');
      }
      const data = await response.json();
      return data;
    },
    staleTime: 0, // Always consider data as stale for instant refetch
    refetchInterval: 60000, // Refetch every 1 minute
  });
}
