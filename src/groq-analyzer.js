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

  extractSuggestions(analysis) {
    const suggestions = [];
    const lines = analysis.split('\n');
    for (const line of lines) {
      if (
        line.toLowerCase().includes('suggestion:') ||
        line.toLowerCase().includes('recommend:') ||
        line.toLowerCase().includes('tip:')
      ) {
        const message = line.replace(/suggestion:|recommend:|tip:/i, '').trim();
        if (message) {
          suggestions.push({ type: 'suggestion', message });
        }
      }
    }
    return suggestions;
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
      const prompt = `Generate comprehensive unit tests for this JavaScript code. Follow these requirements:

1. Use Jest testing framework with CommonJS require syntax
2. Include tests for all functions, classes, and key logic
3. Test edge cases, error conditions, and normal usage
4. Use descriptive test names
5. Include setup and teardown where needed
6. Mock external dependencies if any
7. Follow AAA pattern (Arrange, Act, Assert)

IMPORTANT REQUIREMENTS:
- Create SELF-CONTAINED tests that define their own test data
- Do NOT reference variables from the original code (like 'a', 'b', etc.)
- Define test variables within each test case
- Test the LOGIC and BEHAVIOR, not specific variable names

JAVASCRIPT BEHAVIOR - CRITICAL:
- null * number = 0 (returns 0, not NaN)
- undefined * number = NaN (returns NaN)
- 'string' * number = NaN (returns NaN, NEVER throws error)
- NaN * number = NaN (returns NaN)
- Always use Number.isNaN() for NaN checks, never toBeNaN()
- Mathematical calculations must be VERIFIED as correct

ERROR HANDLING RULES:
- For null inputs: expect(result).toBe(0)
- For undefined/NaN/string inputs: expect(Number.isNaN(result)).toBe(true)
- For actual errors: expect(() => operation()).toThrow()
- JavaScript multiplication NEVER throws errors for type mismatches
- String multiplication always returns NaN, never throws

NEVER GENERATE THESE PATTERNS:
- expect(() => 'string' * number).toThrow()
- expect(() => null * number).toThrow()
- expect(() => undefined * number).toThrow()
- Use Number.isNaN() instead of toBeNaN()

FORMATTING REQUIREMENTS:
- Use single quotes for strings
- Use 2-space indentation
- Include trailing commas where appropriate
- Use CommonJS require syntax: const { describe, test, expect } = require('@jest/globals');
- Follow standard prettier formatting rules

Return ONLY the test code in the following format:

\`\`\`javascript
// Test file for: ${filePath}
// Generated by AI Test Generator

const { describe, test, expect } = require('@jest/globals');

describe('${path.basename(filePath, '.js')}', () => {
  // Test cases that define their own variables and test the core logic
  describe('core functionality', () => {
    test('should perform basic multiplication', () => {
      // Arrange
      const x = 5;
      const y = 10;

      // Act
      const result = x * y;

      // Assert
      expect(result).toBe(50);
    });

    test('should handle edge case with zero', () => {
      // Arrange
      const x = 0;
      const y = 10;

      // Act
      const result = x * y;

      // Assert
      expect(result).toBe(0);
    });
  });

  describe('error handling', () => {
    test('should return 0 for null inputs', () => {
      // Arrange
      const x = null;
      const y = 10;

      // Act
      const result = x * y;

      // Assert
      expect(result).toBe(0);
    });

    test('should return NaN for undefined inputs', () => {
      // Arrange
      const x = undefined;
      const y = 10;

      // Act
      const result = x * y;

      // Assert
      expect(Number.isNaN(result)).toBe(true);
    });
  });
});
\`\`\`

Code to test:
\`\`\`
${code}
\`\`\``;

      const completion = await this.groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content:
              'You are an expert JavaScript developer specializing in writing comprehensive, mathematically accurate unit tests. Generate complete Jest tests with perfect formatting, correct expected values, and proper error handling. CRITICAL: Understand JavaScript behavior precisely - null * number = 0, undefined * number = NaN, string * number = NaN. Always use Number.isNaN() for NaN checks. Ensure all mathematical calculations are verified as correct. Generate tests that pass without any manual corrections needed.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        model: this.config.get('groq.model') || 'llama-3.1-8b-instant',
        temperature: 0.1, // Even lower temperature for more consistent results
        max_tokens: 2000,
      });

      const response = completion.choices[0]?.message?.content || '';

      // Extract test code from response
      const testCode = this.extractCodeBlocks(response)[0] || '';

      if (!testCode) {
        return {
          success: false,
          error: 'No test code generated',
          file: filePath,
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
