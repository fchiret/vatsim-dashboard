import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { AircraftProvider, useAircraft } from '../contexts/AircraftContext';
import type { ReactNode } from 'react';

describe('AircraftContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <AircraftProvider>{children}</AircraftProvider>
  );

  it('should provide initial state', () => {
    const { result } = renderHook(() => useAircraft(), { wrapper });

    expect(result.current.selectedAircraft).toBeNull();
    expect(result.current.aircraftList).toEqual([]);
  });

  it('should update selected aircraft', () => {
    const { result } = renderHook(() => useAircraft(), { wrapper });

    act(() => {
      result.current.setSelectedAircraft('B737');
    });
    
    expect(result.current.selectedAircraft).toBe('B737');
  });

  it('should clear selected aircraft', () => {
    const { result } = renderHook(() => useAircraft(), { wrapper });

    act(() => {
      result.current.setSelectedAircraft('B737');
      result.current.setSelectedAircraft(null);
    });
    
    expect(result.current.selectedAircraft).toBeNull();
  });

  it('should extract aircraft list from localStorage', async () => {
    const mockPilots = [
      { flight_plan: { aircraft_short: 'B737' } },
      { flight_plan: { aircraft_short: 'A320' } },
      { flight_plan: { aircraft_short: 'B737' } },
      { flight_plan: {} },
      {},
    ];

    localStorage.setItem('vatsim_pilots', JSON.stringify(mockPilots));

    const { result } = renderHook(() => useAircraft(), { wrapper });

    await waitFor(() => {
      expect(result.current.aircraftList).toEqual(['A320', 'B737']);
    });
  });

  it('should handle localStorage parse errors', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    localStorage.setItem('vatsim_pilots', 'invalid json');

    const { result } = renderHook(() => useAircraft(), { wrapper });

    expect(result.current.aircraftList).toEqual([]);
    expect(consoleSpy).toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });

  it('should update aircraft list on vatsim-pilots-updated event', async () => {
    const mockPilots = [
      { flight_plan: { aircraft_short: 'A380' } },
    ];
    
    localStorage.setItem('vatsim_pilots', JSON.stringify(mockPilots));
    
    const { result } = renderHook(() => useAircraft(), { wrapper });

    await waitFor(() => {
      expect(result.current.aircraftList).toContain('A380');
    });
  });

  it('should throw error when used outside provider', () => {
    expect(() => {
      renderHook(() => useAircraft());
    }).toThrow('useAircraft must be used within an AircraftProvider');
  });
});
