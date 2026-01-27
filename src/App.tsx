import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WorldMap } from './components/WorldMap';
import Footer from './components/Footer';
import { AircraftProvider } from './contexts/AircraftContext';
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AircraftProvider>
        <Footer />
        <WorldMap />
      </AircraftProvider>
    </QueryClientProvider>
  );
}

export default App;
