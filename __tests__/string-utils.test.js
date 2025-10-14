const StringUtils = require('../string-utils');

describe('StringUtils', () => {
  let stringUtils;

  beforeEach(() => {
    stringUtils = new StringUtils();
  });

  describe('capitalize', () => {
    it('capitalizes the first letter of a string', () => {
      const result = stringUtils.capitalize('hello');
      expect(result).toBe('Hello');
    });

    it('throws an error if the input is not a string', () => {
      expect(() => stringUtils.capitalize(123)).toThrow('Input must be a string');
    });

    it('leaves the string unchanged if it is already capitalized', () => {
      const result = stringUtils.capitalize('HELLO');
      expect(result).toBe('HELLO');
    });
  });

  describe('reverse', () => {
    it('reverses the order of characters in a string', () => {
      const result = stringUtils.reverse('hello');
      expect(result).toBe('olleh');
    });

    it('throws an error if the input is not a string', () => {
      expect(() => stringUtils.reverse(123)).toThrow('Input must be a string');
    });

    it('reverses a string with multiple words', () => {
      const result = stringUtils.reverse('hello world');
      expect(result).toBe('dlrow olleh');
    });
  });

  describe('countWords', () => {
    it('counts the number of words in a string', () => {
      const result = stringUtils.countWords('hello world');
      expect(result).toBe(2);
    });

    it('ignores empty strings', () => {
      const result = stringUtils.countWords('   ');
      expect(result).toBe(0);
    });

    it('counts words with multiple spaces between them', () => {
      const result = stringUtils.countWords('hello   world');
      expect(result).toBe(2);
    });

    it('throws an error if the input is not a string', () => {
      expect(() => stringUtils.countWords(123)).toThrow('Input must be a string');
    });
  });

  describe('isPalindrome', () => {
    it('returns true if the string is a palindrome', () => {
      const result = stringUtils.isPalindrome('madam');
      expect(result).toBe(true);
    });

    it('returns false if the string is not a palindrome', () => {
      const result = stringUtils.isPalindrome('hello');
      expect(result).toBe(false);
    });

    it('ignores non-alphanumeric characters', () => {
      const result = stringUtils.isPalindrome('A man, a plan, a canal: Panama');
      expect(result).toBe(true);
    });

    it('throws an error if the input is not a string', () => {
      expect(() => stringUtils.isPalindrome(123)).toThrow('Input must be a string');
    });
  });
});
