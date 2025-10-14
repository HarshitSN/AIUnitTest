const moduleUnderTest = require('../try');

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

    it('returns the product of two decimal numbers', () => {
      expect(calculator.multiply(2.5, 3.7)).toBeCloseTo(9.25);
    });
  });
});
