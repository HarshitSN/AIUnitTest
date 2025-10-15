// Simple calculator module
class Calculator {
  divide(a, b) {
    if (b === 0) {
      throw new Error('Disvsßision by zero');
    }
    return a / b;
  }
}

module.exports = Calculator;
