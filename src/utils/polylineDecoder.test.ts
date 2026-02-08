import { describe, it, expect } from 'vitest';
import { decodePolyline } from './polylineDecoder';

describe('polylineDecoder', () => {
  it('should decode a simple polyline', () => {
    // Encoded polyline for coordinates: [[38.5, -120.2], [40.7, -120.95], [43.252, -126.453]]
    const encoded = '_p~iF~ps|U_ulLnnqC_mqNvxq`@';
    
    const result = decodePolyline(encoded);

    expect(result.coordinates).toHaveLength(3);
    expect(result.coordinates[0]).toEqual([38.5, -120.2]);
    expect(result.coordinates[1]).toEqual([40.7, -120.95]);
    expect(result.coordinates[2]).toEqual([43.252, -126.453]);
  });

  it('should calculate correct bounds for a polyline', () => {
    const encoded = '_p~iF~ps|U_ulLnnqC_mqNvxq`@';
    
    const result = decodePolyline(encoded);

    expect(result.bounds.north).toBe(43.252);
    expect(result.bounds.south).toBe(38.5);
    expect(result.bounds.east).toBe(-120.2);
    expect(result.bounds.west).toBe(-126.453);
  });

  it('should handle a single point polyline', () => {
    // Encoded single point
    const encoded = 'wfp~FdkbtM';
    
    const result = decodePolyline(encoded);

    expect(result.coordinates).toHaveLength(1);
    // Check that we have a valid coordinate
    expect(result.coordinates[0]).toHaveLength(2);
    expect(typeof result.coordinates[0][0]).toBe('number');
    expect(typeof result.coordinates[0][1]).toBe('number');
    
    // Bounds should be the same for a single point
    expect(result.bounds.north).toBe(result.bounds.south);
    expect(result.bounds.east).toBe(result.bounds.west);
  });

  it('should handle transatlantic route (LFPG to KJFK)', () => {
    // Simplified transatlantic route
    // Paris CDG (49.0097, 2.5479) to New York JFK (40.6413, -73.7781)
    const encoded = 'kqgiHycy@~gkNfuwjB';
    
    const result = decodePolyline(encoded);

    expect(result.coordinates).toHaveLength(2);
    
    // Check that we have coordinates on both sides of the Atlantic
    const lats = result.coordinates.map(([lat]) => lat);
    const lngs = result.coordinates.map(([, lng]) => lng);
    
    expect(Math.max(...lats)).toBeGreaterThan(40);
    expect(Math.min(...lats)).toBeLessThan(50);
    expect(Math.max(...lngs)).toBeGreaterThan(0); // Europe (positive)
    expect(Math.min(...lngs)).toBeLessThan(0); // America (negative)
  });

  it('should handle empty polyline gracefully', () => {
    const encoded = '';
    
    const result = decodePolyline(encoded);

    expect(result.coordinates).toHaveLength(0);
    // With no coordinates, bounds should be -Infinity/Infinity
    expect(result.bounds.north).toBe(-Infinity);
    expect(result.bounds.south).toBe(Infinity);
    expect(result.bounds.east).toBe(-Infinity);
    expect(result.bounds.west).toBe(Infinity);
  });

  it('should handle complex multi-point route', () => {
    // Route with 5 points forming a rectangular path
    const encoded = 'gfo}EtohhU_c@ssC_c@~rC~b@~rC~b@ssC';
    
    const result = decodePolyline(encoded);

    expect(result.coordinates.length).toBeGreaterThan(1);
    
    // Verify bounds are calculated correctly
    const { north, south, east, west } = result.bounds;
    
    expect(north).toBeGreaterThan(south);
    expect(east).toBeGreaterThan(west);
    
    // All coordinates should be within bounds
    result.coordinates.forEach(([lat, lng]) => {
      expect(lat).toBeLessThanOrEqual(north);
      expect(lat).toBeGreaterThanOrEqual(south);
      expect(lng).toBeLessThanOrEqual(east);
      expect(lng).toBeGreaterThanOrEqual(west);
    });
  });

  it('should return LatLngTuple format compatible with Leaflet', () => {
    const encoded = '_p~iF~ps|U';
    
    const result = decodePolyline(encoded);

    // Should be array of [lat, lng] tuples
    expect(Array.isArray(result.coordinates)).toBe(true);
    
    result.coordinates.forEach(coord => {
      expect(Array.isArray(coord)).toBe(true);
      expect(coord).toHaveLength(2);
      expect(typeof coord[0]).toBe('number'); // lat
      expect(typeof coord[1]).toBe('number'); // lng
    });
  });

  it('should handle precision correctly', () => {
    // Test with high-precision encoded polyline
    const encoded = 'gfo}EtohhU_c@ssC';
    
    const result = decodePolyline(encoded);

    // Coordinates should be precise to multiple decimal places
    result.coordinates.forEach(([lat, lng]) => {
      expect(lat.toString()).toMatch(/\d+\.\d{2,}/); // At least 2 decimal places
      expect(lng.toString()).toMatch(/\d+\.\d{2,}/);
    });
  });
});
