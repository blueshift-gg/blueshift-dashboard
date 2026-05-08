import { createHighlighterCore, type HighlighterCore } from "@shikijs/core";
import { createOnigurumaEngine } from "@shikijs/engine-oniguruma";
import { BUNDLED_LANGUAGES, BUNDLED_THEMES } from "./config";

let highlighterPromise: Promise<HighlighterCore> | undefined;

export async function createShikiHighlighter(): Promise<HighlighterCore> {
  return createHighlighterCore({
    engine: await createOnigurumaEngine(
      import("@shikijs/engine-oniguruma/wasm-inlined"),
    ),
    langs: BUNDLED_LANGUAGES,
    themes: BUNDLED_THEMES,
  });
}

/**
 * Get or create a singleton Shiki highlighter instance.
 * The highlighter is created lazily on first use and reused for subsequent calls.
 */
export const getSingletonHighlighter = async () => {
  if (!highlighterPromise) {
    highlighterPromise = createShikiHighlighter();
  }

  return highlighterPromise;
};
