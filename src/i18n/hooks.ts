import { useLocale } from "next-intl";

export function useSplitLocaleBy(): "words" | "chars" {
  const locale = useLocale();

  return ["zh-hant", "zh-hans"].includes(locale) ? "chars" : "words";
}
