#!/usr/bin/env node

import GroqAIAnalyzer from '../src/groq-analyzer.js';
import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';
import { parse } from '@babel/parser';

// Helper: Extract describe blocks with their names and full text
function extractDescribeBlocks(content) {
  const blocks = new Map();
  const describeRegex = /describe\(\s*['"]([^'"]+)['"]\s*,\s*\(\s*\)\s*=>\s*\{/g;
  let match;
  while ((match = describeRegex.exec(content)) !== null) {
    const name = match[1];
    // Find matching closing brace for this describe body
    let braceCount = 1; // we've just seen '{'
    let i = match.index + match[0].length; // start after the '{'
    while (i < content.length && braceCount > 0) {
      const ch = content[i];
      if (ch === '{') braceCount++;
      else if (ch === '}') braceCount--;
      i++;
    }
    const fullBlock = content.slice(match.index, i);
    blocks.set(name, fullBlock);
  }
  return blocks;
}

// Helper: Insert text before the final closing of the top-level describe
// (old insertBeforeFinalClosingDescribe removed; using safer EOF append instead)

// Safer merge: append missing describe blocks at EOF instead of injecting inside blocks
function mergeDescribeBlocksSafely(existingContent, blocksToAppend) {
  if (!blocksToAppend || blocksToAppend.length === 0) return existingContent;
  const trimmed = existingContent.replace(/\s*$/, '');
  return trimmed + '\n\n' + blocksToAppend.join('\n\n') + '\n';
}

function isSyntaxValid(code) {
  try {
    parse(code, { sourceType: 'unambiguous', plugins: ['jsx'] });
    return true;
  } catch {
    return false;
  }
}

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

      // Merge strategy: if file exists, append only missing describe blocks
      let finalContent = testCode;
      let merged = false;
      try {
        const existing = await fs.readFile(testFilePath, 'utf8');
        const existingBlocks = extractDescribeBlocks(existing);
        const newBlocks = extractDescribeBlocks(testCode);

        // Determine which blocks are missing
        const missing = [];
        for (const [name, block] of newBlocks.entries()) {
          if (!existingBlocks.has(name)) {
            missing.push(block);
          }
        }

        if (missing.length > 0) {
          finalContent = mergeDescribeBlocksSafely(existing, missing);
          merged = true;
          console.log(`✅ Merged ${missing.length} new describe block(s) into existing tests`);
        } else {
          // No new blocks; keep existing as-is
          finalContent = existing;
          merged = true;
          console.log('ℹ️ No new describe blocks to add; existing tests unchanged');
        }
      } catch {
        // File does not exist; will create fresh
        merged = false;
      }

      // Validate syntax; if invalid after merge, fall back to EOF append strategy
      if (!isSyntaxValid(finalContent)) {
        try {
          const existing = await fs.readFile(testFilePath, 'utf8');
          const appended = mergeDescribeBlocksSafely(existing, [testCode]);
          if (isSyntaxValid(appended)) {
            finalContent = appended;
          }
        } catch {
          // If no existing file, keep generated content as-is
        }
      }

      await fs.writeFile(testFilePath, finalContent, 'utf8');

      console.log((merged ? '✅ Updated test file: ' : '✅ Generated test file: ') + testFilePath);
      return true;
    } else {
      console.error('❌ Failed to generate tests:', result.error);
      if (result.fullResponse) {
        console.error('🔍 AI Response:', result.fullResponse.substring(0, 1000));
      }
      return false;
    }
  } catch (error) {
    console.error('💥 Error generating tests:', error.message);
    console.error('🔍 Stack trace:', error.stack);
    return false;
  }
}

async function main() {
  // Validate we're in a git repository
  try {
    execSync('git status', { stdio: 'pipe' });
  } catch (error) {
    console.error('❌ Not in a git repository:', error.message);
    process.exit(1);
  }

  const success = await generateTests();

  if (success) {
    // Note: Git commit and push is now handled by the Jenkins pipeline
    // This ensures proper authentication and error handling in CI environments
    console.log('✅ Test files generated successfully');
    console.log('💡 Git commit and push will be handled by the Jenkins pipeline');
  } else {
    console.error('❌ Test generation failed');
    process.exit(1);
  }
}

main().catch(console.error);
