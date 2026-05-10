import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

async function copyAsset(sourcePath, destinationPath) {
  await mkdir(path.dirname(destinationPath), { recursive: true });
  await copyFile(sourcePath, destinationPath);
}

async function syncEsbuildWasm() {
  const sourcePath = fileURLToPath(import.meta.resolve("esbuild-wasm/esbuild.wasm"));
  const web3TypesPath = fileURLToPath(import.meta.resolve("@solana/web3.js/lib/index.d.ts"));
  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const projectRoot = path.resolve(scriptDir, "..");
  const destinationPath = path.join(projectRoot, "public", "esbuild.wasm");
  const editorAssetsDir = path.join(projectRoot, "public", "editor-assets");

  await copyAsset(sourcePath, destinationPath);
  await copyAsset(web3TypesPath, path.join(editorAssetsDir, "types", "solana-web3.d.ts"));
  await copyAsset(
    path.join(projectRoot, "src", "app", "components", "TSChallengeEnv", "types", "spl-token.d.ts"),
    path.join(editorAssetsDir, "types", "spl-token.d.ts"),
  );
  await copyAsset(
    path.join(projectRoot, "src", "app", "components", "TSChallengeEnv", "types", "bs58.d.ts"),
    path.join(editorAssetsDir, "types", "bs58.d.ts"),
  );
  await copyAsset(
    path.join(
      projectRoot,
      "src",
      "app",
      "content",
      "challenges",
      "typescript-mint-an-spl-token",
      "challenge.ts.template",
    ),
    path.join(
      editorAssetsDir,
      "challenge-templates",
      "typescript-mint-an-spl-token",
      "challenge.ts.template",
    ),
  );

  console.log("[sync-esbuild-wasm] Synced static editor assets");
}

syncEsbuildWasm().catch((error) => {
  console.error("[sync-esbuild-wasm] Failed to sync esbuild.wasm", error);
  process.exit(1);
});
