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

    // Check if the code contains class definitions
    const classMatches = code.match(/class\s+(\w+)/g);
    if (classMatches) {
      classMatches.forEach(match => {
        const className = match.replace('class ', '');
        // Check if this is in the same file we're testing
        if (filePath.endsWith('.js') && !filePath.includes('/__tests__/')) {
          const fileName = path.basename(filePath, '.js');
          if (className === fileName || className === 'DataProcessor') {
            imports.push(`const ${className} = require('../${path.basename(filePath)}');`);
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

    return imports.join('\n');
  }

  generateTestSuiteName(filePath) {
    const baseName = path.basename(filePath, '.js');
    // Convert camelCase or kebab-case to Title Case for describe blocks
    return baseName
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
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
      const prompt = `Generate comprehensive unit tests for this JavaScript code:

\`\`\`javascript
${code}
\`\`\`

Requirements:
1. Use Jest testing framework with CommonJS require syntax
2. Include tests for all public methods and functions
3. Test edge cases, error conditions, and normal usage
4. Use descriptive test names and AAA pattern (Arrange, Act, Assert)
5. Include proper setup and teardown where needed
6. Mock external dependencies if any
7. Use single quotes for strings and 2-space indentation
8. Follow standard prettier formatting rules

IMPORTANT: Generate tests that are appropriate for the actual code provided. For classes, import them properly. For functions, test them directly.

Return ONLY the test code in this format:

\`\`\`javascript
// Test file for: ${path.basename(filePath)}
// Generated by AI Test Generator

const { describe, test, expect } = require('@jest/globals');
// Add necessary imports based on the code being tested
${this.generateImports(code, filePath)}

describe('${this.generateTestSuiteName(filePath)}', () => {
  // Comprehensive tests for the actual functionality
  describe('core functionality', () => {
    // Add appropriate tests based on the code
  });

  describe('edge cases', () => {
    // Add edge case tests
  });

  describe('error handling', () => {
    // Add error handling tests
  });
});
\`\`\``;

      const completion = await this.groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content:
              'You are an expert JavaScript developer specializing in writing comprehensive unit tests. Generate complete Jest tests appropriate for the provided code. Focus on testing the actual functionality, edge cases, and error conditions of the code given.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        model: this.config.get('groq.model') || 'llama-3.1-8b-instant',
        temperature: 0.2, // Slightly higher for more flexibility with complex code
        max_tokens: 4000, // Increased for complex class testing
      });

      const response = completion.choices[0]?.message?.content || '';

      // Extract test code from response
      const testCode = this.extractCodeBlocks(response)[0] || '';

      if (!testCode) {
        return {
          success: false,
          error: 'No test code generated',
          file: filePath,
          fullResponse: response.substring(0, 500), // Include part of response for debugging
        };
      }

      return {
        success: true,
        file: filePath,
        testCode: testCode,
        fullResponse: response,
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
}

export { GroqAIAnalyzer };
