import * as fs from 'fs';
import * as path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';

dotenv.config();

// ====================================================================================
// ====================================================================================

// Gemini API Key (required)
// Get your API key from: https://aistudio.google.com/app/apikey
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error('Error: GEMINI_API_KEY not found in .env file');
  process.exit(1);
}

// Target language code (default: 'ko' for Korean)
// Supported: ko, zh-CN, zh-HK, fr, uk, vi, id, de, etc.
const TARGET_LANGUAGE = process.env.TARGET_LANGUAGE || 'ko';

// Language-specific translation prompt configuration
const LANGUAGE_PROMPTS: Record<string, { name: string; instructions: string }> = {
  ko: {
    name: 'Korean',
    instructions: 'Translate to natural, fluent Korean that technical readers will understand.',
  },
  'zh-CN': {
    name: 'Simplified Chinese',
    instructions: 'Translate to natural, fluent Simplified Chinese that technical readers will understand.',
  },
  'zh-HK': {
    name: 'Traditional Chinese (Hong Kong)',
    instructions: 'Translate to natural, fluent Traditional Chinese (Hong Kong) that technical readers will understand.',
  },
  fr: {
    name: 'French',
    instructions: 'Translate to natural, fluent French that technical readers will understand.',
  },
  uk: {
    name: 'Ukrainian',
    instructions: 'Translate to natural, fluent Ukrainian that technical readers will understand.',
  },
  vi: {
    name: 'Vietnamese',
    instructions: 'Translate to natural, fluent Vietnamese that technical readers will understand.',
  },
  id: {
    name: 'Indonesian',
    instructions: 'Translate to natural, fluent Indonesian that technical readers will understand.',
  },
  de: {
    name: 'German',
    instructions: 'Translate to natural, fluent German that technical readers will understand.',
  },
};

if (!LANGUAGE_PROMPTS[TARGET_LANGUAGE]) {
  console.error(`Error: Unsupported target language '${TARGET_LANGUAGE}'`);
  console.error(`Supported languages: ${Object.keys(LANGUAGE_PROMPTS).join(', ')}`);
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Gemini 2.5 Flash model
const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
});

// ====================================================================================
// ====================================================================================

interface TranslationTask {
  priority: number;      // Translation priority (lower = higher priority)
  category: string;      // Category name for logging
  sourcePath: string;    // Source file path (en.mdx)
  targetPath: string;    // Target file path (e.g., ko.mdx)
  completed: boolean;    // Completion status
}

// Progress tracking file (language-specific)
// Example: scripts/translation/translation-progress-ko.json
const PROGRESS_FILE = path.join(__dirname, `translation-progress-${TARGET_LANGUAGE}.json`);

// ====================================================================================
// ====================================================================================
// This list defines all translation tasks in priority order.
//
// Priority levels:
// ====================================================================================

const TRANSLATION_TASKS: TranslationTask[] = [
  // Priority 0: Challenge
  {
    priority: 0,
    category: 'Challenge',
    sourcePath: 'src/app/content/challenges/anchor-escrow/en/challenge.mdx',
    targetPath: `src/app/content/challenges/anchor-escrow/${TARGET_LANGUAGE}/challenge.mdx`,
    completed: false,
  },

  // Priority 1: Introduction courses
  ...generateCourseTasks(1, 'Introduction', 'introduction-to-blockchain-and-solana', [
    'introduction',
    'blockchain-fundamentals',
    'blockchain-evolution',
    'introduction-to-solana',
    'conclusion',
  ]),

  ...generateCourseTasks(1, 'Anchor Basics', 'anchor-for-dummies', [
    'anchor-101',
    'anchor-accounts',
    'anchor-instructions',
    'client-side-development',
    'testing-your-program',
    'program-deployment',
    'advanced-anchor',
    'conclusion',
  ]),

  ...generateCourseTasks(1, 'Pinocchio Basics', 'pinocchio-for-dummies', [
    'pinocchio-101',
    'pinocchio-accounts',
    'pinocchio-instructions',
    'pinocchio-errors',
    'reading-and-writing-data',
    'batch-instructions',
    'middleware-entrypoint',
    'testing-your-program',
    'performance',
    'conclusion',
  ]),

  // Priority 2: Intermediate
  ...generateCourseTasks(2, 'Low Level', 'introduction-to-low-level-solana', [
    'low-level-101',
    'entrypoint',
  ]),

  ...generateCourseTasks(2, 'Security', 'program-security', [
    'introduction',
    'signer-checks',
    'owner-checks',
    'data-matching',
    'arbitrary-cpi',
    'type-cosplay',
    'reinitialization-attacks',
    'revival-attacks',
    'duplicate-mutable-accounts',
    'pda-sharing',
    'conclusion',
  ]),

  ...generateCourseTasks(2, 'SPL Token Anchor', 'spl-token-with-anchor', [
    'introduction',
    'mint-to',
    'transfer',
    'burn',
    'approve-and-revoke',
    'freeze-and-thaw',
    'set-authority',
    'close-account',
    'conclusion',
  ]),

  ...generateCourseTasks(2, 'Tokens', 'tokens-on-solana', [
    'introduction',
    'mint-and-token-accounts',
    'functionalities',
    'metaplex-token-metadata',
    'conclusion',
  ]),

  ...generateCourseTasks(2, 'SPL Token Web3js', 'spl-token-with-web3js', [
    'introduction',
    'mint-to',
    'transfer',
    'burn',
    'approve-and-revoke',
    'freeze-and-thaw',
    'set-authority',
    'close-account',
    'conclusion',
  ]),

  ...generateCourseTasks(2, 'NFTs', 'nfts-on-solana', [
    'introduction',
    'metaplex-core',
    'metaplex-token-metadata',
    'conclusion',
  ]),

  // Priority 3: Advanced
  ...generateCourseTasks(3, 'Codama SDK', 'create-your-sdk-with-codama', ['introduction', 'codama-with-anchor', 'codama-from-scratch', 'updating-codama-idl', 'conclusion']),
  ...generateCourseTasks(3, 'Introspection', 'instruction-introspection', ['introduction', 'introspection-with-anchor', 'introspection-with-pinocchio', 'conclusion']),
  ...generateCourseTasks(3, 'Assembly', 'introduction-to-assembly', ['assembly-101', 'registers-and-memory', 'instructions', 'tooling', 'program-example', 'conclusion']),
  ...generateCourseTasks(3, 'Secp256r1', 'secp256r1-on-solana', ['introduction', 'secp256r1-with-pinocchio', 'conclusion']),
  ...generateCourseTasks(3, 'Winternitz', 'winternitz-signatures-on-solana', ['introduction', 'winternitz-signatures-with-pinocchio', 'conclusion']),
  ...generateCourseTasks(3, 'Solana Pay', 'solana-pay', ['introduction', 'transfer-request', 'transaction-request', 'conclusion']),

  // Priority 4: Testing
  ...generateCourseTasks(4, 'Litesvm', 'testing-with-litesvm', ['litesvm-101', 'typescript', 'rust', 'conclusion']),
  ...generateCourseTasks(4, 'Mollusk', 'testing-with-mollusk', ['mollusk-101', 'advanced-functionalities', 'conclusion']),
  ...generateCourseTasks(4, 'Surfpool', 'testing-with-surfpool', ['surfpool-101', 'advanced-functionalities', 'conclusion']),

  // Priority 5: Token 2022
  ...generateCourseTasks(5, 'Token2022 Program', 'token-2022-program', ['introduction', 'token-extensions', 'conclusion']),
  ...generateCourseTasks(5, 'Token2022 Anchor', 'token-2022-with-anchor', ['introduction', 'metadata-extension', 'transfer-fee-extension', 'default-account-state-extension', 'immutable-owner-extension', 'non-transferable-extension', 'interest-bearing-extension', 'cpi-guard-extension', 'permanent-delegate-extension', 'mint-close-authority-extension', 'memo-transfer-extension', 'group-and-member-extension', 'conclusion']),
  ...generateCourseTasks(5, 'Token2022 Web3js', 'token-2022-with-web3js', ['introduction', 'metadata-extension', 'transfer-fee-extension', 'default-account-state-extension', 'immutable-owner-extension', 'non-transferable-extension', 'interest-bearing-extension', 'cpi-guard-extension', 'permanent-delegate-extension', 'mint-close-authority-extension', 'memo-transfer-extension', 'group-and-member-extension', 'conclusion']),

  // Priority 6: Research
  ...generateCourseTasks(6, 'Research', 'research-crateless-program', ['lesson']),
];

// ====================================================================================
// ====================================================================================

/**
 * Generate translation tasks for a course
 *
 *
 * @param priority - Priority level
 * @param category - Category name for display
 * @param courseName - Course directory name
 * @param lessons - List of lesson directory names
 * @returns Array of translation tasks
 */
function generateCourseTasks(
  priority: number,
  category: string,
  courseName: string,
  lessons: string[]
): TranslationTask[] {
  return lessons.map(lesson => ({
    priority,
    category,
    sourcePath: `src/app/content/courses/${courseName}/${lesson}/en.mdx`,
    targetPath: `src/app/content/courses/${courseName}/${lesson}/${TARGET_LANGUAGE}.mdx`,
    completed: false,
  }));
}

/**
 * Load translation progress from disk
 *
 */
function loadProgress(): TranslationTask[] {
  if (fs.existsSync(PROGRESS_FILE)) {
    const savedProgress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
    // Merge saved progress with task list

    return TRANSLATION_TASKS.map(task => {
      const saved = savedProgress.find(
        (s: TranslationTask) => s.sourcePath === task.sourcePath
      );
      return saved || task;
    });
  }
  return TRANSLATION_TASKS;
}

/**
 * Save translation progress to disk
 *
 */
function saveProgress(tasks: TranslationTask[]) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(tasks, null, 2));
}

/**
 * Translate content using Gemini AI
 *
 * @param content - Source content in English
 * @returns Translated content in target language
 */
async function translateWithGemini(content: string): Promise<string> {
  const languageConfig = LANGUAGE_PROMPTS[TARGET_LANGUAGE];

  const prompt = `You are a professional ${languageConfig.name} translator specializing in blockchain and Solana development documentation.

Translate the following MDX content from English to ${languageConfig.name}. Follow these rules:

1. Keep all MDX syntax, code blocks, and frontmatter unchanged
2. Translate only the text content, not code or technical identifiers
3. Maintain technical terms in English when appropriate (e.g., "wallet", "transaction", "account")
4. ${languageConfig.instructions}
5. Keep markdown formatting (headings, lists, links, etc.) exactly as-is
6. Do not translate URLs, image paths, or file names
7. Preserve all spacing and line breaks

Here's the content to translate:

---
${content}
---

Return ONLY the translated ${languageConfig.name} content, nothing else.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw error;
  }
}

async function translateFile(task: TranslationTask): Promise<boolean> {
  const projectRoot = path.join(__dirname, '..');
  const sourcePath = path.join(projectRoot, task.sourcePath);
  const targetPath = path.join(projectRoot, task.targetPath);

  console.log(`\n📄 Translating: ${task.sourcePath}`);
  console.log(`   Category: ${task.category} (Priority ${task.priority})`);

  // Check if source exists
  if (!fs.existsSync(sourcePath)) {
    console.error(`   ❌ Source file not found: ${sourcePath}`);
    return false;
  }

  // Check if target already exists
  if (fs.existsSync(targetPath)) {
    console.log(`   ⏭️  Already exists, skipping: ${targetPath}`);
    return true;
  }

  // Read source content
  const content = fs.readFileSync(sourcePath, 'utf-8');
  console.log(`   📖 Read ${content.length} characters`);

  // Translate
  console.log(`   🤖 Translating with Gemini (thinking mode)...`);
  const startTime = Date.now();

  let translated: string;
  let retries = 3;
  while (retries > 0) {
    try {
      translated = await translateWithGemini(content);
      break;
    } catch (error) {
      retries--;
      if (retries === 0) {
        console.error(`   ❌ Translation failed after 3 retries`);
        return false;
      }
      console.log(`   ⚠️  Error, retrying... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`   ✅ Translated in ${duration}s (${translated!.length} characters)`);

  // Create target directory if needed
  const targetDir = path.dirname(targetPath);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
    console.log(`   📁 Created directory: ${targetDir}`);
  }

  // Write translated content
  fs.writeFileSync(targetPath, translated!);
  console.log(`   💾 Saved: ${targetPath}`);

  return true;
}

async function main() {
  console.log('🚀 Gemini Translation Script');
  console.log('============================\n');

  // Load progress
  let tasks = loadProgress();
  const totalTasks = tasks.length;
  const completedCount = tasks.filter(t => t.completed).length;

  console.log(`📊 Progress: ${completedCount}/${totalTasks} tasks completed\n`);

  // Filter pending tasks, sorted by priority
  const pendingTasks = tasks
    .filter(t => !t.completed)
    .sort((a, b) => a.priority - b.priority);

  if (pendingTasks.length === 0) {
    console.log('🎉 All translations complete!');
    return;
  }

  console.log(`📋 ${pendingTasks.length} tasks remaining\n`);

  // Process tasks one by one
  for (let i = 0; i < pendingTasks.length; i++) {
    const task = pendingTasks[i];
    console.log(`\n[${i + 1}/${pendingTasks.length}] ===============================`);

    const success = await translateFile(task);

    if (success) {
      // Mark as completed
      const taskIndex = tasks.findIndex(t => t.sourcePath === task.sourcePath);
      tasks[taskIndex].completed = true;
      saveProgress(tasks);

      // Rate limiting: wait 2 seconds between requests
      if (i < pendingTasks.length - 1) {
        console.log('\n⏳ Waiting 2s before next translation...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } else {
      console.log(`\n❌ Failed to translate: ${task.sourcePath}`);
      console.log('Stopping script. Fix the issue and run again to continue.');
      saveProgress(tasks);
      process.exit(1);
    }
  }

  console.log('\n\n✅ Translation batch complete!');
  console.log(`📊 Final progress: ${tasks.filter(t => t.completed).length}/${totalTasks} completed`);
}

main().catch(console.error);
