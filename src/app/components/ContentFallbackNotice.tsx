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
    <div className="mb-4 flex items-center gap-x-3 border border-yellow-500/20 bg-yellow-500/10 px-3 py-2 text-yellow-500">
      <Icon name="Globe" className="h-5 w-5" />
      <p className="text-sm">{t("notifications.content_fallback")}</p>
    </div>
  );
}
