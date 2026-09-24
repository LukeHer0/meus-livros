import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { reviewsPlugin } from './server/reviews.js'

export default defineConfig({
  plugins: [vue(), reviewsPlugin(fileURLToPath(new URL('./public', import.meta.url)))],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
