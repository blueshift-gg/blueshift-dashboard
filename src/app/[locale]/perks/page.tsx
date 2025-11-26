import { useTranslations } from "next-intl";
import PageHero from "@/app/components/PageHero/PageHero";
import Perks from "@/app/components/Perks/Perks";

export default function PerksPage() {
  const t = useTranslations();

  return (
    <div className="flex flex-col w-full gap-y-0 px-3 sm:px-4">
      <PageHero badge={t("perks.subtitle")} title={t("perks.title")} />
      <Perks />
    </div>
  );
}
