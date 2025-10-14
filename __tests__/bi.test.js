const moduleUnderTest = require('../bi');

describe('Calculator', () => {
  let calculator;

  beforeEach(() => {
    calculator = new moduleUnderTest();
  });

  describe('multiply', () => {
    it('returns the product of two numbers', () => {
      expect(calculator.multiply(2, 3)).toBe(6);
    });

    it('returns the product of two negative numbers', () => {
      expect(calculator.multiply(-2, -3)).toBe(6);
    });

    it('returns the product of a positive and a negative number', () => {
      expect(calculator.multiply(2, -3)).toBe(-6);
    });

    it('returns the product of two zeros', () => {
      expect(calculator.multiply(0, 0)).toBe(0);
    });

    it('returns the product of a zero and a non-zero number', () => {
      expect(calculator.multiply(0, 3)).toBe(0);
    });
  });
});
