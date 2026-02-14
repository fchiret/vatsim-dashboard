import { useQuery } from '@tanstack/react-query';

export interface Navaid {
  ident: string;
  lat: number;
  lon: number;
  type?: string;
  name?: string;
}

interface NavaidSearchParams {
  waypoint: string;
}

export function useNavaidSearch(params: NavaidSearchParams | null) {
  return useQuery<Navaid>({
    queryKey: ['navaidSearch', params?.waypoint],
    queryFn: async () => {
      if (!params?.waypoint) {
        throw new Error('Waypoint parameter is required');
      }

      // Utiliser le proxy Vite local (pas d'auth côté client, géré par le proxy)
      const response = await fetch(`/api/flightplan/search/nav?q=${encodeURIComponent(params.waypoint)}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/vnd.fpd.v1+json',
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(`Failed to search navaid: ${response.status} ${response.statusText}`, {
          cause: error,
        });
      }

      const data = await response.json();
      
      // L'API retourne un tableau de résultats, on prend le premier
      if (Array.isArray(data) && data.length > 0) {
        return {
          ident: data[0].ident,
          lat: data[0].lat,
          lon: data[0].lon,
          type: data[0].type,
          name: data[0].name,
        };
      }
      
      // Si aucun résultat, retourner null ou lever une erreur
      throw new Error(`No navaid found for waypoint: ${params.waypoint}`);
    },
    enabled: !!params?.waypoint, // Only run query if waypoint is provided
    staleTime: 24 * 60 * 60 * 1000, // Cache for 24 hours (navaids don't change often)
    retry: 1, // Only retry once on failure
    retryDelay: 500, // Wait 500ms before retrying
  });
}
