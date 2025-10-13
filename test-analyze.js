// A function with potential improvements
function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i];
  }
  return total;
}

// Test the function
const numbers = [1, 2, 3, 4, 5];
console.log(calculateTotal(numbers)); // Should output: 15
