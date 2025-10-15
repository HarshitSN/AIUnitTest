const { describe, test, expect } = require('@jest/globals');

describe('multiply', () => {
  test('should perform basic multiplication', () => {
    // Arrange
    const a = 5;
    const b = 22;

    // Act
    const result = a * b;

    // Assert
    expect(result).toBe(110);
  });

  test('should handle edge case with zero', () => {
    // Arrange
    const a = 5;
    const b = 0;

    // Act
    const result = a * b;

    // Assert
    expect(result).toBe(0);
  });
});
