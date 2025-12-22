import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { getCourse, getCourseLessons } from "@/app/utils/content";
import { fetchCompiledContent } from "@/app/utils/content-source";
import { CoursePdfDocument, LessonContent } from "@/lib/pdf";

interface RouteContext {
    params: Promise<{
        courseSlug: string;
    }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
    try {
        const { courseSlug } = await context.params;
        const { searchParams } = new URL(request.url);
        const locale = searchParams.get("locale") || "en";

        // Fetch course metadata
        let course;
        try {
            course = await getCourse(courseSlug);
        } catch {
            return NextResponse.json(
                { error: "Course not found" },
                { status: 404 }
            );
        }

        // Fetch all lessons
        const lessonMetadata = await getCourseLessons(courseSlug);

        // Fetch content for each lesson
        const lessons: LessonContent[] = await Promise.all(
            lessonMetadata.map(async (lesson) => {
                let content;
                let rawContent = "";

                // Try to fetch in requested locale, fall back to English
                try {
                    content = await fetchCompiledContent(
                        `courses/${courseSlug}/${lesson.slug}/${locale}.mdx`
                    );
                    rawContent = content.raw;
                } catch {
                    try {
                        content = await fetchCompiledContent(
                            `courses/${courseSlug}/${lesson.slug}/en.mdx`
                        );
                        rawContent = content.raw;
                    } catch {
                        rawContent = `# ${lesson.slug}\n\nContent not available.`;
                    }
                }

                // Convert slug to readable title (e.g., "anchor-101" -> "Anchor 101")
                const title = lesson.slug
                    .split("-")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ");

                return {
                    lessonNumber: lesson.lessonNumber,
                    slug: lesson.slug,
                    title,
                    rawContent,
                };
            })
        );

        // Convert course slug to readable title
        const courseTitle = course.slug
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");

        // Generate PDF
        const pdfBuffer = await renderToBuffer(
            CoursePdfDocument({
                courseTitle,
                courseSlug: course.slug,
                language: course.language,
                lessons,
                generatedAt: new Date().toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                }),
            })
        );

        // Return PDF as downloadable file
        // Convert Buffer to Uint8Array for NextResponse compatibility
        const pdfData = new Uint8Array(pdfBuffer);

        return new NextResponse(pdfData, {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="${course.slug}.pdf"`,
                "Cache-Control": "private, max-age=3600",
            },
        });
    } catch (error) {
        console.error("PDF generation error:", error);
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error";

        return NextResponse.json(
            { error: "Failed to generate PDF", details: errorMessage },
            { status: 500 }
        );
    }
}
