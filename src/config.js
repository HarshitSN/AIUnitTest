import fs from 'fs';
import path from 'path';

class Config {
  constructor() {
    this.config = this.loadConfig();
  }

  loadConfig() {
    const configPath = path.join(process.cwd(), '.aiprecommitrc');

    if (fs.existsSync(configPath)) {
      try {
        return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      } catch (e) {
        console.error(`Error loading config file: ${e.message}. Using default config.`);
        return this.getDefaultConfig();
      }
    }
    return this.getDefaultConfig();
  }

  getDefaultConfig() {
    return {
      ai: {
        provider: 'groq',
        apiKey: process.env.GROQ_API_KEY || '',
        model: 'llama-3.1-8b-instant',
      },
      rules: {
        requireTests: true,
        minTestCoverage: 80,
        interactive: false,
        strictMode: false,
        languages: ['javascript', 'typescript'],
      },
      ignorePatterns: ['node_modules/', 'dist/', '*.test.js', '*.spec.js'],
    };
  }

  get(key) {
    return key.split('.').reduce((obj, k) => (obj || {})[k], this.config);
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

export { Config };
