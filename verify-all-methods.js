import GroqAIAnalyzer from './src/groq-analyzer.js';

// Simple configuration for testing
const config = {
  get: (key) =>
    ({
      'groq.apiKey': 'test-key',
      'groq.model': 'llama-3.1-8b-instant',
    })[key],
};

const analyzer = new GroqAIAnalyzer(config);

// Test all three methods
const testResponse = `
Here are my suggestions for the code:

Error: The method doesn't handle non-numeric inputs properly.
Warning: Division by zero not handled correctly.

\`\`\`javascript
// This is a code block
function test() {
  return "hello";
}
\`\`\`

Suggestion: Consider adding input validation.
Fix: Add proper error handling for edge cases.
`;

console.log('Testing extractIssues method...');
try {
  const issues = analyzer.extractIssues(testResponse);
  console.log('✅ extractIssues method works!');
  console.log('Found issues:', issues.length);
  issues.forEach((issue, index) => {
    console.log(`  ${index + 1}. [${issue.severity}] ${issue.message}`);
  });
} catch (error) {
  console.error('❌ extractIssues method failed:', error.message);
}

console.log('\nTesting extractSuggestions method...');
try {
  const suggestions = analyzer.extractSuggestions(testResponse);
  console.log('✅ extractSuggestions method works!');
  console.log('Found suggestions:', suggestions.length);
  suggestions.forEach((suggestion, index) => {
    console.log(`  ${index + 1}. ${suggestion.message}`);
  });
} catch (error) {
  console.error('❌ extractSuggestions method failed:', error.message);
}

console.log('\nTesting extractCodeBlocks method...');
try {
  const codeBlocks = analyzer.extractCodeBlocks(testResponse);
  console.log('✅ extractCodeBlocks method works!');
  console.log('Found code blocks:', codeBlocks.length);
  codeBlocks.forEach((block, index) => {
    console.log(`  ${index + 1}. ${block.substring(0, 50)}...`);
  });
} catch (error) {
  console.error('❌ extractCodeBlocks method failed:', error.message);
}

console.log('\n✅ All tests passed!');
