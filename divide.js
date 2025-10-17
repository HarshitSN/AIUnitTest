// Simple division function
function divide(a, b) {
    if (typeof a !== 'number') {
      throw new Error('a is not a number');
    }
    if (typeof b !== 'number') {
      throw new Error('b is not a number');
    }
    if (b === 0) {
      throw new Error('Division by zero is not allowed');
    }
    const result = a / b;
    return result;
  }
  
  // Example usage
  let a = 10;
  let b = 2;
  console.log(divide(a, b));
  
  // Export the function for testing
  module.exports = divide;
  