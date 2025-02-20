import { defineConfig } from 'vite'

export default defineConfig({
  base: '/',  // Alterado para usar a raiz como base
  server: {
    port: 3090,
    host: '0.0.0.0'
  },
  preview: {
    port: 3090,
    host: '0.0.0.0',
    allowedHosts: ['max-cmdca-web.uvxtdw.easypanel.host']
  },
  build: {
    rollupOptions: {
      input: {
        main: '/index.html',
        dashboard: '/dashboard/dashboard.html'
      }
    },
    assetsInclude: ['**/*.html'] // Isso garante que arquivos HTML sejam incluídos como assets
  }
})
