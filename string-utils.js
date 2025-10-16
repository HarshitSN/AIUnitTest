// String utility functions
function capitalize(str) {
  if (typeof str !== 'string') return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function reverseString(str) {
  if (typeof str !== 'string') return '';
  return str.split('').reverse().join('');
}

function isPalindrome(str) {
  if (typeof str !== 'string') return false;
  const cleaned = str.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  return cleaned === reverseString(cleaned);
}

// Export all functions
module.exports = {
  capitalize,
  reverseString,
  isPalindrome
};
