// palindrome.test.js
const { describe, test, expect } = require('@jest/globals');
const { isPalindrome } = require('../palindrome.js');

describe('isPalindrome function', () => {
  describe('valid inputs', () => {
    test('should return true for a palindrome string', () => {
      const result = isPalindrome('madam');
      expect(result).toBe(true);
    });

    test('should return true for a palindrome string with numbers', () => {
      const result = isPalindrome('12321');
      expect(result).toBe(true);
    });

    test('should return true for a palindrome string with mixed case', () => {
      const result = isPalindrome('Aibohphobia');
      expect(result).toBe(true);
    });

    test('should return true for a palindrome string with special characters', () => {
      const result = isPalindrome('A man, a plan, a canal: Panama');
      expect(result).toBe(true);
    });
  });

  describe('invalid inputs', () => {
    test('should return false for a non-palindrome string', () => {
      const result = isPalindrome('hello');
      expect(result).toBe(false);
    });

    test('should return false for a non-palindrome string with numbers', () => {
      const result = isPalindrome('123456');
      expect(result).toBe(false);
    });

    test('should return false for a non-palindrome string with mixed case', () => {
      const result = isPalindrome('HelloWorld');
      expect(result).toBe(false);
    });

    test('should return false for a non-palindrome string with special characters', () => {
      const result = isPalindrome('Hello, World!');
      expect(result).toBe(false);
    });
  });

  describe('edge cases', () => {
    test('should return false for an empty string', () => {
      const result = isPalindrome('');
      expect(result).toBe(false);
    });

    test('should return false for a single character string', () => {
      const result = isPalindrome('a');
      expect(result).toBe(true);
    });

    test('should return false for a null input', () => {
      expect(() => isPalindrome(null)).toThrowError('Input must be a string');
    });

    test('should return false for an undefined input', () => {
      expect(() => isPalindrome(undefined)).toThrowError('Input must be a string');
    });
  });

  describe('boundary value analysis', () => {
    test('should return true for a palindrome string with a single character', () => {
      const result = isPalindrome('a');
      expect(result).toBe(true);
    });

    test('should return true for a palindrome string with a very long string', () => {
      const result = isPalindrome('a'.repeat(1000));
      expect(result).toBe(true);
    });

    test('should return false for a non-palindrome string with a single character', () => {
      const result = isPalindrome('b');
      expect(result).toBe(false);
    });

    test('should return false for a non-palindrome string with a very long string', () => {
      const result = isPalindrome('b'.repeat(1000));
      expect(result).toBe(false);
    });
  });
});

describe('error handling', () => {
    test('should throw an error for a null input', () => {
      expect(() => isPalindrome(null)).toThrowError('Input must be a string');
    });

    test('should throw an error for an undefined input', () => {
      expect(() => isPalindrome(undefined)).toThrowError('Input must be a string');
    });

    test('should throw an error for a non-string input', () => {
      expect(() => isPalindrome(123)).toThrowError('Input must be a string');
    });
  }
