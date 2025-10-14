const moduleUnderTest = require('../a');

describe('Calculator', () => {
  describe('add', () => {
    it('adds two numbers', () => {
      const calculator = new moduleUnderTest.Calculator();
      expect(calculator.add(2, 3)).toBe(5);
    });

    it('adds a negative number', () => {
      const calculator = new moduleUnderTest.Calculator();
      expect(calculator.add(-2, 3)).toBe(1);
    });

    it('adds zero', () => {
      const calculator = new moduleUnderTest.Calculator();
      expect(calculator.add(0, 0)).toBe(0);
    });
  });

  describe('subtract', () => {
    it('subtracts two numbers', () => {
      const calculator = new moduleUnderTest.Calculator();
      expect(calculator.subtract(5, 3)).toBe(2);
    });

    it('subtracts a negative number', () => {
      const calculator = new moduleUnderTest.Calculator();
      expect(calculator.subtract(5, -3)).toBe(8);
    });

    it('subtracts zero', () => {
      const calculator = new moduleUnderTest.Calculator();
      expect(calculator.subtract(5, 0)).toBe(5);
    });
  });

  describe('multiply', () => {
    it('multiplies two numbers', () => {
      const calculator = new moduleUnderTest.Calculator();
      expect(calculator.multiply(4, 5)).toBe(20);
    });

    it('multiplies a negative number', () => {
      const calculator = new moduleUnderTest.Calculator();
      expect(calculator.multiply(-4, 5)).toBe(-20);
    });

    it('multiplies zero', () => {
      const calculator = new moduleUnderTest.Calculator();
      expect(calculator.multiply(4, 0)).toBe(0);
    });
  });

  describe('divide', () => {
    it('divides two numbers', () => {
      const calculator = new moduleUnderTest.Calculator();
      expect(calculator.divide(10, 2)).toBe(5);
    });

    it('divides by a negative number', () => {
      const calculator = new moduleUnderTest.Calculator();
      expect(calculator.divide(10, -2)).toBe(-5);
    });

    it('divides by zero', () => {
      const calculator = new moduleUnderTest.Calculator();
      expect(() => calculator.divide(10, 0)).toThrowError('Division by zero');
    });
  });
});
