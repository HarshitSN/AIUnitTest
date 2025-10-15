#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

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

        // Ensure __tests__ directory exists
        await fs.mkdir(path.dirname(testFilePath), { recursive: true });

        // Write test file
        await fs.writeFile(testFilePath, testResult.testCode, 'utf8');

        // Stage the test file
        execSync(`git add "${testFilePath}"`);
        console.log(`✅ Generated and staged test file: ${testFilePath}`);
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
