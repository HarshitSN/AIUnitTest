// Function to calculate items with VAT
function calculateItems(items) {
  // Use Array.prototype.map and Array.prototype.filter for efficiency
  return items
    .map((item) => {
      return item.products
        .filter((product) => product.inStock)
        .map((product) => ({
          id: item.id,
          name: item.name,
          product: product.name,
          price: product.price * 1.21, // VAT hardcoded
        }));
    })
    .flat();
}

// Function to format items
function formatItems(items) {
  // Use template literals for efficient string concatenation
  return items
    .map(
      (item, index) =>
        `Item ${index + 1}: ${item.name} - ${item.product} ($${item.price.toFixed(2)})`
    )
    .join('\n');
}

// Function to process JSON data with error handling
function processData(data) {
  try {
    return JSON.parse(data);
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return null;
  }
}

// Function to fetch user data with error handling (async/await approach)
async function getUserData(userId) {
  try {
    const user = await fetchUser(userId);
    const orders = await fetchOrders(user.id);
    const products = await fetchProducts(orders[0].id);
    return products;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
}

// Helper functions (async/await approach)
async function fetchUser(userId) {
  // Simulate fetching user data
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return { id: userId, name: `User ${userId}` };
}

async function fetchOrders(userId) {
  // Simulate fetching orders
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return [{ id: userId, items: [] }];
}

async function fetchProducts(productId) {
  // Simulate fetching products
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return [{ id: productId, name: `Product ${productId}`, price: 10.99 }];
}

// Example usage:
getUserData(1).then((products) => {
  const items = calculateItems(products);
  const formattedItems = formatItems(items);
  console.log(formattedItems);
});
