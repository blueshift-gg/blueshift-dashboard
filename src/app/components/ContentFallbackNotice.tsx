import { Icon } from "@blueshift-gg/ui-components";
import { getTranslations } from "next-intl/server";

interface ContentFallbackNoticeProps {
  locale: string;
  originalLocale: string;
}

export default async function ContentFallbackNotice({
  locale,
  originalLocale,
}: ContentFallbackNoticeProps) {
  if (locale === originalLocale) {
    return null;
  }

  const t = await getTranslations();

  return (
    <div className="flex items-center gap-x-3 px-3 py-2 mb-4 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
      <Icon name="Globe" className="w-5 h-5" />
      <p className="text-sm">{t("notifications.content_fallback")}</p>
    </div>
  );
}
