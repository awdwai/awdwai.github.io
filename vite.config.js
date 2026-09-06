import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// User site: https://awdwai.github.io/
export default defineConfig({
  plugins: [react()],
  base: '/',
})
