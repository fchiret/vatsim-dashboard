import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AircraftProvider } from './contexts/AircraftContext';
import type { ReactNode } from 'react';

/**
 * Creates a fresh QueryClient for testing
 * Prevents cache pollution between tests
 */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
}

/**
 * Renders a component with QueryClient provider
 */
export function renderWithQueryClient(
  ui: React.ReactElement,
  queryClient = createTestQueryClient()
) {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return {
    ...render(ui, { wrapper: Wrapper }),
    queryClient,
  };
}

/**
 * Renders a component with QueryClient and AircraftContext providers
 */
export function renderWithProviders(
  ui: React.ReactElement,
  queryClient = createTestQueryClient()
) {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <AircraftProvider>{children}</AircraftProvider>
    </QueryClientProvider>
  );

  return {
    ...render(ui, { wrapper: Wrapper }),
    queryClient,
  };
}

/**
 * Creates a wrapper component for renderHook with QueryClient
 */
export function createQueryClientWrapper(queryClient = createTestQueryClient()) {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

/**
 * Creates a wrapper component for renderHook with QueryClient and AircraftContext
 */
export function createProvidersWrapper(queryClient = createTestQueryClient()) {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <AircraftProvider>{children}</AircraftProvider>
    </QueryClientProvider>
  );
}
