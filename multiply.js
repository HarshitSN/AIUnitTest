// Simple multiplication function
function multiply(a, b) {
  const product = a * b;
  return product === 0 ? 0 : product;
}

// Example usage
let a = 5;
let b = 1;
console.log(multiply(a, b));

// Export the function for testing
module.exports = multiply;
