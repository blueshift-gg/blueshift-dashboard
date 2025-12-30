import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error('Error: GEMINI_API_KEY not found in .env file');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

async function listModels() {
  console.log('🔍 Fetching available Gemini models...\n');

  try {
    const models = await genAI.listModels();

    console.log(`Found ${models.length} models:\n`);

    for (const model of models) {
      console.log(`📦 ${model.name}`);
      console.log(`   Display Name: ${model.displayName}`);
      console.log(`   Description: ${model.description}`);
      console.log(`   Supported Methods: ${model.supportedGenerationMethods?.join(', ')}`);
      console.log('');
    }

    // Filter for thinking models
    const thinkingModels = models.filter(m =>
      m.name.includes('thinking') || m.displayName?.includes('Thinking')
    );

    if (thinkingModels.length > 0) {
      console.log('\n💭 Thinking models available:');
      thinkingModels.forEach(m => console.log(`   - ${m.name}`));
    } else {
      console.log('\n⚠️  No thinking models found in your API access');
      console.log('Available alternatives:');
      const alternatives = models.filter(m =>
        m.name.includes('gemini-2.0') || m.name.includes('gemini-1.5')
      );
      alternatives.forEach(m => console.log(`   - ${m.name}`));
    }

  } catch (error) {
    console.error('Error fetching models:', error);
  }
}

listModels();
