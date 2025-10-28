import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import path from 'path' // 1. Import the 'path' module

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  // 2. Add this 'resolve' section
  resolve: {
    alias: {
      'react': path.resolve(__dirname, './node_modules/react'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
    }
  }
})