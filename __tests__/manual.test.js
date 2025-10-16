const { describe, test, expect } = require('@jest/globals');
const Calculator = require('../cal');
const multiply = require('../multiply');

describe('Calculator', () => {
  describe('core functionality', () => {
    test('should append a number', () => {
      const calc = new Calculator();
      calc.appendNumber(5);
      expect(calc.getDisplayValue()).toBe('5');
    });

    test('should perform basic calculation', () => {
      const calc = new Calculator();
      calc.appendNumber(5);
      calc.chooseOperation('+');
      calc.appendNumber(3);
      calc.compute();
      expect(calc.getDisplayValue()).toBe('8');
    });

    test('should handle edge cases', () => {
      const calc = new Calculator();
      calc.appendNumber(null);
      expect(calc.getDisplayValue()).toBe('');
    });
  });
});

describe('multiply function', () => {
  describe('core functionality', () => {
    test('should multiply two numbers', () => {
      const result = multiply(5, 3);
      expect(result).toBe(15);
    });

    test('should handle zero', () => {
      const result = multiply(0, 5);
      expect(result).toBe(0);
    });

    test('should handle negative numbers', () => {
      const result = multiply(-2, 3);
      expect(result).toBe(-6);
    });
  });
});
