import { useTranslations } from "next-intl";
import PageHero from "@/app/components/PageHero/PageHero";
import Paths from "@/app/components/PathsContent/Paths";

export default function Home() {
  const t = useTranslations();

  return (
    <div className="flex w-full flex-col gap-y-0 px-3 sm:px-4">
      <PageHero badge={t("paths.subtitle")} title={t("paths.title")} />
      <Paths />
    </div>
  );
}
