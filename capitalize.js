// Simple function to capitalize the first letter of each word
function capitalizeWords(sentence) {
    if (typeof sentence !== 'string') {
      throw new Error('Input is not a string');
    }
  
    const words = sentence.split(' ');
    const capitalized = words.map(word => {
      if (word.length === 0) return word;
      return word[0].toUpperCase() + word.slice(1).toLowerCase();
    });
  
    return capitalized.join(' ');
  }
  
  // Example usage
  let sentence = "hello world from javascript";
  console.log(capitalizeWords(sentence));
  
  // Export the function for testingg
  module.exports = capitalizeWords;
  