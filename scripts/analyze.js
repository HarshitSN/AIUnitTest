const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Security patterns to detect
const SECURITY_PATTERNS = [
  { 
    pattern: /eval\(/g, 
    message: 'Found eval() - this can be dangerous as it executes arbitrary code.',
    severity: 'error'
  },
  {
    pattern: /new Function\(/g,
    message: 'Found new Function() - dynamic code execution can be a security risk.',
    severity: 'error'
  },
  {
    pattern: /<script>[\s\S]*<\/script>/g,
    message: 'Found inline script - consider moving to external files for better security.',
    severity: 'warning'
  },
  {
    pattern: /(?:\$|jQuery\.|document\.(getElementById|getElementsByClassName|querySelector|querySelectorAll|write|writeln)\(["']?[^'"\n]*[\"']?\))/g,
    message: 'Direct DOM manipulation detected - consider using a framework like React or Vue for better security and maintainability.',
    severity: 'warning'
  },
  {
    pattern: /(?:\b(?:select|insert|update|delete|drop|alter|create|truncate)\s+[\w*]+(?:\s+[\w=<>!]+)*\s*(?:;|$))/i,
    message: 'Potential SQL query detected - use parameterized queries to prevent SQL injection.',
    severity: 'error'
  },
  {
    pattern: /(?:password|pwd|secret|api[_-]?key|token|auth|credential)[\s\S]*?=[\s\S]*?[\"']([^\"'\s]+)["']/i,
    message: 'Potential hardcoded credentials detected - use environment variables instead.',
    severity: 'error'
  }
];

// Performance patterns to detect
const PERFORMANCE_PATTERNS = [
  {
    pattern: /\b(?:for\s*\([^;]*;\s*[^;]*;\s*[^)]*\)\s*{)/g,
    message: 'Consider using array methods (map, filter, reduce) for better readability and performance.',
    severity: 'suggestion'
  },
  {
    pattern: /\b(?:document\.getElementById|document\.getElementsByClassName|document\.querySelector)\(/g,
    message: 'Cache DOM queries to improve performance.',
    severity: 'suggestion'
  },
  {
    pattern: /\b(?:setInterval|setTimeout)\([^,)]*,\s*[0-9]+\)/g,
    message: 'Be cautious with timers - ensure they are properly cleaned up to prevent memory leaks.',
    severity: 'warning'
  }
];

// Code quality patterns
const CODE_QUALITY_PATTERNS = [
  {
    pattern: /\b(var)\s+/g,
    message: 'Use const or let instead of var for better scoping.',
    severity: 'warning'
  },
  {
    pattern: /\b(?:if\s*\([^)]*\)\s*{[^}]*}\s*else\s*{[^}]*})\s*else\s*{/g,
    message: 'Multiple if-else statements can be hard to read - consider using a switch statement or object mapping.',
    severity: 'suggestion'
  },
  {
    pattern: /\b(?:function\s+[a-zA-Z0-9_$]+\s*\([^)]*\)\s*{[^}]*})/g,
    message: 'Consider using arrow functions for better scoping and cleaner syntax.',
    severity: 'suggestion'
  }
];

// Simple code analysis function
function analyzeCode(filePath) {
  if (!filePath || typeof filePath !== 'string') {
    return {
      file: filePath || 'unknown',
      error: 'Invalid file path',
      issues: [],
      issueCount: 0
    };
  }

  try {
    // Check if file exists and is accessible
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const stats = fs.statSync(filePath);
    if (!stats.isFile()) {
      throw new Error(`Path is not a file: ${filePath}`);
    }

    // Read file with encoding specified
    const content = fs.readFileSync(filePath, 'utf-8');
    let issues = [];
    
    // Check for common issues
    const isTestFile = filePath.includes('.test.') || 
                      filePath.includes('__tests__') ||
                      filePath.endsWith('.test.js') || 
                      filePath.endsWith('.spec.js');
    
    // Only warn about console.log in non-test files
    if (content.includes('console.log(') && !isTestFile) {
      // Count occurrences to provide more context
      const count = (content.match(/console\.log\(/g) || []).length;
      issues.push({
        severity: 'warning',
        message: `Found ${count} console.log() calls - consider using a proper logging library in production.`,
        line: content.substring(0, content.indexOf('console.log(')).split('\n').length
      });
    }
    
    // Check for TODO/FIXME comments
    const todoMatches = content.match(/\b(TODO|FIXME|HACK|XXX)\b/g) || [];
    if (todoMatches.length > 0) {
      const uniqueTags = [...new Set(todoMatches)];
      issues.push({
        severity: 'info',
        message: `Found ${todoMatches.length} ${uniqueTags.join('/')} comments - make sure to address these before merging.`
      });
    }
    
    // Check for security issues
    SECURITY_PATTERNS.forEach(pattern => {
      const matches = content.match(pattern.pattern) || [];
      if (matches.length > 0) {
        issues.push({
          severity: pattern.severity,
          message: pattern.message,
          occurrences: matches.length
        });
      }
    });
    
    // Check for performance issues
    PERFORMANCE_PATTERNS.forEach(pattern => {
      const matches = content.match(pattern.pattern) || [];
      if (matches.length > 0) {
        issues.push({
          severity: pattern.severity,
          message: pattern.message,
          occurrences: matches.length
        });
      }
    });
    
    // Check for code quality issues
    CODE_QUALITY_PATTERNS.forEach(pattern => {
      const matches = content.match(pattern.pattern) || [];
      if (matches.length > 0) {
        issues.push({
          severity: pattern.severity,
          message: pattern.message,
          occurrences: matches.length
        });
      }
    });
    
    // Check for basic code quality
    const lines = content.split('\n');
    lines.forEach((line, i) => {
      // Check line length
      if (line.length > 120) {
        issues.push({
          severity: 'warning',
          line: i + 1,
          message: `Line exceeds 120 characters (${line.length}) - consider breaking it down.`,
          codeSnippet: line.trim().substring(0, 50) + (line.length > 50 ? '...' : '')
        });
      }
      
      // Check for trailing whitespace
      if (/\s+$/.test(line)) {
        issues.push({
          severity: 'suggestion',
          line: i + 1,
          message: 'Trailing whitespace found',
          codeSnippet: line.trim().substring(0, 50) + (line.length > 50 ? '...' : '')
        });
      }
      
      // Check for mixed tabs and spaces
      if (/^\s* \s*\t|\t \s*| \t/.test(line)) {
        issues.push({
          severity: 'warning',
          line: i + 1,
          message: 'Mixed tabs and spaces',
          codeSnippet: line.trim().substring(0, 50) + (line.length > 50 ? '...' : '')
        });
      }
    });
    };
    // Check for potential memory leaks
    const eventListeners = content.match(/addEventListener\([^,)]+,\s*[^,)]+\)/g) || [];
    const removeListeners = content.match(/removeEventListener\([^,)]+,\s*[^,)]+\)/g) || [];
    
    if (eventListeners.length > removeListeners.length) {
      issues.push({
        severity: 'warning',
        message: `Found ${eventListeners.length} addEventListener() calls but only ${removeListeners.length} removeEventListener() calls - potential memory leak.`
      });
    }
    
    // Check for potential infinite loops
    if (content.match(/\b(?:while\s*\(true\)|for\s*\(;\s*;\s*\))/)) {
      issues.push({
        severity: 'warning',
        message: 'Potential infinite loop detected - make sure there is a proper exit condition.'
      });
    }
    
    // Check for deprecated APIs
    const deprecatedApis = [
      { name: 'componentWillMount', severity: 'warning' },
      { name: 'componentWillReceiveProps', severity: 'warning' },
      { name: 'UNSAFE_', severity: 'warning' },
      { name: 'createClass', severity: 'warning' },
      { name: 'PropTypes', severity: 'suggestion' }
    ];
    
    deprecatedApis.forEach(api => {
      if (content.includes(api.name)) {
        issues.push({
          severity: api.severity,
          message: `Deprecated API detected: ${api.name} - consider using the recommended alternative.`
        });
      }
    });
    
    return {
      file: path.basename(filePath),
      fullPath: filePath,
      issues,
      issueCount: issues.length,
      stats: {
        lines: lines.length,
        characters: content.length,
        issuesBySeverity: issues.reduce((acc, issue) => {
          acc[issue.severity] = (acc[issue.severity] || 0) + 1;
          return acc;
        }, {})
      }
    };
    
  } catch (error) {
    return {
      file: path.basename(filePath),
      fullPath: filePath,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      issues: [{
        severity: 'error',
        message: `Error analyzing file: ${error.message}`
      }],
      issueCount: 1
    };
  }
}

// Main function
async function main() {
  try {
    const files = process.argv.slice(2);
    if (files.length === 0) {
      console.log('No files to analyze. Please provide file paths as arguments.');
      process.exit(0);
    }

    let hasErrors = false;
    for (const file of files) {
      const result = analyzeCode(file);
      console.log(`\nAnalysis for ${file}:`);
      
      if (result.error) {
        console.error(`❌ Error: ${result.error}`);
        hasErrors = true;
        continue;
      }

      if (result.issueCount === 0) {
        console.log('✅ No issues found');
      } else {
        console.log(`Found ${result.issueCount} issue(s):`);
        result.issues.forEach(issue => {
          const lineInfo = issue.line ? ` (line ${issue.line})` : '';
          console.log(`- [${issue.severity.toUpperCase()}]${lineInfo}: ${issue.message}`);
          if (issue.codeSnippet) {
            console.log(`  ${issue.codeSnippet}`);
          }
        });
        
        // If there are any errors, set the flag
        if (result.issues.some(issue => issue.severity === 'error')) {
          hasErrors = true;
        }
      }
    }

    // Exit with appropriate status code
    process.exit(hasErrors ? 1 : 0);
  } catch (error) {
    console.error('Unhandled error:', error);
    process.exit(1);
  }
}

// Run the main function if this file is executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}

// Format results function (used by the test)
function formatResults(results, verbose = false) {
  const output = [];
  let errorCount = 0;
  let warningCount = 0;
  let suggestionCount = 0;
  
  results.forEach(result => {
    if (result.error) {
      output.push(`❌ ${result.file}: ${result.error}`);
      if (result.stack && verbose) {
        output.push(`   ${result.stack.split('\n').slice(0, 3).join('\n   ')}`);
      }
      errorCount++;
      return;
    }

    if (result.issueCount === 0) {
      output.push(`✅ ${result.file}: No issues found`);
      return;
    }

    output.push(`\n📄 ${result.file} (${result.issueCount} issues):`);
    
    result.issues.forEach(issue => {
      const prefix = issue.severity === 'error' ? '❌' :
                    issue.severity === 'warning' ? '⚠️' : '💡';
      const lineInfo = issue.line ? ` (line ${issue.line})` : '';
      output.push(`  ${prefix} [${issue.severity.toUpperCase()}]${lineInfo}: ${issue.message}`);
      
      if (issue.codeSnippet) {
        output.push(`    ${issue.codeSnippet}`);
      }
      
      // Update counters
      if (issue.severity === 'error') errorCount++;
      else if (issue.severity === 'warning') warningCount++;
      else suggestionCount++;
    });
  });

  // Add summary
  output.push('\n📊 Summary:');
  output.push(`  - ${errorCount} errors`);
  output.push(`  - ${warningCount} warnings`);
  output.push(`  - ${suggestionCount} suggestions`);

  return output.join('\n');
}

// Export for testing
module.exports = {
  analyzeCode,
  formatResults
};
