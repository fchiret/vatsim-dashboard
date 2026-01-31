import { describe, it, expect } from 'vitest';
import { generatePilotPopupContent } from '../utils/pilotPopupContent';
import type { Pilot, PilotRating } from '../hooks/useVatsimData';

describe('pilotPopupContent', () => {
  const createMockPilot = (overrides?: Partial<Pilot>): Pilot => ({
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
  });

  const mockRatings: PilotRating[] = [
    { id: 0, short_name: 'NEW', long_name: 'Basic Member' },
    { id: 15, short_name: 'ATPL', long_name: 'Airline Transport Pilot License' },
  ];

  it('should generate popup with pilot basic info', () => {
    const html = generatePilotPopupContent(createMockPilot(), mockRatings);

    expect(html).toContain('ABC123');
    expect(html).toContain('John Doe');
    expect(html).toContain('35,000 ft');
    expect(html).toContain('450 kts');
  });

  it('should display pilot rating correctly', () => {
    const html = generatePilotPopupContent(createMockPilot(), mockRatings);

    expect(html).toContain('ATPL');
    expect(html).toContain('Airline Transport Pilot License');
  });

  it('should display transponder and server', () => {
    const html = generatePilotPopupContent(createMockPilot(), mockRatings);

    expect(html).toContain('1200');
    expect(html).toContain('USA-EAST');
  });

  it('should display flight plan when available', () => {
    const html = generatePilotPopupContent(createMockPilot(), mockRatings);

    expect(html).toContain('KJFK');
    expect(html).toContain('KLAX');
    expect(html).toContain('B737/M');
  });

  it('should handle missing flight plan', () => {
    const html = generatePilotPopupContent(createMockPilot({ flight_plan: undefined }), mockRatings);

    expect(html).toContain('ABC123');
    expect(html).not.toContain('Flight Plan');
  });

  it('should handle missing ratings', () => {
    const html = generatePilotPopupContent(createMockPilot());

    expect(html).toContain('N/A');
  });
});
