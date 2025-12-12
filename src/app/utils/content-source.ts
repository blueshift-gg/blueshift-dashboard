import "server-only";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Root } from "mdast";
import type { Nodes } from "hast";

const CONTENT_ROOT = "src/app/content";
const DEFAULT_BUCKET_PREFIX = "compiled-mdx";

const resolveBucketPrefix = (prefixFromEnv?: string) => {
  const normalizedPrefix = prefixFromEnv?.trim();

  if (normalizedPrefix) {
    return normalizedPrefix;
  }

  const fallbackPrefix = process.env.CONTENT_PREFIX?.trim();

  if (fallbackPrefix) {
    return fallbackPrefix;
  }

  return DEFAULT_BUCKET_PREFIX;
};

export interface CompiledMDX {
  mdast: Root | null;
  raw: string;
  highlightedCode?: Record<string, { lang: string; hast: Nodes }>;
}

/**
 * Loads a compiled content file. Reads directly from the filesystem while
 * developing locally (compiling on-the-fly) and falls back to pre-compiled
 * content from the CONTENT R2 bucket once deployed to Cloudflare.
 */
export async function fetchCompiledContent(
  relativePath: string
): Promise<CompiledMDX> {
  if (!relativePath) {
    throw new Error("A relative content path is required");
  }

  const normalizedPath = relativePath.replace(/^\/+/, "");

  const isDevelopment = process.env.NODE_ENV === "development";

  if (isDevelopment) {
    // In development, read the raw MDX file and return it for on-the-fly compilation
    const [{ readFile }, { join }] = await Promise.all([
      import("node:fs/promises"),
      import("node:path"),
    ]);
    const absolutePath = join(process.cwd(), CONTENT_ROOT, normalizedPath);
    const raw = await readFile(absolutePath, "utf-8");

    // We'll compile it on-the-fly in mdx.tsx, so return a minimal structure
    return { mdast: null, raw };
  }

  // In production, fetch from R2
  const { env } = getCloudflareContext();
  const bucket = env?.CONTENT;
  const bucketPrefix = resolveBucketPrefix(
    (env as { CONTENT_PREFIX?: string } | undefined)?.CONTENT_PREFIX
  );

  if (!bucket) {
    throw new Error(
      "CONTENT bucket binding is not available in production environment"
    );
  }

  // Convert .mdx path to .json path for compiled content
  const compiledPath = normalizedPath.replace(/\.mdx$/, ".json");
  const key = [bucketPrefix, compiledPath].join("/");
  const object = await bucket.get(key);

  if (!object) {
    throw new Error(
      `Compiled content file not found in R2: ${key}\n` +
      `This may indicate the content was not uploaded during deployment. ` +
      `Verify that the precompilation and R2 upload steps completed successfully.`
    );
  }

  const json = await object.text();
  return JSON.parse(json) as CompiledMDX;
}
