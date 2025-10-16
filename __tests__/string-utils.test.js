const { describe, test, expect } = require('@jest/globals');
const { capitalize, reverseString, isPalindrome } = require('../string-utils');

describe('String Utils', () => {
  describe('capitalize function', () => {
    test('should capitalize first letter of string', () => {
      const result = capitalize('hello');
      expect(result).toBe('Hello');
    });

    test('should handle empty string', () => {
      const result = capitalize('');
      expect(result).toBe('');
    });

    test('should handle non-string input', () => {
      const result = capitalize(123);
      expect(result).toBe('');
    });

    test('should handle single character', () => {
      const result = capitalize('a');
      expect(result).toBe('A');
    });
  });

  describe('reverseString function', () => {
    test('should reverse a string', () => {
      const result = reverseString('hello');
      expect(result).toBe('olleh');
    });

    test('should handle empty string', () => {
      const result = reverseString('');
      expect(result).toBe('');
    });

    test('should handle non-string input', () => {
      const result = reverseString(123);
      expect(result).toBe('');
    });

    test('should handle palindrome strings', () => {
      const result = reverseString('radar');
      expect(result).toBe('radar');
    });
  });

  describe('isPalindrome function', () => {
    test('should return true for palindromes', () => {
      const result = isPalindrome('radar');
      expect(result).toBe(true);
    });

    test('should return false for non-palindromes', () => {
      const result = isPalindrome('hello');
      expect(result).toBe(false);
    });

    test('should handle empty string as palindrome', () => {
      const result = isPalindrome('');
      expect(result).toBe(true);
    });

    test('should ignore case and non-alphanumeric characters', () => {
      const result = isPalindrome('A man, a plan, a canal: Panama');
      expect(result).toBe(true);
    });

    test('should handle non-string input', () => {
      const result = isPalindrome(123);
      expect(result).toBe(false);
    });
  });
});
