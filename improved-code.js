/**
 * Calculates the total price of items including tax
 * @param {Array} items - Array of items with price and quantity
 * @param {number} taxRate - Tax rate as a decimal (e.g., 0.08 for 8%)
 * @returns {Object} Object containing subtotal, tax, and total
 */
function calculateTotal(items, taxRate) {
  // Input validation
  if (!Array.isArray(items) || typeof taxRate !== 'number' || taxRate < 0 || taxRate > 1) {
    throw new Error('Invalid input parameters');
  }
  
  // Calculate subtotal
  const subtotal = items.reduce((sum, item) => {
    if (typeof item.price !== 'number' || typeof item.quantity !== 'number' || 
        item.price < 0 || item.quantity < 0 || isNaN(item.price) || isNaN(item.quantity)) {
      throw new Error('Invalid item data');
    }
    return sum + (item.price * item.quantity);
  }, 0);
  
  // Calculate tax and total
  const tax = subtotal * taxRate;
  const total = subtotal + tax;
  
  // Handle tax rate of 1.0
  if (taxRate === 1) {
    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      tax: parseFloat(subtotal.toFixed(2)),
      total: parseFloat(subtotal.toFixed(2))
    };
  }
  
  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    tax: parseFloat(tax.toFixed(2)),
    total: parseFloat(total.toFixed(2))
  };
}