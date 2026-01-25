import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import { useVatsimData } from '../hooks/useVatsimData';
import markerIconSvg from '../../public/marker-icon.svg';
import './WorldMap.css';

interface Pilot {
  cid: number
  name: string
  callsign: string
  latitude: number
  longitude: number
  altitude: number
  groundspeed: number
  heading?: number
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
      markerClusterGroupRef.current = (L.markerClusterGroup as any)({
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

      const popupContent = `
        <div style="max-width: 500px; font-size: 12px;">
          <p><strong>Callsign:</strong> ${pilot.callsign}</p>
          <p><strong>Pilot:</strong> ${pilot.name}</p>
          <p><strong>Heading:</strong> ${pilot.heading || 'N/A'}°</p>
          <p><strong>Altitude:</strong> ${pilot.altitude} ft</p>
          <p><strong>Speed:</strong> ${pilot.groundspeed} kts</p>
          <p><strong>Position:</strong> ${pilot.latitude.toFixed(4)}, ${pilot.longitude.toFixed(4)}</p>
          ${
            (pilot as any).flight_plan
              ? `
            <hr />
            <p><strong>Aircraft:</strong> ${(pilot as any).flight_plan.aircraft}</p>
            <p><strong>Departure:</strong> ${(pilot as any).flight_plan.departure}</p>
            <p><strong>Arrival:</strong> ${(pilot as any).flight_plan.arrival}</p>
            <p><strong>Route:</strong> ${(pilot as any).flight_plan.route || 'N/A'}</p>
            <p><strong>Remarks:</strong> ${(pilot as any).flight_plan.remarks || 'N/A'}</p>
          `
              : ''
          }
        </div>
      `

      marker.bindPopup(popupContent);
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
  const [pilots, setPilots] = useState<Pilot[]>([]);
  const [center, setCenter] = useState<[number, number]>(defaultCenter);
  const [zoom, setZoom] = useState(defaultZoom);
  const [updateTimestamp, setUpdateTimestamp] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState(false);

  // Load map position and zoom from localStorage on component mount
  useEffect(() => {
    const savedMapState = localStorage.getItem('vatsim_map_state');
    if (savedMapState) {
      try {
        const { center: savedCenter, zoom: savedZoom, updateTimestamp: savedUpdateTimestamp } = JSON.parse(savedMapState);
        setCenter(savedCenter);
        setZoom(savedZoom);
        setUpdateTimestamp(savedUpdateTimestamp || '');
      } catch (error) {
        console.error('Error parsing saved map state:', error);
      }
    }
    setTimeout(() => setIsInitialized(true), 500);
  }, []);

  // Load pilots from localStorage on component mount
  useEffect(() => {
    const storedPilots = localStorage.getItem('vatsim_pilots');
    if (storedPilots) {
      try {
        setPilots(JSON.parse(storedPilots));
      } catch (error) {
        console.error('Error parsing localStorage pilots:', error);
      }
    }
  }, []);

  // Update pilots when data is fetched and save to localStorage
  useEffect(() => {
    if (data?.pilots && data.pilots.length > 0) {
      setPilots(data.pilots);
      localStorage.setItem('vatsim_pilots', JSON.stringify(data.pilots));
    }
  }, [data]);

  useEffect(() => {
    if (data?.general?.update_timestamp) {
      setUpdateTimestamp(data.general.update_timestamp);
    }
  }, [data]);

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
