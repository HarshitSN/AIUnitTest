const SimpleClass = require('../test-detection');

describe('SimpleClass', () => {
  let simpleClass;

  beforeEach(() => {
    simpleClass = new SimpleClass();
  });

  it('should return true from simpleMethod', () => {
    expect(simpleClass.simpleMethod()).toBe(true);
  });

  it('should be an instance of SimpleClass', () => {
    expect(simpleClass).toBeInstanceOf(SimpleClass);
  });

  it('should have a simpleMethod property', () => {
    expect(simpleClass.simpleMethod).toBeDefined();
  });
});
