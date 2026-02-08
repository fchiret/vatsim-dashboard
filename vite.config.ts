import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      port: 3000,
      proxy: {
        '/api/flightplan': {
          target: 'https://api.flightplandatabase.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/flightplan/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              // Ajouter l'authentification Basic Auth
              const apiKey = env.VITE_FLIGHTPLAN_DB_API_KEY;
              if (apiKey) {
                const credentials = Buffer.from(`${apiKey}:`).toString('base64');
                proxyReq.setHeader('Authorization', `Basic ${credentials}`);
              }
              proxyReq.setHeader('Accept', 'application/vnd.fpd.v1+json');
            });
          },
        },
      },
    },
  };
});
