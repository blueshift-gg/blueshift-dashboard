import createMDX from "@next/mdx";
import rehypePrettyCode from "rehype-pretty-code";
import createNextIntlPlugin from "next-intl/plugin";
import redirects from "./redirects.mjs";
import remarkGfm from 'remark-gfm'

const nextConfig = {
  async redirects() {
    return redirects;
  },
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config) => {
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

const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    rehypePlugins: [
      [
        rehypePrettyCode,
        {
          theme: "dracula-soft",
          // aurora-x
          keepBackground: false,
        },
      ],
    ],
    remarkPlugins: [remarkGfm],
  },
});

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(withMDX(nextConfig));

// added by create cloudflare to enable calling `getCloudflareContext()` in `next dev`
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
await initOpenNextCloudflareForDev();
