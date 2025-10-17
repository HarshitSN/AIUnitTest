// palindrome.test.js
const { describe, test, expect } = require('@jest/globals');
const { isPalindrome } = require('./palindrome.js');

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

    test('should return false for a string with non-alphanumeric characters', () => {
      const result = isPalindrome('hello, world!');
      expect(result).toBe(false);
    });

    test('should return false for an empty string', () => {
      const result = isPalindrome('');
      expect(result).toBe(false);
    });

    test('should return false for a string with only spaces', () => {
      const result = isPalindrome('   ');
      expect(result).toBe(false);
    });
  });

  describe('edge cases', () => {
    test('should return false for null input', () => {
      expect(() => isPalindrome(null)).toThrowError('Input must be a string');
    });

    test('should return false for undefined input', () => {
      expect(() => isPalindrome(undefined)).toThrowError('Input must be a string');
    });

    test('should return false for non-string input', () => {
      expect(() => isPalindrome(123)).toThrowError('Input must be a string');
    });
  });
});
