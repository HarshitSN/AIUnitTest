const moduleUnderTest = require('../utils');
const { isEven, factorial, greet } = moduleUnderTest;

describe('isEven function', () => {
  test('returns true for even numbers', () => {
    expect(isEven(4)).toBe(true);
  });

  test('returns false for odd numbers', () => {
    expect(isEven(3)).toBe(false);
  });

  test('returns false for non-integer numbers', () => {
    expect(isEven(3.5)).toBe(false);
  });
});

describe('factorial function', () => {
  test('returns 1 for 0 and 1', () => {
    expect(factorial(0)).toBe(1);
    expect(factorial(1)).toBe(1);
  });

  test('returns the correct factorial for positive numbers', () => {
    expect(factorial(2)).toBe(2);
    expect(factorial(3)).toBe(6);
    expect(factorial(4)).toBe(24);
  });

  test('throws an error for negative numbers', () => {
    expect(() => factorial(-1)).toThrow();
  });
});

describe('greet function', () => {
  test('returns a greeting with the provided name', () => {
    expect(greet('John')).toBe('Hello, John!');
  });

  test('returns a greeting with an empty string when no name is provided', () => {
    expect(greet('')).toBe('Hello, !');
  });

  test('returns a greeting with a null name', () => {
    expect(greet(null)).toBe('Hello, !');
  });

  test('returns a greeting with an undefined name', () => {
    expect(greet(undefined)).toBe('Hello, !');
  });
});
