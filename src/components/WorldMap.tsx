import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import { useVatsimData } from '../hooks/useVatsimData';
import markerIconSvg from '../../public/marker-icon.svg';
import { generatePilotPopupContent } from '../utils/pilotPopupContent';
import './WorldMap.css';

interface FlightPlan {
  aircraft?: string;
  departure?: string;
  arrival?: string;
  route?: string;
  remarks?: string;
}

interface Pilot {
  cid: number
  name: string
  callsign: string
  latitude: number
  longitude: number
  altitude: number
  groundspeed: number
  heading?: number
  flight_plan?: FlightPlan
}

// Create custom icon using SVG from public folder
const createPilotIcon = (heading: number = 0) => {
  return L.divIcon({
    html: `<div class="pilot-marker" style="transform: rotate(${heading}deg)">
      <img src="${markerIconSvg}" alt="pilot" width="32" height="32" />
    </div>`,
    className: 'pilot-marker-container',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

function MapContent({ pilots }: { pilots: Pilot[] }) {
  const map = useMap();
  const markerClusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);

  useEffect(() => {
    if (!map || !pilots.length) return;

    // Create cluster group only once
    if (!markerClusterGroupRef.current) {
      markerClusterGroupRef.current = (L as unknown as { markerClusterGroup: (options: Record<string, unknown>) => L.MarkerClusterGroup }).markerClusterGroup({
        disableClusteringAtZoom: 13,
        maxClusterRadius: 80,
      });
      map.addLayer(markerClusterGroupRef.current as L.Layer);
    }

    // Clear previous markers
    const group = markerClusterGroupRef.current;
    if (!group) return;
    group.clearLayers();

    // Add markers to cluster group
    pilots.forEach((pilot) => {
      const marker = L.marker([pilot.latitude, pilot.longitude], {
        icon: createPilotIcon(pilot.heading || 0),
      });

      marker.bindPopup(generatePilotPopupContent(pilot));
      group.addLayer(marker);
    });
  }, [pilots, map]);

  return null;
}

function MapSetView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !center || center.length !== 2 || !Number.isFinite(zoom)) return;
    
    if (Number.isFinite(center[0]) && Number.isFinite(center[1])) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);

  return null;
}

function MapSaveState({ updateTimestamp }: { updateTimestamp: string }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const handleMapChange = () => {
      const mapCenter = map.getCenter();
      const mapZoom = map.getZoom();
      const mapState = {
        center: [mapCenter.lat, mapCenter.lng],
        zoom: mapZoom,
        updateTimestamp: updateTimestamp,
      };
      localStorage.setItem('vatsim_map_state', JSON.stringify(mapState));
    };

    map.on('moveend', handleMapChange);
    map.on('zoomend', handleMapChange);

    return () => {
      map.off('moveend', handleMapChange);
      map.off('zoomend', handleMapChange);
    };
  }, [map, updateTimestamp]);

  return null;
}

export function WorldMap() {
  const defaultCenter: [number, number] = [20, 0];
  const defaultZoom = 2;
  const { data, error } = useVatsimData();
  
  // Initialize state from localStorage using initializer functions
  const storedPilotsInit = (() => {
    const storedPilots = localStorage.getItem('vatsim_pilots');
    if (storedPilots) {
      try {
        return JSON.parse(storedPilots);
      } catch (error) {
        console.error('Error parsing localStorage pilots:', error);
      }
    }
    return [];
  })();
  
  // Use pilots directly from data when available, otherwise use cached ones
  const pilots = data?.pilots && data.pilots.length > 0 ? data.pilots : storedPilotsInit;
  
  const center = (() => {
    const savedMapState = localStorage.getItem('vatsim_map_state');
    if (savedMapState) {
      try {
        const { center: savedCenter } = JSON.parse(savedMapState);
        return savedCenter;
      } catch (error) {
        console.error('Error parsing saved map state:', error);
      }
    }
    return defaultCenter;
  })();
  
  const zoom = (() => {
    const savedMapState = localStorage.getItem('vatsim_map_state');
    if (savedMapState) {
      try {
        const { zoom: savedZoom } = JSON.parse(savedMapState);
        return savedZoom;
      } catch (error) {
        console.error('Error parsing saved map state:', error);
      }
    }
    return defaultZoom;
  })();
  
  const updateTimestamp = (() => {
    const savedMapState = localStorage.getItem('vatsim_map_state');
    if (savedMapState) {
      try {
        const { updateTimestamp: savedUpdateTimestamp } = JSON.parse(savedMapState);
        return savedUpdateTimestamp || '';
      } catch (error) {
        console.error('Error parsing saved map state:', error);
      }
    }
    return data?.general?.update_timestamp || '';
  })();
  
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize after mount
  useEffect(() => {
    setTimeout(() => setIsInitialized(true), 500);
  }, []);

  // Save pilots to localStorage when data is fetched
  useEffect(() => {
    if (data?.pilots && data.pilots.length > 0) {
      localStorage.setItem('vatsim_pilots', JSON.stringify(data.pilots));
    }
  }, [data?.pilots]);

  if (error) {
    console.error('Error fetching VATSIM data:', error);
  }

  return (
    <MapContainer
      center={defaultCenter}
      zoom={defaultZoom}
      style={{ height: '100vh', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapContent pilots={pilots} />
      <MapSetView center={center} zoom={zoom} />
      {isInitialized && <MapSaveState updateTimestamp={updateTimestamp} />}
    </MapContainer>
  )
}
