module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js', '**/test/**/*.test.js'],
  collectCoverage: false,
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
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
  verbose: true,
  passWithNoTests: true,
};
