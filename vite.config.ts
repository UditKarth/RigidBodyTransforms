import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
// For root deployment (user site): VITE_BASE=/
// For project site: VITE_BASE=./ or /RigidBodyTransforms/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: process.env.VITE_BASE ?? './',
})
