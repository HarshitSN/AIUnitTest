// Simple function to remove duplicate elements from an array
function removeDuplicates(arr) {
    if (!Array.isArray(arr)) {
      throw new Error('Input is not an array');
    }
  
    const uniqueArray = [...new Set(arr)];
    return uniqueArray;
  }
  
  // Example usage
  let numbers = [1, 2, 2, 3, 4, 4, 5];
  console.log(removeDuplicates(numbers)); // Output: [1, 2, 3, 4, 5]
  
  // Export the function for testing
  module.exports = removeDuplicates;
  