/**
 * Calculates the total cost of a list of items.
 * @param {Array<Object>} items - An array of objects with price and quantity properties.
 * @returns {number} The total cost.
 * @throws {Error} If the input is not an array, if an item is missing price or quantity,
 * or if price or quantity is not a number.
 */
function calculateTotal(items) {
  if (!Array.isArray(items)) {
    throw new Error('Input must be an array');
  }

  if (items.length === 0) {
    return 0;
  }

  let total = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    // Input validation
    if (typeof item !== 'object' || !item.price || !item.quantity) {
      throw new Error(`Invalid item at index ${i}: ${JSON.stringify(item)}`);
    }

    // Check if price and quantity are numbers
    if (typeof item.price !== 'number' || typeof item.quantity !== 'number') {
      throw new Error(`Price or quantity is not a number at index ${i}: ${JSON.stringify(item)}`);
    }

    // Check if price and quantity are non-negative
    if (item.price < 0 || item.quantity < 0) {
      throw new Error(`Price or quantity is negative at index ${i}: ${JSON.stringify(item)}`);
    }

    total += item.price * item.quantity;
  }

  return total;
}

// Test cases
const testItems = [
  { price: 10, quantity: 2 },
  { price: 15, quantity: 1 },
  { price: 5, quantity: 3 },
];

console.log('Test 1 - Valid items:', calculateTotal(testItems) === 50 ? 'Passed' : 'Failed');

// Test with empty array
console.log('Test 2 - Empty array:', calculateTotal([]) === 0 ? 'Passed' : 'Failed');

// Test with invalid input
try {
  calculateTotal('not an array');
  console.log('Test 3 - Invalid input (not an array): Failed - No error thrown');
} catch (e) {
  console.log(
    'Test 3 - Invalid input (not an array):',
    e.message.includes('must be an array') ? 'Passed' : 'Failed'
  );
}

// Test with missing price
try {
  calculateTotal([{ quantity: 1 }]);
  console.log('Test 4 - Missing price: Failed - No error thrown');
} catch (e) {
  console.log('Test 4 - Missing price:', e.message.includes('Invalid item') ? 'Passed' : 'Failed');
}

// Test with negative price
try {
  calculateTotal([{ price: -10, quantity: 1 }]);
  console.log('Test 5 - Negative price: Failed - No error thrown');
} catch (e) {
  console.log('Test 5 - Negative price:', e.message.includes('negative') ? 'Passed' : 'Failed');
}
