import { ReactNode } from "react";
import { PathContentProvider, PathNavigationStep } from "@/app/contexts/PathContentContext";
import { getPathStepsWithMetadata } from "@/app/utils/content";

interface PathContentLayoutProps {
  children: ReactNode;
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

export default async function PathContentLayout({
  children,
  params,
}: PathContentLayoutProps) {
  const { slug } = await params;
  const { stepsWithMetadata } = await getPathStepsWithMetadata(slug);
  const navigationSteps: PathNavigationStep[] = stepsWithMetadata.map(
    ({ type, slug, metadata }) => ({
      type,
      slug,
      defaultLessonSlug:
        type === "course"
          ? (metadata as { lessons?: { slug?: string }[] } | undefined)?.lessons?.[0]?.slug
          : undefined,
    })
  );

  return (
    <PathContentProvider pathSlug={slug} steps={navigationSteps}>
      {children}
    </PathContentProvider>
  );
}
