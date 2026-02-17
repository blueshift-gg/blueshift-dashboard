import { mkdir, copyFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

async function syncEsbuildWasm() {
  const sourcePath = fileURLToPath(
    import.meta.resolve("esbuild-wasm/esbuild.wasm"),
  );
  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const projectRoot = path.resolve(scriptDir, "..");
  const destinationPath = path.join(projectRoot, "public", "esbuild.wasm");

  await mkdir(path.dirname(destinationPath), { recursive: true });
  await copyFile(sourcePath, destinationPath);

  console.log("[sync-esbuild-wasm] Synced public/esbuild.wasm");
}

syncEsbuildWasm().catch((error) => {
  console.error("[sync-esbuild-wasm] Failed to sync esbuild.wasm", error);
  process.exit(1);
});
