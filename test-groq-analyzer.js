const Config = require('./src/config');
const GroqAIAnalyzer = require('./src/groq-analyzer');

// Sample configuration
const config = {
  get: (key) => {
    const configMap = {
      'groq.apiKey': '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',
      'groq.model': 'llama-3.1-8b-instant' // Using Llama 3.1 8B model
    };
    return configMap[key];
  }
};

async function testGroqAnalyzer() {
  console.log('🚀 Testing Groq AI Analyzer with Llama 3...');
  
  try {
    console.log('🔧 Initializing Groq AI Analyzer...');
    const analyzer = new GroqAIAnalyzer(config);
    
    // Test code to analyze
    const testCode = `
    /**
     * Calculates the total price of items including tax
     * @param {Array} items - Array of items with price and quantity
     * @param {number} taxRate - Tax rate as a decimal (e.g., 0.08 for 8%)
     * @returns {Object} Object containing subtotal, tax, and total
     */
    function calculateTotal(items, taxRate) {
      // Input validation
      if (!Array.isArray(items) || typeof taxRate !== 'number' || taxRate < 0) {
        throw new Error('Invalid input parameters');
      }
      
      // Calculate subtotal
      const subtotal = items.reduce((sum, item) => {
        if (typeof item.price !== 'number' || typeof item.quantity !== 'number' || 
            item.price < 0 || item.quantity < 0) {
          throw new Error('Invalid item data');
        }
        return sum + (item.price * item.quantity);
      }, 0);
      
      // Calculate tax and total
      const tax = subtotal * taxRate;
      const total = subtotal + tax;
      
      return {
        subtotal: parseFloat(subtotal.toFixed(2)),
        tax: parseFloat(tax.toFixed(2)),
        total: parseFloat(total.toFixed(2))
      };
    }
    
    // Example usage
    const items = [
      { name: 'Laptop', price: 999.99, quantity: 1 },
      { name: 'Mouse', price: 24.99, quantity: 2 },
      { name: 'Keyboard', price: 49.99, quantity: 1 }
    ];
    
    try {
      const result = calculateTotal(items, 0.08);
      console.log('Order Summary:');
      console.log('- Subtotal: $' + result.subtotal);
      console.log('- Tax (8%): $' + result.tax);
      console.log('- Total: $' + result.total);
    } catch (error) {
      console.error('Error calculating total:', error.message);
    }
    
    console.log('\n🤖 Analyzing test code with Groq...');
    const result = await analyzer.analyzeCode(testCode, 'example/calculate-total.js');
    
    if (result.success) {
      console.log('\      const analysis = completion.choices[0]?.message?.content || 'No response from AI';
      
      console.log('✅ Received response from Groq API');
      
      // Save the full response to a file
      const fs = require('fs').promises;
      const path = require('path');
      const outputPath = path.join(__dirname, 'analysis-result.txt');
      
      // Display suggestions
      if (result.suggestions && result.suggestions.length > 0) {
        console.log('\n💡 Suggestions for Improvement:');
        console.log('==========================');
        result.suggestions.forEach((suggestion, index) => {
          console.log(`${index + 1}. ${suggestion}`);
        });
      } else {
        console.log('\nℹ️  No specific suggestions provided.');
      }
    } else {
      console.error('❌ Analysis failed:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Error during analysis:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
  }
}

// Install required package if not already installed
async function ensureDependencies() {
  try {
    // Check if groq-sdk is installed
    require.resolve('groq-sdk');
  } catch (e) {
    console.log('Installing groq-sdk...');
    const { execSync } = require('child_process');
    try {
      execSync('npm install groq-sdk', { stdio: 'inherit' });
      console.log('✅ groq-sdk installed successfully');
    } catch (error) {
      console.error('❌ Failed to install groq-sdk:', error.message);
      process.exit(1);
    }
  }
  
  // Run the test
  testGroqAnalyzer().catch(console.error);
}

// Start the process
ensureDependencies();
