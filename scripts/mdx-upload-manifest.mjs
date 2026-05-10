import { createHash } from "node:crypto";
import { readFile, readdir, stat, writeFile } from "node:fs/promises";
import { relative, resolve, sep } from "node:path";

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = resolve(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)));
      continue;
    }

    if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

async function writeManifest(compiledDirArg, manifestFileArg) {
  const compiledDir = resolve(compiledDirArg);
  const manifestFile = resolve(manifestFileArg);
  const files = (await walk(compiledDir)).sort();
  const manifest = {};

  for (const file of files) {
    const fileStat = await stat(file);
    if (!fileStat.isFile()) {
      continue;
    }

    const relativePath = relative(compiledDir, file).replaceAll(sep, "/");
    if (!relativePath.endsWith(".json") || relativePath === ".cache.json") {
      continue;
    }

    if (file === manifestFile) {
      continue;
    }

    const contents = await readFile(file);
    manifest[relativePath] = createHash("sha256").update(contents).digest("hex");
  }

  await writeFile(manifestFile, `${JSON.stringify(manifest, null, 2)}\n`);
}

async function printManifestDiff(localManifestFile, remoteManifestFile) {
  const [localManifest, remoteManifest] = await Promise.all([
    readJson(localManifestFile),
    readJson(remoteManifestFile),
  ]);

  const changedFiles = Object.keys(localManifest)
    .filter((file) => remoteManifest[file] !== localManifest[file])
    .sort();

  process.stdout.write(changedFiles.join("\n"));
}

async function readJson(filePath) {
  const raw = await readFile(filePath, "utf-8");
  return JSON.parse(raw);
}

async function main() {
  const [command, ...args] = process.argv.slice(2);

  if (command === "write") {
    const [compiledDir, manifestFile] = args;
    if (!compiledDir || !manifestFile) {
      throw new Error(
        "Usage: node scripts/mdx-upload-manifest.mjs write <compiledDir> <manifestFile>",
      );
    }

    await writeManifest(compiledDir, manifestFile);
    return;
  }

  if (command === "diff") {
    const [localManifestFile, remoteManifestFile] = args;
    if (!localManifestFile || !remoteManifestFile) {
      throw new Error(
        "Usage: node scripts/mdx-upload-manifest.mjs diff <localManifestFile> <remoteManifestFile>",
      );
    }

    await printManifestDiff(localManifestFile, remoteManifestFile);
    return;
  }

  throw new Error("Usage: node scripts/mdx-upload-manifest.mjs <write|diff> ...args");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
