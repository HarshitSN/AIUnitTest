// palindrome.test.js
const { describe, test, expect } = require('@jest/globals');
const { isPalindrome } = require('../palindrome.js');

describe('isPalindrome function', () => {
  describe('valid inputs', () => {
    test('should return true for a palindrome string', () => {
      expect(isPalindrome('radar')).toBe(true);
    });

    test('should return true for a palindrome string with numbers', () => {
      expect(isPalindrome('12321')).toBe(true);
    });

    test('should return true for a palindrome string with mixed case', () => {
      expect(isPalindrome('Aba')).toBe(true);
    });

    test('should return true for a palindrome string with non-alphanumeric characters', () => {
      expect(isPalindrome('A man, a plan, a canal: Panama')).toBe(true);
    });
  });

  describe('invalid inputs', () => {
    test('should return false for a non-palindrome string', () => {
      expect(isPalindrome('hello')).toBe(false);
    });

    test('should return false for a string with non-alphanumeric characters', () => {
      expect(isPalindrome('Hello, World!')).toBe(false);
    });

    test('should return false for an empty string', () => {
      expect(isPalindrome('')).toBe(false);
    });

    test('should return false for a string with a single character', () => {
      expect(isPalindrome('a')).toBe(false);
    });
  });

  describe('edge cases', () => {
    test('should return false for null input', () => {
      expect(isPalindrome(null)).toBe(false);
    });

    test('should return false for undefined input', () => {
      expect(isPalindrome(undefined)).toBe(false);
    });

    test('should return false for non-string input', () => {
      expect(isPalindrome(123)).toBe(false);
    });
  });

  describe('boundary value analysis', () => {
    test('should return false for a string with a single character', () => {
      expect(isPalindrome('a')).toBe(false);
    });

    test('should return true for a palindrome string with a length of 1', () => {
      expect(isPalindrome('a')).toBe(true);
    });

    test('should return true for a palindrome string with a length of 2', () => {
      expect(isPalindrome('ab')).toBe(false);
    });

    test('should return true for a palindrome string with a length of 3', () => {
      expect(isPalindrome('aba')).toBe(true);
    });

    test('should return true for a palindrome string with a length of 4', () => {
      expect(isPalindrome('abba')).toBe(true);
    });

    test('should return true for a palindrome string with a length of 5', () => {
      expect(isPalindrome('ababa')).toBe(true);
    });

    test('should return true for a palindrome string with a length of 6', () => {
      expect(isPalindrome('ababab')).toBe(false);
    });
  });
});
