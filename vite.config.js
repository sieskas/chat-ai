import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
      react(),
    tailwindcss(),
  ],
    server: {
        watch: {
            // Ignorer les fichiers de base de données SQLite
            ignored: [
                '**/backend/**',
                '**/*.db',
                '**/*.db-*',
                '**/*.sqlite',
                '**/*.sqlite-*'
            ]
        }
    }
})
