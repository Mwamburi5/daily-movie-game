import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { SECURITY_HEADERS } from './security-headers.ts'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Bundle budgets and smoke tests consume Vite's authoritative chunk graph.
    manifest: true,
  },
  // Vercel reads vercel.json. Mirroring its exact values here lets the browser
  // suite exercise the production build under the same enforced headers.
  preview: {
    headers: SECURITY_HEADERS,
  },
})
