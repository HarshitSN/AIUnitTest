const Config = require('./src/config');
const GroqAIAnalyzer = require('./src/groq-analyzer');
const fs = require('fs').promises;
const path = require('path');

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
    `;
    
    // Test the function with sample data
    const items = [
      { name: 'Laptop', price: 999.99, quantity: 1 },
      { name: 'Mouse', price: 25.50, quantity: 2 },
      { name: 'Keyboard', price: 75.00, quantity: 1 }
    ];
    
    console.log('\n🧪 Testing with sample data...');
    try {
      const result = calculateTotal(items, 0.08);
      console.log('Order Summary:');
      console.log('- Subtotal: $' + result.subtotal);
    } catch (error) {
      console.error('Error calculating total:', error.message);
    }
    
    console.log('\n🤖 Analyzing test code...');
    const result = await analyzer.analyzeCode(testCode, 'example/calculate-total.js');
    
    if (result.success) {
      console.log('\n✅ Analysis completed!');
      
      // Display the concise analysis
      console.log('\n📝 Summary:', result.summary);
      console.log('🔧 Issue:', result.issue);
      
      // Save the improved code
      if (result.improvedCode && result.improvedCode !== testCode) {
        const outputPath = path.join(__dirname, 'improved-code.js');
        await fs.writeFile(outputPath, result.improvedCode, 'utf-8');
        console.log('\n✨ Improved code saved to improved-code.js');
        
        // Show a preview of the improved code
        console.log('\n🔍 Improved Code Preview:');
        console.log('======================');
        console.log(result.improvedCode.split('\n').slice(0, 10).join('\n') + '\n...');
      }
    } else {
      console.error('❌ Analysis failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Error during analysis:', error);
  }
}

// Install required package if not already installed
async function ensureDependencies() {
  try {
    // Check if groq-sdk is installed
    require.resolve('groq-sdk');
    console.log('✅ groq-sdk is already installed');
    // Run the test
    testGroqAnalyzer();
  } catch (error) {
    console.log('Installing groq-sdk...');
    const { exec } = require('child_process');
    
    exec('npm install groq-sdk', (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Failed to install groq-sdk:', error);
        return;
      }
      console.log('✅ groq-sdk installed successfully');
      // Run the test after installation
      testGroqAnalyzer();
    });
  }
}

// Start the process
ensureDependencies();
