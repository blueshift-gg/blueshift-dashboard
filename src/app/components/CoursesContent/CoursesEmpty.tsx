import { useTranslations } from "next-intl";

export default function CoursesEmpty() {
  const t = useTranslations();

  return (
    <div className="flex flex-col items-center justify-center gap-y-3 mx-auto w-[300px] pb-36">
      <div className="flex items-center gap-x-2">
        <img
          src="/graphics/sad-face.svg"
          alt="Sad Face"
          className="w-[30px] h-[30px]"
        />
        <span className="text-lg font-mono font-medium text-brand-primary leading-none text-center">
          {t("lessons.empty_results_title")}
        </span>
      </div>
      <span className="text-shade-secondary leading-[140%] text-center">
        {t("lessons.empty_results_description")}
      </span>
    </div>
  );
}
