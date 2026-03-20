import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  envPrefix: 'HYDRA_',

  server: {
    port: 5173,
    proxy: {

      // Proxies /auth/* → https://identity.hydra.africa/*
      // e.g. /auth/connect/token → https://identity.hydra.africa/connect/token
      '/auth': {
        target:      'https://identity.hydra.africa',
        changeOrigin: true,
        secure:       true,
        rewrite:      path => path.replace(/^\/auth/, ''),
      },

      // Proxies /api/* → https://hydra-api.azurewebsites.net/*
      // e.g. /api/Sensor/exportAggregatedNumbers → https://hydra-api.azurewebsites.net/Sensor/exportAggregatedNumbers
      '/api': {
        target:      'https://hydra-api.azurewebsites.net',
        changeOrigin: true,
        secure:       true,
        rewrite:      path => path.replace(/^\/api/, ''),
      },
    },
  },
})
