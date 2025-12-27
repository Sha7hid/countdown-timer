import { defineConfig } from "vite";
import { dirname } from "path";
import { fileURLToPath } from "url";
import react from "@vitejs/plugin-react";

if (
  process.env.npm_lifecycle_event === "build" &&
  !process.env.CI &&
  !process.env.SHOPIFY_API_KEY
) {
  throw new Error(
    "\n\nThe frontend build will not work without an API key. Set the SHOPIFY_API_KEY environment variable when running the build command, for example:" +
    "\n\nSHOPIFY_API_KEY=<your-api-key> npm run build\n"
  );
}

process.env.VITE_SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY;

const backendPort = process.env.BACKEND_PORT || process.env.PORT || "3000";
const frontendPort = process.env.FRONTEND_PORT || "5173";

const proxyOptions = {
  target: process.env.NGROK_URL || `http://127.0.0.1:${backendPort}`,
  changeOrigin: false,
  secure: true,
  ws: false,
};

const host = process.env.HOST
  ? process.env.HOST.replace(/https?:\/\//, "")
  : "localhost";

let hmrConfig;
if (host === "localhost") {
  hmrConfig = {
    protocol: "ws",
    host: "localhost",
    port: 64999,
    clientPort: 64999,
  };
} else {
  hmrConfig = {
    protocol: "wss",
    host: host,
    port: frontendPort,
    clientPort: 443,
  };
}

export default defineConfig({
  root: dirname(fileURLToPath(import.meta.url)),
  plugins: [react()],
  resolve: {
    preserveSymlinks: true,
  },
  server: {
    host: "localhost",
    port: frontendPort,
    hmr: hmrConfig,
    proxy: {
      "^/api(/|(\\?.*)?$)": proxyOptions,
    },
  },
});
