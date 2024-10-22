import {
  vitePlugin as remix,
  cloudflareDevProxyVitePlugin as remixCloudflareDevProxy,
} from "@remix-run/dev";
import { defineConfig, loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";

declare module "@remix-run/cloudflare" {
  interface Future {
    v3_singleFetch: true;
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [
      remixCloudflareDevProxy(),
      remix({
        future: {
          v3_fetcherPersist: true,
          v3_relativeSplatPath: true,
          v3_throwAbortReason: true,
          v3_singleFetch: true,
          v3_lazyRouteDiscovery: true,
        },
      }),
      tsconfigPaths(),
    ],
    resolve: {
      alias: {
        "~": path.resolve(__dirname, "./app")
      }
    },
    define: {
      'process.env.VAPI_SERVER_URL': JSON.stringify(env.VAPI_SERVER_URL),
      'process.env.VAPI_WEB_TOKEN': JSON.stringify(env.VAPI_WEB_TOKEN),
    },
    optimizeDeps: {
      include: ['tailwind-merge', 'clsx', 'class-variance-authority']
    }
  }
});
