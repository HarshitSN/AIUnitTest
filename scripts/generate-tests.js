#!/usr/bin/env node

import { GroqAIAnalyzer } from '../src/groq-analyzer.js';
import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';

// Get filename from command line arguments
const fileName = process.argv[2] || 'multiply.js';

// Validate environment variables
if (!process.env.GROQ_API_KEY) {
  console.error('❌ GROQ_API_KEY environment variable is required');
  console.error('💡 Set it with: export GROQ_API_KEY="your-api-key"');
  process.exit(1);
}

const config = {
  get: (key) =>
    ({
      'groq.apiKey': process.env.GROQ_API_KEY,
      'groq.model': 'llama-3.1-8b-instant',
    })[key],
};

const analyzer = new GroqAIAnalyzer(config);

async function generateTests() {
  try {
    console.log(`🔍 Reading file: ${fileName}`);
    const code = await fs.readFile(fileName, 'utf8');
    console.log('📝 Code length:', code.length, 'characters');

    console.log('🤖 Calling AI to generate tests...');
    const result = await analyzer.generateTests(code, fileName);
    console.log('✨ AI response received, success:', result.success);

    if (result.success && result.testCode) {
      console.log('🧪 Test code generated, length:', result.testCode.length);

      const testFileName = path.basename(fileName, path.extname(fileName)) + '.test.js';
      const testFileDir = path.dirname(fileName);
      const testFilePath = path.join(testFileDir, '__tests__', testFileName);

      // Ensure CommonJS syntax for Jest compatibility
      let testCode = result.testCode;

      // Convert ES6 imports to CommonJS requires if present
      testCode = testCode.replace(
        /import\s+{\s*([^}]+)\s*}\s+from\s+['"]@jest\/globals['"];?/g,
        "const { $1 } = require('@jest/globals');"
      );

      await fs.mkdir(path.dirname(testFilePath), { recursive: true });
      await fs.writeFile(testFilePath, testCode, 'utf8');

      console.log('✅ Generated test file: ' + testFilePath);
    } else {
      console.error('❌ Failed to generate tests:', result.error);
      if (result.fullResponse) {
        console.error('🔍 AI Response:', result.fullResponse.substring(0, 1000));
      }
    }
  } catch (error) {
    console.error('💥 Error generating tests:', error.message);
    console.error('🔍 Stack trace:', error.stack);
  }
}

async function main() {
  // Validate we're in a git repository
  try {
    execSync('git status', { stdio: 'pipe' });
  } catch (error) {
    console.error('❌ Not in a git repository');
    process.exit(1);
  }

  await generateTests();

  // Note: Git commit and push is now handled by the Jenkins pipeline
  // This ensures proper authentication and error handling in CI environments
  console.log('✅ Test files generated successfully');
  console.log('💡 Git commit and push will be handled by the Jenkins pipeline');
}

main().catch(console.error);
