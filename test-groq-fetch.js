const fetch = require('node-fetch');
const { writeFile } = require('fs').promises;
const { join } = require('path');

const API_KEY = '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';
const API_URL = 'https://api.groq.com/openai/v1/chat/completions';

async function testGroq() {
  console.log('🚀 Testing Groq API with direct HTTP request...');
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI assistant that provides clear and concise answers.'
          },
          {
            role: 'user',
            content: 'Write a simple JavaScript function that calculates the factorial of a number.'
          }
        ],
        temperature: 0.7,
        max_tokens: 1024,
        top_p: 1,
        stream: false
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API request failed with status ${response.status}: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    
    // Save the complete response to a file
    const outputPath = join(__dirname, 'groq-response.json');
    await writeFile(outputPath, JSON.stringify(data, null, 2), 'utf-8');
    
    console.log(`✅ Response saved to ${outputPath}`);
    
    // Log a preview of the response
    const content = data.choices?.[0]?.message?.content || 'No content received';
    console.log('\n📝 Response Preview:');
    console.log('================');
    console.log(content.substring(0, 200) + (content.length > 200 ? '...' : ''));
    console.log(`\n✅ Check ${outputPath} for the complete response.`);
    
  } catch (error) {
    console.error('❌ Error calling Groq API:');
    console.error(`Status: ${error.response?.status}`);
    console.error('Error message:', error.message);
  }
}

// Run the test
testGroq().catch(console.error);