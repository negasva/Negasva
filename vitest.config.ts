import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

// Resuelve el alias `@/` igual que tsconfig, para que los tests puedan importar
// módulos de la app.
export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('.', import.meta.url)) },
  },
});
