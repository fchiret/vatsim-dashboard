import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Footer from '../components/Footer';
import { AircraftProvider } from '../contexts/AircraftContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock hooks
vi.mock('../hooks/useUpdateCountdown', () => ({
  useUpdateCountdown: () => ({
    nextUpdateIn: '45s',
    lastUpdateTime: '10:00:00',
  }),
}));

vi.mock('../hooks/useUniqueUsers', () => ({
  useUniqueUsers: () => ({
    uniqueUsers: 1500,
  }),
}));

describe('Footer Component', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <AircraftProvider>
          {component}
        </AircraftProvider>
      </QueryClientProvider>
    );
  };

  it('should render footer with aircraft filter', () => {
    renderWithProviders(<Footer />);
    expect(screen.getByText(/Highlight aircraft model/i)).toBeInTheDocument();
  });

  it('should render "All aircraft models" option', () => {
    renderWithProviders(<Footer />);
    expect(screen.getByText('All aircraft models')).toBeInTheDocument();
  });

  it('should display unique users count', () => {
    renderWithProviders(<Footer />);
    expect(screen.getByText('1,500')).toBeInTheDocument();
  });

  it('should render select element for aircraft filter', () => {
    renderWithProviders(<Footer />);
    const selectElement = screen.getByRole('combobox');
    expect(selectElement).toBeInTheDocument();
  });

  it('should display last update time', () => {
    renderWithProviders(<Footer />);
    expect(screen.getByText(/Last data update/i)).toBeInTheDocument();
    expect(screen.getByText('10:00:00')).toBeInTheDocument();
  });

  it('should call setSelectedAircraft when selecting an aircraft', async () => {
    const user = userEvent.setup();
    
    const mockPilots = [
      { flight_plan: { aircraft_short: 'A320' } },
      { flight_plan: { aircraft_short: 'B737' } },
    ];
    localStorage.setItem('vatsim_pilots', JSON.stringify(mockPilots));

    renderWithProviders(<Footer />);

    const selectElement = screen.getByRole('combobox') as HTMLSelectElement;
    
    await user.selectOptions(selectElement, 'A320');
    expect(selectElement.value).toBe('A320');

    await user.selectOptions(selectElement, '');
    expect(selectElement.value).toBe('');
  });
});
