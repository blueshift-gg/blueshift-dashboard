import { setupDevPlatform } from '@cloudflare/next-on-pages/next-dev';
import createMDX from "@next/mdx";
import rehypePrettyCode from "rehype-pretty-code";
import pkg from "./next-i18next.config.js";
const { i18n } = pkg;

const nextConfig = {
  i18n,
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  eslint: {
    ignoreDuringBuilds: true,
  }
};

const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    rehypePlugins: [
      [
        rehypePrettyCode,
        {
          theme: "github-dark",
          keepBackground: false,
        },
      ],
    ],
  }
});

export default withMDX(nextConfig); 


if (process.env.NODE_ENV === 'development') {
  await setupDevPlatform();
}
