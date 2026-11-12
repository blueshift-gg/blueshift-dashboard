#!/usr/bin/env node
// Allows only the expected deployment settings.

import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";

const configPath = resolve(process.argv[2] ?? "wrangler.json");

const EXPECTED = {
  name: "blueshift-dashboard",
  main: ".open-next/worker.js",
  assets: ".open-next/assets",
  workersDev: false,
  compatibilityDate: "2025-09-01",
  previewDomain: "previews.learn.blueshift.gg",
};

const TOP_LEVEL_KEYS = new Set([
  "name",
  "main",
  "compatibility_date",
  "compatibility_flags",
  "workers_dev",
  "observability",
  "assets",
  "routes",
  "previews",
  "preview_urls",
]);
const ASSETS_KEYS = new Set(["directory", "binding"]);
const OBSERVABILITY_KEYS = new Set(["enabled"]);
const ROUTE_KEYS = new Set(["pattern", "custom_domain", "previews_enabled", "enabled"]);

const failures = [];

function fail(message) {
  failures.push(message);
}

const configDir = dirname(configPath);
const alternateConfigs = new Set([
  join(configDir, "wrangler.toml"),
  join(configDir, "wrangler.jsonc"),
  join(configDir, ".wrangler/deploy/config.json"),
  join(process.cwd(), ".wrangler/deploy/config.json"),
]);
for (const alternateConfig of alternateConfigs) {
  if (existsSync(alternateConfig)) {
    fail(`alternate Wrangler config not allowed: ${alternateConfig}`);
  }
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

let config;
try {
  config = JSON.parse(await readFile(configPath, "utf8"));
} catch (error) {
  console.error(`Cannot read ${configPath}: ${error.message}`);
  process.exit(1);
}

if (!isObject(config)) {
  console.error(`Deploy configuration check failed for ${configPath}: config must be an object`);
  process.exit(1);
}

for (const key of Object.keys(config)) {
  if (!TOP_LEVEL_KEYS.has(key)) {
    fail(`key not allowed: ${key}`);
  }
}

if (!isObject(config.assets)) {
  fail("assets must be an object");
} else {
  for (const key of Object.keys(config.assets)) {
    if (!ASSETS_KEYS.has(key)) {
      fail(`assets key not allowed: ${key}`);
    }
  }
}

if (!isObject(config.observability)) {
  fail("observability must be an object");
} else {
  for (const key of Object.keys(config.observability)) {
    if (!OBSERVABILITY_KEYS.has(key)) {
      fail(`observability key not allowed: ${key}`);
    }
  }
}

const compatibilityDate = config.compatibility_date;
const parsedDate =
  typeof compatibilityDate === "string" ? new Date(`${compatibilityDate}T00:00:00Z`) : null;
if (
  !parsedDate ||
  Number.isNaN(parsedDate.getTime()) ||
  parsedDate.toISOString().slice(0, 10) !== compatibilityDate ||
  compatibilityDate !== EXPECTED.compatibilityDate
) {
  fail(`compatibility_date must be "${EXPECTED.compatibilityDate}"`);
}

if (
  !Array.isArray(config.compatibility_flags) ||
  config.compatibility_flags.length !== 1 ||
  config.compatibility_flags[0] !== "nodejs_compat"
) {
  fail('compatibility_flags must be ["nodejs_compat"]');
}

if (config.name !== EXPECTED.name) {
  fail(`name must be "${EXPECTED.name}"`);
}
if (config.main !== EXPECTED.main) {
  fail(`main must be "${EXPECTED.main}"`);
}
if (config.workers_dev !== EXPECTED.workersDev) {
  fail(`workers_dev must be ${EXPECTED.workersDev}`);
}
if (!isObject(config.assets) || config.assets.directory !== EXPECTED.assets) {
  fail(`assets directory must be "${EXPECTED.assets}"`);
}
if (!isObject(config.assets) || config.assets.binding !== "ASSETS") {
  fail('assets binding must be "ASSETS"');
}
if (!isObject(config.observability) || config.observability.enabled !== true) {
  fail("observability.enabled must be true");
}
if (!Array.isArray(config.routes) || config.routes.length !== 1) {
  fail("routes must contain exactly one preview route");
} else {
  const route = config.routes[0];
  if (!isObject(route)) {
    fail("preview route must be an object");
  } else {
    for (const key of Object.keys(route)) {
      if (!ROUTE_KEYS.has(key)) {
        fail(`route key not allowed: ${key}`);
      }
    }
    if (route.pattern !== EXPECTED.previewDomain) {
      fail(`route pattern must be "${EXPECTED.previewDomain}"`);
    }
    if (route.custom_domain !== true) {
      fail("route custom_domain must be true");
    }
    if (route.previews_enabled !== true) {
      fail("route previews_enabled must be true");
    }
    if (route.enabled !== false) {
      fail("route enabled must be false");
    }
  }
}
if (!isObject(config.previews) || Object.keys(config.previews).length !== 0) {
  fail("previews must be an empty object");
}
if (config.preview_urls !== false) {
  fail("preview_urls must be false");
}

if (failures.length > 0) {
  console.error(`Deploy configuration check failed for ${configPath}:`);
  for (const failure of failures) {
    console.error(`  - ${failure}`);
  }
  process.exit(1);
}

console.log(`Deploy configuration OK: ${configPath}`);
