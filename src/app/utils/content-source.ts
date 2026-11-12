import "server-only";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { contentAssetUrl, CONTENT_PREFIX, normalizeContentPath } from "./content-path";
import type { Nodes } from "hast";
import type { Root } from "mdast";

const CONTENT_ROOT = "src/app/content";
// ASSETS.fetch requires an absolute URL; the host is ignored.
const ASSETS_ORIGIN = "https://assets.invalid";

export interface CompiledMDX {
  mdast: Root | null;
  raw: string;
  highlightedCode?: Record<string, { lang: string; hast: Nodes }>;
}

/** Loads precompiled MDX from ASSETS in production; returns raw MDX in development. */
export async function fetchCompiledContent(relativePath: string): Promise<CompiledMDX> {
  if (!relativePath) {
    throw new Error("A relative content path is required");
  }

  const normalizedPath = normalizeContentPath(relativePath);

  const isDevelopment = process.env.NODE_ENV === "development";

  if (isDevelopment) {
    const [{ readFile }, { join, sep }] = await Promise.all([
      import("node:fs/promises"),
      import("node:path"),
    ]);
    const contentRoot = join(process.cwd(), CONTENT_ROOT);
    const absolutePath = join(contentRoot, normalizedPath);

    if (!absolutePath.startsWith(`${contentRoot}${sep}`)) {
      throw new Error("Invalid content path");
    }

    const raw = await readFile(absolutePath, "utf-8");

    // mdx.tsx parses this raw MDX into mdast.
    return { mdast: null, raw };
  }

  const { env } = getCloudflareContext();
  const assets = env.ASSETS;

  if (!assets) {
    throw new Error("ASSETS binding is not available in production environment");
  }

  const compiledPath = normalizedPath.replace(/\.mdx$/, ".json");
  const key = [CONTENT_PREFIX, compiledPath].join("/");
  const response = await assets.fetch(contentAssetUrl(key, ASSETS_ORIGIN));

  if (!response.ok) {
    throw new Error(
      `Compiled content not found in Worker assets: ${key} (HTTP ${response.status})`,
    );
  }

  return (await response.json()) as CompiledMDX;
}
