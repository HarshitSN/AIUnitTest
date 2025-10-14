const moduleUnderTest = require('../index');
const { CommitValidator, runPrecommit, generateTestFile, runTests } = moduleUnderTest;

describe('CommitValidator', () => {
  it('should create a new instance with default results', () => {
    const validator = new CommitValidator();
    expect(validator.results).toEqual({ errors: [] });
  });

  it('should create a new instance with custom results', () => {
    const results = { errors: ['error1', 'error2'] };
    const validator = new CommitValidator(results);
    expect(validator.results).toEqual(results);
  });

  it('should return true if no critical, warning, or issue errors', () => {
    const validator = new CommitValidator();
    expect(validator.shouldProceedWithCommit()).toBe(true);
  });

  it('should return false if there are critical, warning, or issue errors', () => {
    const validator = new CommitValidator({ errors: ['critical error'] });
    expect(validator.shouldProceedWithCommit()).toBe(false);
  });
});

describe('runPrecommit', () => {
  it('should return 0 if all tests pass', async () => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const result = await runPrecommit();
    expect(result).toBe(0);
  });

  it('should return 1 if some tests fail', async () => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const runTestsMock = jest
      .spyOn(runTests, 'default')
      .mockImplementation(() => Promise.resolve(false));
    const result = await runPrecommit();
    expect(result).toBe(1);
    runTestsMock.mockRestore();
  });

  it('should return 1 if an error occurs during execution', async () => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const runPrecommitMock = jest
      .spyOn(runPrecommit, 'default')
      .mockImplementation(() => Promise.reject(new Error('test error')));
    const result = await runPrecommit();
    expect(result).toBe(1);
    runPrecommitMock.mockRestore();
  });
});

describe('generateTestFile', () => {
  it('should return an object with success: true and testPath: null if file is empty', async () => {
    const filePath = 'test/file.js';
    const result = await generateTestFile(filePath);
    expect(result.success).toBe(true);
    expect(result.testPath).toBeNull();
  });

  it('should return an object with success: false and testPath: null if file does not exist', async () => {
    const filePath = 'non/existent/file.js';
    const result = await generateTestFile(filePath);
    expect(result.success).toBe(false);
    expect(result.testPath).toBeNull();
  });

  it('should return an object with success: true and testPath: string if file exists and test code is generated', async () => {
    const filePath = 'test/file.js';
    const result = await generateTestFile(filePath);
    expect(result.success).toBe(true);
    expect(result.testPath).toBeInstanceOf(String);
  });
});

describe('runTests', () => {
  it('should return true if tests pass', async () => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const result = await runTests('test/file.js');
    expect(result).toBe(true);
  });

  it('should return false if tests fail', async () => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const runTestsMock = jest
      .spyOn(runTests, 'default')
      .mockImplementation(() => Promise.resolve(false));
    const result = await runTests('test/file.js');
    expect(result).toBe(false);
    runTestsMock.mockRestore();
  });
});
