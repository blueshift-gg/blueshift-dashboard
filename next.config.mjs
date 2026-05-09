import createNextIntlPlugin from "next-intl/plugin";
import redirects from "./redirects.mjs";

const nextConfig = {
  poweredByHeader: false,
  async redirects() {
    return redirects;
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);

// added by create cloudflare to enable calling `getCloudflareContext()` in `next dev`
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
await initOpenNextCloudflareForDev();
