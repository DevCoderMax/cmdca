import { defineConfig } from 'vite'

export default defineConfig({
  base: './',  // Isso fará com que o Vite use caminhos relativos
  server: {
    port: 3000
  },
  preview: {
    port: 3000
  }
})
