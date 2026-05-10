import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import PageHero from "@/app/components/PageHero/PageHero";
import Paths from "@/app/components/PathsContent/Paths";
import { buildLocalizedMetadata } from "@/i18n/metadata";

interface PathsPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: PathsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  const title = `${t("metadata.title")} | ${t("paths.title")}`;

  return buildLocalizedMetadata({
    href: "/paths",
    locale,
    title,
    description: t("metadata.description"),
  });
}

export default function PathsPage() {
  const t = useTranslations();

  return (
    <div className="flex w-full flex-col gap-y-0 px-3 sm:px-4">
      <PageHero badge={t("paths.subtitle")} title={t("paths.title")} />
      <Paths />
    </div>
  );
}
