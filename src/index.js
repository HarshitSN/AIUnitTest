import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GroqAIAnalyzer } from './groq-analyzer.js';
import { Config } from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Main pre-commit hook function
 * @param {Object} options - Command line options
 * @returns {Promise<number>} - Exit code
 */
export async function runPrecommit(options = {}) {
  try {
    console.log('🚀 Starting AI-powered pre-commit analysis...');

    // Initialize configuration
    const config = new Config();

    // Find files to analyze
    const filesToAnalyze = findFilesToAnalyze();

    if (filesToAnalyze.length === 0) {
      console.log('✅ No files to analyze');
      return 0;
    }

    console.log(`📁 Found ${filesToAnalyze.length} file(s) to analyze:`);
    filesToAnalyze.forEach((file) => console.log(`  - ${file}`));

    // Analyze each file
    let allResults = [];
    for (const filePath of filesToAnalyze) {
      const result = await analyzeFile(filePath, config, options);
      allResults.push(result);
    }

    // Generate tests for complex files
    await generateTestsForComplexFiles(filesToAnalyze, config, options);

    // Check if we should proceed with commit
    const shouldCommit = checkCommitReadiness(allResults);

    if (shouldCommit) {
      console.log('✅ Pre-commit checks passed!');
      return 0;
    } else {
      console.log('❌ Pre-commit checks failed. Please review the issues above.');
      return 1;
    }
  } catch (error) {
    console.error('💥 Error in pre-commit hook:', error.message);
    return 1;
  }
}

/**
 * Find files that need to be analyzed
 * @returns {Array<string>} - Array of file paths
 */
function findFilesToAnalyze() {
  const files = [];

  // Check for staged files or specific files mentioned
  // For now, we'll analyze the dataProcessor.js file we created
  const dataProcessorPath = path.join(__dirname, '..', 'dataProcessor.js');
  if (fs.existsSync(dataProcessorPath)) {
    files.push(dataProcessorPath);
  }

  return files;
}

/**
 * Analyze a single file
 * @param {string} filePath - Path to the file to analyze
 * @param {Config} config - Configuration manager
 * @param {Object} options - Command line options
 * @returns {Promise<Object>} - Analysis result
 */
async function analyzeFile(filePath, config, options) {
  try {
    const code = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);

    console.log(`🔍 Analyzing ${fileName}...`);

    // Use Groq AI to analyze the code
    const analyzer = new GroqAIAnalyzer(config);
    const analysis = await analyzer.analyzeCode(code, filePath);

    if (analysis.success) {
      console.log(`✅ ${fileName} analysis completed`);
      console.log(`   Summary: ${analysis.summary || 'No summary available'}`);

      if (analysis.issues && analysis.issues.length > 0) {
        console.log(`   Issues found: ${analysis.issues.length}`);
        analysis.issues.forEach((issue) => console.log(`     - ${issue}`));
      }
    } else {
      console.log(`❌ ${fileName} analysis failed: ${analysis.error}`);
    }

    return analysis;
  } catch (error) {
    console.error(`💥 Error analyzing ${filePath}:`, error.message);
    return { success: false, error: error.message, file: filePath };
  }
}

/**
 * Generate tests for complex files
 * @param {Array<string>} files - Array of file paths
 * @param {Config} config - Configuration manager
 * @param {Object} options - Command line options
 */
async function generateTestsForComplexFiles(files, config, options) {
  if (options['no-tests']) {
    console.log('⏭️  Test generation skipped');
    return;
  }

  console.log('🧪 Generating tests for complex files...');

  for (const filePath of files) {
    try {
      const code = fs.readFileSync(filePath, 'utf8');
      const fileName = path.basename(filePath);

      // Skip test files themselves
      if (fileName.endsWith('.test.js') || fileName.endsWith('.spec.js')) {
        continue;
      }

      // Check if it's a complex file that would benefit from AI-generated tests
      if (isComplexCode(code)) {
        console.log(`📝 Generating tests for ${fileName}...`);

        const testCode = await generateTestFile(code, fileName, config);

        if (testCode) {
          const testFileName = fileName.replace('.js', '.test.js');
          const testFilePath = path.join(__dirname, '..', '__tests__', testFileName);

          fs.writeFileSync(testFilePath, testCode);
          console.log(`✅ Generated test file: ${testFileName}`);
        }
      } else {
        console.log(`⏭️  ${fileName} is not complex enough for AI test generation`);
      }
    } catch (error) {
      console.error(`💥 Error generating tests for ${filePath}:`, error.message);
    }
  }
}

/**
 * Check if code is complex enough to warrant AI-generated tests
 * @param {string} code - Source code
 * @returns {boolean} - True if complex
 */
function isComplexCode(code) {
  // Simple heuristic: count functions, classes, and complexity indicators
  const functionCount = (code.match(/function|=>|class\s+\w+/g) || []).length;
  const lineCount = code.split('\n').length;
  const hasErrorHandling = /try|catch|throw/.test(code);
  const hasValidation = /if.*valid|check|assert/.test(code);

  return functionCount >= 3 || (lineCount > 50 && (hasErrorHandling || hasValidation));
}

/**
 * Generate test file using AI
 * @param {string} code - Source code
 * @param {string} fileName - Original file name
 * @param {Config} config - Configuration manager
 * @returns {Promise<string|null>} - Generated test code or null
 */
async function generateTestFile(code, fileName, config) {
  try {
    const analyzer = new GroqAIAnalyzer(config);

    const prompt = `Generate comprehensive unit tests for this JavaScript code:

\`\`\`javascript
${code}
\`\`\`

Please generate Jest tests that cover:
1. All public methods and functions
2. Edge cases and error conditions
3. Input validation
4. Different data types and values
5. Expected behavior for various scenarios

Format the output as a complete Jest test file with proper describe blocks, test cases, and assertions.`;

    const completion = await analyzer.groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content:
            'You are an expert JavaScript testing engineer. Generate comprehensive, well-structured Jest tests.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: config.get('groq.model') || 'llama-3.1-8b-instant',
      temperature: 0.3,
      max_tokens: 2000,
    });

    const testCode = completion.choices[0]?.message?.content || '';

    // Clean up the response and ensure it's valid JavaScript
    return testCode.replace(/```javascript|```/g, '').trim();
  } catch (error) {
    console.error('Error generating test file:', error.message);
    return null;
  }
}

/**
 * Check if commit should proceed based on analysis results
 * @param {Array<Object>} results - Analysis results
 * @returns {boolean} - True if commit should proceed
 */
function checkCommitReadiness(results) {
  const errors = results.filter(
    (result) =>
      !result.success ||
      (result.issues &&
        result.issues.some(
          (issue) =>
            issue.toLowerCase().includes('critical') || issue.toLowerCase().includes('error')
        ))
  );

  return errors.length === 0;
}
