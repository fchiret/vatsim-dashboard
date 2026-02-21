import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { MapContainer } from 'react-leaflet';
import { WaypointMarkers } from './WaypointMarkers';
import { createQueryClientWrapper, createTestQueryClient } from '../test-utils';
import type { Navaid } from '../hooks/useNavaidSearch';
import type { WaypointWithCoords } from '../hooks/useFlightPlanDecode';

describe('WaypointMarkers Component', () => {
  let queryClient: ReturnType<typeof createTestQueryClient>;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    queryClient.clear();
    vi.unstubAllGlobals();
  });

  const renderWithMap = (component: React.ReactElement) => {
    const Wrapper = createQueryClientWrapper(queryClient);
    return render(
      <Wrapper>
        <MapContainer center={[0, 0]} zoom={2}>
          {component}
        </MapContainer>
      </Wrapper>
    );
  };

  // Waypoints without pre-loaded coordinates – will trigger navaid search
  const mockWaypoints: WaypointWithCoords[] = [
    { ident: 'LFPG' },
    { ident: 'BOBIG' },
    { ident: 'KJFK' },
  ];

  // Waypoints with pre-loaded coordinates – no navaid search needed
  const mockWaypointsWithCoords: WaypointWithCoords[] = [
    { ident: 'LFPG', lat: 49.0097, lon: 2.5479, type: 'airport', name: 'Paris CDG' },
    { ident: 'BOBIG', lat: 50.5, lon: 1.5, type: 'waypoint' },
    { ident: 'KJFK', lat: 40.6413, lon: -73.7781, type: 'airport', name: 'New York JFK' },
  ];

  describe('Waypoint Rendering', () => {
    it('should render waypoints when coordinates are found via navaid search', async () => {
      const mockNavaids: Navaid[] = [
        { ident: 'LFPG', lat: 49.0097, lon: 2.5479, type: 'airport', name: 'Paris CDG' },
        { ident: 'BOBIG', lat: 50.5, lon: 1.5, type: 'waypoint' },
        { ident: 'KJFK', lat: 40.6413, lon: -73.7781, type: 'airport', name: 'New York JFK' },
      ];

      (fetch as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce({ ok: true, json: async () => [mockNavaids[0]] } as Response)
        .mockResolvedValueOnce({ ok: true, json: async () => [mockNavaids[1]] } as Response)
        .mockResolvedValueOnce({ ok: true, json: async () => [mockNavaids[2]] } as Response);

      const { container } = renderWithMap(<WaypointMarkers waypoints={mockWaypoints} />);

      await waitFor(() => {
        const circles = container.querySelectorAll('path.leaflet-interactive');
        expect(circles.length).toBeGreaterThan(0);
      }, { timeout: 3000 });
    });

    it('should render waypoints immediately when coordinates are pre-loaded (no navaid search)', async () => {
      const { container } = renderWithMap(<WaypointMarkers waypoints={mockWaypointsWithCoords} />);

      await waitFor(() => {
        const circles = container.querySelectorAll('path.leaflet-interactive');
        expect(circles.length).toBe(3);
      }, { timeout: 3000 });

      // No navaid HTTP requests should have been made
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should not render when waypoints array is empty', () => {
      const { container } = renderWithMap(<WaypointMarkers waypoints={[]} />);

      const circles = container.querySelectorAll('path.leaflet-interactive');
      expect(circles.length).toBe(0);
    });

    it('should fetch navaid data for each waypoint', async () => {
      const mockNavaid: Navaid = {
        ident: 'LFPG',
        lat: 49.0097,
        lon: 2.5479,
        type: 'airport',
      };

      (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: async () => [mockNavaid],
      } as Response);

      renderWithMap(<WaypointMarkers waypoints={[{ ident: 'LFPG' }]} />);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          '/api/flightplan/search/nav?q=LFPG',
          expect.objectContaining({
            method: 'GET',
          })
        );
      });
    });
  });

  describe('Error Handling', () => {
    it('should not render waypoint when navaid search fails', async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ error: 'Not found' }),
      } as Response);

      const { container } = renderWithMap(<WaypointMarkers waypoints={[{ ident: 'INVALID' }]} />);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalled();
      });

      // Should not render circle marker when search fails
      const circles = container.querySelectorAll('path.leaflet-interactive');
      expect(circles.length).toBe(0);
    });

    it('should handle network errors gracefully', async () => {
      (fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'));

      const { container } = renderWithMap(<WaypointMarkers waypoints={[{ ident: 'LFPG' }]} />);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalled();
      });

      const circles = container.querySelectorAll('path.leaflet-interactive');
      expect(circles.length).toBe(0);
    });

    it('should render waypoint when lat or lon is 0 (valid coordinate)', async () => {
      const mockNavaid: Navaid = {
        ident: 'NULL',
        lat: 0,
        lon: 0,
        type: 'waypoint',
      };

      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => [mockNavaid],
      });

      const { container } = renderWithMap(<WaypointMarkers waypoints={[{ ident: 'NULL' }]} />);

      await waitFor(() => {
        const circles = container.querySelectorAll('path.leaflet-interactive');
        expect(circles.length).toBe(1);
      });
    });
  });

  describe('Waypoint Styling', () => {
    it('should render waypoints with correct color and style', async () => {
      const mockNavaid: Navaid = {
        ident: 'LFPG',
        lat: 49.0097,
        lon: 2.5479,
        type: 'airport',
      };

      (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: async () => [mockNavaid],
      } as Response);

      const { container } = renderWithMap(<WaypointMarkers waypoints={[{ ident: 'LFPG' }]} />);

      await waitFor(() => {
        const circles = container.querySelectorAll('path.leaflet-interactive');
        expect(circles.length).toBeGreaterThan(0);
        
        const circle = circles[0] as SVGPathElement;
        expect(circle).toHaveAttribute('stroke', '#ab0000');
        expect(circle).toHaveAttribute('fill', '#bb5555');
      });
    });

    it('should apply correct style to pre-loaded coordinate waypoints', async () => {
      const { container } = renderWithMap(
        <WaypointMarkers waypoints={[{ ident: 'LFPG', lat: 49.0097, lon: 2.5479 }]} />
      );

      await waitFor(() => {
        const circles = container.querySelectorAll('path.leaflet-interactive');
        expect(circles.length).toBe(1);

        const circle = circles[0] as SVGPathElement;
        expect(circle).toHaveAttribute('stroke', '#ab0000');
        expect(circle).toHaveAttribute('fill', '#bb5555');
      });

      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe('Multiple Waypoints', () => {
    it('should render multiple waypoints via navaid search', async () => {
      const mockNavaid: Navaid = {
        ident: 'TEST',
        lat: 48.0,
        lon: 2.0,
        type: 'waypoint',
      };

      (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: async () => [mockNavaid],
      } as Response);

      const { container } = renderWithMap(
        <WaypointMarkers waypoints={[{ ident: 'WPT1' }, { ident: 'WPT2' }]} />
      );

      await waitFor(() => {
        const circles = container.querySelectorAll('path.leaflet-interactive');
        expect(circles.length).toBe(2);
      }, { timeout: 3000 });
    });

    it('should render multiple pre-loaded coordinate waypoints without any navaid search', async () => {
      const { container } = renderWithMap(<WaypointMarkers waypoints={mockWaypointsWithCoords} />);

      await waitFor(() => {
        const circles = container.querySelectorAll('path.leaflet-interactive');
        expect(circles.length).toBe(3);
      }, { timeout: 3000 });

      expect(fetch).not.toHaveBeenCalled();
    });
  });
});
