const { GroqAIAnalyzer } = require('./src/groq-analyzer');
const fs = require('fs').promises;
const path = require('path');

// Mock config
const config = {
  get: (key) =>
    ({
      'groq.apiKey': process.env.GROQ_API_KEY || 'your-api-key',
      'groq.model': 'llama-3.1-8b-instant',
    })[key],
};

async function testGenerator() {
  try {
    const analyzer = new GroqAIAnalyzer(config);

    // Read the math-utils.js file
    const filePath = path.join(__dirname, 'src/math-utils.js');
    const code = await fs.readFile(filePath, 'utf8');

    console.log('Analyzing file:', filePath);
    const result = await analyzer.analyzeCode(code, filePath);

    if (result.success) {
      console.log('✅ Test generation successful!');
      console.log('Generated test file content:');
      console.log('----------------------------------------');
      console.log(result.testCode);
      console.log('----------------------------------------');

      // Save the test file
      const testFilePath = path.join(
        path.dirname(filePath),
        '__tests__',
        path.basename(filePath).replace(/\.js$/, '.test.js')
      );

      await fs.mkdir(path.dirname(testFilePath), { recursive: true });
      await fs.writeFile(testFilePath, result.testCode);
      console.log(`✅ Test file saved to: ${testFilePath}`);

      return testFilePath;
    } else {
      console.error('❌ Test generation failed:', result.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Error:', error);
    return null;
  }
}

testGenerator().then((testFilePath) => {
  if (testFilePath) {
    console.log('\nTo run the tests, use:');
    console.log(`npx jest ${testFilePath}`);
  }
});
