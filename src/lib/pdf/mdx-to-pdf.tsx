import React from "react";
import { Text, View, Image, Link } from "@react-pdf/renderer";
import { styles } from "./pdf-styles";
import type { Root, RootContent, PhrasingContent } from "mdast";

/**
 * Converts an MDX AST (mdast) to react-pdf elements.
 * This handles the core markdown elements needed for course content.
 */

type MdastNode = RootContent | PhrasingContent;

// Extract text content from a node and its children
function extractText(node: MdastNode): string {
    if ("value" in node && typeof node.value === "string") {
        return node.value;
    }
    if ("children" in node && Array.isArray(node.children)) {
        return (node.children as MdastNode[]).map(extractText).join("");
    }
    return "";
}

// Render inline/phrasing content (text, strong, em, code, links)
function renderPhrasingContent(nodes: PhrasingContent[]): React.ReactNode[] {
    return nodes.map((node, index) => {
        const key = `phrasing-${index}`;

        switch (node.type) {
            case "text":
                return node.value;

            case "strong":
                return (
                    <Text key={key} style={styles.strong}>
                        {renderPhrasingContent(node.children as PhrasingContent[])}
                    </Text>
                );

            case "emphasis":
                return (
                    <Text key={key} style={styles.emphasis}>
                        {renderPhrasingContent(node.children as PhrasingContent[])}
                    </Text>
                );

            case "inlineCode":
                return (
                    <Text key={key} style={styles.inlineCode}>
                        {node.value}
                    </Text>
                );

            case "link":
                return (
                    <Link key={key} src={node.url} style={styles.link}>
                        {extractText(node)}
                    </Link>
                );

            default:
                // For any other phrasing content, try to extract text
                return extractText(node);
        }
    });
}

// Render a single block-level node
function renderNode(node: RootContent, index: number): React.ReactNode {
    const key = `node-${index}`;

    switch (node.type) {
        case "heading": {
            const headingStyles = {
                1: styles.h1,
                2: styles.h2,
                3: styles.h3,
                4: styles.h4,
                5: styles.h4,
                6: styles.h4,
            };
            const style = headingStyles[node.depth as keyof typeof headingStyles] || styles.h4;
            return (
                <Text key={key} style={style}>
                    {renderPhrasingContent(node.children as PhrasingContent[])}
                </Text>
            );
        }

        case "paragraph":
            return (
                <Text key={key} style={styles.paragraph}>
                    {renderPhrasingContent(node.children as PhrasingContent[])}
                </Text>
            );

        case "code": {
            const language = node.lang || "text";
            return (
                <View key={key} style={styles.codeBlock} wrap={false}>
                    {language !== "text" && (
                        <Text style={styles.codeBlockLabel}>{language}</Text>
                    )}
                    <Text style={styles.code}>{node.value}</Text>
                </View>
            );
        }

        case "blockquote":
            return (
                <View key={key} style={styles.blockquote}>
                    <Text style={styles.blockquoteText}>
                        {(node.children as RootContent[]).map(extractText).join("\n")}
                    </Text>
                </View>
            );

        case "list": {
            const isOrdered = node.ordered;
            return (
                <View key={key} style={styles.list}>
                    {node.children.map((item, itemIndex) => {
                        if (item.type !== "listItem") return null;
                        const bullet = isOrdered ? `${itemIndex + 1}.` : "•";
                        return (
                            <View key={`list-item-${itemIndex}`} style={styles.listItem}>
                                <Text style={styles.listBullet}>{bullet}</Text>
                                <Text style={styles.listContent}>
                                    {(item.children as RootContent[]).map(extractText).join(" ")}
                                </Text>
                            </View>
                        );
                    })}
                </View>
            );
        }

        case "thematicBreak":
            return (
                <View
                    key={key}
                    style={{
                        borderBottomWidth: 1,
                        borderBottomColor: "#1a1e26",
                        marginVertical: 20,
                    }}
                />
            );

        case "image": {
            // Handle images - only if they're absolute URLs or public paths
            const src = node.url;
            if (src.startsWith("http") || src.startsWith("/graphics")) {
                const imageSrc = src.startsWith("/")
                    ? `https://learn.blueshift.gg${src}`
                    : src;
                return (
                    <View key={key}>
                        <Image src={imageSrc} style={styles.image} />
                        {node.alt && <Text style={styles.imageCaption}>{node.alt}</Text>}
                    </View>
                );
            }
            return null;
        }

        // Skip MDX-specific nodes (jsx elements, imports, etc.)
        case "mdxJsxFlowElement":
            return null;

        default:
            // For unknown node types, try to extract and render as text
            const text = extractText(node);
            if (text) {
                return (
                    <Text key={key} style={styles.paragraph}>
                        {text}
                    </Text>
                );
            }
            return null;
    }
}

/**
 * Main function to convert MDX AST to react-pdf elements
 */
export function mdxAstToPdf(ast: Root): React.ReactNode[] {
    if (!ast.children || !Array.isArray(ast.children)) {
        return [];
    }

    return ast.children
        .map((node, index) => renderNode(node, index))
        .filter(Boolean);
}

/**
 * Parse raw MDX content to extract basic structure for PDF
 * This is a simpler approach that parses the raw markdown directly
 */
export function parseRawMdxForPdf(raw: string): React.ReactNode[] {
    const elements: React.ReactNode[] = [];
    const lines = raw.split("\n");
    let index = 0;
    let inCodeBlock = false;
    let codeBlockContent = "";
    let codeBlockLang = "";

    while (index < lines.length) {
        const line = lines[index];

        // Handle code blocks
        if (line.startsWith("```")) {
            if (!inCodeBlock) {
                inCodeBlock = true;
                codeBlockLang = line.slice(3).trim();
                codeBlockContent = "";
            } else {
                inCodeBlock = false;
                elements.push(
                    <View key={`code-${index}`} style={styles.codeBlock} wrap={false}>
                        {codeBlockLang && (
                            <Text style={styles.codeBlockLabel}>{codeBlockLang}</Text>
                        )}
                        <Text style={styles.code}>{codeBlockContent.trim()}</Text>
                    </View>
                );
            }
            index++;
            continue;
        }

        if (inCodeBlock) {
            codeBlockContent += line + "\n";
            index++;
            continue;
        }

        // Skip import statements and JSX components
        if (line.startsWith("import ") || line.startsWith("<")) {
            index++;
            continue;
        }

        // Handle headings
        const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
        if (headingMatch) {
            const level = headingMatch[1].length;
            const text = headingMatch[2];
            const headingStyles: Record<number, typeof styles.h1> = {
                1: styles.h1,
                2: styles.h2,
                3: styles.h3,
                4: styles.h4,
            };
            elements.push(
                <Text key={`heading-${index}`} style={headingStyles[level] || styles.h4}>
                    {text}
                </Text>
            );
            index++;
            continue;
        }

        // Handle blockquotes
        if (line.startsWith(">")) {
            let quoteContent = line.slice(1).trim();
            index++;
            while (index < lines.length && lines[index].startsWith(">")) {
                quoteContent += " " + lines[index].slice(1).trim();
                index++;
            }
            elements.push(
                <View key={`quote-${index}`} style={styles.blockquote}>
                    <Text style={styles.blockquoteText}>{quoteContent}</Text>
                </View>
            );
            continue;
        }

        // Handle list items
        if (line.match(/^[-*]\s/) || line.match(/^\d+\.\s/)) {
            const listItems: string[] = [];
            const isOrdered = line.match(/^\d+\.\s/) !== null;

            while (
                index < lines.length &&
                (lines[index].match(/^[-*]\s/) || lines[index].match(/^\d+\.\s/))
            ) {
                listItems.push(
                    lines[index].replace(/^[-*]\s/, "").replace(/^\d+\.\s/, "")
                );
                index++;
            }

            elements.push(
                <View key={`list-${index}`} style={styles.list}>
                    {listItems.map((item, i) => (
                        <View key={`item-${i}`} style={styles.listItem}>
                            <Text style={styles.listBullet}>
                                {isOrdered ? `${i + 1}.` : "•"}
                            </Text>
                            <Text style={styles.listContent}>{item}</Text>
                        </View>
                    ))}
                </View>
            );
            continue;
        }

        // Handle horizontal rules
        if (line.match(/^---+$/) || line.match(/^\*\*\*+$/)) {
            elements.push(
                <View
                    key={`hr-${index}`}
                    style={{
                        borderBottomWidth: 1,
                        borderBottomColor: "#1a1e26",
                        marginVertical: 20,
                    }}
                />
            );
            index++;
            continue;
        }

        // Handle paragraphs (non-empty lines)
        if (line.trim()) {
            let paragraphContent = line;
            index++;
            // Collect consecutive non-empty lines that aren't special syntax
            while (
                index < lines.length &&
                lines[index].trim() &&
                !lines[index].startsWith("#") &&
                !lines[index].startsWith("```") &&
                !lines[index].startsWith(">") &&
                !lines[index].match(/^[-*]\s/) &&
                !lines[index].match(/^\d+\.\s/) &&
                !lines[index].startsWith("import ") &&
                !lines[index].startsWith("<")
            ) {
                paragraphContent += " " + lines[index];
                index++;
            }

            elements.push(
                <Text key={`para-${index}`} style={styles.paragraph}>
                    {paragraphContent}
                </Text>
            );
            continue;
        }

        index++;
    }

    return elements;
}
