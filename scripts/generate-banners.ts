import fs from "fs/promises";
import path from "path";
import { generateBannerData } from "@/lib/banners/banner-generator";
import sharp from "sharp";
import { courses } from "@/app/content/courses/courses";
import { challenges } from "@/app/content/challenges/challenges";
import { paths } from "@/app/content/paths/paths";

const COURSE_BANNERS_DIR = path.join(
  process.cwd(),
  "public",
  "graphics",
  "course-banners",
);
const CHALLENGE_BANNERS_DIR = path.join(
  process.cwd(),
  "public",
  "graphics",
  "challenge-banners",
);
const PATH_BANNERS_DIR = path.join(
  process.cwd(),
  "public",
  "graphics",
  "path-banners",
);

async function generateBannersFor(
  items: any[],
  type: "course" | "challenge" | "path",
  outputDir: string,
  options: { force: boolean },
) {
  await fs.mkdir(outputDir, { recursive: true });
  console.log(`Output directory ensured: ${outputDir}`);

  // Snapshot of existing files
  const existingFiles = new Set(await fs.readdir(outputDir));

  if (!items || !Array.isArray(items) || items.length === 0) {
    console.error(`No ${type}s found to generate banners for.`);
    return;
  }

  console.log(`Found ${items.length} ${type}s to generate banners for.`);

  for (const item of items) {
    if (!item.slug) {
      console.warn(
        `${type} with no slug found, skipping: ${JSON.stringify(item)}`,
      );
      continue;
    }

    const itemSlug = item.slug;
    const filename = `${itemSlug}.png`;
    const filePath = path.join(outputDir, filename);

    // Skip if already exists and not forcing
    if (!options.force && existingFiles.has(filename)) {
      console.log(`Skipping existing ${type} banner: ${filePath}`);
      continue;
    }

    console.log(`Processing ${type} overview for: ${itemSlug}`);

    const bannerInfo = await generateBannerData({
      itemSlug,
      type,
    });

    if (bannerInfo && bannerInfo.data) {
      // Optimize using sharp before writing to disk
      let outputBuffer: Buffer;
      try {
        outputBuffer = await sharp(bannerInfo.data)
          .png({ compressionLevel: 9, adaptiveFiltering: true, palette: true })
          .toBuffer();
        console.log(`Optimized PNG with sharp: ${filePath}`);
      } catch (optErr) {
        console.warn(`PNG optimization failed for ${filePath}:`, optErr);
        outputBuffer = Buffer.from(bannerInfo.data);
      }

      await fs.writeFile(filePath, outputBuffer);

      existingFiles.add(filename);
      console.log(`Successfully generated and saved: ${filePath}`);
    } else {
      console.warn(
        `Skipped banner for ${itemSlug} (generation failed or no data returned).`,
      );
    }
  }
}

async function main() {
  const argv = process.argv.slice(2);
  const force = argv.includes("-f") || argv.includes("--force");

  await generateBannersFor(courses, "course", COURSE_BANNERS_DIR, { force });
  await generateBannersFor(challenges, "challenge", CHALLENGE_BANNERS_DIR, {
    force,
  });
  await generateBannersFor(paths, "path", PATH_BANNERS_DIR, { force });

  console.log("Banner generation process complete.");
}

main().catch(error => {
  console.error("Unexpected error in main execution:", error);
  process.exit(1);
});
