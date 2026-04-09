import { defineConfig } from 'tsup'

export default defineConfig({
  entry: { server: 'src/infra/http/server.ts' },
  outDir: 'dist',
  format: ['esm'],
  target: 'node20',
  clean: true,
  sourcemap: true,
})
