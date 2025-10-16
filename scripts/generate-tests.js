import GroqAIAnalyzer from '../src/groq-analyzer.js';
import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';

// Helper function to intelligently merge test files
async function mergeTestFile(testFilePath, newTestCode) {
  try {
    // Check if file exists
    const fileExists = await fs.access(testFilePath)
      .then(() => true)
      .catch(() => false);

    if (!fileExists) {
      // File doesn't exist, create it normally
      await fs.mkdir(path.dirname(testFilePath), { recursive: true });
      await fs.writeFile(testFilePath, newTestCode, 'utf8');
      console.log('✅ Created new test file: ' + testFilePath);
      return true;
    }

    // File exists, read existing content
    const existingContent = await fs.readFile(testFilePath, 'utf8');
    console.log('📝 Existing test file found, analyzing for incremental updates...');

    // Parse existing tests to understand structure
    const existingTests = parseExistingTests(existingContent);
    const newTests = parseExistingTests(newTestCode);

    // Compare and identify changes needed
    const changes = compareTests(existingTests, newTests);

    if (changes.testsToAdd.length === 0 && changes.testsToUpdate.length === 0) {
      console.log('✅ No changes needed for test file: ' + testFilePath);
      return true;
    }

    // Create updated content
    const updatedContent = createUpdatedTestContent(existingContent, newTestCode, changes);

    // Write the updated file
    await fs.writeFile(testFilePath, updatedContent, 'utf8');
    console.log(
      `✅ Updated test file: ${testFilePath} (${changes.testsToAdd.length} new tests added)`
    );

    return true;
  } catch (error) {
    console.error('❌ Error merging test file:', error.message);
    return false;
  }
}

// Parse existing tests to understand their structure
function parseExistingTests(content) {
  const tests = {
    describeBlocks: [],
    testCases: [],
    imports: [],
    setup: []
  };

  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Extract imports
    if (line.startsWith('const ') && (line.includes('require') || line.includes('import'))) {
      tests.imports.push(line);
    }
    // Extract setup code (before describe blocks)
    else if (!line.startsWith('describe') && !line.startsWith('test') && line && tests.describeBlocks.length === 0) {
      tests.setup.push(line);
    }
    // Extract describe blocks
    else if (line.startsWith('describe(')) {
      const block = extractDescribeBlock(lines, i);
      tests.describeBlocks.push(block);
      i += block.lines.length - 1; // Skip the lines we processed
    }
  }

  return tests;
}

// Extract a complete describe block
function extractDescribeBlock(lines, startIndex) {
  const block = {
    name: '',
    content: [],
    lines: []
  };

  let braceCount = 0;
  let inBlock = false;

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];
    block.lines.push(line);

    if (line.includes('describe(') && !inBlock) {
      const match = line.match(/describe\(['"`]([^'"`]+)['"`]/);
      if (match) {
        block.name = match[1];
      }
      inBlock = true;
    }

    // Count braces to find block boundaries
    for (const char of line) {
      if (char === '{') braceCount++;
      if (char === '}') braceCount--;
    }

    if (inBlock && braceCount <= 0 && i > startIndex) {
      break;
    }
  }

  block.content = block.lines.slice(1, -1); // Remove outer describe line and closing brace
  return block;
}

// Compare existing and new tests
function compareTests(existing, newTests) {
  const changes = {
    testsToAdd: [],
    testsToUpdate: [],
    blocksToAdd: []
  };

  // Find new describe blocks
  for (const newBlock of newTests.describeBlocks) {
    const existingBlock = existing.describeBlocks.find(block => block.name === newBlock.name);

    if (!existingBlock) {
      // New describe block
      changes.blocksToAdd.push(newBlock);
    } else {
      // Existing block - could check for test updates here if needed
      // For now, we'll assume the AI generates complete blocks
    }
  }

  return changes;
}

// Create updated test content by appending new blocks
function createUpdatedTestContent(existingContent, newContent, changes) {
  if (changes.blocksToAdd.length === 0) {
    return existingContent; // No changes needed
  }

  // Extract the new blocks from the new content
  let newBlocksContent = '';

  for (const block of changes.blocksToAdd) {
    newBlocksContent += '\n\n' + block.lines.join('\n');
  }

  // Append new blocks to existing content (before the final closing brace if present)
  const lines = existingContent.split('\n');
  let insertIndex = lines.length;

  // Find a good place to insert (before any final closing brace)
  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].trim() === '}' && i < lines.length - 1) {
      insertIndex = i;
      break;
    }
  }

  lines.splice(insertIndex, 0, newBlocksContent);

  return lines.join('\n');
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

      // Use intelligent merging instead of overwriting
      const success = await mergeTestFile(testFilePath, testCode);

      if (success) {
        console.log('✅ Generated test file: ' + testFilePath);
      }
      return success;
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
