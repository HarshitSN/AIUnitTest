class Config {
    constructor() {
      this.config = this.loadConfig();
    }
  
    loadConfig() {
      const configPath = path.join(process.cwd(), '.aiprecommitrc');
      
      if (fs.existsSync(configPath)) {
        return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      }
  
      return this.getDefaultConfig();
    }
  
    getDefaultConfig() {
      return {
        ai: {
          provider: 'openai',
          apiKey: process.env.OPENAI_API_KEY,
          model: 'gpt-4'
        },
        rules: {
          requireTests: true,
          minTestCoverage: 80,
          autoFix: true,
          interactive: false,
          strictMode: false,
          languages: ['javascript', 'typescript']
        },
        ignorePatterns: ['node_modules/', 'dist/', '*.test.js', '*.spec.js']
      };
    }
  
    get(key) {
      return key.split('.').reduce((obj, k) => obj?.[k], this.config);
    }
  
    set(key, value) {
      const keys = key.split('.');
      let obj = this.config;
      
      for (let i = 0; i < keys.length - 1; i++) {
        obj[keys[i]] = obj[keys[i]] || {};
        obj = obj[keys[i]];
      }
      
      obj[keys[keys.length - 1]] = value;
    }
  }
  
  module.exports = { AIPrecommitHook, AIAnalyzer, TestGenerator, GitUtils, Config };