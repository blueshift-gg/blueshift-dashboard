# MDX Precompilation

This project uses MDX precompilation to improve performance by moving compilation and syntax highlighting to build time.

## Overview

**Build Time:**

1. Parse MDX files with `safe-mdx` to generate MDAST (Markdown AST)
2. Pre-highlight code blocks with Shiki
3. Store compiled JSON in `.compiled-mdx/` directory
4. Upload to Cloudflare R2

**Runtime:**

- **Development:** Compile on-the-fly for hot reloading
- **Production:** Fetch pre-compiled JSON from R2

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

**Features:**

- Processes all `.mdx` files from `src/app/content/`
- Parallel batch processing (100 files at a time)
- Incremental compilation with content hash caching

## Incremental Compilation

The script caches compilation results in `.compiled-mdx/.cache.json`:

**Cache validation:**

- Content hash (SHA-256) detects text changes
- File modification time catches filesystem updates
- Missing outputs trigger recompilation

**Performance:**

- **Initial build:** 9s for all 1,430 files
- **No changes:** 0.7s (skips all files)
- **1 file changed:** 0.7s (recompiles only that file)

## CI/CD Integration

GitHub Actions caches `.compiled-mdx/` between runs.

## API

### `fetchCompiledContent(relativePath: string): Promise<CompiledMDX>`

- **Development:** Returns `{ mdast: null, raw }` (compile on-the-fly)
- **Production:** Returns pre-compiled `{ mdast, raw, highlightedCode }` from R2

### `renderSafeMdx(mdast, highlightedCode)`

- Checks for pre-highlighted code via `node.data.highlightId`
- Falls back to runtime highlighting in development
- Converts HAST to React elements with `toJsxRuntime()`
