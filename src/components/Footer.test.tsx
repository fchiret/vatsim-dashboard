import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Footer from '../components/Footer';
import { renderWithProviders, createTestQueryClient } from '../test-utils';

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
  let queryClient: ReturnType<typeof createTestQueryClient>;

  beforeEach(() => {
    queryClient = createTestQueryClient();
  });

  afterEach(() => {
    queryClient.clear();
    localStorage.clear();
  });

  it('should display aircraft filter label for users', () => {
    renderWithProviders(<Footer />, queryClient);
    expect(screen.getByText(/Highlight aircraft model/i)).toBeInTheDocument();
  });

  it('should display "All aircraft models" as default filter option', () => {
    renderWithProviders(<Footer />, queryClient);
    expect(screen.getByText('All aircraft models')).toBeInTheDocument();
  });

  it('should display unique users count', () => {
    renderWithProviders(<Footer />);
    expect(screen.getByText('1,500')).toBeInTheDocument();
  });

  it('should provide a dropdown for aircraft filtering', () => {
    renderWithProviders(<Footer />);
    const selectElement = screen.getByRole('combobox');
    expect(selectElement).toBeInTheDocument();
  });

  it('should display last update time', () => {
    renderWithProviders(<Footer />);
    expect(screen.getByText(/Last data update/i)).toBeInTheDocument();
    expect(screen.getByText('10:00:00')).toBeInTheDocument();
  });

  it('should update selected aircraft when user chooses from dropdown', async () => {
    const user = userEvent.setup();
    
    const mockPilots = [
      { flight_plan: { aircraft_short: 'A320' } },
      { flight_plan: { aircraft_short: 'B737' } },
    ];
    localStorage.setItem('vatsim_pilots', JSON.stringify(mockPilots));

    renderWithProviders(<Footer />, queryClient);

    const selectElement = screen.getByRole('combobox') as HTMLSelectElement;
    
    await user.selectOptions(selectElement, 'A320');
    expect(selectElement.value).toBe('A320');

    await user.selectOptions(selectElement, '');
    expect(selectElement.value).toBe('');
  });
});
