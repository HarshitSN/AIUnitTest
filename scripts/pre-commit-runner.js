#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

async function run() {
  try {
    console.log('🚀 Running AI Code Analysis...');
    
    // Get the repository root
    const repoRoot = process.cwd();
    const preCommitScript = path.join(repoRoot, 'scripts', 'pre-commit.js');
    
    // Check if the pre-commit script exists
    try {
      await fs.access(preCommitScript);
    } catch (err) {
      console.error(`❌ Pre-commit script not found at: ${preCommitScript}`);
      return 1;
    }
    
    // Execute the main pre-commit script
    const result = execSync(`node "${preCommitScript}"`, {
      stdio: 'pipe',
      cwd: repoRoot,
      encoding: 'utf-8'
    });
    
    // Output the result
    console.log(result);
    return 0;
    
  } catch (error) {
    console.error('❌ Pre-commit hook error:', error.message);
    if (error.stdout) console.error('stdout:', error.stdout);
    if (error.stderr) console.error('stderr:', error.stderr);
    return 1;
  }
}

// Run the function and exit with the appropriate status code
run().then(code => {
  process.exit(code);
}).catch(err => {
  console.error('❌ Unhandled error in pre-commit hook:', err);
  process.exit(1);
});
