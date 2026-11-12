This is the frontend for [Blueshift](https://learn.blueshift.gg).

## Development

First, run the development server:

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment

Production deployment is handled by Cloudflare Workers Builds through its
GitHub App. There are no GitHub Actions workflows. Content ships in the Worker's
static assets.

Workers Builds build command:

```bash
pnpm run build:cf
```

Workers Builds installs dependencies automatically; do not set
`SKIP_DEPENDENCY_INSTALL`.

Deploy command:

```bash
bash scripts/ci/deploy.sh
```

Set the production branch to `master`. **Enable Preview Builds** is Worker-wide;
enable it only if every branch writer is trusted. Previews publish to
`previews.learn.blueshift.gg`; protect them with Cloudflare Access.

Set the required `NEXT_PUBLIC_*` build variables. Attach `learn.blueshift.gg` as
a Custom Domain. Workers Builds' default token can edit Workers, KV, R2, and
routes account-wide; use a custom minimal token (Workers Scripts and Routes) and
an isolated account or broker for isolation.

Create a Preview with `pnpm build:cf && pnpm exec wrangler preview`; a production
deploy applies the preview domain. If preview builds are disabled, run
`pnpm build:cf` before merging.

## Contributing

Courses and challenges are located in the `src/app/content` directory.

- Courses are located in `src/app/content/courses`
- Challenges are located in `src/app/content/challenges`

## Content Translation

Blueshift supports multiple languages to make Solana education accessible
worldwide:

- **French** (`fr`)
- **Vietnamese** (`vi`)
- **Simplified Chinese** (`zh-CN`)
- **Traditional Chinese** (`zh-HK`)
- **Indonesian** (`id`)

Translations live alongside the English source under `src/app/content/` and
`messages/`; updates are submitted as normal pull requests and reviewed like any
other content change.
