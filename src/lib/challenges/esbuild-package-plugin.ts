import type * as esbuild from "esbuild-wasm";

// esbuild plugin to fetch modules from a CDN (esm.sh)
export const createCdnPlugin = (moduleName: string, namespace: string): esbuild.Plugin => {
  // Helper to escape regex special characters in moduleName
  const escapedModuleName = moduleName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  return {
    name: `${namespace}-plugin`,
    setup(build: esbuild.PluginBuild) {
      // Initial entry: resolve the module to its name in our namespace
      build.onResolve(
        { filter: new RegExp(`^${escapedModuleName}$`) },
        (args: esbuild.OnResolveArgs) => {
          // console.log(
          //   `[cdn-plugin-${namespace}] onResolve (@module): ${args.path} (importer: ${args.importer})`,
          // );
          return { path: args.path, namespace: namespace };
        },
      );

      // Resolve absolute paths (starting with /) that are dependencies from esm.sh modules
      build.onResolve({ filter: /^\//, namespace: namespace }, (args: esbuild.OnResolveArgs) => {
        // console.log(
        //   `[cdn-plugin-${namespace}] onResolve (/path): ${args.path} (importer: ${args.importer})`,
        // );
        return { path: args.path, namespace: namespace };
      });

      // Resolve relative paths (./ or ../) from within esm.sh modules
      build.onResolve(
        { filter: /^\.\.?\//, namespace: namespace },
        (args: esbuild.OnResolveArgs) => {
          // console.log(
          //   `[cdn-plugin-${namespace}] onResolve (./path): ${args.path} (importer: ${args.importer})`,
          // );
          const resolvedUrl = new URL(args.path, `https://esm.sh${args.importer}`);
          const newPath = resolvedUrl.pathname + resolvedUrl.search; // Preserve query params
          // console.log(`  [cdn-plugin-${namespace}] resolved to: ${newPath}`);
          return {
            path: newPath,
            namespace: namespace,
          };
        },
      );

      // Load modules in the namespace from esm.sh
      build.onLoad({ filter: /.*/, namespace: namespace }, async (args: esbuild.OnLoadArgs) => {
        let fetchUrl: string;
        if (args.path.startsWith("/")) {
          // Handles resolved paths from esm.sh which start with /
          fetchUrl = `https://esm.sh${args.path}`;
        } else {
          // Handles initial module names (e.g., "bs58", "@solana/web3.js")
          fetchUrl = `https://esm.sh/${args.path}`;
        }

        // console.log(
        //   `[cdn-plugin-${namespace}] onLoad (${args.namespace}): ${args.path}, fetching from ${fetchUrl}`,
        // );
        try {
          const res = await fetch(fetchUrl);
          if (!res.ok) {
            throw new Error(`Failed to fetch ${fetchUrl}: ${res.status} ${res.statusText}`);
          }
          const contents = await res.text();

          return { contents, loader: "js" };
        } catch (error) {
          console.error(
            `[cdn-plugin-${namespace}] Error fetching from esm.sh (${args.path} -> ${fetchUrl}):`,
            error,
          );
          const errorMessage = error instanceof Error ? error.message : String(error);
          return {
            errors: [
              {
                text: `Failed to load ${args.path} (from ${fetchUrl}) via esm.sh: ${errorMessage}`,
                detail: error,
              },
            ],
          };
        }
      });
    },
  };
};
