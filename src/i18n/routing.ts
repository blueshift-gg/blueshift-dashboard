import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'fr','uk' /*, 'zh-hant'*/],
  defaultLocale: 'en'
});
