import { useTranslations } from "next-intl";
import Paths from "@/app/components/PathsContent/Paths";
import PageHero from "@/app/components/PageHero/PageHero";

export default function PathsPage() {
  const t = useTranslations();

  return (
    <div className="flex flex-col w-full gap-y-0 px-3 sm:px-4">
      <PageHero badge={t("paths.subtitle")} title={t("paths.title")} />
      <Paths />
    </div>
  );
}
