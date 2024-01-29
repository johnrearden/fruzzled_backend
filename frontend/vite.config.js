import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
})

// https://vitejs.dev/config/
// export default defineConfig({
//     plugins: [react()],
//     build: {
//       outDir: 'build',
//     },
//     server: {
//       proxy: {
//         // Proxying requests with a specific prefix (e.g., /api)
//         // Change '/api' to the path prefix you use for your API calls
//         '/api': {
//           target: 'http://localhost:8000/', // Target server
//           changeOrigin: false, // Needed for virtual hosted sites
//           rewrite: (path) => path.replace(/^\/api/, ''), // Rewrite the API prefix
//         },
//       },
//     },
//   });