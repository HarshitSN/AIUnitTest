// Simple Calculator Class Implementation
class Calculator {
  constructor() {
    this.clear();
  }

  // Reset the calculator
  clear() {
    this.currentValue = '';
    this.previousValue = '';
    this.operation = null;
  }

  // Append a number or decimal
  appendNumber(number) {
    if (number === '.' && this.currentValue.includes('.')) return;
    this.currentValue = this.currentValue.toString() + number.toString();
  }

  // Choose the operation (+, -, *, /)
  chooseOperation(operation) {
    if (this.currentValue === '') return;
    if (this.previousValue !== '') {
      this.compute();
    }
    this.operation = operation;
    this.previousValue = this.currentValue;
    this.currentValue = '';
  }

  // Perform the calculation
  compute() {
    const prev = parseFloat(this.previousValue);
    const curr = parseFloat(this.currentValue);
    if (isNaN(prev) || isNaN(curr)) {
      this.clear(); // Clear state when NaN is encountered
      return;
    }

    let computation;
    switch (this.operation) {
      case '+':
        computation = prev + curr;
        break;
      case '-':
        computation = prev - curr;
        break;
      case '*':
        computation = prev * curr;
        break;
      case '/':
        computation = curr !== 0 ? prev / curr : 'Error'; // prevent division by zero
        break;
      default:
        return;
    }

    this.currentValue = computation.toString();
    this.operation = null;
    this.previousValue = '';
  }

  // Return the current value (for display)
  getDisplayValue() {
    return this.currentValue;
  }
}

// Example usage
const calc = new Calculator();
calc.appendNumber(10);
calc.chooseOperation('+');
calc.appendNumber(4);
calc.compute();

console.log('Result:', calc.getDisplayValue()); // Output: Result: 8

module.exports = Calculator;
