import React from "react";
import {
    Document,
    Page,
    Text,
    View,
} from "@react-pdf/renderer";
import { styles, colors } from "./pdf-styles";
import { parseRawMdxForPdf } from "./mdx-to-pdf";

export interface LessonContent {
    lessonNumber: number;
    slug: string;
    title: string;
    rawContent: string;
}

export interface CoursePdfProps {
    courseTitle: string;
    courseSlug: string;
    language: string;
    lessons: LessonContent[];
    generatedAt: string;
}

/**
 * Cover page component
 */
function CoverPage({
    courseTitle,
    language,
    generatedAt,
}: {
    courseTitle: string;
    language: string;
    generatedAt: string;
}) {
    return (
        <Page size="A4" style={styles.coverPage}>
            <View
                style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <Text style={styles.coverBadge}>{language.toUpperCase()}</Text>
                <Text style={styles.coverTitle}>{courseTitle}</Text>
                <Text style={styles.coverMeta}>Blueshift Education</Text>
                <Text style={[styles.coverMeta, { marginTop: 10, fontSize: 10 }]}>
                    learn.blueshift.gg
                </Text>
            </View>
            <Text
                style={{
                    fontSize: 9,
                    color: colors.textMuted,
                    textAlign: "center",
                    marginTop: "auto",
                }}
            >
                Generated on {generatedAt}
            </Text>
        </Page>
    );
}

/**
 * Table of Contents page
 */
function TableOfContentsPage({ lessons }: { lessons: LessonContent[] }) {
    return (
        <Page size="A4" style={styles.tocPage}>
            <Text style={styles.tocTitle}>Table of Contents</Text>
            {lessons.map((lesson, index) => (
                <View key={lesson.slug} style={styles.tocItem}>
                    <Text style={styles.tocItemNumber}>
                        {String(lesson.lessonNumber).padStart(2, "0")}
                    </Text>
                    <Text style={styles.tocItemTitle}>{lesson.title}</Text>
                    <Text style={styles.tocItemPage}>{index + 3}</Text>
                </View>
            ))}
        </Page>
    );
}

/**
 * Individual lesson page component
 */
function LessonPage({
    lesson,
    courseTitle,
}: {
    lesson: LessonContent;
    courseTitle: string;
}) {
    const pdfContent = parseRawMdxForPdf(lesson.rawContent);

    return (
        <Page size="A4" style={styles.page} wrap>
            {/* Lesson header */}
            <View style={styles.lessonHeader}>
                <Text style={styles.lessonNumber}>
                    Lesson {String(lesson.lessonNumber).padStart(2, "0")}
                </Text>
                <Text style={styles.lessonTitle}>{lesson.title}</Text>
            </View>

            {/* Lesson content */}
            <View>{pdfContent}</View>

            {/* Page footer */}
            <Text style={styles.pageFooter} fixed>
                {courseTitle}
            </Text>
            <Text
                style={styles.pageNumber}
                render={({ pageNumber }) => `${pageNumber}`}
                fixed
            />
        </Page>
    );
}

/**
 * Main Course PDF Document component
 */
export function CoursePdfDocument({
    courseTitle,
    language,
    lessons,
    generatedAt,
}: CoursePdfProps) {
    return (
        <Document
            title={courseTitle}
            author="Blueshift Education"
            subject={`${courseTitle} - Complete Course`}
            creator="Blueshift PDF Generator"
        >
            {/* Cover Page */}
            <CoverPage
                courseTitle={courseTitle}
                language={language}
                generatedAt={generatedAt}
            />

            {/* Table of Contents */}
            <TableOfContentsPage lessons={lessons} />

            {/* Lesson Pages */}
            {lessons.map((lesson) => (
                <LessonPage
                    key={lesson.slug}
                    lesson={lesson}
                    courseTitle={courseTitle}
                />
            ))}
        </Document>
    );
}
