import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Separate from vite.config.js on purpose: lib tests must NOT load the Base44
// Vite plugin (it pulls the SDK / browser runtime). Pure-node environment.
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["src/lib/__tests__/**/*.test.js"],
  },
});