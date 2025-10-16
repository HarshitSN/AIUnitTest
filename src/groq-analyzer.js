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

    // Check if the code contains class definitions
    const classMatches = code.match(/class\s+(\w+)/g);
    if (classMatches) {
      classMatches.forEach((match) => {
        const className = match.replace('class ', '');
        // Check if this is in the same file we're testing
        if (filePath.endsWith('.js') && !filePath.includes('/__tests__/')) {
          const fileName = path.basename(filePath, '.js');
          // Import the class if it's defined in this file (more flexible matching)
          if (
            className.toLowerCase().includes(fileName.toLowerCase()) ||
            fileName.toLowerCase().includes(className.toLowerCase()) ||
            className === 'DataProcessor' ||
            className.toLowerCase().includes('test') // For test files
          ) {
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
          if (
            functionName.toLowerCase().includes(fileName.toLowerCase()) ||
            fileName.toLowerCase().includes(functionName.toLowerCase())
          ) {
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
          }
        }
      });
    }

    // Check for fs imports (for config.js)
    if (code.includes('fs.') || code.includes('fs.readFile') || code.includes('fs.writeFile')) {
      imports.push("const fs = require('fs');");
    }

    // Check for path imports
    if (code.includes('path.') || code.includes('path.join') || code.includes('path.dirname')) {
      imports.push("const path = require('path');");
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
    }
  }

  createDetailedPrompt(code, filePath, analysis) {
    let prompt = `Generate comprehensive unit tests for this JavaScript code:

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
7. Follow standard prettier formatting rules

Based on the code analysis above, generate tests for:

`;

    // Add specific test requirements based on analysis
    if (analysis.classes.length > 0) {
      analysis.classes.forEach((cls) => {
        prompt += `\nCLASS: ${cls.name}\n`;
        if (cls.constructor) {
          prompt += `- Constructor with params: ${cls.constructor.params.join(', ')}\n`;
        }
        cls.methods.forEach((method) => {
          prompt += `- Method: ${method.name}(${method.params.join(', ')})\n`;
          if (method.stateChanges.length > 0) {
            prompt += `  - State changes: ${method.stateChanges.map((s) => `${s.property} = ${s.value}`).join(', ')}\n`;
          }
          if (method.errorHandling.length > 0) {
            prompt += `  - Error handling: ${method.errorHandling.map((e) => e.type).join(', ')}\n`;
          }
        });
      });
    }

    prompt += `

Return ONLY the test code in this format:

\`\`\`javascript
// Test file for: ${path.basename(filePath)}
// Generated by AI Test Generator

const { describe, test, expect } = require('@jest/globals');
// Add necessary imports based on the code being tested
${this.generateImports(code, filePath)}

describe('${this.generateTestSuiteName(filePath)}', () => {
  // Tests based on actual code analysis above
  describe('core functionality', () => {
    // Add tests for actual methods and their behaviors
  });

  describe('edge cases', () => {
    // Add tests for actual edge cases in the code
  });

  describe('error handling', () => {
    // Add tests for actual error conditions in the code
  });
});
\`\`\``;

    return prompt;
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
}

export { GroqAIAnalyzer };
