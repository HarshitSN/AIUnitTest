/**
 * Calculates the total cost of a list of items.
 * @param {Array<Object>} items - An array of objects with price and quantity properties.
 * @returns {number} The total cost.
 * @throws {Error} If the input is not an array or if an item is missing price or quantity.
 */
function calculateTotal(items) {
  if (!Array.isArray(items)) {
    throw new Error('Input must be an array');
  }
  
  if (items.length === 0) {
    return 0; // or throw an error, depending on the desired behavior
  }
  
  let total = 0;
  
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (typeof item !== 'object' || !item.price || !item.quantity) {
      throw new Error(`Invalid item at index ${i}: ${JSON.stringify(item)}`);
    }
    total += item.price * item.quantity;
  }
  
  return total;
}

a=2
print(a)
meow
hi