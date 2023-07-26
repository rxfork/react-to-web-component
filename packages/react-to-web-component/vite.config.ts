/// <reference types="vitest" />
import { defineConfig } from "vite"
import dts from "vite-plugin-dts"

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      filename: "react-to-web-component",
      entry: "src/react-to-web-component.ts",
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      external: ["react", "react-dom", "@rxfork/r2wc-core"],
    },
  },
  plugins: [dts()],
  test: {
    environment: "jsdom",
    restoreMocks: true,
    mockReset: true,
  },
})
