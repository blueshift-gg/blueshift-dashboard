import { defineRouting } from "next-intl/routing";

export const localeNames = {
  en: "English",
  "zh-CN": "简体中文",
  "zh-HK": "繁體中文",
  fr: "Français",
  id: "Bahasa Indonesia",
  vi: "Tiếng Việt",
  uk: "Українська",
  de: "Deutsch",
  "pt-BR": "Português (Brasil)"
};

export const routing = defineRouting({
  locales: ["en", "zh-CN", "zh-HK", "fr", "id", "vi", "uk", "de", "pt-BR"],
  defaultLocale: "en",
});
