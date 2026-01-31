import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUpdateCountdown } from '../hooks/useUpdateCountdown';
import type { ReactNode } from 'react';

// Mock useVatsimData
vi.mock('../hooks/useVatsimData', () => ({
  useVatsimData: vi.fn(),
}));

import { useVatsimData } from '../hooks/useVatsimData';

describe('useUpdateCountdown', () => {
  let queryClient: QueryClient;

  const createMockVatsimData = (timestamp?: string) => ({
    data: timestamp ? {
      general: {
        version: 3,
        reload: 1,
        update_timestamp: timestamp,
        connected_clients: 100,
        unique_users: 100,
      },
      pilots: [],
      pilot_ratings: [],
      controllers: [],
      atis: [],
      servers: [],
      pilot_positions: [],
    } : undefined,
    isLoading: false,
    error: null,
  } as unknown as ReturnType<typeof useVatsimData>);

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should return initial countdown values', () => {
    vi.mocked(useVatsimData).mockReturnValue(createMockVatsimData());

    const { result } = renderHook(() => useUpdateCountdown(), { wrapper });

    expect(result.current.nextUpdateIn).toBe('--:--');
    expect(result.current.lastUpdateTime).toBe('');
  });

  it('should update countdown when data is available', () => {
    const mockTimestamp = new Date('2026-01-31T10:00:00Z').toISOString();
    vi.mocked(useVatsimData).mockReturnValue(createMockVatsimData(mockTimestamp));

    const { result } = renderHook(() => useUpdateCountdown(), { wrapper });

    expect(result.current.nextUpdateIn).not.toBe('--:--');
    expect(result.current.lastUpdateTime).toBeTruthy();
  });

  it('should format countdown as MM:SS', () => {
    const mockTimestamp = new Date().toISOString();
    vi.mocked(useVatsimData).mockReturnValue(createMockVatsimData(mockTimestamp));

    const { result } = renderHook(() => useUpdateCountdown(), { wrapper });

    expect(result.current.nextUpdateIn).toMatch(/^\d{2}:\d{2}$/);
  });

  it('should handle missing update_timestamp gracefully', () => {
    vi.mocked(useVatsimData).mockReturnValue(createMockVatsimData(''));

    const { result } = renderHook(() => useUpdateCountdown(), { wrapper });

    expect(result.current.nextUpdateIn).toBe('--:--');
    expect(result.current.lastUpdateTime).toBe('');
  });

  it('should handle undefined data gracefully', () => {
    vi.mocked(useVatsimData).mockReturnValue(createMockVatsimData());

    const { result } = renderHook(() => useUpdateCountdown(), { wrapper });

    expect(result.current.nextUpdateIn).toBe('--:--');
    expect(result.current.lastUpdateTime).toBe('');
  });

  it('should handle error in countdown calculation', () => {
    vi.mocked(useVatsimData).mockReturnValue(createMockVatsimData('invalid-date'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useUpdateCountdown(), { wrapper });

    expect(result.current.nextUpdateIn).toBeDefined();
    expect(result.current.lastUpdateTime).toBeDefined();
    
    consoleSpy.mockRestore();
  });

  it('should convert timestamp to locale time string', () => {
    const mockTimestamp = new Date('2026-01-31T10:00:00Z').toISOString();
    vi.mocked(useVatsimData).mockReturnValue(createMockVatsimData(mockTimestamp));

    const { result } = renderHook(() => useUpdateCountdown(), { wrapper });

    expect(result.current.lastUpdateTime).toMatch(/\d+:\d+:\d+/);
  });

  it('should reset countdown on new data', () => {
    const mockTimestamp1 = new Date('2026-01-31T10:00:00Z').toISOString();
    const mockTimestamp2 = new Date('2026-01-31T10:01:00Z').toISOString();
    
    const mockFn = vi.mocked(useVatsimData);
    mockFn.mockReturnValue(createMockVatsimData(mockTimestamp1));

    const { result, rerender } = renderHook(() => useUpdateCountdown(), { wrapper });

    mockFn.mockReturnValue(createMockVatsimData(mockTimestamp2));
    rerender();

    expect(result.current.nextUpdateIn).toBeDefined();
    expect(result.current.nextUpdateIn).toMatch(/^\d{2}:\d{2}$/);
  });
});
