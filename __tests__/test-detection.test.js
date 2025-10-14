const moduleUnderTest = require('../test-detection');

describe('SimpleClass', () => {
  let simpleClass;

  beforeEach(() => {
    simpleClass = new moduleUnderTest();
  });

  describe('simpleMethod', () => {
    it('returns true', () => {
      expect(simpleClass.simpleMethod()).toBe(true);
    });
  });
});

));