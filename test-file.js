// Test file for pre-commit hook
function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item || typeof item.price !== 'number' || typeof item.quantity !== 'number') {
      console.log('Invalid item at index', i);
      continue;
    }
    total += item.price * item.quantity;
  }
  return total;
}

// Test the function
const items = [
  { price: 10, quantity: 2 },
  { price: 15, quantity: 1 },
  { price: 5, quantity: 3 },
];

console.log('Total:', calculateTotal(items));
