const moduleUnderTest = require('../yb');

describe('Calculator', () => {
  let calculator;

  beforeEach(() => {
    calculator = new moduleUnderTest();
  });

  describe('add', () => {
    it('adds two numbers', () => {
      expect(calculator.add(2, 3)).toBe(5);
    });

    it('adds two negative numbers', () => {
      expect(calculator.add(-2, -3)).toBe(-5);
    });

    it('adds a positive and a negative number', () => {
      expect(calculator.add(2, -3)).toBe(-1);
    });
  });

  describe('subtract', () => {
    it('subtracts two numbers', () => {
      expect(calculator.subtract(5, 3)).toBe(2);
    });

    it('subtracts two negative numbers', () => {
      expect(calculator.subtract(-5, -3)).toBe(-2);
    });

    it('subtracts a positive from a negative number', () => {
      expect(calculator.subtract(-5, 3)).toBe(-8);
    });
  });

  describe('multiply', () => {
    it('multiplies two numbers', () => {
      expect(calculator.multiply(2, 3)).toBe(6);
    });

    it('multiplies two negative numbers', () => {
      expect(calculator.multiply(-2, -3)).toBe(6);
    });

    it('multiplies a positive and a negative number', () => {
      expect(calculator.multiply(2, -3)).toBe(-6);
    });
  });

  describe('divide', () => {
    it('divides two numbers', () => {
      expect(calculator.divide(6, 3)).toBe(2);
    });

    it('divides two negative numbers', () => {
      expect(calculator.divide(-6, -3)).toBe(2);
    });

    it('divides a positive by a negative number', () => {
      expect(calculator.divide(6, -3)).toBe(-2);
    });

    it('throws an error when dividing by zero', () => {
      expect(() => calculator.divide(6, 0)).toThrow();
    });
  });
});

// Add a newline at the end of the file);
