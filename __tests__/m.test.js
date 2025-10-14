const moduleUnderTest = require('../m');

describe('Calculator', () => {
  let calculator;

  beforeEach(() => {
    calculator = new moduleUnderTest();
  });

  describe('divide method', () => {
    it('should return the result of division', () => {
      expect(calculator.divide(10, 2)).toBe(5);
    });

    it('should return the result of division with decimal numbers', () => {
      expect(calculator.divide(10.5, 2)).toBe(5.25);
    });

    it('should throw an error when dividing by zero', () => {
      expect(() => calculator.divide(10, 0)).toThrow('Disvision by zero');
    });
  });
});
