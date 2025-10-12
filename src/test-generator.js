class TestGenerator {
    constructor(config) {
      this.config = config;
    }
  
    async generate(code, filePath) {
      try {
        const functions = this.extractFunctions(code);
        const tests = [];
  
        for (const fn of functions) {
          const testCases = this.generateTestCases(fn);
          tests.push(...testCases);
        }
  
        return tests;
      } catch (error) {
        return [];
      }
    }
  
    extractFunctions(code) {
      const funcRegex = /(?:function|const|let)\s+(\w+)\s*(?:=\s*)?(?:\([^)]*\))?/g;
      const functions = [];
      let match;
  
      while ((match = funcRegex.exec(code))) {
        functions.push({
          name: match[1],
          isAsync: code.substring(match.index, match.index + 50).includes('async')
        });
      }
  
      return functions.slice(0, 5); // Limit to first 5
    }
  
    generateTestCases(fn) {
      const tests = [];
      
      tests.push({
        name: `${fn.name} - basic functionality`,
        template: `test('${fn.name} - basic functionality', () => {
    const result = ${fn.name}();
    expect(result).toBeDefined();
  });`
      });
  
      if (fn.isAsync) {
        tests.push({
          name: `${fn.name} - async handling`,
          template: `test('${fn.name} - async handling', async () => {
    const result = await ${fn.name}();
    expect(result).toBeDefined();
  });`
        });
      }
  
      tests.push({
        name: `${fn.name} - error handling`,
        template: `test('${fn.name} - handles errors', () => {
    expect(() => ${fn.name}(null)).not.toThrow();
  });`
      });
  
      return tests;
    }
  }