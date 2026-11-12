#!/usr/bin/env bash
set -euo pipefail

root=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
cd "$root"

node ./scripts/ci/verify-deploy-config.mjs wrangler.json
exec pnpm exec wrangler deploy --config wrangler.json
