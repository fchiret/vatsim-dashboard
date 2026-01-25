import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WorldMap } from './components/WorldMap';
import Footer from './components/Footer';
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Footer />
      <WorldMap />
    </QueryClientProvider>
  );
}

export default App;
