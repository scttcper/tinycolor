import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  server: {
    watch: {
      ignored: ['**/dist/**'],
    },
  },
  test: {
    experimental: {
      viteModuleRunner: false,
    },
    globalSetup: ['./benchmarks/setup.ts'],
    forceRerunTriggers: [
      ...configDefaults.forceRerunTriggers,
      '**/src/**',
      '**/build.ts',
      '**/tsconfig*.json',
    ],
  },
});
