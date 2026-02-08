import { describe, it, expect } from 'vitest';
import { generatePilotPopupContent } from '../utils/pilotPopupContent';
import { createMockPilot, createMockPilotRatings } from '../test-factories';

describe('pilotPopupContent', () => {
  const mockRatings = createMockPilotRatings();

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
