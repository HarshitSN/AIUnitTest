const { add, multiply } = require('./sample');

// Simple test for add function
console.log('Testing add(2, 3):', add(2, 3) === 5 ? '✅ Passed' : '❌ Failed');

// Simple test for multiply function
console.log('Testing multiply(2, 3):', multiply(2, 3) === 6 ? '✅ Passed' : '❌ Failed');

// Test error case for add
console.log('Testing add with non-number (should throw):');
try {
  add('a', 2);
  console.log('❌ Failed - Did not throw error');
} catch (e) {
  console.log(e.message === 'Both arguments must be numbers' ? '✅ Passed' : '❌ Failed');
}
