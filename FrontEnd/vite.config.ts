import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
 server: {
proxy: {
// Intercepts any request starting with /api
'/api': {
target: 'http://localhost:3000', // The backend server's address
changeOrigin: true,
secure: false,
}
}
}
  }
)
