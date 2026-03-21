import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WorldMap } from './components/WorldMap';
import { PilotList } from './components/PilotList';
import Footer from './components/Footer';
import { AircraftProvider } from './contexts/AircraftContext';
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AircraftProvider>
        <div className="flex-grow-1 position-relative">
          <Footer />
          <WorldMap />
        </div>
        <PilotList />
      </AircraftProvider>
    </QueryClientProvider>
  );
}

export default App;
