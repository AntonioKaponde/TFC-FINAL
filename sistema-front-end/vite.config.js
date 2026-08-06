import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Separa as bibliotecas de terceiros em chunks independentes (Rolldown
        // exige manualChunks como função). Assim o browser faz cache e só volta
        // a descarregar o que mudou, reduzindo o tempo de carregamento.
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('html2pdf')) return 'pdf';
          if (id.includes('chart.js') || id.includes('react-chartjs-2') || id.includes('react-google-charts')) return 'charts';
          if (id.includes('@mui') || id.includes('@emotion')) return 'mui';
          if (id.includes('react') || id.includes('react-router') || id.includes('scheduler')) return 'react';
          return 'vendor';
        },
      },
    },
  },
})
