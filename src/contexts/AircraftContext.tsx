import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface AircraftContextType {
  selectedAircraft: string | null;
  setSelectedAircraft: (aircraft: string | null) => void;
  aircraftList: string[];
}

const AircraftContext = createContext<AircraftContextType | undefined>(undefined);

export function AircraftProvider({ children }: { children: ReactNode }) {
  const [selectedAircraft, setSelectedAircraft] = useState<string | null>(null);
  const [aircraftList, setAircraftList] = useState<string[]>([]);

  useEffect(() => {
    const updateAircraftList = () => {
      const storedPilots = localStorage.getItem('vatsim_pilots');
      if (storedPilots) {
        try {
          const pilots = JSON.parse(storedPilots);
          const aircrafts = new Set<string>();
          pilots.forEach((pilot: any) => {
            if (pilot.flight_plan?.aircraft_short) {
              aircrafts.add(pilot.flight_plan.aircraft_short);
            }
          });
          setAircraftList(Array.from(aircrafts).sort());
        } catch (error) {
          console.error('Error parsing localStorage pilots:', error);
        }
      }
    };

    // Update on mount
    updateAircraftList();

    // Listen to custom event for immediate updates
    const handlePilotsUpdate = () => updateAircraftList();
    window.addEventListener('vatsim-pilots-updated', handlePilotsUpdate);

    // Also poll periodically as fallback
    const interval = setInterval(updateAircraftList, 60000);
    
    return () => {
      window.removeEventListener('vatsim-pilots-updated', handlePilotsUpdate);
      clearInterval(interval);
    };
  }, []);

  return (
    <AircraftContext.Provider value={{ selectedAircraft, setSelectedAircraft, aircraftList }}>
      {children}
    </AircraftContext.Provider>
  );
}

export function useAircraft() {
  const context = useContext(AircraftContext);
  if (context === undefined) {
    throw new Error('useAircraft must be used within an AircraftProvider');
  }
  return context;
}
