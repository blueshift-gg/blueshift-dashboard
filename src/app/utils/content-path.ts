export const CONTENT_PREFIX = "compiled-mdx";

export function normalizeContentPath(relativePath: string): string {
  const normalizedPath = relativePath.replace(/^\/+/, "");
  const segments = normalizedPath.split("/");

  if (
    !normalizedPath ||
    normalizedPath.includes("%") ||
    normalizedPath.includes("\0") ||
    normalizedPath.includes("\\") ||
    segments.some((segment) => segment === "" || segment === "." || segment === "..")
  ) {
    throw new Error("Invalid content path");
  }

  return normalizedPath;
}

export function contentAssetUrl(key: string, origin: string): URL {
  const normalizedKey = normalizeContentPath(key);
  const url = new URL(`/${normalizedKey}`, origin);

  if (url.pathname !== `/${normalizedKey}`) {
    throw new Error("Invalid content path");
  }

  return url;
}
