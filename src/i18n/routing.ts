import { defineRouting } from 'next-intl/routing';

export const localeNames = {
    en: "English",
    "zh-CN": "简体中文",
    "zh-HK": "繁體中文",
    fr: "Français",
    id: "Bahasa Indonesia",
    vi: "Tiếng Việt"
};

export const routing = defineRouting({
  locales: ['en', 'fr', 'id', 'vi' /*, 'zh-HK'*/],
  defaultLocale: 'en'
});
