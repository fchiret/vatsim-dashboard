import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PilotCard } from './PilotCard';
import { createMockPilot, createMockPilotRatings } from '../test-factories';

describe('PilotCard', () => {
  const mockPilotRatings = createMockPilotRatings();

  it('should display pilot callsign and name', () => {
    render(<PilotCard pilot={createMockPilot({ callsign: 'DAL42', name: 'Jane Smith' })} pilotRatings={mockPilotRatings} />);

    expect(screen.getByText('DAL42')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('should display pilot flight data', () => {
    render(<PilotCard pilot={createMockPilot({
      transponder: '7700',
      heading: 180,
      altitude: 38000,
      groundspeed: 480,
    })} pilotRatings={mockPilotRatings} />);

    expect(screen.getByText('7700')).toBeInTheDocument();
    expect(screen.getByText('180°')).toBeInTheDocument();
    expect(screen.getByText('38,000 ft')).toBeInTheDocument();
    expect(screen.getByText('480 kts')).toBeInTheDocument();
  });

  it('should display pilot position', () => {
    render(<PilotCard pilot={createMockPilot({ latitude: 48.8566, longitude: 2.3522 })} pilotRatings={mockPilotRatings} />);

    expect(screen.getByText('48.8566, 2.3522')).toBeInTheDocument();
  });

  it('should display pilot rating using long name', () => {
    render(<PilotCard pilot={createMockPilot({ pilot_rating: 15 })} pilotRatings={mockPilotRatings} />);

    expect(screen.getByText('Airline Transport Pilot License')).toBeInTheDocument();
  });

  it('should display N/A when no rating is found', () => {
    render(<PilotCard pilot={createMockPilot({ pilot_rating: 999 })} pilotRatings={mockPilotRatings} />);

    const ratingBadge = screen.getByTitle('N/A');
    expect(ratingBadge).toHaveTextContent('N/A');
  });

  it('should display server info', () => {
    render(<PilotCard pilot={createMockPilot({ server: 'USA-EAST' })} pilotRatings={mockPilotRatings} />);

    expect(screen.getByText('USA-EAST')).toBeInTheDocument();
  });

  it('should render card labels for pilot data', () => {
    render(<PilotCard pilot={createMockPilot()} pilotRatings={mockPilotRatings} />);

    expect(screen.getByText('Pilot')).toBeInTheDocument();
    expect(screen.getByText('Altitude')).toBeInTheDocument();
    expect(screen.getByText('Speed')).toBeInTheDocument();
    expect(screen.getByText('Transponder')).toBeInTheDocument();
    expect(screen.getByText('Heading')).toBeInTheDocument();
    expect(screen.getByText('Position')).toBeInTheDocument();
    expect(screen.getByText('Rating')).toBeInTheDocument();
    expect(screen.getByText('Server')).toBeInTheDocument();
  });

  it('should not display flight plan data', () => {
    render(<PilotCard pilot={createMockPilot({
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
        remarks: '',
        route: 'DCT',
      },
    })} pilotRatings={mockPilotRatings} />);

    expect(screen.queryByText('Flight Plan')).not.toBeInTheDocument();
    expect(screen.queryByText('B737/M')).not.toBeInTheDocument();
    expect(screen.queryByText('KJFK → KLAX')).not.toBeInTheDocument();
  });
});
