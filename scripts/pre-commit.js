#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const diff = require('diff');
const readline = require('readline');

// Simple config
const config = {
  get: (key) => ({
    'groq.apiKey': process.env.GROQ_API_KEY || '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',
    'groq.model': 'llama-3.1-8b-instant'
  }[key])
};

// Import the GroqAIAnalyzer
const { GroqAIAnalyzer } = require('../src/groq-analyzer');
const analyzer = new GroqAIAnalyzer(config);

async function run() {
  console.log('🔍 Running AI Code Analysis...');
  let errors = 0;

  try {
    // Get list of staged JavaScript/TypeScript files
    let files = [];
    try {
      const filesOutput = execSync('git diff --cached --name-only --diff-filter=ACM "*.js" "*.jsx" "*.ts" "*.tsx"', { 
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe']
      });
      
      files = filesOutput
        .split('\n')
        .filter(Boolean)
        .filter(file => !file.includes('node_modules'));
      
      if (files.length === 0) {
        console.log('✅ No JavaScript/TypeScript files to analyze.');
        return 0;
      }
      
      console.log(`📋 Found ${files.length} files to analyze:`, files.join(', '));
      
    } catch (error) {
      console.error('❌ Error getting list of staged files:', error.message);
      if (error.stderr) console.error('stderr:', error.stderr.toString());
      return 1;
    }

    // Removed duplicate errors declaration

    for (const file of files) {
      console.log(`\n📄 Analyzing ${file}...`);
      
      try {
        // Get the staged content
        const content = execSync(`git show ":${file}"`, { encoding: 'utf8' });
        
        if (!content) {
          console.log('  ℹ️  File is empty or binary, skipping...');
          continue;
        }

        // Run the analyzer
        const result = await analyzer.analyzeCode(content, file);
        
        if (!result.success) {
          console.error(`❌ Analysis failed: ${result.error}`);
          errors++;
          continue;
        }
        
        console.log(`✅ ${result.summary}`);
        console.log(`🔧 ${result.issue}`);
        
        if (result.improvedCode && result.improvedCode !== content) {
          console.log('\n📝 Suggested improvements:');
          console.log('======================');
          
          // Show diff
          const diffResult = diff.diffLines(content, result.improvedCode);
          
          diffResult.forEach(part => {
            if (part.added) {
              process.stdout.write('\x1b[32m+' + part.value + '\x1b[0m');
            } else if (part.removed) {
              process.stdout.write('\x1b[31m-' + part.value + '\x1b[0m');
            }
          });
          
          // Ask user if they want to apply changes
          const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
          });
          
          const answer = await new Promise(resolve => {
            rl.question('\nApply these changes? (y/n) ', (answer) => {
              rl.close();
              resolve(answer);
            });
          });
          
          if (answer.toLowerCase() === 'y') {
            await fs.writeFile(file, result.improvedCode, 'utf8');
            execSync(`git add "${file}"`);
            console.log('✅ Changes applied and staged!');
          } else {
            console.log('ℹ️  Changes not applied.');
            errors++;
          }
        }
      } catch (error) {
        console.error(`❌ Error analyzing ${file}:`, error.message);
        errors++;
      }
    }

    if (errors > 0) {
      console.error(`\n❌ ${errors} file(s) need attention. Please fix the issues before committing.`);
      console.error('   You can bypass this check with \'git commit --no-verify\' (not recommended)');
      process.exit(1);
    }

    console.log('\n✅ All files passed AI code analysis!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during pre-commit hook:', error.message);
    process.exit(1);
  }
}

// Run the script
run();