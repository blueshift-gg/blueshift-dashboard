import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import Courses from "@/app/components/CoursesContent/Courses";
import PageHero from "@/app/components/PageHero/PageHero";
import { buildLocalizedMetadata } from "@/i18n/metadata";

interface CoursesPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: CoursesPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  const title = `${t("metadata.title")} | ${t("lessons.title")}`;

  return buildLocalizedMetadata({
    href: "/courses",
    locale,
    title,
    description: t("metadata.description"),
  });
}

export default function CoursesPage() {
  const t = useTranslations();

  return (
    <div className="flex w-full flex-col gap-y-0 px-3 sm:px-4">
      <PageHero badge={t("lessons.subtitle")} title={t("lessons.title")} />
      <Courses />
    </div>
  );
}
