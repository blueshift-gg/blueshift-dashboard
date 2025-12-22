import { StyleSheet, Font } from "@react-pdf/renderer";

// Register fonts for PDF generation
// Using system fonts as fallback since custom fonts require specific registration
Font.register({
    family: "Courier",
    fonts: [
        { src: "Courier" },
        { src: "Courier-Bold", fontWeight: "bold" },
    ],
});

// Blueshift-inspired color palette
export const colors = {
    background: "#0b0e14",
    backgroundCard: "#11141a",
    primary: "#00ffff", // Brand cyan
    secondary: "#00e6e6",
    textPrimary: "#eff1f6",
    textSecondary: "#ced5e4",
    textTertiary: "#adb9d2",
    textMuted: "#585e6c",
    border: "#1a1e26",
    codeBackground: "#171a20",
    // Language badge colors
    anchor: "#ddeae0",
    rust: "#ffad66",
    typescript: "#69a2f1",
    general: "#00ffff",
    assembly: "#ff7b72",
};

export const styles = StyleSheet.create({
    // Document
    page: {
        backgroundColor: colors.background,
        padding: 40,
        fontFamily: "Helvetica",
        fontSize: 11,
        color: colors.textSecondary,
        lineHeight: 1.6,
    },

    // Cover page
    coverPage: {
        backgroundColor: colors.background,
        padding: 60,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
    },
    coverTitle: {
        fontSize: 36,
        fontFamily: "Helvetica-Bold",
        color: colors.textPrimary,
        textAlign: "center",
        marginBottom: 20,
    },
    coverBadge: {
        fontSize: 14,
        color: colors.primary,
        fontFamily: "Courier",
        marginBottom: 10,
    },
    coverMeta: {
        fontSize: 12,
        color: colors.textTertiary,
        textAlign: "center",
        marginTop: 40,
    },

    // Table of Contents
    tocPage: {
        backgroundColor: colors.background,
        padding: 40,
    },
    tocTitle: {
        fontSize: 24,
        fontFamily: "Helvetica-Bold",
        color: colors.textPrimary,
        marginBottom: 30,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        paddingBottom: 10,
    },
    tocItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 12,
        paddingVertical: 4,
    },
    tocItemNumber: {
        fontSize: 11,
        color: colors.primary,
        fontFamily: "Courier",
        width: 30,
    },
    tocItemTitle: {
        fontSize: 11,
        color: colors.textSecondary,
        flex: 1,
    },
    tocItemPage: {
        fontSize: 11,
        color: colors.textMuted,
        fontFamily: "Courier",
    },

    // Lesson content
    lessonHeader: {
        marginBottom: 30,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    lessonNumber: {
        fontSize: 12,
        color: colors.primary,
        fontFamily: "Courier",
        marginBottom: 8,
    },
    lessonTitle: {
        fontSize: 24,
        fontFamily: "Helvetica-Bold",
        color: colors.textPrimary,
    },

    // Typography
    h1: {
        fontSize: 24,
        fontFamily: "Helvetica-Bold",
        color: colors.textPrimary,
        marginTop: 24,
        marginBottom: 16,
    },
    h2: {
        fontSize: 20,
        fontFamily: "Helvetica-Bold",
        color: colors.textPrimary,
        marginTop: 20,
        marginBottom: 12,
    },
    h3: {
        fontSize: 16,
        fontFamily: "Helvetica-Bold",
        color: colors.textPrimary,
        marginTop: 16,
        marginBottom: 10,
    },
    h4: {
        fontSize: 14,
        fontFamily: "Helvetica-Bold",
        color: colors.textPrimary,
        marginTop: 12,
        marginBottom: 8,
    },
    paragraph: {
        fontSize: 11,
        color: colors.textSecondary,
        marginBottom: 12,
        lineHeight: 1.7,
    },
    strong: {
        fontFamily: "Helvetica-Bold",
        color: colors.textPrimary,
    },
    emphasis: {
        fontStyle: "italic",
    },
    link: {
        color: colors.primary,
        textDecoration: "underline",
    },

    // Code blocks
    codeBlock: {
        backgroundColor: colors.codeBackground,
        padding: 16,
        marginVertical: 12,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: colors.border,
    },
    codeBlockLabel: {
        fontSize: 9,
        color: colors.textMuted,
        fontFamily: "Courier",
        marginBottom: 8,
        textTransform: "uppercase",
    },
    code: {
        fontSize: 9,
        fontFamily: "Courier",
        color: colors.textSecondary,
        lineHeight: 1.5,
    },
    inlineCode: {
        fontSize: 10,
        fontFamily: "Courier",
        color: colors.primary,
        backgroundColor: colors.codeBackground,
        paddingHorizontal: 4,
        paddingVertical: 2,
    },

    // Lists
    list: {
        marginVertical: 12,
        paddingLeft: 20,
    },
    listItem: {
        flexDirection: "row",
        marginBottom: 6,
    },
    listBullet: {
        width: 15,
        color: colors.primary,
        fontSize: 11,
    },
    listContent: {
        flex: 1,
        fontSize: 11,
        color: colors.textSecondary,
        lineHeight: 1.6,
    },

    // Blockquote
    blockquote: {
        backgroundColor: "rgba(0, 255, 255, 0.05)",
        borderLeftWidth: 3,
        borderLeftColor: colors.primary,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginVertical: 12,
    },
    blockquoteText: {
        fontSize: 11,
        color: colors.textSecondary,
        fontStyle: "italic",
    },

    // Images
    image: {
        marginVertical: 16,
        maxWidth: "100%",
    },
    imageCaption: {
        fontSize: 10,
        color: colors.textMuted,
        textAlign: "center",
        marginTop: 8,
    },

    // Footer
    pageNumber: {
        position: "absolute",
        bottom: 20,
        right: 40,
        fontSize: 10,
        color: colors.textMuted,
        fontFamily: "Courier",
    },
    pageFooter: {
        position: "absolute",
        bottom: 20,
        left: 40,
        fontSize: 10,
        color: colors.textMuted,
    },
});
