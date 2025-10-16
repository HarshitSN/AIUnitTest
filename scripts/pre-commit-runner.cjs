#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

async function mergeTestFile(testFilePath, newTestCode) {
  try {
    // Check if file exists
    const fileExists = await fs
      .access(testFilePath)
      .then(() => true)
      .catch(() => false);

    if (!fileExists) {
      // File doesn't exist, create it normally
      await fs.mkdir(require('path').dirname(testFilePath), { recursive: true });
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

    // If no describe blocks to add but we have new test content, check if we need to add it
    if (changes.blocksToAdd.length === 0 && newTestCode.length > existingContent.length) {
      console.log('📊 New test content detected, checking if updates are needed...');

      // Simple heuristic: if new content is significantly larger, likely has new tests
      if (newTestCode.length > existingContent.length * 1.1) {
        console.log('🔄 Significant new content detected, updating test file...');
        await fs.writeFile(testFilePath, newTestCode, 'utf8');
        console.log(`✅ Updated test file with new content: ${testFilePath}`);
        return true;
      }
    }

    if (
      changes.testsToAdd.length === 0 &&
      changes.testsToUpdate.length === 0 &&
      changes.blocksToAdd.length === 0
    ) {
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
    setup: [],
    testedFunctions: new Set(), // Track which functions are being tested
  };

  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Extract imports
    if (line.startsWith('const ') && (line.includes('require') || line.includes('import'))) {
      tests.imports.push(line);
    }
    // Extract setup code (before describe blocks)
    else if (
      !line.startsWith('describe') &&
      !line.startsWith('test') &&
      line &&
      tests.describeBlocks.length === 0
    ) {
      tests.setup.push(line);
    }
    // Extract describe blocks
    else if (line.startsWith('describe(')) {
      const block = extractDescribeBlock(lines, i);
      tests.describeBlocks.push(block);

      // Extract function names being tested in this block
      for (const testLine of block.content) {
        if (testLine.includes('.')) {
          const match = testLine.match(/(\w+)\./);
          if (match) {
            tests.testedFunctions.add(match[1]);
          }
        }
      }

      i += block.lines.length - 1; // Skip the lines we processed
    }
    // Extract test cases that might test standalone functions
    else if (line.startsWith('test(') || line.startsWith('it(')) {
      tests.testCases.push(line);

      // Look for function calls in test cases
      const functionCallMatch = line.match(/(\w+)\s*\(/);
      if (functionCallMatch) {
        tests.testedFunctions.add(functionCallMatch[1]);
      }
    }
  }

  return tests;
}

// Extract a complete describe block
function extractDescribeBlock(lines, startIndex) {
  const block = {
    name: '',
    content: [],
    lines: [],
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
    blocksToAdd: [],
    standaloneFunctionsToTest: [],
  };

  // Find new describe blocks
  for (const newBlock of newTests.describeBlocks) {
    const existingBlock = existing.describeBlocks.find((block) => block.name === newBlock.name);

    if (!existingBlock) {
      // New describe block
      changes.blocksToAdd.push(newBlock);
    } else {
      // Existing block - could check for test updates here if needed
      // For now, we'll assume the AI generates complete blocks
    }
  }

  // Check for standalone functions that need testing
  // We need to analyze the source code to find functions that aren't tested
  // For now, we'll rely on the AI to generate complete test suites
  // But we can add logic here to detect missing function tests

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

// Simple configuration for the analyzer
const config = {
  get: (key) =>
    ({
      'groq.apiKey':
        process.env.GROQ_API_KEY || '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',
      'groq.model': 'llama-3.1-8b-instant',
    })[key],
};

// Import the GroqAIAnalyzer
const { GroqAIAnalyzer } = require('../src/groq-analyzer');
const analyzer = new GroqAIAnalyzer(config);

// Simple synchronous prompt for better compatibility
function promptUser(question) {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

async function analyzeFile(filePath) {
  try {
    console.log(`\n📄 Analyzing ${filePath}...`);

    // Normalize path for Windows
    const normalizedPath = path.normalize(filePath);

    // Get the staged content - handle Windows paths with forward slashes for git
    const gitPath = normalizedPath.replace(/\\/g, '/');
    const stagedContent = execSync(`git show ":${gitPath}"`, {
      encoding: 'utf8',
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer for large files
      stdio: ['pipe', 'pipe', 'pipe'], // Ensure we can still read from stdin
    });

    // Analyze the code
    const result = await analyzer.analyzeCode(stagedContent, normalizedPath);

    if (result.success) {
      console.log(`✅ ${result.summary}`);
      if (result.issue) {
        console.log(`🔧 ${result.issue}`);
      }

      if (result.improvedCode && result.improvedCode !== stagedContent) {
        console.log('\n📝 Suggested improvements:');
        console.log('======================');

        // Show diff
        const diff = require('diff');
        const diffResult = diff.diffLines(stagedContent, result.improvedCode);

        diffResult.forEach((part) => {
          if (part.added) {
            process.stdout.write(`\x1b[32m+ ${part.value}\x1b[0m`);
          } else if (part.removed) {
            process.stdout.write(`\x1b[31m- ${part.value}\x1b[0m`);
          } else {
            process.stdout.write(`  ${part.value}`);
          }
        });

        console.log(
          '\n\x1b[36m💡 The AI has suggested some improvements. Please review them above.\x1b[0m'
        );

        // In non-interactive mode, default to not applying changes
        if (!process.stdout.isTTY) {
          console.log(
            '\n⚠️  Running in non-interactive mode. Changes will not be applied automatically.'
          );
          console.log('   To apply changes, run the pre-commit hook in an interactive terminal.');
          return true; // Don't fail the commit, just skip applying changes
        }

        let answer = 'n';
        try {
          // Use our more reliable prompt function
          answer = await promptUser('\n\x1b[33m❓ Apply these changes? (y/n, default: n) \x1b[0m');
          console.log(''); // Add a newline after the prompt
        } catch {
          console.error('\n⚠️  Error getting user input, defaulting to no changes');
          console.log('   Run with --no-verify to skip checks');
          console.log('   Or set NODE_ENV=test to auto-deny changes');
        }

        if (answer.toLowerCase() === 'y') {
          await fs.writeFile(filePath, result.improvedCode, 'utf8');
          execSync(`git add "${filePath}"`);
          console.log('✅ Changes applied and staged!');
        } else {
          console.log('ℹ️  Changes not applied.');
        }
      }

      // Generate tests for the code
      console.log('\n🧪 Generating unit tests...');
      const testResult = await analyzer.generateTests(stagedContent, normalizedPath);

      if (testResult.success) {
        // Create test file path
        const testFileName = path.basename(normalizedPath, '.js') + '.test.js';
        const testFileDir = path.dirname(normalizedPath);
        const testFilePath = path.join(testFileDir, '__tests__', testFileName);

        // Use intelligent merging instead of overwriting
        const success = await mergeTestFile(testFilePath, testResult.testCode);

        if (success) {
          // Stage the test file
          execSync(`git add "${testFilePath}"`);
          console.log(`✅ Generated and staged test file: ${testFilePath}`);
        } else {
          console.log(`⚠️  Failed to generate tests: ${testResult.error}`);
        }
      } else {
        console.log(`⚠️  Failed to generate tests: ${testResult.error}`);
      }

      return true;
    } else {
      console.error(`❌ Analysis failed: ${result.error}`);
    }
  } catch (error) {
    console.error(`❌ Error analyzing ${filePath}:`, error.message);
    return false;
  }
}

async function run() {
  try {
    console.clear(); // Clear the console for better visibility
    console.log('🚀 Running AI Code Analysis...');
    // Check if we should run in non-interactive mode
    if (process.env.NODE_ENV === 'test') {
      console.log('ℹ️  Running in test mode - will not apply changes automatically\n');
    }

    // Get list of staged JavaScript/TypeScript files
    const filesOutput = execSync(
      'git diff --cached --name-only --diff-filter=ACM "*.js" "*.jsx" "*.ts" "*.tsx"',
      {
        encoding: 'utf8',
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer for large output
        stdio: ['pipe', 'pipe', 'pipe'], // Ensure we can still read from stdin
      }
    );

    const files = filesOutput
      .split('\n')
      .filter(Boolean)
      .map((file) => file.trim())
      .filter((file) => file.length > 0);

    if (!process.stdout.isTTY) {
      console.log(
        '\x1b[33m⚠️  Warning: Not running in an interactive terminal. Some features may be limited.\x1b[0m'
      );
    }

    if (files.length === 0) {
      console.log('✅ No JavaScript/TypeScript files to analyze.');
      return 0;
    }

    console.log('📋 Files to analyze:');
    files.forEach((file) => console.log(`- ${file}`));

    // Analyze each file
    let allPassed = true;
    for (const file of files) {
      const success = await analyzeFile(file);
      if (!success) {
        allPassed = false;
      }
    }

    if (!allPassed) {
      console.error('\n❌ Some files failed analysis. Please fix the issues and try again.');
      return 1;
    }

    console.log('\n✅ All files passed AI code analysis!');
    return 0;
  } catch (error) {
    console.error('❌ Error during pre-commit hook execution:', error.message);
    return 1;
  }
}

// Run the function and exit with the appropriate status code
run()
  .then((code) => {
    process.exit(code);
  })
  .catch((err) => {
    console.error('❌ Unhandled error in pre-commit hook:', err);
    process.exit(1);
  });
