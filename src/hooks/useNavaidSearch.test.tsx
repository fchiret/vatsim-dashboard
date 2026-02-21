import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useNavaidSearch } from './useNavaidSearch';
import { createQueryClientWrapper, createTestQueryClient } from '../test-utils';
import type { Navaid } from './useNavaidSearch';

describe('useNavaidSearch', () => {
  let queryClient: ReturnType<typeof createTestQueryClient>;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    queryClient.clear();
    vi.unstubAllGlobals();
  });

  it('should not fetch when params is null', () => {
    const { result } = renderHook(() => useNavaidSearch(null), { 
      wrapper: createQueryClientWrapper(queryClient) 
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('should not fetch when waypoint is empty', () => {
    const { result } = renderHook(() => useNavaidSearch({ waypoint: '' }), { 
      wrapper: createQueryClientWrapper(queryClient) 
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('should fetch navaid data successfully', async () => {
    const mockNavaid: Navaid = {
      ident: 'LFPG',
      lat: 49.0097,
      lon: 2.5479,
      type: 'airport',
      name: 'Paris Charles de Gaulle Airport',
    };

    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => [mockNavaid],
    });

    const { result } = renderHook(() => useNavaidSearch({ waypoint: 'LFPG' }), { 
      wrapper: createQueryClientWrapper(queryClient) 
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(fetch).toHaveBeenCalledWith(
      '/api/flightplan/search/nav?q=LFPG',
      expect.objectContaining({
        method: 'GET',
        headers: {
          'Accept': 'application/vnd.fpd.v1+json',
        },
      })
    );

    expect(result.current.data).toEqual(mockNavaid);
  });

  it('should handle multiple results and return first', async () => {
    const mockNavaids: Navaid[] = [
      {
        ident: 'PAR',
        lat: 48.8566,
        lon: 2.3522,
        type: 'vor',
        name: 'Paris VOR',
      },
      {
        ident: 'PAR',
        lat: 48.8000,
        lon: 2.3000,
        type: 'ndb',
        name: 'Paris NDB',
      },
    ];

    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockNavaids,
    });

    const { result } = renderHook(() => useNavaidSearch({ waypoint: 'PAR' }), { 
      wrapper: createQueryClientWrapper(queryClient) 
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockNavaids[0]);
  });

  it('should handle empty results', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => [],
    } as Response);

    const { result } = renderHook(() => useNavaidSearch({ waypoint: 'INVALID' }), { 
      wrapper: createQueryClientWrapper(queryClient) 
    });

    await waitFor(() => expect(result.current.isError).toBe(true), { timeout: 3000 });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toContain('No navaid found for waypoint: INVALID');
  });

  it('should handle API errors gracefully', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: async () => ({ error: 'Navaid not found' }),
    } as Response);

    const { result } = renderHook(() => useNavaidSearch({ waypoint: 'INVALID' }), { 
      wrapper: createQueryClientWrapper(queryClient) 
    });

    await waitFor(() => expect(result.current.isError).toBe(true), { timeout: 3000 });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toContain('Failed to search navaid: 404 Not Found');
  });

  it('should handle network errors', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useNavaidSearch({ waypoint: 'LFPG' }), { 
      wrapper: createQueryClientWrapper(queryClient) 
    });

    await waitFor(() => expect(result.current.isError).toBe(true), { timeout: 3000 });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('Network error');
  });

  it('should cache results for 24 hours', async () => {
    const mockNavaid: Navaid = {
      ident: 'LFPG',
      lat: 49.0097,
      lon: 2.5479,
      type: 'airport',
      name: 'Paris Charles de Gaulle Airport',
    };

    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => [mockNavaid],
    });

    const { result: result1, unmount } = renderHook(
      () => useNavaidSearch({ waypoint: 'LFPG' }), 
      { wrapper: createQueryClientWrapper(queryClient) }
    );

    await waitFor(() => expect(result1.current.isSuccess).toBe(true));
    expect(fetch).toHaveBeenCalledTimes(1);

    unmount();

    // Re-render the hook with the same params
    const { result: result2 } = renderHook(
      () => useNavaidSearch({ waypoint: 'LFPG' }), 
      { wrapper: createQueryClientWrapper(queryClient) }
    );

    // Should use cached data without making another API call
    await waitFor(() => expect(result2.current.isSuccess).toBe(true));
    expect(result2.current.data).toEqual(mockNavaid);
    expect(fetch).toHaveBeenCalledTimes(1); // Still only called once
  });

  it('should encode waypoint parameter in URL', async () => {
    const mockNavaid: Navaid = {
      ident: 'TEST WPT',
      lat: 48.0,
      lon: 2.0,
      type: 'waypoint',
    };

    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => [mockNavaid],
    });

    const { result } = renderHook(() => useNavaidSearch({ waypoint: 'TEST WPT' }), { 
      wrapper: createQueryClientWrapper(queryClient) 
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(fetch).toHaveBeenCalledWith(
      '/api/flightplan/search/nav?q=TEST%20WPT',
      expect.any(Object)
    );
  });
});
