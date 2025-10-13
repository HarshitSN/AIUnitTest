module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/test/**/*.test.js'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    '**/*.js', // Include all JavaScript files in the project
    '!**/node_modules/**', // Exclude node_modules
    '!**/test/**', // Exclude test files
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
};