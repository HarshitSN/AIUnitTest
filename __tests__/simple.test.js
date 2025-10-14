const moduleUnderTest = require('../simple');
const { add, multiply, divide } = moduleUnderTest;

describe('Simple Calculator Functions', () => {
  describe('add function', () => {
    it('adds two numbers correctly', () => {
      expect(add(2, 3)).toBe(5);
    });

    it('adds two negative numbers correctly', () => {
      expect(add(-2, -3)).toBe(-5);
    });

    it('adds a positive and a negative number correctly', () => {
      expect(add(2, -3)).toBe(-1);
    });
  });

  describe('multiply function', () => {
    it('multiplies two numbers correctly', () => {
      expect(multiply(2, 3)).toBe(6);
    });

    it('multiplies two negative numbers correctly', () => {
      expect(multiply(-2, -3)).toBe(6);
    });

    it('multiplies a positive and a negative number correctly', () => {
      expect(multiply(2, -3)).toBe(-6);
    });
  });

  describe('divide function', () => {
    it('divides two numbers correctly', () => {
      expect(divide(6, 3)).toBe(2);
    });

    it('throws an error when dividing by zero', () => {
      expect(() => divide(6, 0)).toThrow('Division by zero');
    });

    it('divides two negative numbers correctly', () => {
      expect(divide(-6, -3)).toBe(2);
    });

    it('divides a positive and a negative number correctly', () => {
      expect(divide(-6, 3)).toBe(-2);
    });
  });
});
