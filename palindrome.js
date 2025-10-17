function isPalindrome(str) {
  // Remove non-alphanumeric characters and convert to lowercase
  const cleaned = str.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  // Check if the string is equal to its reverse
  return cleaned === cleaned.split('').reverse().join('');
}

module.exports = { isPalindrome };
