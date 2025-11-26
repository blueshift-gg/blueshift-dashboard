import { useTranslations } from "next-intl";
import Courses from "@/app/components/CoursesContent/Courses";
import PageHero from "@/app/components/PageHero/PageHero";

export default function CoursesPage() {
  const t = useTranslations();

  return (
    <div className="flex flex-col w-full gap-y-0 px-3 sm:px-4">
      <PageHero badge={t("lessons.subtitle")} title={t("lessons.title")} />
      <Courses />
    </div>
  );
}
