import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GN-08: the API allows this origin (Cors:ClientUrl = http://localhost:5173)
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, strictPort: true },
})
