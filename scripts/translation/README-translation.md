# Translation Automation Script

Automates translation of MDX files to multiple languages using Gemini AI.

---

## 📋 Table of Contents

- [Setup](#-setup)
- [Usage](#-usage)
- [Configuration](#-configuration)
- [Features](#-features)
- [Troubleshooting](#-troubleshooting)
- [Customization](#-customization)

---

## 🚀 Setup

### 1. Install Dependencies

```bash
npm install @google/generative-ai dotenv
# or
pnpm add @google/generative-ai dotenv
```

### 2. Configure API Key

1. Get your Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Copy the example environment file:

```bash
cp .env.example .env
```

3. Edit `.env` file and add your API key:

```env
# Gemini API Key (required for translation)
GEMINI_API_KEY=your_actual_api_key_here

# Target language (default: ko)
TARGET_LANGUAGE=ko
```

---

## 💻 Usage

### Running Translation

```bash
# Run directly with ts-node
ts-node -r tsconfig-paths/register -P ./tsconfig.scripts.json ./scripts/translation/translate-with-gemini.ts

# Or use npm script
npm run translate
```

### Progress Tracking

- Translation progress is automatically saved to `scripts/translation/translation-progress-{LANGUAGE}.json`
- Example: `translation-progress-ko.json`, `translation-progress-zh-CN.json`
- If interrupted, simply run the script again to resume from where it stopped
- Already translated files are automatically skipped

### Translation Priority(Example)

Tasks are processed in the following priority order:

1. **Priority 0**: Challenges
2. **Priority 1**: Beginner courses
   - Introduction to Blockchain and Solana
   - Anchor for Dummies
   - Pinocchio for Dummies
3. **Priority 2**: Intermediate courses
   - Low-level Solana
   - Program Security
   - SPL Token (Anchor/Web3.js)
   - NFTs on Solana
4. **Priority 3**: Advanced courses
   - Codama SDK, Instruction Introspection, Assembly
   - Secp256r1, Winternitz Signatures, Solana Pay
5. **Priority 4**: Testing frameworks
   - Litesvm, Mollusk, Surfpool
6. **Priority 5**: Token 2022 extensions
7. **Priority 6**: Research content

---

## ⚙️ Configuration

### Supported Languages

The script supports the following target languages:

| Code    | Language                        |
| ------- | ------------------------------- |
| `ko`    | Korean                          |
| `zh-CN` | Simplified Chinese              |
| `zh-HK` | Traditional Chinese (Hong Kong) |
| `fr`    | French                          |
| `uk`    | Ukrainian                       |
| `vi`    | Vietnamese                      |
| `id`    | Indonesian                      |
| `de`    | German                          |

### Changing Target Language

Edit the `.env` file:

```env
# For Chinese (Simplified)
TARGET_LANGUAGE=zh-CN

# For French
TARGET_LANGUAGE=fr

# For German
TARGET_LANGUAGE=de
```

Each language will have its own progress file:

- `translation-progress-ko.json` for Korean
- `translation-progress-zh-CN.json` for Chinese
- `translation-progress-fr.json` for French
- etc.

### Adding New Languages

To add support for a new language:

1. Open `scripts/translation/translate-with-gemini.ts`
2. Add your language to the `LANGUAGE_PROMPTS` object:

```typescript
const LANGUAGE_PROMPTS: Record<string, { name: string; instructions: string }> = {
  // ... existing languages ...

  // Add your new language
  'ja': {
    name: 'Japanese',
    instructions: 'Translate to natural, fluent Japanese that technical readers will understand.',
  },
};
```

3. Set `TARGET_LANGUAGE=ja` in `.env`
4. Run the translation script

---

## ✨ Features

### Automatic Retry

- Retries failed API requests up to 3 times
- 2-second delay between retries

### Rate Limiting

- 2-second delay between translations
- Respects Gemini API free tier limits (20 requests/day as of Dec 2025)

### Error Handling

- Saves progress before stopping on errors
- Can resume after fixing issues

### Progress Tracking

- Real-time logging with emojis
- Translation time display
- Overall progress percentage
- Language-specific progress files

---

## 📊 Sample Output

```
🚀 Gemini Translation Script
============================

Target Language: Korean (ko)
Progress File: scripts/translation/translation-progress-ko.json

📊 Progress: 5/129 tasks completed

📋 124 tasks remaining

[1/124] ===============================

📄 Translating: src/app/content/courses/anchor-for-dummies/anchor-101/en.mdx
   Category: Anchor Basics (Priority 1)
   📖 Read 2543 characters
   🤖 Translating with Gemini...
   ✅ Translated in 8.3s (2891 characters)
   📁 Created directory: src/app/content/courses/anchor-for-dummies/anchor-101
   💾 Saved: src/app/content/courses/anchor-for-dummies/anchor-101/ko.mdx

⏳ Waiting 2s before next translation...
```

---

## 🔧 Troubleshooting

### API Key Error

```
Error: GEMINI_API_KEY not found in .env file
```

**Solution**: Verify `.env` file exists and API key is correctly set

### Unsupported Language Error

```
Error: Unsupported target language 'xx'
```

**Solution**: Use a supported language code or add the language to `LANGUAGE_PROMPTS`

### Source File Not Found

```
❌ Source file not found
```

**Solution**: Check file path in `TRANSLATION_TASKS` array

### API Rate Limit Exceeded

```
Error 429: Resource exhausted
```

**Solution**:

- Gemini free tier limits to 20 requests/day (as of Dec 2025)
- Wait 24 hours or upgrade to paid tier (~$0.20 for entire project)
- Script automatically pauses 2 seconds between requests

---

## 🛠 Customization

### Modifying Priority

Edit `TRANSLATION_TASKS` array in `scripts/translation/translate-with-gemini.ts`:

```typescript
const TRANSLATION_TASKS: TranslationTask[] = [
  {
    priority: 0,  // Change priority level
    category: 'Challenge',
    sourcePath: 'src/app/content/challenges/anchor-escrow/en/challenge.mdx',
    targetPath: `src/app/content/challenges/anchor-escrow/${TARGET_LANGUAGE}/challenge.mdx`,
    completed: false,
  },
  // ...
];
```

### Customizing Translation Prompt

Modify the language instructions in `LANGUAGE_PROMPTS`:

```typescript
const LANGUAGE_PROMPTS = {
  ko: {
    name: 'Korean',
    instructions: 'Your custom instructions here.',
  },
};
```

### Using Different Gemini Model

Change the model in the script:

```typescript
const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',  // Change model here
});
```

Available models:

- `gemini-2.5-flash` (recommended, fast)
- `gemini-2.0-flash-exp`
- `gemini-1.5-pro` (higher quality, slower)

### Adjusting Rate Limiting

Modify timeout values:

```typescript
// Between translations (line ~370)
await new Promise(resolve => setTimeout(resolve, 2000)); // Change 2000 to your value

// Between retries (line ~330)
await new Promise(resolve => setTimeout(resolve, 2000)); // Change 2000 to your value
```

---

## 📝 Progress File Management

### Resetting Progress

To start translation from scratch:

```bash
# Delete language-specific progress file
rm scripts/translation/translation-progress-ko.json

# Or delete all progress files
rm scripts/translation/translation-progress-*.json
```

### Managing Multiple Languages

You can translate to multiple languages simultaneously:

1. Each language uses its own progress file
2. Files don't conflict with each other
3. Example directory structure:

```
scripts/
├── translate-with-gemini.ts
├── translation-progress-ko.json      # Korean progress
├── translation-progress-zh-CN.json   # Chinese progress
└── translation-progress-fr.json      # French progress
```

---

## 📈 Cost Estimation

### Gemini API Pricing (as of Dec 2025)

- **Free tier**: 20 requests/day
- **Paid tier**: ~$0.20 for entire project (129 files)

### Timeline Estimates

- **Free tier**: ~7 days (at 20 files/day)
- **Paid tier**: ~1 hour (no rate limits)

---

## 🤝 Contributing

To add support for more languages:

1. Add language to `LANGUAGE_PROMPTS` in `translate-with-gemini.ts`
2. Test with a small set of files first
3. Submit PR with your changes

---

## 📚 Additional Resources

- [Gemini API Documentation](https://ai.google.dev/docs)
- [Google AI Studio](https://aistudio.google.com/)
- [i18n Configuration](../i18n.json)

---

## ⚠️ Important Notes

- **Never commit `.env` file** - it contains your API key
- **Backup progress files** before making major changes
- **Test with one file first** when adding new languages
- **Check translation quality** regularly, especially for technical terms
- **Use version control** to track translated files
