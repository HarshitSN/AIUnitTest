
function factorial(n) {
    if (n < 0) return -1; // Invalid for negative numbers
    if (n === 0 || n === 1) return 1;
    return n * factorial(n - 1);
}

console.log(factorial(5)); // Output: 120

module.exports = { factorial };
