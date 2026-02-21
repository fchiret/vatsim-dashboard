import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useFlightPlanDecode, parseWaypointsFromNotes } from './useFlightPlanDecode';
import { createQueryClientWrapper, createTestQueryClient } from '../test-utils';
import { createMockFlightPlan } from '../test-factories';

describe('parseWaypointsFromNotes', () => {
  it('should exclude unmatched points from parsed waypoints', () => {
    const notes = 'Requested: KRDG DUMMR T438 RAV SFK BUF KBUF\nUnmatched points: T438';
    const waypoints = parseWaypointsFromNotes(notes);
    expect(waypoints).toEqual(['KRDG', 'DUMMR', 'RAV', 'SFK', 'BUF', 'KBUF']);
    expect(waypoints).not.toContain('T438');
  });

  it('should return empty array when notes is empty', () => {
    const waypoints = parseWaypointsFromNotes('');
    expect(waypoints).toEqual([]);
  });

  it('should return empty array when no Requested line', () => {
    const notes = 'Some other text\nNo requested line here';
    const waypoints = parseWaypointsFromNotes(notes);
    expect(waypoints).toEqual([]);
  });

  it('should return all waypoints when no Unmatched points line exists', () => {
    const notes = 'Requested: LFPG BOBIG KJFK';
    const waypoints = parseWaypointsFromNotes(notes);
    expect(waypoints).toEqual(['LFPG', 'BOBIG', 'KJFK']);
  });

  it('should handle multiple spaces between waypoints', () => {
    const notes = 'Requested: LFPG   BOBIG    KJFK';
    const waypoints = parseWaypointsFromNotes(notes);
    expect(waypoints).toEqual(['LFPG', 'BOBIG', 'KJFK']);
  });

  it('should be case-insensitive when excluding unmatched points', () => {
    const notes = 'Requested: LFPG un851 EGLL\nUnmatched points: UN851';
    const waypoints = parseWaypointsFromNotes(notes);
    expect(waypoints).toEqual(['LFPG', 'EGLL']);
  });

  it('should exclude multiple unmatched points', () => {
    const notes = 'Requested: LFPG UN851 BIBAX L610 EGLL\nUnmatched points: UN851 L610';
    const waypoints = parseWaypointsFromNotes(notes);
    expect(waypoints).toEqual(['LFPG', 'BIBAX', 'EGLL']);
  });
});

describe('useFlightPlanDecode', () => {
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

  it('should expose parsedWaypoints derived from flight plan notes', async () => {
    const mockFlightPlan = createMockFlightPlan({
      notes: 'Requested: LFPG BOBIG KJFK\nUnmatched points: none',
    });

    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockFlightPlan,
    });

    const { result } = renderHook(() => useFlightPlanDecode({ route: 'LFPG KJFK' }), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.parsedWaypoints).toEqual([
      { ident: 'LFPG' },
      { ident: 'BOBIG' },
      { ident: 'KJFK' },
    ]);
  });

  it('should return empty parsedWaypoints when data is undefined', () => {
    const { result } = renderHook(() => useFlightPlanDecode(null), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    expect(result.current.parsedWaypoints).toEqual([]);
  });

  it('should enrich parsedWaypoints with coordinates from route.nodes', async () => {
    const mockFlightPlan = createMockFlightPlan({
      notes: 'Requested: LFPG BOBIG KJFK',
      route: {
        nodes: [
          { ident: 'LFPG', type: 'airport', lat: 49.0097, lon: 2.5479, alt: 0, name: 'Paris CDG', via: null },
          { ident: 'BOBIG', type: 'waypoint', lat: 50.5, lon: 1.5, alt: 0, name: null, via: null },
          // KJFK is intentionally missing from route.nodes to test the fallback
        ],
      },
    });

    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockFlightPlan,
    });

    const { result } = renderHook(() => useFlightPlanDecode({ route: 'LFPG BOBIG KJFK' }), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.parsedWaypoints).toEqual([
      { ident: 'LFPG', lat: 49.0097, lon: 2.5479, name: 'Paris CDG', type: 'airport' },
      { ident: 'BOBIG', lat: 50.5, lon: 1.5, name: null, type: 'waypoint' },
      // KJFK falls back: no coords
      { ident: 'KJFK' },
    ]);
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
