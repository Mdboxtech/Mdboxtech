import { defineConfig } from 'vite'

export default defineConfig({
  publicDir: 'public',
  server: {
    port: 5173,
    host: true,
    open: true
  }
})
