/**
 * Adds two numbers together.
 *
 * @param {number} a The first number.
 * @param {number} b The second number.
 * @returns {number} The sum of a and b.
 */
function add(a, b) {
  // Check if both inputs are numbers
  if (typeof a !== 'number' || typeof b !== 'number') {
    throw new Error('Both inputs must be numbers');
  }
  return a + b;
}

// Test the function
console.log(add(2, 3)); // Should output: 5
console.log(add(5, 0)); // Should output: 5
console.log(add(-1, 1)); // Should output: 0

// Test error handling
try {
  console.log(add('a', 3));
} catch (error) {
  console.error(error.message); // Should output: Both inputs must be numbers
}