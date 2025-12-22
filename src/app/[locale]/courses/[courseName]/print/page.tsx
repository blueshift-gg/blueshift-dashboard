import { getTranslations } from "next-intl/server";
import { getCourse } from "@/app/utils/content";
import { getCompiledMdx } from "@/app/utils/mdx";
import MdxLayout from "@/app/mdx-layout";
import ContentFallbackNotice from "@/app/components/ContentFallbackNotice";
import { Metadata } from "next";
import PrintButton from "@/app/components/PrintButton";

interface PrintPageProps {
    params: Promise<{
        courseName: string;
        locale: string;
    }>;
}

export async function generateMetadata({
    params,
}: PrintPageProps): Promise<Metadata> {
    const { courseName, locale } = await params;
    const t = await getTranslations({ locale });
    const courseMetadata = await getCourse(courseName);

    return {
        title: `${t("metadata.title")} | ${t(`courses.${courseMetadata.slug}.title`)} (PDF)`,
        robots: {
            index: false,
            follow: false,
        },
    };
}

export default async function PrintPage({ params }: PrintPageProps) {
    const { courseName, locale } = await params;
    const t = await getTranslations({ locale });
    const courseMetadata = await getCourse(courseName);

    // Fetch all lessons content
    const lessonsContent = await Promise.all(
        courseMetadata.lessons.map(async (lesson) => {
            let LessonComponent;
            let lessonLocale = locale;

            try {
                LessonComponent = await getCompiledMdx(
                    `courses/${courseName}/${lesson.slug}/${locale}.mdx`
                );
            } catch {
                try {
                    LessonComponent = await getCompiledMdx(
                        `courses/${courseName}/${lesson.slug}/en.mdx`
                    );
                    lessonLocale = "en";
                } catch {
                    return null;
                }
            }

            return {
                slug: lesson.slug,
                component: LessonComponent,
                locale: lessonLocale,
            };
        })
    );

    return (
        <div className="max-w-app mx-auto w-full px-8 py-8 bg-background text-primary">
            <style>{`
              @media print {
            @page {
                margin: 20mm;
                size: auto;
            }
            body { 
                background: white !important; 
                color: black !important; 
            }
            
            /* Reset all elements to black text/transparent background */
            html, body, div, span, applet, object, iframe,
            h1, h2, h3, h4, h5, h6, p, blockquote, pre,
            a, abbr, acronym, address, big, cite, code,
            del, dfn, em, img, ins, kbd, q, s, samp,
            small, strike, strong, sub, sup, tt, var,
            b, u, i, center,
            dl, dt, dd, ol, ul, li,
            fieldset, form, label, legend,
            table, caption, tbody, tfoot, thead, tr, th, td,
            article, aside, canvas, details, embed, 
            figure, figcaption, footer, header, hgroup, 
            menu, nav, output, ruby, section, summary,
            time, mark, audio, video {
                background-color: transparent !important;
                color: black !important;
                box-shadow: none !important;
                text-shadow: none !important;
            }

            .print-hidden {
                display: none !important;
            }

            .page-break {
                break-before: page;
            }

            /* Code Blocks - Critical Fixes */
            pre, code {
                white-space: pre-wrap !important; /* Allow wrapping */
                word-wrap: break-word !important; /* different browsers */
                overflow-x: visible !important;   /* No scrolling */
                overflow-y: visible !important;
                border: 1px solid #000 !important; /* Proper border */
                background-color: transparent !important;
                color: black !important;
                display: block !important;
                page-break-inside: avoid;
            }

            pre {
                padding: 1rem !important;
                margin-bottom: 1rem !important;
            }

            /* Override Shiki/Highlight.js specific colors - deep selector */
            pre span, code span, .shiki span {
                 color: black !important;
                 background-color: transparent !important;
                 text-shadow: none !important;
            }
            
            /* Hide copy buttons and other non-print UI inside code blocks if identifiable */
            button {
                display: none !important;
            }

            /* Ensure MdxLayout prose doesn't mess it up */
            .prose {
                max-width: 100% !important;
                color: black !important;
            }
            
            /* Headings */
            h1, h2, h3, h4, h5, h6 {
                page-break-after: avoid;
                color: black !important;
            }

            /* Links */
            a {
                color: black !important;
                text-decoration: underline !important;
            }
        }
      `}</style>

            <div className="print-hidden fixed bottom-8 right-8 z-50">
                <PrintButton />
            </div>

            <div className="mb-12 text-center border-b border-border pb-8">
                <h1 className="text-4xl font-bold mb-4">
                    {t(`courses.${courseMetadata.slug}.title`)}
                </h1>
                <p className="text-xl text-shade-secondary">
                    {t(`courses.${courseMetadata.slug}.description`)}
                </p>
            </div>

            <div className="block">
                {lessonsContent.map((item, index) => {
                    if (!item) return null;

                    return (
                        <div key={item.slug} className={`mb-16 ${index > 0 ? "page-break" : ""}`}>
                            <div className="mb-0 border-b border-border/50 pb-4 break-inside-avoid">
                                <span className="text-sm font-mono text-shade-tertiary uppercase tracking-wider">
                                    {t("lessons.lesson")} {index + 1}
                                </span>
                                <h2 className="text-3xl font-bold mt-2">
                                    {t(`courses.${courseMetadata.slug}.lessons.${item.slug}`)}
                                </h2>
                            </div>
                            <div className="mt-8">
                                <MdxLayout>
                                    <ContentFallbackNotice
                                        locale={locale}
                                        originalLocale={item.locale}
                                    />
                                    {item.component}
                                </MdxLayout>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
