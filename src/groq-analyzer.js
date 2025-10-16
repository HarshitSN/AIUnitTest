import { Groq } from 'groq-sdk';
import path from 'path';

class GroqAIAnalyzer {
  constructor(config) {
    this.config = config;
    this.groq = new Groq({
      apiKey: this.config.get('groq.apiKey'),
    });
  }

  async analyzeCode(code, filePath) {
    if (!code || typeof code !== 'string') {
      return {
        success: false,
        error: 'Invalid code provided',
        file: filePath,
      };
    }

    try {
      const prompt = `Review this code and provide:
1. One-line summary of what it does
2. One potential issue to fix
3. Improved version with fixes

Code:\n\`\`\`\n${code}\n\`\`\``;

      const completion = await this.groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content:
              'You are a senior software engineer reviewing code. Provide clear, concise feedback and improved code when possible.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        model: this.config.get('groq.model') || 'llama-3.1-8b-instant',
        temperature: 0.3,
        max_tokens: 1000,
      });

      const response = completion.choices[0]?.message?.content || 'No response';

      // Extract improved code if present
      const improvedCode = this.extractCodeBlocks(response)[0] || code;

      // Extract issues and suggestions from AI response
      const issues = this.extractIssues(response);
      const suggestions = this.extractSuggestions(response);

      return {
        success: true,
        file: filePath,
        summary: response.split('\n')[0] || 'No summary',
        issue: issues.length > 0 ? issues[0].message : 'No major issues',
        improvedCode: improvedCode,
        fullResponse: response,
        issues: issues,
        suggestions: suggestions,
      };
    } catch (error) {
      console.error('Error in analyzeCode:', error);
      return {
        success: false,
        error: error.message,
        file: filePath,
      };
    }
  }

  extractCodeBlocks(text) {
    if (!text) return [];

    const codeBlocks = [];
    const codeBlockRegex = /```(?:javascript|js|typescript|ts)?\n([\s\S]*?)\n```/g;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      codeBlocks.push(match[1]);
    }

    return codeBlocks.length > 0 ? codeBlocks : [];
  }

  extractIssues(analysis) {
    const issues = [];
    const lines = analysis.split('\n');
    for (const line of lines) {
      if (line.toLowerCase().includes('error:') || line.toLowerCase().includes('warning:')) {
        const severity = line.toLowerCase().includes('error:') ? 'error' : 'warning';
        const message = line.split(':').slice(1).join(':').trim();
        if (message) {
          issues.push({ severity, message });
        }
      }
    }
    return issues;
  }

  generateImports(code, filePath) {
    const imports = [];
    const issues = [];
    const isExported = /\bmodule\.exports\s*=|exports\./.test(code);

    // Check if the code contains class definitions
    const classMatches = code.match(/class\s+(\w+)/g);
    if (classMatches) {
      classMatches.forEach((match) => {
        const className = match.replace('class ', '');
        // Check if this is in the same file we're testing
        if (filePath.endsWith('.js') && !filePath.includes('/__tests__/')) {
          const fileName = path.basename(filePath, '.js');

          // For exported classes - use normal import
          if (isExported) {
            // Check if the class is exported
            const exportPattern = new RegExp(
              `module\\.exports\\s*=\\s*${className}|exports\\.${className}\\s*=\\s*${className}`
            );
            if (!exportPattern.test(code)) {
              issues.push(
                `Class '${className}' is not exported. Add 'module.exports = ${className};' to ${path.basename(filePath)}`
              );
            }
            imports.push(`const ${className} = require('../${path.basename(filePath)}');`);
          } else {
            // For non-exported classes - test them differently
            imports.push(`// Testing non-exported class: ${className}`);
            imports.push(`// Note: This file doesn't export ${className}, testing in global scope`);
          }
        }
      });
    }

    // Check for function definitions (but not arrow functions or methods)
    const functionMatches = code.match(
      /^(?!.*=>.*)[ \t]*function\s+(\w+)[\s]*\(|^(?!.*=>.*)[ \t]*(\w+)[\s]*\([^)]*\)[\s]*{/gm
    );
    if (functionMatches) {
      functionMatches.forEach((match) => {
        const functionName = match
          .replace(/^(?!.*=>.*)[ \t]*function\s+/, '')
          .replace(/[\s]*\([^)]*\)[\s]*{/, '');
        if (functionName && filePath.endsWith('.js') && !filePath.includes('/__tests__/')) {
          const fileName = path.basename(filePath, '.js');

          // For exported functions - use normal import
          if (isExported) {
            // Check if the function is exported
            const exportPattern = new RegExp(
              `module\\.exports\\s*=\\s*${functionName}|exports\\.${functionName}\\s*=\\s*${functionName}`
            );
            if (!exportPattern.test(code)) {
              issues.push(
                `Function '${functionName}' is not exported. Add 'module.exports = ${functionName};' to ${path.basename(filePath)}`
              );
            }
            imports.push(`const ${functionName} = require('../${path.basename(filePath)}');`);
          } else {
            // For non-exported functions - test them differently
            imports.push(`// Testing non-exported function: ${functionName}`);
            imports.push(
              `// Note: This file doesn't export ${functionName}, testing in global scope`
            );
          }
        }
      });
    }

    // Check for fs imports (for config.js)
    if (code.includes('fs.') || code.includes('fs.readFile') || code.includes('fs.writeFile')) {
      imports.push("import fs from 'fs';");
    }

    // Check for path imports
    if (code.includes('path.') || code.includes('path.join') || code.includes('path.dirname')) {
      imports.push("import path from 'path';");
    }

    // Store issues for later reporting
    this.lastImportIssues = issues;

    return imports.join('\n');
  }

  analyzeCodeBehavior(code, filePath) {
    const analysis = {
      classes: [],
      functions: [],
      methods: [],
      stateVariables: [],
      edgeCases: [],
      errorConditions: [],
    };

    // Analyze class definitions
    const classMatches = code.match(/class\s+(\w+).*?\{([\s\S]*)\}$/gm);
    if (classMatches) {
      classMatches.forEach((classMatch) => {
        const className = classMatch.match(/class\s+(\w+)/)[1];
        // Extract everything between the opening { and the closing } of the class
        const openBraceIndex = classMatch.lastIndexOf('{');
        const classBody = classMatch.substring(openBraceIndex + 1, classMatch.length - 1);

        const classInfo = {
          name: className,
          methods: [],
          constructor: null,
        };

        // Extract constructor
        const constructorMatch = classBody.match(/constructor\s*\(([^)]*)\)\s*\{([\s\S]*?)\}/);
        if (constructorMatch) {
          classInfo.constructor = {
            params: constructorMatch[1].split(',').map((p) => p.trim()),
            body: constructorMatch[2].trim(),
          };
        }

        // Extract methods - look for method patterns within the class body
        const methodMatches = classBody.match(
          /(\w+)\s*\(([^)]*)\)\s*\{([\s\S]*?)\}(?=\s*(?:\w+\s*\(|\/\s*$))/g
        );
        if (methodMatches) {
          methodMatches.forEach((methodMatch) => {
            const methodName = methodMatch.match(/(\w+)\s*\(/)[1];
            const params = methodMatch.match(/\(([^)]*)\)/)[1];
            const body = methodMatch.match(/\{([\s\S]*?)\}/)[1];

            if (methodName !== 'constructor') {
              classInfo.methods.push({
                name: methodName,
                params: params
                  .split(',')
                  .map((p) => p.trim())
                  .filter((p) => p),
                body: body.trim(),
                isAsync: methodMatch.includes('async'),
                returnStatements: this.extractReturnStatements(body),
                stateChanges: this.analyzeStateChanges(body, className),
                errorHandling: this.analyzeErrorHandling(body),
              });
            }
          });
        }

        analysis.classes.push(classInfo);
      });
    }

    // Analyze function definitions
    const functionMatches = code.match(
      /^(?!.*=>.*)[ \t]*function\s+(\w+)[\s]*\(([^)]*)\)[\s]*\{([\s\S]*?)\}/gm
    );
    if (functionMatches) {
      functionMatches.forEach((funcMatch) => {
        const funcName = funcMatch.match(/function\s+(\w+)/)[1];
        const params = funcMatch.match(/\(([^)]*)\)/)[1];
        const body = funcMatch.match(/\{([\s\S]*?)\}/)[1];

        analysis.functions.push({
          name: funcName,
          params: params
            .split(',')
            .map((p) => p.trim())
            .filter((p) => p),
          body: body.trim(),
          returnStatements: this.extractReturnStatements(body),
          errorHandling: this.analyzeErrorHandling(body),
        });
      });
    }

    return analysis;
  }

  extractReturnStatements(body) {
    const returns = [];
    const returnMatches = body.match(/return\s+([^;]+);?/g);
    if (returnMatches) {
      returnMatches.forEach((ret) => {
        const value = ret.match(/return\s+([^;]+);?/)[1].trim();
        returns.push(value);
      });
    }
    return returns;
  }

  analyzeStateChanges(body, className) {
    const changes = [];
    // Look for this.property assignments
    const assignments = body.match(/this\.(\w+)\s*=\s*([^;]+);?/g);
    if (assignments) {
      assignments.forEach((assignment) => {
        const match = assignment.match(/this\.(\w+)\s*=\s*([^;]+);?/);
        if (match) {
          changes.push({
            property: match[1],
            value: match[2].trim(),
            context: assignment.trim(),
          });
        }
      });
    }
    return changes;
  }

  analyzeErrorHandling(body) {
    const errors = [];
    // Look for try-catch blocks
    const tryCatchMatches = body.match(/catch\s*\(\s*([^)]+)\s*\)\s*\{([\s\S]*?)\}/g);
    if (tryCatchMatches) {
      tryCatchMatches.forEach((catchBlock) => {
        const errorVar = catchBlock.match(/catch\s*\(\s*([^)]+)\s*\)/)[1];
        errors.push({ type: 'catch', variable: errorVar, block: catchBlock });
      });
    }

    // Look for error throwing
    const throwMatches = body.match(/throw\s+([^;]+);?/g);
    if (throwMatches) {
      throwMatches.forEach((throwMatch) => {
        const error = throwMatch.match(/throw\s+([^;]+);?/)[1].trim();
        errors.push({ type: 'throw', value: error });
      });
    }

    // Look for conditional returns
    const conditionals = body.match(/if\s*\(([^)]+)\)\s*return;/g);
    if (conditionals) {
      conditionals.forEach((cond) => {
        const condition = cond.match(/if\s*\(([^)]+)\)/)[1];
        errors.push({ type: 'conditional_return', condition });
      });
    }

    return errors;
  }

  generateTestSuiteName(filePath) {
    const baseName = path.basename(filePath, '.js');
    // Convert camelCase or kebab-case to Title Case for describe blocks
    return baseName
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());
  }

  async generateTests(code, filePath) {
    if (!code || typeof code !== 'string') {
      return {
        success: false,
        error: 'Invalid code provided',
        file: filePath,
      };
    }

    try {
      // Analyze the code behavior first
      const analysis = this.analyzeCodeBehavior(code, filePath);

      // Create detailed prompt based on analysis
      const prompt = this.createDetailedPrompt(code, filePath, analysis);

      const completion = await this.groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content:
              'You are an expert JavaScript developer specializing in writing comprehensive unit tests. Generate complete Jest tests that accurately reflect the actual behavior of the provided code. Do not make assumptions about behavior - test exactly what the code does.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        model: this.config.get('groq.model') || 'llama-3.1-8b-instant',
        temperature: 0.1, // Lower temperature for more accurate tests
        max_tokens: 4000,
      });

      const response = completion.choices[0]?.message?.content || '';

      // Extract test code from response
      const testCode = this.extractCodeBlocks(response)[0] || '';

      if (!testCode) {
        return {
          success: false,
          error: 'No test code generated',
          file: filePath,
          fullResponse: response.substring(0, 500),
        };
      }

      // Validate generated tests against analysis
      const validation = this.validateGeneratedTests(testCode, analysis);

      if (!validation.isValid) {
        return {
          success: false,
          error: `Generated tests don't match code behavior: ${validation.issues.join(', ')}`,
          file: filePath,
          suggestions: validation.suggestions,
          testCode: testCode,
        };
      }

      // Check for import issues and provide helpful error messages
      if (this.lastImportIssues && this.lastImportIssues.length > 0) {
        return {
          success: false,
          error: `Import issues detected: ${this.lastImportIssues.join(', ')}`,
          file: filePath,
          suggestions: this.lastImportIssues,
          testCode: testCode,
        };
      }

      return {
        success: true,
        file: filePath,
        testCode: testCode,
        fullResponse: response,
        analysis: analysis,
      };
    } catch (error) {
      console.error('Error in generateTests:', error);
      return {
        success: false,
        error: error.message,
        file: filePath,
      };
    } // Close catch block
  } // Close generateTests method

  createDetailedPrompt(code, filePath, analysis) {
    const isExported = /\bmodule\.exports\s*=|exports\./.test(code);
    const className = analysis.classes.length > 0 ? analysis.classes[0].name : 'Calculator';

    if (!isExported) {
      return `Generate comprehensive unit tests for this JavaScript code:

\`\`\`javascript
${code}
\`\`\`

CODE ANALYSIS:
${JSON.stringify(analysis, null, 2)}

IMPORTANT: This code does NOT export any modules. To enable proper testing, you have two options:

OPTION 1 - Add exports (RECOMMENDED):
Add 'module.exports = YourClassName;' at the end of the file, then generate tests normally.

OPTION 2 - Alternative testing approach:
Since this code doesn't export modules, the tests would need to reference the classes/functions directly.

For now, I'll generate tests assuming exports will be added. If you prefer not to modify the original file, the tests will need manual adjustment.

IMPORTANT ADDITIONAL REQUIREMENTS:
8. Use the variable name "${className}" (exactly as imported above) when creating instances in tests
9. Do NOT use different variable names like "${className.toLowerCase()}" - always use "${className}"
10. The imported variable "${className}" refers to the ${className} class from the source file

\`\`\`javascript
// Test file for: ${path.basename(filePath)}
// Generated by AI Test Generator
// NOTE: This file doesn't export modules. Add 'module.exports = ${className};' to enable these tests.

const { describe, test, expect } = require('@jest/globals');
// Import the ${className} class - use '${className}' as the variable name
const ${className} = require('../${path.basename(filePath)}');

describe('${this.generateTestSuiteName(filePath)}', () => {
  // Test the ${className} class that was imported above
  // Use '${className}' (uppercase) as the variable name throughout the tests

  describe('core functionality', () => {
    // Test basic ${className.toLowerCase()} operations
  });

  describe('edge cases', () => {
    // Test edge cases and error conditions
  });
});
\`\`\``;
    }

    // Traditional exported module testing
    return `Generate comprehensive unit tests for this JavaScript code:

\`\`\`javascript
${code}
\`\`\`

CODE ANALYSIS:
${JSON.stringify(analysis, null, 2)}

IMPORTANT REQUIREMENTS:
1. Use Jest testing framework with CommonJS require syntax
2. Test EXACTLY what the code does - no assumptions
3. For each method, test the specific behavior observed in the analysis
4. Use descriptive test names that reflect actual functionality
5. Test edge cases that actually exist in the code
6. Test error conditions as they are implemented
IMPORTANT ADDITIONAL REQUIREMENTS:
8. Use the variable name "${className}" (exactly as imported above) when creating instances in tests
9. Do NOT use different variable names like "${className.toLowerCase()}" - always use "${className}"
10. The imported variable "${className}" refers to the ${className} class from the source file

\`\`\`javascript
// Test file for: ${path.basename(filePath)}
// Generated by AI Test Generator

const { describe, test, expect } = require('@jest/globals');
// Import the ${className} class - use '${className}' as the variable name
const ${className} = require('../${path.basename(filePath)}');

describe('${this.generateTestSuiteName(filePath)}', () => {
  // Test the ${className} class that was imported above
  // Use '${className}' (uppercase) as the variable name throughout the tests

  describe('core functionality', () => {
    // Test basic ${className.toLowerCase()} operations
  });

  describe('edge cases', () => {
    // Test edge cases and error conditions
  });
});
\`\`\``;
  }
  extractCodeForInlineTesting(code) {
    // Extract class and function definitions for inline testing
    const lines = code.split('\n');
    const extractedLines = [];

    lines.forEach((line, index) => {
      // Include class definitions
      if (line.trim().startsWith('class ')) {
        // Find the end of the class
        let braceCount = 0;
        let inClass = false;
        for (let i = index; i < lines.length; i++) {
          extractedLines.push(lines[i]);
          if (lines[i].includes('{')) braceCount++;
          if (lines[i].includes('}')) braceCount--;
          if (braceCount === 0 && inClass) break;
          if (lines[i].trim().startsWith('class ')) inClass = true;
        }
      }
      // Include function definitions (but not arrow functions)
      else if (line.match(/^(?!.*=>.*)[ \t]*function\s+\w+/) && !line.includes('module.exports')) {
        extractedLines.push(line);
      }
    });

    return extractedLines.join('\n').trim();
  }

  validateGeneratedTests(testCode, analysis) {
    const issues = [];
    const suggestions = [];

    try {
      // Basic syntax validation
      new Function(testCode);
    } catch (error) {
      issues.push(`Syntax error in generated tests: ${error.message}`);
      suggestions.push('Check for proper JavaScript syntax in generated tests');
    }

    // Check if test structure matches code structure
    if (analysis.classes.length > 0 && !testCode.includes('describe(')) {
      issues.push('Generated tests missing describe blocks for classes');
      suggestions.push('Ensure tests include describe blocks for each class');
    }

    // Check for method coverage
    analysis.classes.forEach((cls) => {
      cls.methods.forEach((method) => {
        if (!testCode.includes(`.${method.name}(`)) {
          issues.push(`Missing test for method: ${cls.name}.${method.name}`);
          suggestions.push(`Add test for ${cls.name}.${method.name} method`);
        }
      });
    });

    return {
      isValid: issues.length === 0,
      issues,
      suggestions,
    };
  }
} // Close class GroqAIAnalyzer

export default GroqAIAnalyzer;
