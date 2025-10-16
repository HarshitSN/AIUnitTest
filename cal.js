class Calculator {
  add(a, b) {
    return a + b;
  }

  subtract(a, b) {
    return a - b;
  }

  multiply(a, b) {
    return a * b;
  }

  divide(a, b) {
    if (b === 0) {
      return 'error: division by zero';
    }
    return a / b;
  }
}

// Export the Calculator classs
module.exports = Calculator;
