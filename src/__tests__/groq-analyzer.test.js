const moduleUnderTest = require('../groq-analyzer');
const { GroqAIAnalyzer } = moduleUnderTest;

describe('GroqAIAnalyzer', () => {
  it('should be instantiated correctly', () => {
    const analyzer = new GroqAIAnalyzer({ apiKey: 'test-api-key' });
    expect(analyzer).toBeInstanceOf(GroqAIAnalyzer);
  });

  describe('detectExportStyle', () => {
    it('should return "default" for default exports', () => {
      const code = 'module.exports = function() {}';
      const analyzer = new GroqAIAnalyzer({ apiKey: 'test-api-key' });
      expect(analyzer.detectExportStyle(code)).toBe('default');
    });

    it('should return "named" for named exports', () => {
      const code = 'module.exports = { function() {} };';
      const analyzer = new GroqAIAnalyzer({ apiKey: 'test-api-key' });
      expect(analyzer.detectExportStyle(code)).toBe('named');
    });

    it('should return "both" for both default and named exports', () => {
      const code = 'module.exports = function() {};\nmodule.exports = { function() {} };';
      const analyzer = new GroqAIAnalyzer({ apiKey: 'test-api-key' });
      expect(analyzer.detectExportStyle(code)).toBe('both');
    });

    it('should return "none" for no exports', () => {
      const code = 'function() {}';
      const analyzer = new GroqAIAnalyzer({ apiKey: 'test-api-key' });
      expect(analyzer.detectExportStyle(code)).toBe('none');
    });
  });

  describe('generateImportStatement', () => {
    it('should generate correct import statement for default exports', () => {
      const filePath = 'path/to/file.js';
      const exportStyle = 'default';
      const analyzer = new GroqAIAnalyzer({ apiKey: 'test-api-key' });
      expect(analyzer.generateImportStatement(filePath, exportStyle)).toBe(
        `const moduleUnderTest = require('${filePath}');`
      );
    });

    it('should generate correct import statement for named exports', () => {
      const filePath = 'path/to/file.js';
      const exportStyle = 'named';
      const analyzer = new GroqAIAnalyzer({ apiKey: 'test-api-key' });
      expect(analyzer.generateImportStatement(filePath, exportStyle)).toBe(
        `const { functionName } = require('${filePath}');`
      );
    });

    it('should generate correct import statement for both default and named exports', () => {
      const filePath = 'path/to/file.js';
      const exportStyle = 'both';
      const analyzer = new GroqAIAnalyzer({ apiKey: 'test-api-key' });
      expect(analyzer.generateImportStatement(filePath, exportStyle)).toBe(
        `const moduleUnderTest = require('${filePath}');\nconst { functionName } = moduleUnderTest;`
      );
    });
  });

  describe('analyzeCode', () => {
    it('should return success and test code for valid code', async () => {
      const code = 'function functionName() {}';
      const filePath = 'path/to/file.js';
      const analyzer = new GroqAIAnalyzer({ apiKey: 'test-api-key' });
      const result = await analyzer.analyzeCode(code, filePath);
      expect(result.success).toBe(true);
      expect(result.testCode).not.toBeUndefined();
    });

    it('should return error for invalid code', async () => {
      const code = 'invalid code';
      const filePath = 'path/to/file.js';
      const analyzer = new GroqAIAnalyzer({ apiKey: 'test-api-key' });
      const result = await analyzer.analyzeCode(code, filePath);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid code provided');
    });

    it('should return success and skipped message for test files', async () => {
      const code = 'function functionName() {}';
      const filePath = 'path/to/file.test.js';
      const analyzer = new GroqAIAnalyzer({ apiKey: 'test-api-key' });
      const result = await analyzer.analyzeCode(code, filePath);
      expect(result.success).toBe(true);
      expect(result.summary).toBe('Skipping test file');
    });
  });
});
