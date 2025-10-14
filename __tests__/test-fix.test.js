const TestClass = require('../test-fix');

describe('TestClass', () => {
  describe('testMethod', () => {
    it('should return a string', () => {
      const testInstance = new TestClass();
      expect(testInstance.testMethod()).toBe('Hello World');
    });
  });
});
