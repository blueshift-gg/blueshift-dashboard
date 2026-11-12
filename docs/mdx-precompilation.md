# MDX Precompilation

MDX is compiled and syntax-highlighted at build time.

## Overview

**Build Time:**

1. Parse MDX files with `safe-mdx` to generate MDAST (Markdown AST)
2. Pre-highlight code blocks with Shiki
3. Store compiled JSON in `.compiled-mdx/` directory
4. Build the Worker with `opennextjs-cloudflare build`
5. Validate the output with `scripts/ci/validate-content.mjs`
6. Copy the compiled JSON into `.open-next/assets/compiled-mdx/` with
   `scripts/ci/bundle-content.mjs`

Content ships with the Worker as static assets.

**Runtime:**

- **Development:** Compile on-the-fly for hot reloading
- **Production:** Fetch pre-compiled JSON from the Worker's `ASSETS` binding

## Compilation Output

Each MDX file becomes a JSON file with:

- **`mdast`**: Parsed Markdown AST
- **`raw`**: Original markdown text
- **`highlightedCode`**: Pre-rendered code blocks as HAST (HTML AST)
  - Unique IDs (`code-0`, `code-1`, etc.)
  - Languages: TypeScript, Rust, TOML, Shell, JSON, Python, SBPF
  - Custom Blueshift theme
  - Bash/sh blocks skipped (rendered as-is)

## Build Command

```bash
pnpm precompile-mdx
```

`pnpm build:cf` runs this plus the full deployment build; see
[CI/CD Integration](#cicd-integration).

**Features:**

- Processes all `.mdx` files from `src/app/content/`
- Clears `.compiled-mdx/` before compiling

**Performance:** filesystem-bound locally; expect several minutes for 1,649
files.

## CI/CD Integration

Cloudflare Workers Builds runs `pnpm run build:cf`; deploy with
`bash scripts/ci/deploy.sh`. Required build variables are checked by
`scripts/ci/verify-build-env.mjs`; `.env.local` is loaded for local builds.

All MDX under `src/app/content` is public, including in preview branches. Do not
add gated or draft content without excluding it before precompile.

## API

### `fetchCompiledContent(relativePath: string): Promise<CompiledMDX>`

- **Development:** Returns `{ mdast: null, raw }` (compile on-the-fly)
- **Production:** Fetches pre-compiled `{ mdast, raw, highlightedCode }` from the
  `ASSETS` binding

### `renderSafeMdx(compiled: CompiledMDX)`

- Checks for pre-highlighted code via `node.data.highlightId`
- Falls back to runtime highlighting in development
- Converts HAST to React elements with `toJsxRuntime()`
