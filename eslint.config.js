import js from '@eslint/js';
import prettier from 'eslint-plugin-prettier';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    ignores: ['scripts/__tests__/**'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    plugins: {
      prettier: prettier,
    },
    rules: {
      // 'prettier/prettier': 'error',
      'no-console': 'off',
      'no-unused-vars': 'warn',
    },
  },
  {
    files: ['__tests__/**/*.js'],
    rules: {
      'prettier/prettier': 'warn', // More lenient for auto-generated tests
      'no-unused-vars': 'off', // Tests often have unused variables in setup
    },
  },
];
