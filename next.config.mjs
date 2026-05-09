import { fileURLToPath } from "node:url";
import createNextIntlPlugin from "next-intl/plugin";
import redirects from "./redirects.mjs";

const canvasShimPath = fileURLToPath(
  new URL("./src/shims/canvas-shim.js", import.meta.url),
);

const nextConfig = {
  async redirects() {
    return redirects;
  },
  pageExtensions: ["js", "jsx", "ts", "tsx"],
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config) => {
    config.resolve = config.resolve ?? {};
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: canvasShimPath, // ensure optional canvas import falls back to linkedom shim
    };

    config.module.rules.push({
      test: /\.d\.ts$/, // Target .d.ts files
      resourceQuery: /raw/, // Only when ?raw is in the import path
      type: "asset/source", // Import as a string
    });

    config.module.rules.push({
      test: /\.ts\.template$/, // Target .ts files
      resourceQuery: /raw/, // Only when ?raw is in the import path
      type: "asset/source", // Import as a string
    });

    // Important: return the modified config
    return config;
  },
  poweredByHeader: false,
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);

// added by create cloudflare to enable calling `getCloudflareContext()` in `next dev`
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

await initOpenNextCloudflareForDev();
