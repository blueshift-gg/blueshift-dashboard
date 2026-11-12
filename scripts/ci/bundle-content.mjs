#!/usr/bin/env node
// Copies compiled MDX into Worker assets.

import { cp, lstat, readdir, rm } from "node:fs/promises";
import { resolve } from "node:path";
import { CONTENT_PREFIX } from "../../src/app/utils/content-path.ts";

const SOURCE_DIR = resolve(".compiled-mdx");
const DEST_DIR = resolve(".open-next/assets", CONTENT_PREFIX);

async function main() {
  const sourceStat = await lstat(SOURCE_DIR).catch(() => null);
  if (!sourceStat?.isDirectory()) {
    throw new Error(`Compiled content directory not found: ${SOURCE_DIR}`);
  }

  await rm(DEST_DIR, { recursive: true, force: true });
  await cp(SOURCE_DIR, DEST_DIR, { recursive: true });

  const entries = await readdir(DEST_DIR, { recursive: true });
  if (!entries.some((entry) => entry.endsWith(".json"))) {
    throw new Error(`No content was bundled into ${DEST_DIR}`);
  }

  console.log(`Bundled compiled content into ${DEST_DIR}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
