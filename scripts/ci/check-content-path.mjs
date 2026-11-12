#!/usr/bin/env node
// Regression checks for route-derived content paths.

import assert from "node:assert/strict";
import { contentAssetUrl, normalizeContentPath } from "../../src/app/utils/content-path.ts";

const valid = "courses/anchor-for-dummies/anchor-101/en.mdx";
assert.equal(normalizeContentPath(valid), valid);

for (const invalid of [
  "",
  "/",
  "../secret.mdx",
  "%2e%2e/secret.mdx",
  "%252e%252e/secret.mdx",
  "courses/%2e%2e/%2e%2e/compiled-mdx/secret.mdx",
  "courses//secret.mdx",
  "courses\\secret.mdx",
  "courses/\0secret.mdx",
]) {
  assert.throws(() => normalizeContentPath(invalid), /Invalid content path/);
}

const origin = "https://assets.local";
const key = "compiled-mdx/courses/anchor-for-dummies/anchor-101/en.json";
assert.equal(contentAssetUrl(key, origin).pathname, `/${key}`);
assert.throws(
  () => contentAssetUrl("compiled-mdx/../compiled-mdx/secret.json", origin),
  /Invalid content path/,
);
assert.throws(
  () => contentAssetUrl("compiled-mdx/%252e%252e/secret.json", origin),
  /Invalid content path/,
);
assert.throws(() => contentAssetUrl("compiled-mdx/a\\b.json", origin), /Invalid content path/);
assert.throws(() => contentAssetUrl("compiled-mdx/a\0b.json", origin), /Invalid content path/);

console.log("Content path checks OK.");
