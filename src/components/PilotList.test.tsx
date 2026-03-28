import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { PilotList } from './PilotList';
import { renderWithProviders } from '../test-utils';
import { createMockPilot, createMockPilotRatings } from '../test-factories';
import type { useVatsimData } from '../hooks/useVatsimData';

vi.mock('../hooks/useVatsimData', () => ({
  useVatsimData: vi.fn(),
}));

vi.mock('../contexts/AircraftContext', async () => {
  const actual = await vi.importActual<typeof import('../contexts/AircraftContext')>('../contexts/AircraftContext');
  return {
    ...actual,
    useAircraft: vi.fn(),
  };
});

import { useAircraft } from '../contexts/AircraftContext';
import { useVatsimData as useVatsimDataImport } from '../hooks/useVatsimData';

const mockUseAircraft = vi.mocked(useAircraft);
const mockUseVatsimData = vi.mocked(useVatsimDataImport);

describe('PilotList', () => {
  const mockPilotRatings = createMockPilotRatings();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseVatsimData.mockReturnValue({
      data: { pilot_ratings: mockPilotRatings },
    } as unknown as ReturnType<typeof useVatsimData>);
  });

  const setupMockContext = (visiblePilots: ReturnType<typeof createMockPilot>[], highlightedPilot: string | null = null) => {
    const setHighlightedPilot = vi.fn();
    mockUseAircraft.mockReturnValue({
      selectedAircraft: null,
      setSelectedAircraft: vi.fn(),
      aircraftList: [],
      visibleRoutes: new Set(),
      toggleRoute: vi.fn(),
      isRouteVisible: vi.fn(),
      visiblePilots,
      setVisiblePilots: vi.fn(),
      highlightedPilot,
      setHighlightedPilot,
    });
    return { setHighlightedPilot };
  };

  it('should display empty state when no pilots are visible', () => {
    setupMockContext([]);

    renderWithProviders(<PilotList />);

    expect(screen.getByText('No pilots visible in the current map view')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('should display visible pilots count', () => {
    const pilots = [
      createMockPilot({ callsign: 'AAL100' }),
      createMockPilot({ callsign: 'BAW200' }),
    ];
    setupMockContext(pilots);

    renderWithProviders(<PilotList />);

    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('should render multiple pilots', () => {
    const pilots = [
      createMockPilot({ callsign: 'AAL100', name: 'Alice' }),
      createMockPilot({ callsign: 'BAW200', name: 'Bob' }),
      createMockPilot({ callsign: 'DLH300', name: 'Charlie' }),
    ];
    setupMockContext(pilots);

    renderWithProviders(<PilotList />);

    expect(screen.getByText('AAL100')).toBeInTheDocument();
    expect(screen.getByText('BAW200')).toBeInTheDocument();
    expect(screen.getByText('DLH300')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('should call setHighlightedPilot when a pilot card is clicked', () => {
    const { setHighlightedPilot } = setupMockContext([createMockPilot({ callsign: 'DAL42' })]);

    renderWithProviders(<PilotList />);

    const card = screen.getByText('DAL42').closest('.pilot-card') as HTMLElement;
    fireEvent.click(card);

    expect(setHighlightedPilot).toHaveBeenCalledWith('DAL42');
  });

  it('should apply highlighted class to highlighted pilot card', () => {
    setupMockContext([createMockPilot({ callsign: 'DAL42' })], 'DAL42');

    renderWithProviders(<PilotList />);

    const card = screen.getByText('DAL42').closest('.pilot-card') as HTMLElement;
    expect(card).toHaveClass('pilot-card-highlighted');
  });

  it('should not apply highlighted class when pilot is not highlighted', () => {
    setupMockContext([createMockPilot({ callsign: 'DAL42' })], null);

    renderWithProviders(<PilotList />);

    const card = screen.getByText('DAL42').closest('.pilot-card') as HTMLElement;
    expect(card).not.toHaveClass('pilot-card-highlighted');
  });

  it('should have accessible role and label on pilot cards', () => {
    setupMockContext([createMockPilot({ callsign: 'DAL42' })]);

    renderWithProviders(<PilotList />);

    const card = screen.getByRole('button', { name: 'Pilot DAL42' });
    expect(card).toBeInTheDocument();
    expect(card).toHaveAttribute('tabindex', '0');
  });

  it('should call setHighlightedPilot when Enter is pressed on a pilot card', () => {
    const { setHighlightedPilot } = setupMockContext([createMockPilot({ callsign: 'DAL42' })]);

    renderWithProviders(<PilotList />);

    const card = screen.getByRole('button', { name: 'Pilot DAL42' });
    fireEvent.keyDown(card, { key: 'Enter' });

    expect(setHighlightedPilot).toHaveBeenCalledWith('DAL42');
  });

  it('should call setHighlightedPilot when Space is pressed on a pilot card', () => {
    const { setHighlightedPilot } = setupMockContext([createMockPilot({ callsign: 'DAL42' })]);

    renderWithProviders(<PilotList />);

    const card = screen.getByRole('button', { name: 'Pilot DAL42' });
    fireEvent.keyDown(card, { key: ' ' });

    expect(setHighlightedPilot).toHaveBeenCalledWith('DAL42');
  });
});
