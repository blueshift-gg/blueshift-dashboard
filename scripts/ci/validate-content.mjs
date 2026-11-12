#!/usr/bin/env node
// Validates compiled MDX before bundling.

import { lstat, readdir, readFile } from "node:fs/promises";
import { join, relative, resolve } from "node:path";

const CONTENT_ROOT = resolve(process.argv[2] ?? ".compiled-mdx");
const SAFE_PATH = /^[A-Za-z0-9._/-]+$/;

const failures = [];
let fileCount = 0;
let totalBytes = 0;

function fail(message) {
  failures.push(message);
}

function validateRelativePath(relativePath) {
  if (!relativePath || relativePath.startsWith("/") || relativePath.includes("\\")) {
    fail(`unsafe path: ${JSON.stringify(relativePath)}`);
    return false;
  }

  if (relativePath.includes("\0") || relativePath.includes("//")) {
    fail(`unsafe path: ${JSON.stringify(relativePath)}`);
    return false;
  }

  if (!SAFE_PATH.test(relativePath)) {
    fail(`disallowed characters in path: ${JSON.stringify(relativePath)}`);
    return false;
  }

  const segments = relativePath.split("/");
  if (segments.some((segment) => segment === "" || segment === "." || segment === "..")) {
    fail(`unsafe path segment in: ${JSON.stringify(relativePath)}`);
    return false;
  }

  return true;
}

async function validateFile(fullPath, relativePath, size) {
  const raw = await readFile(fullPath, "utf8");

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    fail(`${relativePath}: invalid JSON (${error.message})`);
    return;
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    fail(`${relativePath}: expected a JSON object`);
    return;
  }

  if (typeof parsed.raw !== "string") {
    fail(`${relativePath}: missing string "raw" field`);
  }

  if (parsed.mdast !== null && typeof parsed.mdast !== "object") {
    fail(`${relativePath}: "mdast" must be an object or null`);
  } else if (parsed.mdast && parsed.mdast.type !== "root") {
    fail(`${relativePath}: "mdast" is not a root node`);
  }

  if (
    parsed.highlightedCode !== undefined &&
    (typeof parsed.highlightedCode !== "object" ||
      parsed.highlightedCode === null ||
      Array.isArray(parsed.highlightedCode))
  ) {
    fail(`${relativePath}: "highlightedCode" must be an object when present`);
  }

  totalBytes += size;
}

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    const relativePath = relative(CONTENT_ROOT, fullPath);

    const info = await lstat(fullPath);

    if (info.isSymbolicLink()) {
      fail(`symlink not allowed: ${relativePath}`);
      continue;
    }

    if (info.isDirectory()) {
      if (!validateRelativePath(relativePath)) {
        continue;
      }
      await walk(fullPath);
      continue;
    }

    if (!info.isFile()) {
      fail(`not a regular file: ${relativePath}`);
      continue;
    }

    if (!relativePath.endsWith(".json")) {
      fail(`unexpected file type: ${relativePath}`);
      continue;
    }

    if (!validateRelativePath(relativePath)) {
      continue;
    }

    fileCount += 1;
    await validateFile(fullPath, relativePath, info.size);
  }
}

async function main() {
  const stat = await lstat(CONTENT_ROOT).catch(() => null);
  if (!stat?.isDirectory()) {
    throw new Error(`Compiled content directory not found: ${CONTENT_ROOT}`);
  }

  await walk(CONTENT_ROOT);

  if (fileCount === 0) {
    fail(`no compiled JSON files found in ${CONTENT_ROOT}`);
  }

  if (failures.length > 0) {
    console.error(`Content validation failed with ${failures.length} problem(s):`);
    for (const failure of failures.slice(0, 50)) {
      console.error(`  - ${failure}`);
    }
    if (failures.length > 50) {
      console.error(`  ... and ${failures.length - 50} more`);
    }
    process.exit(1);
  }

  const totalMiB = (totalBytes / 1024 / 1024).toFixed(1);
  console.log(`Content validation passed: ${fileCount} files, ${totalMiB} MiB.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
