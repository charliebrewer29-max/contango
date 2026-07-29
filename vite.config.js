import base44 from "@base44/vite-plugin"
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    base44({
      // Support for legacy code that imports the base44 SDK with @/integrations, @/entities, etc.
      // can be removed if the code has been updated to use the new SDK imports from @base44/sdk
      legacySDKImports: process.env.BASE44_LEGACY_SDK_IMPORTS === 'true',
      hmrNotifier: true,
      navigationNotifier: true,
      analyticsTracker: true,
      visualEditAgent: true
    }),
    react(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (/[\\/]node_modules[\\/]react-router-dom[\\/]/.test(id)) return "vendor-react";
          if (/[\\/]node_modules[\\/](react|react-dom)[\\/]/.test(id)) return "vendor-react";
          if (/[\\/]node_modules[\\/]recharts[\\/]/.test(id)) return "vendor-charts";
          if (/[\\/]node_modules[\\/]@radix-ui[\\/]/.test(id)) return "vendor-ui";
          if (/[\\/]node_modules[\\/](framer-motion|canvas-confetti)[\\/]/.test(id)) return "vendor-motion";
        },
      },
    },
  },
});