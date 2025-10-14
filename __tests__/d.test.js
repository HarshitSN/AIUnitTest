const moduleUnderTest = require('../d');

describe('Calculator', () => {
  let calculator;

  beforeEach(() => {
    calculator = new moduleUnderTest();
  });

  describe('divide', () => {
    it('returns the result of a division operation', () => {
      expect(calculator.divide(10, 2)).toBe(5);
    });

    it('throws an error when dividing by zero', () => {
      expect(() => calculator.divide(10, 0)).toThrow('Division by zero');
    });

    it('returns the result of a division operation with negative numbers', () => {
      expect(calculator.divide(-10, 2)).toBe(-5);
    });

    it('returns the result of a division operation with decimal numbers', () => {
      expect(calculator.divide(10.5, 2)).toBe(5.25);
    });
  });
});
