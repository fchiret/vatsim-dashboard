import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useUniqueUsers } from '../hooks/useUniqueUsers';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

describe('useUniqueUsers', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should return cached unique users from localStorage', () => {
    localStorage.setItem('vatsim_unique_users', '2500');

    const { result } = renderHook(() => useUniqueUsers(), { wrapper });

    expect(typeof result.current.uniqueUsers).toBe('number');
  });

  it('should return 0 when no cached data available', () => {
    localStorage.clear();

    const { result } = renderHook(() => useUniqueUsers(), { wrapper });

    expect(result.current.uniqueUsers).toBe(0);
  });

  it('should handle invalid localStorage data', () => {
    localStorage.setItem('vatsim_unique_users', 'invalid');

    const { result } = renderHook(() => useUniqueUsers(), { wrapper });

    expect(result.current.uniqueUsers).toBe(0);
  });
});
