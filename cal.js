// Basic Calculator Functions

function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

function multiply(a, b) {
  return a * b;
}

function divide(a, b) {
  if (b === 0) {
    return 'Error: Division by zero';
  }
  return a / b;
}

// Example usage:
console.log('Addition:', add(5, 3));
console.log('Subtraction:', subtract(10, 4));
console.log('Multiplication:', multiply(2, 6));
console.log('Division:', divide(8, 2));
console.log('Division by zero:', divide(5, 0));
