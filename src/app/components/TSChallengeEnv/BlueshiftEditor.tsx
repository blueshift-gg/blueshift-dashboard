"use client";

import React, { useRef, useState } from "react";
import "./style.css";
import Editor, { Monaco } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import classNames from "classnames";
import { Icon } from "@blueshift-gg/ui-components";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import { anticipate } from "motion";

/**
 * Props for the BlueshiftEditor component
 */
interface BlueshiftTSEditorProps {
  /** Initial code content to display in the editor */
  initialCode: string;
  /** Callback fired when code content changes */
  onCodeChange: (code: string) => void;
  /** Optional title for the editor */
  title?: string;
  /** Additional CSS classes */
  className?: string;
  /** Name of the file being edited */
  fileName?: string;
  /** Callback fired when refresh/reset is requested */
  onRefresh?: () => void;
  /** Current auto-save state */
  saveState?: "saved" | "unsaved" | "saving";
  /** Whether to show the "just saved" indicator */
  justSaved?: boolean;
  /** Whether to show the "loaded from auto-save" indicator */
  loadedFromAutoSave?: boolean;
}

const processEnvTypes = `
declare namespace NodeJS {
  interface ProcessEnv {
    SECRET: string;
    RPC_ENDPOINT: string;
  }
}
declare var process: {
  env: NodeJS.ProcessEnv;
};
`;

/**
 * Monaco-based TypeScript code editor with auto-save functionality
 * Features syntax highlighting, type checking, and visual save state indicators
 */
export default function BlueshiftEditor({
  initialCode,
  onCodeChange,
  className,
  fileName = "main.ts",
  onRefresh,
  saveState = "saved",
  justSaved = false,
  loadedFromAutoSave = false,
}: BlueshiftTSEditorProps) {
  const editorRefInternal = useRef<editor.IStandaloneCodeEditor | null>(null);
  const [showRefreshDialog, setShowRefreshDialog] = useState(false);
  const t = useTranslations();

  const handleEditorDidMount = (
    editorInstance: editor.IStandaloneCodeEditor,
    monaco: Monaco
  ) => {
    if (editorRefInternal.current) return;

    editorRefInternal.current = editorInstance;
    editorInstance.onDidChangeModelContent(() => {
      onCodeChange(editorInstance.getValue());
    });

    monaco.languages.typescript.typescriptDefaults.addExtraLib(
      processEnvTypes,
      "file:///node_modules/@types/node/index.d.ts"
    );

    const addMonacoTypesForModule = async (
      moduleName: string,
      dtsImportPromise: Promise<{ default: string }>,
      monacoTypesPath: string,
      monacoModulePath: string
    ) => {
      try {
        const dtsModule = await dtsImportPromise;
        const dtsContent = dtsModule.default;

        monaco.languages.typescript.typescriptDefaults.addExtraLib(
          dtsContent,
          monacoTypesPath
        );

        monaco.languages.typescript.typescriptDefaults.addExtraLib(
          `declare module '${moduleName}' { export * from '${monacoTypesPath}'; export { default } from '${monacoTypesPath}'; }`,
          monacoModulePath
        );
      } catch (error) {
        console.error(`Error adding ${moduleName} types:`, error);
      }
    };

    addMonacoTypesForModule(
      "@solana/web3.js",
      import("@solana/web3.js/lib/index.d.ts?raw"),
      "file:///node_modules/@types/@solana/web3.js/index.d.ts",
      "file:///node_modules/@solana/web3.js/index.d.ts"
    );

    addMonacoTypesForModule(
      "@solana/spl-token",
      import("./types/spl-token.d.ts?raw"),
      "file:///node_modules/@types/@solana/spl-token/index.d.ts",
      "file:///node_modules/@solana/spl-token/index.d.ts"
    );

    addMonacoTypesForModule(
      "bs58",
      import("./types/bs58.d.ts?raw"),
      "file:///node_modules/@types/bs58/index.d.ts",
      "file:///node_modules/bs58/index.d.ts"
    );

    monaco.editor.defineTheme("dracula", {
      base: "vs-dark",
      inherit: true,
      rules: [
        {
          background: "1A1E26",
          token: "",
        },
        {
          foreground: "6272a4",
          token: "comment",
        },
        {
          foreground: "f1fa8c",
          token: "string",
        },
        {
          foreground: "bd93f9",
          token: "constant.numeric",
        },
        {
          foreground: "bd93f9",
          token: "constant.language",
        },
        {
          foreground: "bd93f9",
          token: "constant.character",
        },
        {
          foreground: "bd93f9",
          token: "constant.other",
        },
        {
          foreground: "ffb86c",
          token: "variable.other.readwrite.instance",
        },
        {
          foreground: "ff79c6",
          token: "constant.character.escaped",
        },
        {
          foreground: "ff79c6",
          token: "constant.character.escape",
        },
        {
          foreground: "ff79c6",
          token: "string source",
        },
        {
          foreground: "ff79c6",
          token: "string source.ruby",
        },
        {
          foreground: "ff79c6",
          token: "keyword",
        },
        {
          foreground: "ff79c6",
          token: "storage",
        },
        {
          foreground: "8be9fd",
          fontStyle: "italic",
          token: "storage.type",
        },
        {
          foreground: "50fa7b",
          fontStyle: "underline",
          token: "entity.name.class",
        },
        {
          foreground: "50fa7b",
          fontStyle: "italic underline",
          token: "entity.other.inherited-class",
        },
        {
          foreground: "50fa7b",
          token: "entity.name.function",
        },
        {
          foreground: "ffb86c",
          fontStyle: "italic",
          token: "variable.parameter",
        },
        {
          foreground: "ff79c6",
          token: "entity.name.tag",
        },
        {
          foreground: "50fa7b",
          token: "entity.other.attribute-name",
        },
        {
          foreground: "8be9fd",
          token: "support.function",
        },
        {
          foreground: "6be5fd",
          token: "support.constant",
        },
        {
          foreground: "66d9ef",
          fontStyle: " italic",
          token: "support.type",
        },
        {
          foreground: "66d9ef",
          fontStyle: " italic",
          token: "support.class",
        },
        {
          foreground: "f8f8f0",
          background: "ff79c6",
          token: "invalid",
        },
        {
          foreground: "f8f8f0",
          background: "bd93f9",
          token: "invalid.deprecated",
        },
        {
          foreground: "cfcfc2",
          token: "meta.structure.dictionary.json string.quoted.double.json",
        },
        {
          foreground: "6272a4",
          token: "meta.diff",
        },
        {
          foreground: "6272a4",
          token: "meta.diff.header",
        },
        {
          foreground: "ff79c6",
          token: "markup.deleted",
        },
        {
          foreground: "50fa7b",
          token: "markup.inserted",
        },
        {
          foreground: "e6db74",
          token: "markup.changed",
        },
        {
          foreground: "bd93f9",
          token: "constant.numeric.line-number.find-in-files - match",
        },
        {
          foreground: "e6db74",
          token: "entity.name.filename",
        },
        {
          foreground: "f83333",
          token: "message.error",
        },
        {
          foreground: "eeeeee",
          token:
            "punctuation.definition.string.begin.json - meta.structure.dictionary.value.json",
        },
        {
          foreground: "eeeeee",
          token:
            "punctuation.definition.string.end.json - meta.structure.dictionary.value.json",
        },
        {
          foreground: "8be9fd",
          token: "meta.structure.dictionary.json string.quoted.double.json",
        },
        {
          foreground: "f1fa8c",
          token:
            "meta.structure.dictionary.value.json string.quoted.double.json",
        },
        {
          foreground: "50fa7b",
          token:
            "meta meta meta meta meta meta meta.structure.dictionary.value string",
        },
        {
          foreground: "ffb86c",
          token:
            "meta meta meta meta meta meta.structure.dictionary.value string",
        },
        {
          foreground: "ff79c6",
          token: "meta meta meta meta meta.structure.dictionary.value string",
        },
        {
          foreground: "bd93f9",
          token: "meta meta meta meta.structure.dictionary.value string",
        },
        {
          foreground: "50fa7b",
          token: "meta meta meta.structure.dictionary.value string",
        },
        {
          foreground: "ffb86c",
          token: "meta meta.structure.dictionary.value string",
        },
      ],
      colors: {
        "editor.background": "#1A1E2680",
        "editor.foreground": "#f8f8f2",
        "editor.selectionBackground": "#585E6C",
        "editor.lineHighlightBackground": "#1A1E26",
        "editorCursor.foreground": "#f8f8f0",
        "editorWhitespace.foreground": "#3B3A32",
        "editorIndentGuide.activeBackground": "#9D550FB0",
        "editor.selectionHighlightBorder": "#222218",
      },
    });

    monaco.editor.setTheme("dracula");
  };

  const handleRefreshClick = () => {
    setShowRefreshDialog(true);
  };

  const handleConfirmRefresh = () => {
    setShowRefreshDialog(false);
    if (onRefresh) {
      onRefresh();
    }
  };

  const handleCancelRefresh = () => {
    setShowRefreshDialog(false);
  };

  return (
    <div className={classNames("w-full h-full lg:relative", className)}>
      <div className="absolute py-4 bottom-0 z-10 right-0 px-6 flex items-center gap-x-4 w-full h-auto justify-end border-t border-border bg-background/80 lg:border-t-0 backdrop-blur lg:bg-transparent lg:backdrop-blur-none">
        {/* Loaded from auto-save indicator */}
        {loadedFromAutoSave && saveState === "saved" && (
          <div className="flex items-center gap-x-1.5 text-xs text-blue-400 bg-blue-400/10 px-2 py-1">
            <Icon name="Progress" size={12} />
            <span>{t("ChallengePage.loaded_from_auto_save")}</span>
          </div>
        )}

        {/* Save status indicator */}
        {saveState === "unsaved" && (
          <div className="flex items-center gap-x-1.5 text-xs text-orange-400 bg-orange-400/10 px-2 py-1">
            <div className="w-2 h-2 bg-orange-400 animate-pulse" />
            <span>{t("ChallengePage.unsaved_changes")}</span>
          </div>
        )}
        {saveState === "saving" && (
          <div className="flex items-center gap-x-1.5 text-xs text-blue-400 bg-blue-400/10 px-2 py-1">
            <div className="w-2 h-2 bg-blue-400 animate-spin" />
            <span>{t("ChallengePage.saving")}</span>
          </div>
        )}
        {justSaved && (
          <div className="flex items-center gap-x-1.5 text-xs text-green-400 bg-green-400/10 px-2 py-1">
            <Icon name="Success" size={12} />
            <span>{t("ChallengePage.auto_saved")}</span>
          </div>
        )}

        <button
          className="group/refresh font-medium flex items-center gap-x-2 text-sm text-shade-tertiary cursor-pointer hover:text-shade-secondary transition-colors"
          onClick={handleRefreshClick}
        >
          <Icon
            name="Refresh"
            size={12}
            className="group-hover/refresh:rotate-360 transition-transform"
          />
          <span>{t("ChallengePage.reset_button")}</span>
        </button>
      </div>

      {/* Refresh Confirmation Dialog */}
      <AnimatePresence>
        {showRefreshDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
                transition: { duration: 0.3, ease: anticipate },
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
                y: 20,
                transition: { duration: 0.2 },
              }}
              className="bg-card-solid border border-border  p-6 max-w-md mx-4 shadow-xl"
            >
              <div className="flex items-center gap-x-3 mb-4">
                <Icon name="Warning" size={18} className="text-yellow-500" />
                <h3 className="text-lg font-semibold">
                  {t("ChallengePage.reset_code_modal.title")}
                </h3>
              </div>
              <p className="text-shade-secondary mb-6">
                {t("ChallengePage.reset_code_modal.description")}
              </p>
              <div className="flex gap-x-3 justify-end">
                <button
                  className="px-4 py-2 text-sm font-medium text-shade-secondary hover:text-shade-primary border border-border  hover:bg-card-solid-hover transition-colors cursor-pointer"
                  onClick={handleCancelRefresh}
                >
                  {t("ChallengePage.reset_code_modal.cancel")}
                </button>
                <button
                  className="px-4 py-2 text-sm font-medium bg-[#ff285a] hover:bg-[#e6234f] text-white transition-colors cursor-pointer"
                  onClick={handleConfirmRefresh}
                >
                  {t("ChallengePage.reset_code_modal.confirm")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full h-full">
        <Editor
          height="100%"
          width="100%"
          className="bg-transparent min-h-[400px] backdrop-blur-lg"
          language="typescript"
          value={initialCode}
          options={{
            automaticLayout: true,
            minimap: {
              enabled: false,
            },
            stickyScroll: {
              enabled: false,
            },
            wordWrap: "on", // Optional: for better readability of long lines
            renderLineHighlight: "all", // Highlight the current line
          }}
          path={`file:///${fileName}`}
          onMount={handleEditorDidMount}
        />
      </div>
    </div>
  );
}
