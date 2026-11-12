#!/usr/bin/env bash
set -euo pipefail

step() { printf '\n==> %s\n' "$1"; }

step "Lint"
pnpm lint

step "Format"
pnpm format:check

step "Verify config"
node ./scripts/ci/verify-deploy-config.mjs wrangler.json

step "Verify build environment"
node --env-file-if-exists=.env.local ./scripts/ci/verify-build-env.mjs

step "Check content paths"
node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON ./scripts/ci/check-content-path.mjs

step "Precompile MDX"
pnpm precompile-mdx

step "Build Worker"
pnpm exec opennextjs-cloudflare build

step "Validate content"
node ./scripts/ci/validate-content.mjs .compiled-mdx

# OpenNext clears .open-next; bundle content after it.
step "Bundle content"
node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON ./scripts/ci/bundle-content.mjs

step "Verify config"
node ./scripts/ci/verify-deploy-config.mjs wrangler.json
