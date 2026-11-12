// safe-mdx and shiki expose loosely typed AST structures in this build script.
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { mdxParse } from "safe-mdx/parse";
import { SKIP_HIGHLIGHT_LANGS, THEME_NAME } from "../src/lib/shiki/config";
import { createShikiHighlighter } from "../src/lib/shiki/highlighter";

const CONTENT_DIR = join(process.cwd(), "src/app/content");
const OUTPUT_DIR = join(process.cwd(), ".compiled-mdx");

interface HighlightedCode {
  lang: string;
  hast: any;
}

interface CompiledMDX {
  mdast: any;
  raw: string;
  highlightedCode: Record<string, HighlightedCode>;
}

async function precompileMDX(
  inputPath: string,
  outputPath: string,
  highlighter: Awaited<ReturnType<typeof createShikiHighlighter>>,
) {
  try {
    const raw = await readFile(inputPath, "utf-8");
    const mdast = mdxParse(raw);

    // Pre-highlight all code blocks
    const highlightedCode: Record<string, HighlightedCode> = {};

    function traverseNodes(node: any, currentIndex: { value: number } = { value: 0 }) {
      if (node.type === "code") {
        const lang = node.lang || "text";

        // Skip bash/sh like in the runtime renderer
        if (!SKIP_HIGHLIGHT_LANGS.includes(lang)) {
          try {
            const hast = highlighter.codeToHast(node.value, {
              lang,
              theme: THEME_NAME,
            });

            const blockId = `code-${currentIndex.value++}`;
            highlightedCode[blockId] = { lang, hast };

            // Store the block ID in the node for reference
            node.data = node.data || {};
            node.data.highlightId = blockId;
          } catch (error) {
            console.error(
              `Warning: Failed to highlight code block in ${inputPath} (lang: ${lang})`,
              error,
            );
          }
        }
      }

      if (node.children) {
        node.children.forEach((child: any) => {
          traverseNodes(child, currentIndex);
        });
      }
    }

    traverseNodes(mdast);

    const compiled: CompiledMDX = {
      mdast,
      raw,
      highlightedCode,
    };

    // Ensure output directory exists
    await mkdir(dirname(outputPath), { recursive: true });

    // Write compiled JSON
    await writeFile(outputPath, JSON.stringify(compiled), "utf-8");
  } catch (error) {
    console.error(`✗ Failed to compile ${inputPath}:`, error);
    throw error;
  }
}

async function findMDXFiles(dir: string, baseDir: string = dir): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await findMDXFiles(fullPath, baseDir)));
    } else if (entry.isFile() && entry.name.endsWith(".mdx")) {
      files.push(relative(baseDir, fullPath));
    }
  }

  return files;
}

async function main() {
  console.log("🚀 Starting MDX precompilation...\n");

  // Create highlighter once for all files
  console.log("Initializing syntax highlighter...");
  const highlighter = await createShikiHighlighter();
  console.log("✓ Highlighter ready\n");

  // Find all MDX files
  const mdxFiles = await findMDXFiles(CONTENT_DIR);

  console.log(`Found ${mdxFiles.length} MDX files\n`);

  // Start from a clean output directory.
  await rm(OUTPUT_DIR, { recursive: true, force: true });

  let compiled = 0;
  let failed = 0;

  for (const [index, file] of mdxFiles.entries()) {
    const inputPath = join(CONTENT_DIR, file);
    const outputFile = file.replace(/\.mdx$/, ".json");
    const outputPath = join(OUTPUT_DIR, outputFile);

    try {
      await precompileMDX(inputPath, outputPath, highlighter);
      compiled++;
    } catch (_error) {
      failed++;
    }

    if ((index + 1) % 100 === 0 || index + 1 === mdxFiles.length) {
      console.log(`Progress: ${index + 1}/${mdxFiles.length} files processed`);
    }
  }

  console.log(`\n✨ Precompilation complete!`);
  console.log(`   ✓ Compiled: ${compiled}`);
  if (failed > 0) {
    console.log(`   ✗ Failed: ${failed}`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
