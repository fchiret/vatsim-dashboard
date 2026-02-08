import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useUniqueUsers } from '../hooks/useUniqueUsers';
import { createQueryClientWrapper, createTestQueryClient } from '../test-utils';
import * as useVatsimDataModule from './useVatsimData';

describe('useUniqueUsers', () => {
  let queryClient: ReturnType<typeof createTestQueryClient>;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    vi.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('should return unique users from useVatsimData', () => {
    // Mock useVatsimData to return test data
    vi.spyOn(useVatsimDataModule, 'useVatsimData').mockReturnValue({
      data: {
        general: { unique_users: 2500 },
        pilots: [],
        controllers: [],
        atis: [],
        servers: [],
        prefiles: [],
        facilities: [],
        ratings: [],
        pilot_ratings: [],
        military_ratings: [],
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useVatsimDataModule.useVatsimData>);

    const { result } = renderHook(() => useUniqueUsers(), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    expect(result.current.uniqueUsers).toBe(2500);
  });

  it('should return 0 when data is not available', () => {
    vi.spyOn(useVatsimDataModule, 'useVatsimData').mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useVatsimDataModule.useVatsimData>);

    const { result } = renderHook(() => useUniqueUsers(), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    expect(result.current.uniqueUsers).toBe(0);
  });

  it('should return 0 when general data is missing', () => {
    vi.spyOn(useVatsimDataModule, 'useVatsimData').mockReturnValue({
      data: {
        pilots: [],
        controllers: [],
        atis: [],
        servers: [],
        prefiles: [],
        facilities: [],
        ratings: [],
        pilot_ratings: [],
        military_ratings: [],
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useVatsimDataModule.useVatsimData>);

    const { result } = renderHook(() => useUniqueUsers(), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    expect(result.current.uniqueUsers).toBe(0);
  });

  it('should return 0 when data is undefined', () => {
    vi.spyOn(useVatsimDataModule, 'useVatsimData').mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useVatsimDataModule.useVatsimData>);

    const { result } = renderHook(() => useUniqueUsers(), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    expect(result.current.uniqueUsers).toBe(0);
  });
});
