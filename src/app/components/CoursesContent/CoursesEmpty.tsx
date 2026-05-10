import { useTranslations } from "next-intl";

export default function CoursesEmpty() {
  const t = useTranslations();

  return (
    <div className="mx-auto flex w-[300px] flex-col items-center justify-center gap-y-3 pb-36">
      <div className="flex items-center gap-x-2">
        <img src="/graphics/sad-face.svg" alt="Sad Face" className="h-[30px] w-[30px]" />
        <span className="text-center font-mono text-lg leading-none font-medium text-brand-primary">
          {t("lessons.empty_results_title")}
        </span>
      </div>
      <span className="text-center leading-[140%] text-shade-secondary">
        {t("lessons.empty_results_description")}
      </span>
    </div>
  );
}
