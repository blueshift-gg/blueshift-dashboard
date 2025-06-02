import fs from "fs/promises";
import path from "path";
import { generateBannerData } from "@/lib/banners/banner-generator";
import { courses } from "@/app/content/courses/courses";

const OUTPUT_DIR = path.join(process.cwd(), "public", "graphics", "banners");

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  console.log(`Output directory ensured: ${OUTPUT_DIR}`);

  if (!courses || !Array.isArray(courses) || courses.length === 0) {
    console.error("No courses found to generate banners for.");
    return;
  }

  console.log(`Found ${courses.length} courses to generate banners for.`);

  for (const course of courses) {
    if (!course.slug) {
      console.warn(`Course with no slug found, skipping: ${JSON.stringify(course)}`);
      continue;
    }

    const courseSlug = course.slug;
    console.log(`Processing course overview for: ${courseSlug}`);

    const bannerInfo = await generateBannerData({ courseSlug });

    if (bannerInfo && bannerInfo.data) {
      const safeCourseSlug = courseSlug.replace(/[^a-zA-Z0-9_\-]/g, "");
      const filename = `${safeCourseSlug}.png`;
      const filePath = path.join(OUTPUT_DIR, filename);

      await fs.writeFile(filePath, Buffer.from(bannerInfo.data));
      console.log(`Successfully generated and saved: ${filePath}`);
    } else {
      console.warn(
        `Skipped banner for ${courseSlug} (generation failed or no data returned).`,
      );
    }
  }

  console.log("Banner generation process complete.");
}

main().catch(error => {
  console.error("Unexpected error in main execution:", error);
  process.exit(1);
});
