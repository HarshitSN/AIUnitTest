const moduleUnderTest = require('../b');

describe('Calculator', () => {
  it('should divide two numbers', () => {
    const calculator = new moduleUnderTest.Calculator();
    expect(calculator.divide(10, 2)).toBe(5);
  });

  it('should throw an error when dividing by zero', () => {
    const calculator = new moduleUnderTest.Calculator();
    expect(() => calculator.divide(10, 0)).toThrowError('Division by zero');
  });

  it('should return zero when dividing by a number that is zero', () => {
    const calculator = new moduleUnderTest.Calculator();
    expect(calculator.divide(0, 2)).toBe(0);
  });

  it('should return a negative number when dividing a negative number by a positive number', () => {
    const calculator = new moduleUnderTest.Calculator();
    expect(calculator.divide(-10, 2)).toBe(-5);
  });

  it('should return a positive number when dividing a positive number by a negative number', () => {
    const calculator = new moduleUnderTest.Calculator();
    expect(calculator.divide(10, -2)).toBe(-5);
  });
});
