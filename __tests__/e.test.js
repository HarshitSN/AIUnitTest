const moduleUnderTest = require('../e');

describe('Calculator', () => {
  let calculator;

  beforeEach(() => {
    calculator = new moduleUnderTest();
  });

  describe('divide function', () => {
    it('should divide two numbers', () => {
      expect(calculator.divide(10, 2)).toBe(5);
    });

    it('should throw an error when dividing by zero', () => {
      expect(() => calculator.divide(10, 0)).toThrowError('Division by zero');
    });

    it('should return a number when dividing two integers', () => {
      expect(calculator.divide(10, 2)).toBe(5);
    });

    it('should return a number when dividing two floats', () => {
      expect(calculator.divide(10.5, 2.5)).toBe(4.2);
    });
  });
});
