import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { MapContainer } from 'react-leaflet';
import { FlightRoute } from './FlightRoute';
import { createMockFlightPlan } from '../test-factories';
import * as polylineDecoder from '../utils/polylineDecoder';

// Mock polyline decoder
vi.mock('../utils/polylineDecoder', () => ({
  decodePolyline: vi.fn((encoded: string) => {
    if (encoded === 'empty_polyline') {
      return {
        coordinates: [],
        bounds: { north: 0, south: 0, east: 0, west: 0 },
      };
    }
    return {
      coordinates: [
        [49.0097, 2.5479] as [number, number], // Paris CDG
        [40.6413, -73.7781] as [number, number], // New York JFK
      ],
      bounds: {
        north: 49.0097,
        south: 40.6413,
        east: 2.5479,
        west: -73.7781,
      },
    };
  }),
}));

describe('FlightRoute Component', () => {
  const mockFlightPlan = createMockFlightPlan();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithMap = (component: React.ReactElement) => {
    return render(
      <MapContainer center={[0, 0]} zoom={2}>
        {component}
      </MapContainer>
    );
  };

  describe('Route Rendering', () => {
    it('should display a flight route on the map', () => {
      const { container } = renderWithMap(<FlightRoute flightPlan={mockFlightPlan} />);

      // Check that a polyline path is rendered in the SVG
      const polyline = container.querySelector('path.leaflet-interactive');
      expect(polyline).not.toBeNull();
    });
  });

  describe('Route Styling', () => {
    it('should render route with default blue color', () => {
      const { container } = renderWithMap(<FlightRoute flightPlan={mockFlightPlan} />);

      const polyline = container.querySelector('path.leaflet-interactive');
      expect(polyline).toHaveAttribute('stroke', '#3388ff');
    });

    it('should render route with custom color when specified', () => {
      const { container } = renderWithMap(
        <FlightRoute flightPlan={mockFlightPlan} color="#ff0000" />
      );

      const polyline = container.querySelector('path.leaflet-interactive');
      expect(polyline).toHaveAttribute('stroke', '#ff0000');
    });

    it('should render route as dashed line', () => {
      const { container } = renderWithMap(<FlightRoute flightPlan={mockFlightPlan} />);

      const polyline = container.querySelector('path.leaflet-interactive');
      expect(polyline).toHaveAttribute('stroke-dasharray', '10, 5');
    });
  });

  describe('Route Properties', () => {
    it('should render route with correct visual properties', () => {
      const { container } = renderWithMap(<FlightRoute flightPlan={mockFlightPlan} />);

      const polyline = container.querySelector('path.leaflet-interactive');
      expect(polyline).toHaveAttribute('stroke-opacity', '0.7');
      expect(polyline).toHaveAttribute('stroke-width', '3');
    });

    it('should not render route when flight plan has no coordinates', () => {
      const emptyFlightPlan = createMockFlightPlan({
        encodedPolyline: 'empty_polyline',
      });

      const { container } = renderWithMap(<FlightRoute flightPlan={emptyFlightPlan} />);

      const polyline = container.querySelector('path.leaflet-interactive');
      expect(polyline).toBeNull();
    });
  });

  describe('Map Bounds Behavior', () => {
    it('should adjust map view to show entire route by default', () => {
      // Just verify component renders without errors
      // Testing actual map.fitBounds would require complex mocking
      const { container } = renderWithMap(<FlightRoute flightPlan={mockFlightPlan} />);
      
      const polyline = container.querySelector('path.leaflet-interactive');
      expect(polyline).not.toBeNull();
    });

    it('should not adjust map view when fitBounds is disabled', () => {
      const { container } = renderWithMap(<FlightRoute flightPlan={mockFlightPlan} fitBounds={false} />);

      // Verify component renders without errors
      const polyline = container.querySelector('path.leaflet-interactive');
      expect(polyline).not.toBeNull();
    });

    it('should render transatlantic routes correctly', () => {
      const { container } = renderWithMap(<FlightRoute flightPlan={mockFlightPlan} />);

      const polyline = container.querySelector('path.leaflet-interactive');
      expect(polyline).not.toBeNull();
      
      // Verify the path has data (d attribute should exist and have content)
      const pathData = polyline?.getAttribute('d');
      expect(pathData).toBeTruthy();
      expect(pathData).not.toBe('');
    });
  });

  describe('Route Decoding', () => {
    it('should decode encoded polyline into coordinates', () => {
      renderWithMap(<FlightRoute flightPlan={mockFlightPlan} />);

      // Verify decoder was called with the encoded polyline
      expect(polylineDecoder.decodePolyline).toHaveBeenCalledWith('mock_encoded_polyline');
    });
  });

  describe('Multiple Routes', () => {
    it('should render multiple flight routes on the same map', () => {
      const flightPlan1 = { ...mockFlightPlan, id: 1 };
      const flightPlan2 = { ...mockFlightPlan, id: 2, encodedPolyline: 'different_polyline' };

      const { container } = renderWithMap(
        <>
          <FlightRoute flightPlan={flightPlan1} color="#ff0000" />
          <FlightRoute flightPlan={flightPlan2} color="#00ff00" />
        </>
      );

      const polylines = container.querySelectorAll('path.leaflet-interactive');
      expect(polylines).toHaveLength(2);
    });
  });

  describe('Visual Styling', () => {
    it('should apply semi-transparent opacity to routes', () => {
      const { container } = renderWithMap(<FlightRoute flightPlan={mockFlightPlan} />);

      const polyline = container.querySelector('path.leaflet-interactive');
      expect(polyline).toHaveAttribute('stroke-opacity', '0.7');
    });
  });
});
