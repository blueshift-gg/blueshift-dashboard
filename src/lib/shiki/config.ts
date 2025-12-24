import typescript from "@shikijs/langs-precompiled/typescript";
import rust from "@shikijs/langs-precompiled/rust";
import toml from "@shikijs/langs-precompiled/toml";
import shellscript from "@shikijs/langs-precompiled/shellscript";
import json from "@shikijs/langs-precompiled/json";
import python from "@shikijs/langs-precompiled/python";
import solidity from "@shikijs/langs-precompiled/solidity";
import sbpfGrammar from "./sbpf-grammar.json" with { type: "json" };
import blueshiftTheme from "./blueshift-theme.json" with { type: "json" };

/**
 * Theme configuration for Shiki
 */
export const BUNDLED_THEMES = [
  {
    ...blueshiftTheme,
    type: "dark" as const,
  },
];

/**
 * SBPF assembly language configuration
 */
export const SBPF_LANG = {
  name: "sbpf-asm",
  aliases: ["sbpf", "sbf", "ebpf"],
  ...sbpfGrammar,
};

/**
 * Language configurations for Shiki
 */
export const BUNDLED_LANGUAGES = [
  typescript,
  rust,
  toml,
  shellscript,
  json,
  python,
  solidity,
  SBPF_LANG,
];

/**
 * Theme name used throughout the application
 */
export const THEME_NAME = "blueshift";

/**
 * Languages that should skip syntax highlighting
 */
export const SKIP_HIGHLIGHT_LANGS = ["bash", "sh"];
