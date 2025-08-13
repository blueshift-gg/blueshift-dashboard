import createMDX from "@next/mdx";
import rehypePrettyCode from "rehype-pretty-code";
import createNextIntlPlugin from "next-intl/plugin";
import redirects from "./redirects.mjs";
import { createHighlighter, bundledLanguages } from "shiki";

import sbpfGrammar from "./src/lib/shiki/sbpf-grammar.json" with { type: "json" };
import blueshiftTheme from "./src/lib/shiki/blueshift-theme.json" with { type: "json" };

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
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      [
        rehypePrettyCode,
        {
          getHighlighter: (options) => {
            return createHighlighter({
              ...options,
              langs: [
                ...Object.values(bundledLanguages),
                {
                  name: "sbpf-asm",
                  aliases: ["sbpf", "sbpfasm", "sbf", "ebpf"],
                  ...sbpfGrammar,
                },
              ],
              themes: [blueshiftTheme],
            });
          },
          theme: "blueshift",
          // aurora-x
          keepBackground: false,
          transformers: [
            {
              span(node) {
                if (
                  this.options.lang === "bash" ||
                  this.options.lang === "sh"
                ) {
                  delete node.properties.style;
                }
              },
            },
          ],
        },
      ],
    ],
  },
});

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(withMDX(nextConfig));

// added by create cloudflare to enable calling `getCloudflareContext()` in `next dev`
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import remarkGfm from "remark-gfm";
await initOpenNextCloudflareForDev();
