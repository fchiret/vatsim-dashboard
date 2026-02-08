import type { Pilot, PilotRating } from './hooks/useVatsimData';
import type { FlightPlan as FlightPlanDecoded } from './hooks/useFlightPlanDecode';

/**
 * Creates a mock Pilot with default values
 * Can be overridden with partial Pilot object
 */
export function createMockPilot(overrides?: Partial<Pilot>): Pilot {
  return {
    cid: 123456,
    name: 'John Doe',
    callsign: 'ABC123',
    server: 'USA-EAST',
    latitude: 40.7128,
    longitude: -74.006,
    altitude: 35000,
    groundspeed: 450,
    transponder: '1200',
    heading: 270,
    pilot_rating: 15,
    flight_plan: {
      flight_rules: 'I',
      aircraft: 'B737/M',
      aircraft_short: 'B737',
      departure: 'KJFK',
      arrival: 'KLAX',
      alternate: 'KSAN',
      cruise_tas: '450',
      altitude: '35000',
      deptime: '1200',
      enroute_time: '0500',
      fuel_time: '0600',
      remarks: 'Test flight',
      route: 'DCT',
    },
    ...overrides,
  };
}

/**
 * Creates mock pilot ratings
 */
export function createMockPilotRatings(): PilotRating[] {
  return [
    { id: 0, short_name: 'NEW', long_name: 'Basic Member' },
    { id: 1, short_name: 'PPL', long_name: 'Private Pilot License' },
    { id: 3, short_name: 'IR', long_name: 'Instrument Rating' },
    { id: 7, short_name: 'CMEL', long_name: 'Commercial Multi-Engine License' },
    { id: 15, short_name: 'ATPL', long_name: 'Airline Transport Pilot License' },
  ];
}

/**
 * Creates a mock decoded FlightPlan
 */
export function createMockFlightPlan(overrides?: Partial<FlightPlanDecoded>): FlightPlanDecoded {
  return {
    id: 1,
    fromICAO: 'LFPG',
    toICAO: 'KJFK',
    fromName: 'Paris Charles de Gaulle',
    toName: 'John F. Kennedy International',
    flightNumber: 'AF001',
    distance: 5837,
    maxAltitude: 39000,
    waypoints: 45,
    likes: 10,
    downloads: 100,
    popularity: 0.5,
    notes: 'Transatlantic flight',
    encodedPolyline: 'mock_encoded_polyline',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    tags: ['oceanic', 'long-haul'],
    user: {
      id: 1,
      username: 'pilot123',
      gravatarHash: 'hash123',
      location: 'France',
    },
    route: {
      nodes: [
        {
          ident: 'LFPG',
          type: 'airport',
          lat: 49.0097,
          lon: 2.5479,
          alt: 0,
          name: 'Paris Charles de Gaulle',
          via: null,
        },
        {
          ident: 'KJFK',
          type: 'airport',
          lat: 40.6413,
          lon: -73.7781,
          alt: 0,
          name: 'John F. Kennedy International',
          via: null,
        },
      ],
    },
    ...overrides,
  };
}
