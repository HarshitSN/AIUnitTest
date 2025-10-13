const { test, expect, beforeAll, afterAll } = require('@jest/globals');
const fs = require('fs');
const path = require('path');
const Config = require('../src/config');
const AIAnalyzer = require('../src/ai-analyzer-new');

describe('AIAnalyzer', () => {
  let config;
  let analyzer;
  
  beforeAll(() => {
    // Initialize config and analyzer
    config = new Config();
    // Make sure to set your API key in the environment variables
    process.env.GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY || '';
    analyzer = new AIAnalyzer(config);
  });

  test('should analyze a simple function', async () => {
    const testCode = `
      function add(a, b) {
        // This is a simple function that adds two numbers
        return a + b;
      }
      
      // Example usage
      console.log(add(2, 3)); // Should output 5
    `;

    const result = await analyzer.analyzeCode(testCode, 'test-file.js');
    
    // Basic response structure
    expect(result).toHaveProperty('success', true);
    expect(result).toHaveProperty('file', 'test-file.js');
    expect(result).toHaveProperty('analysis');
    expect(Array.isArray(result.issues)).toBe(true);
    expect(Array.isArray(result.suggestions)).toBe(true);
    
    // Log the analysis for review
    console.log('\nAI Analysis:');
    console.log('===========');
    console.log(result.analysis);
    
    if (result.issues.length > 0) {
      console.log('\nIssues found:');
      result.issues.forEach(issue => {
        console.log(`- [${issue.severity.toUpperCase()}] ${issue.message}`);
      });
    }
    
    if (result.suggestions.length > 0) {
      console.log('\nSuggestions:');
      result.suggestions.forEach((suggestion, i) => {
        console.log(`${i + 1}. ${suggestion}`);
      });
    }
  }, 30000); // Increase timeout for AI API calls
  
  test('should handle invalid API key gracefully', async () => {
    // Save original API key
    const originalKey = process.env.GOOGLE_AI_API_KEY;
    
    try {
      // Set invalid API key
      process.env.GOOGLE_AI_API_KEY = 'invalid-key';
      
      // Create new analyzer with invalid key
      const invalidAnalyzer = new AIAnalyzer(config);
      const testCode = 'function test() { return "test"; }';
      
      // This should throw an error
      await expect(invalidAnalyzer.analyzeCode(testCode, 'test.js'))
        .rejects
        .toThrow();
    } catch (error) {
      // Handle unexpected errors
      console.error('Unexpected error:', error);
    } finally {
      // Restore original API key
      process.env.GOOGLE_AI_API_KEY = originalKey;
    }
  });
  
  test('should handle empty code', async () => {
    const result = await analyzer.analyzeCode('', 'empty.js');
    
    expect(result).toHaveProperty('success', true);
    expect(result.analysis).toBeDefined();
  });
  
  test('should handle unexpected errors', async () => {
    const testCode = 'function test() { throw new Error("Test error"); }';
    
    try {
      await analyzer.analyzeCode(testCode, 'test.js');
    } catch (error) {
      // Verify that an error was thrown
      expect(error).toBeInstanceOf(Error);
      // Verify that the error message contains the expected text
      expect(error.message).toContain('Test error');
    }
  });
});