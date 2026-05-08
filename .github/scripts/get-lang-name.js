const [langCode] = process.argv.slice(2);

// Custom mappings for specific formatting preferences
const customNames = {
  "zh-CN": "Chinese (Simplified)",
  "zh-HK": "Chinese (Traditional)",
};

function getLanguageName(locale) {
  // First check custom mappings
  if (customNames[locale]) {
    return customNames[locale];
  }

  try {
    const displayNames = new Intl.DisplayNames(["en"], { type: "language" });
    return displayNames.of(locale);
  } catch {
    return locale;
  }
}

console.log(getLanguageName(langCode));
