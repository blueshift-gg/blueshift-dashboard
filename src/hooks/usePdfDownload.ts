"use client";

import { useState, useCallback } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "react-hot-toast";

interface UsePdfDownloadReturn {
    downloadPdf: (courseSlug: string) => Promise<void>;
    isDownloading: boolean;
}

/**
 * Hook to handle PDF download with loading state and error handling.
 * Triggers fetch to /api/courses/[slug]/pdf and handles blob response.
 */
export function usePdfDownload(): UsePdfDownloadReturn {
    const [isDownloading, setIsDownloading] = useState(false);
    const locale = useLocale();
    const t = useTranslations();

    const downloadPdf = useCallback(
        async (courseSlug: string) => {
            if (isDownloading) return;

            setIsDownloading(true);

            // Show loading toast
            const loadingToast = toast.loading(
                t("lessons.downloading_pdf") || "Generating PDF..."
            );

            try {
                const response = await fetch(
                    `/api/courses/${courseSlug}/pdf?locale=${locale}`,
                    {
                        method: "GET",
                    }
                );

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({})) as { error?: string };
                    throw new Error(
                        errorData.error || `HTTP ${response.status}: Failed to generate PDF`
                    );
                }

                // Get the blob from response
                const blob = await response.blob();

                // Create download link
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = `${courseSlug}.pdf`;
                document.body.appendChild(link);
                link.click();

                // Cleanup
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);

                toast.dismiss(loadingToast);
                toast.success(
                    t("lessons.pdf_download_success") || "PDF downloaded successfully"
                );
            } catch (error) {
                console.error("PDF download error:", error);
                toast.dismiss(loadingToast);
                toast.error(
                    t("lessons.pdf_download_error") || "Failed to generate PDF"
                );
            } finally {
                setIsDownloading(false);
            }
        },
        [isDownloading, locale, t]
    );

    return { downloadPdf, isDownloading };
}
