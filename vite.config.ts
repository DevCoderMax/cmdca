import { defineConfig } from 'vite'

export default defineConfig({
  base: './',  // Isso fará com que o Vite use caminhos relativos
  server: {
    port: 3090,
    host: '0.0.0.0'
  },
  preview: {
    port: 3090,
    host: '0.0.0.0'
  }
})
