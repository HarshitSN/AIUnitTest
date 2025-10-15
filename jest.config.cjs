module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js', '**/test/**/*.test.js'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    '**/*.js', // Include all JavaScript files in the project
    '!**/node_modules/**', // Exclude node_modules
    '!**/__tests__/**', // Exclude test files in __tests__ directories
    '!**/test/**', // Exclude test files in test directories
    '!**/coverage/**', // Exclude coverage files
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  verbose: true,
  passWithNoTests: true,
};
