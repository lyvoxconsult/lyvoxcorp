import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      reporter: ['text', 'json', 'html'],
      thresholds: {
        branches: 80,
        lines: 80,
      },
    },
    environment: 'node',
    fileParallelism: false,
    maxWorkers: 1,
    include: ['src/**/*.test.ts'],
  },
});
