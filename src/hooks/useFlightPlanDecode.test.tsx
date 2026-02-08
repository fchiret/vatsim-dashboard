import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useFlightPlanDecode } from './useFlightPlanDecode';
import { createQueryClientWrapper, createTestQueryClient } from '../test-utils';
import { createMockFlightPlan } from '../test-factories';

// Mock fetch
globalThis.fetch = vi.fn() as typeof fetch;

describe('useFlightPlanDecode', () => {
  let queryClient: ReturnType<typeof createTestQueryClient>;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    vi.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('should not fetch when params is null', () => {
    const { result } = renderHook(() => useFlightPlanDecode(null), { 
      wrapper: createQueryClientWrapper(queryClient) 
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('should not fetch when route is empty', () => {
    const { result } = renderHook(() => useFlightPlanDecode({ route: '' }), { 
      wrapper: createQueryClientWrapper(queryClient) 
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('should fetch and decode flight plan successfully', async () => {
    const mockFlightPlan = createMockFlightPlan();

    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockFlightPlan,
    });

    const { result } = renderHook(() => useFlightPlanDecode({ route: 'LFPG KJFK' }), { 
      wrapper: createQueryClientWrapper(queryClient) 
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(fetch).toHaveBeenCalledWith('/api/flightplan/auto/decode', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ route: 'LFPG KJFK' }),
    });

    expect(result.current.data).toEqual(mockFlightPlan);
  });

  it('should handle API errors gracefully', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: async () => ({ error: 'Route not found' }),
    });

    const { result } = renderHook(() => useFlightPlanDecode({ route: 'INVALID' }), { 
      wrapper: createQueryClientWrapper(queryClient) 
    });

    await waitFor(() => expect(result.current.isError).toBe(true), { timeout: 3000 });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toContain('Failed to decode route: 404 Not Found');
  });

  it('should handle network errors', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useFlightPlanDecode({ route: 'LFPG KJFK' }), { 
      wrapper: createQueryClientWrapper(queryClient) 
    });

    await waitFor(() => expect(result.current.isError).toBe(true), { timeout: 3000 });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('Network error');
  });

  it('should cache results for 5 minutes', async () => {
    const mockFlightPlan = createMockFlightPlan({
      id: 1,
      fromICAO: 'LFPG',
      toICAO: 'KJFK',
      encodedPolyline: 'mock_polyline',
    });

    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => mockFlightPlan,
    });

    const wrapper = createQueryClientWrapper(queryClient);

    // First render
    const { result: result1 } = renderHook(() => useFlightPlanDecode({ route: 'LFPG KJFK' }), {
      wrapper,
    });

    await waitFor(() => expect(result1.current.isSuccess).toBe(true));
    expect(fetch).toHaveBeenCalledTimes(1);

    // Second render with same route - should use cache
    const { result: result2 } = renderHook(() => useFlightPlanDecode({ route: 'LFPG KJFK' }), {
      wrapper,
    });

    await waitFor(() => expect(result2.current.isSuccess).toBe(true));
    // Should still be 1 call (cached)
    expect(fetch).toHaveBeenCalledTimes(1);

    expect(result2.current.data).toEqual(mockFlightPlan);
  });

  it('should handle invalid JSON response', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: async () => {
        throw new Error('Invalid JSON');
      },
    });

    const { result } = renderHook(() => useFlightPlanDecode({ route: 'LFPG KJFK' }), { 
      wrapper: createQueryClientWrapper(queryClient) 
    });

    await waitFor(() => expect(result.current.isError).toBe(true), { timeout: 3000 });

    expect(result.current.error?.message).toContain('Failed to decode route: 500 Internal Server Error');
  });
});
