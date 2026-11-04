import createNextIntlPlugin from "next-intl/plugin";
import redirects from "./redirects.mjs";

const nextConfig = {
  poweredByHeader: false,
  // esbuild-wasm ships a Node entry (lib/main.js) that spawns a child process.
  // Turbopack's SSR pass resolves it instead of the browser build, so pin the
  // browser entry for every bundle.
  turbopack: {
    resolveAlias: {
      "esbuild-wasm": "esbuild-wasm/lib/browser.js",
    },
  },
  async redirects() {
    return redirects;
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);

// added by create cloudflare to enable calling `getCloudflareContext()` in `next dev`
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
await initOpenNextCloudflareForDev();
