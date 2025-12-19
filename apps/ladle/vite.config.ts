import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Point to source files for HMR during development
      "@tailgrid/react/themes/default.css": path.resolve(
        __dirname,
        "../../packages/react/src/themes/default.css"
      ),
      "@tailgrid/react": path.resolve(
        __dirname,
        "../../packages/react/src/index.ts"
      ),
      "@tailgrid/core": path.resolve(
        __dirname,
        "../../packages/core/src/index.ts"
      ),
    },
  },
  server: {
    port: 61000,
  },
});
