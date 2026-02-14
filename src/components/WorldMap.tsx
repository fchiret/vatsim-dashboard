import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import { useVatsimData } from '../hooks/useVatsimData';
import type { Pilot, PilotRating } from '../hooks/useVatsimData';
import { useFlightPlanDecode, parseWaypointsFromNotes } from '../hooks/useFlightPlanDecode';
import { FlightRoute } from './FlightRoute';
import { WaypointMarkers } from './WaypointMarkers';
import { generatePilotPopupContent } from '../utils/pilotPopupContent';
import { useAircraft } from '../contexts/AircraftContext';
import './WorldMap.css';

// Extend Leaflet marker options to include our custom isSelected flag
interface SelectedMarkerOptions extends L.MarkerOptions {
  isSelected: boolean;
}

// Create custom icon using SVG from public folder
const createPilotIcon = (heading: number = 0, isSelected: boolean = false) => {
  const iconSvg = isSelected ? '/marker-icon-selected.svg' : '/marker-icon.svg';
  return L.divIcon({
    html: `<div class="pilot-marker" style="transform: rotate(${heading}deg)">
      <img src="${iconSvg}" alt="pilot" width="32" height="32" />
    </div>`,
    className: 'pilot-marker-container',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

function MapContent({ pilots, pilotRatings }: { pilots: Pilot[]; pilotRatings?: PilotRating[] }) {
  const map = useMap();
  const markerClusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);
  const { selectedAircraft, visibleRoutes, toggleRoute } = useAircraft();

  // Handle route toggle in popups - synchronize checkbox state and prevent popup close
  useEffect(() => {
    if (!map) return;

    const handlePopupOpen = (e: L.PopupEvent) => {
      const popup = e.popup;
      const popupContent = popup.getElement();
      
      if (!popupContent) return;

      const toggleInput = popupContent.querySelector('.toggle-route-btn') as HTMLInputElement;
      if (!toggleInput) return;

      // Synchronize checkbox state with visibleRoutes
      const callsign = toggleInput.dataset.callsign;
      if (callsign) {
        toggleInput.checked = visibleRoutes.has(callsign);
      }

      const handleChange = () => {
        if (callsign) {
          toggleRoute(callsign);
        }
      };

      const handleClick = (evt: Event) => {
        evt.stopPropagation();
      };

      // Attach listeners to prevent popup close
      toggleInput.addEventListener('change', handleChange);
      toggleInput.addEventListener('click', handleClick);
      
      const label = popupContent.querySelector(`label[for="${toggleInput.id}"]`);
      if (label) {
        label.addEventListener('click', handleClick);
      }

      // Cleanup when popup closes
      popup.on('remove', () => {
        toggleInput.removeEventListener('change', handleChange);
        toggleInput.removeEventListener('click', handleClick);
        if (label) {
          label.removeEventListener('click', handleClick);
        }
      });
    };

    map.on('popupopen', handlePopupOpen);
    
    return () => {
      map.off('popupopen', handlePopupOpen);
    };
  }, [map, toggleRoute, visibleRoutes]);

  useEffect(() => {
    if (!map || !pilots.length) return;

    // Create cluster group only once
    if (!markerClusterGroupRef.current) {
      markerClusterGroupRef.current = (L as unknown as { markerClusterGroup: (options: Record<string, unknown>) => L.MarkerClusterGroup }).markerClusterGroup({
        disableClusteringAtZoom: 13,
        maxClusterRadius: 80,
        iconCreateFunction: (cluster: L.MarkerCluster) => {
          const markers = cluster.getAllChildMarkers();
          const hasSelected = markers.some((marker: L.Marker<SelectedMarkerOptions>) => 
            (marker.options as SelectedMarkerOptions).isSelected
          );
          const count = markers.length;
          
          // Determine cluster size class based on count
          let sizeClass = 'marker-cluster-small';
          if (count >= 100) {
            sizeClass = 'marker-cluster-large';
          } else if (count >= 10) {
            sizeClass = 'marker-cluster-medium';
          }
          
          const className = hasSelected 
            ? `marker-cluster ${sizeClass} marker-cluster-selected` 
            : `marker-cluster ${sizeClass}`;
          
          return L.divIcon({
            html: `<div><span>${count}</span></div>`,
            className: className,
            iconSize: L.point(40, 40),
          });
        },
      });
      map.addLayer(markerClusterGroupRef.current as L.Layer);
    }

    // Clear previous markers
    const group = markerClusterGroupRef.current;
    if (!group) return;
    group.clearLayers();

    // Add markers to cluster group
    pilots.forEach((pilot) => {
      // Ensure isSelected is always a strict boolean
      const isSelected = selectedAircraft != null && pilot.flight_plan?.aircraft_short === selectedAircraft;
      const marker = L.marker<SelectedMarkerOptions>([pilot.latitude, pilot.longitude], {
        icon: createPilotIcon(pilot.heading || 0, isSelected),
        isSelected: isSelected,
      } as SelectedMarkerOptions);

      marker.bindPopup(generatePilotPopupContent(pilot, pilotRatings));
      group.addLayer(marker);
    });
  }, [pilots, map, selectedAircraft, pilotRatings]);

  return null;
}

function RouteDisplay({ pilots }: { pilots: Pilot[] }) {
  const { visibleRoutes } = useAircraft();
  
  return (
    <>
      {pilots.map((pilot) => {
        if (!visibleRoutes.has(pilot.callsign) || !pilot.flight_plan?.route) {
          return null;
        }
        
        const fullRoute = `${pilot.flight_plan.departure || ''} ${pilot.flight_plan.route} ${pilot.flight_plan.arrival || ''}`.trim();
        
        return (
          <RouteRenderer 
            key={pilot.callsign}
            route={fullRoute}
          />
        );
      })}
    </>
  );
}

function RouteRenderer({ route }: { route: string }) {
  const { data: flightPlan } = useFlightPlanDecode({ route });
  
  if (!flightPlan?.encodedPolyline) {
    return null;
  }
  
  // Parse waypoints from notes
  const waypoints = parseWaypointsFromNotes(flightPlan.notes);
  
  return (
    <>
      <FlightRoute 
        flightPlan={flightPlan}
        color="#e74c3c"
        fitBounds={false}
      />
      {waypoints.length > 0 && (
        <WaypointMarkers waypoints={waypoints} />
      )}
    </>
  );
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
      // Notify other components that pilots data has been updated
      window.dispatchEvent(new Event('vatsim-pilots-updated'));
    }
  }, [data?.pilots]);

  if (error) {
    console.error('Error fetching VATSIM data:', error);
  }

  return (
    <MapContainer
      center={defaultCenter}
      zoom={defaultZoom}
      scrollWheelZoom={false}
      style={{ height: '100vh', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapContent pilots={pilots} pilotRatings={data?.pilot_ratings} />
      <RouteDisplay pilots={pilots} />
      <MapSetView center={center} zoom={zoom} />
      {isInitialized && <MapSaveState updateTimestamp={updateTimestamp} />}
    </MapContainer>
  )
}
