import fs from "fs/promises";
import path from "path";

type ImageKind = "markdown" | "jsx" | "html";

type ExtractedImage = {
  kind: ImageKind;
  attribute?: "src" | "source";
  path: string;
};

type DynamicImage = {
  kind: "jsx" | "html";
  attribute: "src" | "source";
  expression: string;
};

type FileImageReport = {
  file: string;
  courseSlug?: string;
  expectedBanner?: string | null;
  images: Array<{
    kind: ImageKind;
    attribute?: "src" | "source";
    path: string;
    isCourseBanner: boolean;
    matchesExpected: boolean | null;
  }>;
  dynamicImages: DynamicImage[];
};

type Report = {
  summary: {
    mdxFiles: number;
    filesWithImages: number;
    totalImages: number;
    totalDynamicImages: number;
    totalCourseBannerImages: number;
    mismatchedCourseBannerImages: number;
    coursesWithMissingBannerFile: number;
    coursesWithoutBannerUsage: number;
  };
  courseBannerMap: Record<string, string>;
  courseBannerUsage: Record<
    string,
    {
      expectedBanner: string;
      foundBanners: string[];
      mismatchedBanners: string[];
      files: string[];
    }
  >;
  missingCourseBannerFiles: string[];
  files: FileImageReport[];
};

const CONTENT_DIR = path.join(process.cwd(), "src", "app", "content");
const COURSES_DIR = path.join(CONTENT_DIR, "courses");
const COURSE_BANNERS_DIR = path.join(
  process.cwd(),
  "public",
  "graphics",
  "course-banners",
);
const REPORT_DIR = path.join(process.cwd(), ".tmp");
const REPORT_FILE = path.join(REPORT_DIR, "mdx-image-banner-map.json");

async function listDirectories(dirPath: string): Promise<string[]> {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  return entries.filter(entry => entry.isDirectory()).map(entry => entry.name);
}

async function walkMdxFiles(dirPath: string): Promise<string[]> {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const results: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await walkMdxFiles(fullPath)));
    } else if (entry.isFile() && entry.name.endsWith(".mdx")) {
      results.push(fullPath);
    }
  }

  return results;
}

function normalizeImagePath(imagePath: string): string {
  return imagePath.split("?")[0].split("#")[0];
}

function extractImages(content: string): {
  images: ExtractedImage[];
  dynamicImages: DynamicImage[];
} {
  const images: ExtractedImage[] = [];
  const dynamicImages: DynamicImage[] = [];

  const markdownImageRegex = /!\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
  for (const match of content.matchAll(markdownImageRegex)) {
    images.push({
      kind: "markdown",
      path: match[1],
    });
  }

  const sourceUriRegex =
    /source=\{\{\s*[^}]*?uri\s*:\s*["']([^"']+)["'][^}]*\}\}/g;
  for (const match of content.matchAll(sourceUriRegex)) {
    images.push({
      kind: "jsx",
      attribute: "source",
      path: match[1],
    });
  }

  const jsxImageRegex =
    /<(?:img|Image)\b[^>]*\b(src|source)\s*=\s*(?:"([^"]+)"|'([^']+)'|\{`([^`]+)`\}|\{['"]([^'"]+)['"]\})/g;
  for (const match of content.matchAll(jsxImageRegex)) {
    const attribute = match[1] as "src" | "source";
    const imagePath =
      match[2] || match[3] || match[4] || match[5] || undefined;

    if (imagePath) {
      images.push({
        kind: "jsx",
        attribute,
        path: imagePath,
      });
    }
  }

  const dynamicImageRegex =
    /<(?:img|Image)\b[^>]*\b(src|source)\s*=\s*\{([^}]+)\}[^>]*>/g;
  for (const match of content.matchAll(dynamicImageRegex)) {
    const attribute = match[1] as "src" | "source";
    const expression = match[2].trim();
    const hasStringLiteral = /['"`]/.test(expression);

    if (!hasStringLiteral) {
      dynamicImages.push({
        kind: "jsx",
        attribute,
        expression,
      });
    }
  }

  return { images, dynamicImages };
}

function getCourseSlug(filePath: string): string | undefined {
  const relative = path.relative(CONTENT_DIR, filePath);
  const parts = relative.split(path.sep);

  if (parts[0] === "courses" && parts.length > 1) {
    return parts[1];
  }

  return undefined;
}

async function main() {
  const courseSlugs = new Set(await listDirectories(COURSES_DIR));
  const mdxFiles = await walkMdxFiles(CONTENT_DIR);

  const bannerFiles = await fs.readdir(COURSE_BANNERS_DIR);
  const bannerSlugs = new Set(
    bannerFiles
      .filter(file => file.endsWith(".png"))
      .map(file => file.replace(/\.png$/i, "")),
  );

  const courseBannerMap: Record<string, string> = {};
  const missingCourseBannerFiles: string[] = [];

  for (const slug of courseSlugs) {
    const expectedBanner = `/graphics/course-banners/${slug}.png`;
    courseBannerMap[slug] = expectedBanner;
    if (!bannerSlugs.has(slug)) {
      missingCourseBannerFiles.push(slug);
    }
  }

  const courseBannerUsage: Report["courseBannerUsage"] = {};
  const fileReports: FileImageReport[] = [];

  let totalImages = 0;
  let totalDynamicImages = 0;
  let totalCourseBannerImages = 0;
  let mismatchedCourseBannerImages = 0;

  for (const filePath of mdxFiles) {
    const content = await fs.readFile(filePath, "utf8");
    const { images, dynamicImages } = extractImages(content);

    if (images.length === 0 && dynamicImages.length === 0) {
      continue;
    }

    const courseSlug = getCourseSlug(filePath);
    const expectedBanner = courseSlug ? courseBannerMap[courseSlug] : null;

    const normalizedExpectedVariants = expectedBanner
      ? new Set([expectedBanner, expectedBanner.replace(/^\//, "")])
      : null;

    const reportImages = images.map(image => {
      const normalizedPath = normalizeImagePath(image.path);
      const isCourseBanner =
        normalizedPath.includes("/graphics/course-banners/") ||
        normalizedPath.includes("graphics/course-banners/");
      const matchesExpected = expectedBanner
        ? normalizedExpectedVariants?.has(normalizedPath) ?? false
        : null;

      if (courseSlug && isCourseBanner) {
        totalCourseBannerImages += 1;
        if (!matchesExpected) {
          mismatchedCourseBannerImages += 1;
        }
      }

      return {
        kind: image.kind,
        attribute: image.attribute,
        path: image.path,
        isCourseBanner,
        matchesExpected,
      };
    });

    totalImages += images.length;
    totalDynamicImages += dynamicImages.length;

    if (courseSlug && expectedBanner) {
      const usage = courseBannerUsage[courseSlug] ?? {
        expectedBanner,
        foundBanners: [],
        mismatchedBanners: [],
        files: [],
      };

      const bannerPaths = reportImages
        .filter(image => image.isCourseBanner)
        .map(image => normalizeImagePath(image.path));

      for (const bannerPath of bannerPaths) {
        if (!usage.foundBanners.includes(bannerPath)) {
          usage.foundBanners.push(bannerPath);
        }

        if (
          bannerPath !== expectedBanner &&
          bannerPath !== expectedBanner.replace(/^\//, "") &&
          !usage.mismatchedBanners.includes(bannerPath)
        ) {
          usage.mismatchedBanners.push(bannerPath);
        }
      }

      usage.files.push(path.relative(process.cwd(), filePath));
      courseBannerUsage[courseSlug] = usage;
    }

    fileReports.push({
      file: path.relative(process.cwd(), filePath),
      courseSlug,
      expectedBanner,
      images: reportImages,
      dynamicImages,
    });
  }

  const coursesWithoutBannerUsage = Object.keys(courseBannerMap).filter(slug => {
    const usage = courseBannerUsage[slug];
    return !usage || usage.foundBanners.length === 0;
  });

  const report: Report = {
    summary: {
      mdxFiles: mdxFiles.length,
      filesWithImages: fileReports.length,
      totalImages,
      totalDynamicImages,
      totalCourseBannerImages,
      mismatchedCourseBannerImages,
      coursesWithMissingBannerFile: missingCourseBannerFiles.length,
      coursesWithoutBannerUsage: coursesWithoutBannerUsage.length,
    },
    courseBannerMap,
    courseBannerUsage,
    missingCourseBannerFiles: missingCourseBannerFiles.sort(),
    files: fileReports,
  };

  await fs.mkdir(REPORT_DIR, { recursive: true });
  await fs.writeFile(REPORT_FILE, JSON.stringify(report, null, 2), "utf8");

  console.log(`MDX files scanned: ${mdxFiles.length}`);
  console.log(`Files with images: ${fileReports.length}`);
  console.log(`Total images found: ${totalImages}`);
  console.log(`Course banner images found: ${totalCourseBannerImages}`);
  console.log(`Course banner mismatches: ${mismatchedCourseBannerImages}`);
  console.log(
    `Missing course banner files: ${missingCourseBannerFiles.length}`,
  );
  console.log(`Report written to: ${REPORT_FILE}`);
}

main().catch(error => {
  console.error("Error generating MDX image banner map:", error);
  process.exit(1);
});
