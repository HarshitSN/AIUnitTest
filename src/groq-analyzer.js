const { Groq } = require('groq-sdk');
const esprima = require('esprima');

class GroqAIAnalyzer {
  constructor(config) {
    this.config = config;
    this.groq = new Groq({
      apiKey: this.config.get('groq.apiKey')
    });
  }

  async analyzeCode(code, filePath) {
    try {
      // Get API key and model from config
      const apiKey = this.config.get('groq.apiKey');
      const model = this.config.get('groq.model');

      if (!apiKey) {
        const error = new Error('No API key found. Please set the GROQ_API_KEY environment variable.');
        error.status = 401;
        throw error;
      }

      const response = await fetch('https://api.groq.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content: 'You are a helpful code reviewer. Analyze the following code and provide feedback.'
            },
            {
              role: 'user',
              content: `Please analyze this code (${filePath || 'unknown file'}):\n\n\`\`\`javascript\n${code}\n\`\`\``
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.error?.message || 'API request failed');
        error.status = response.status;
        error.code = errorData.error?.code;
        throw error;
      }

      const responseJson = await response.json();
      const completion = responseJson.choices[0];
      if (!completion) {
        throw new Error('No response from API');
      }

      const responseText = completion.message.content || 'No response';

      // Extract improved code if present
      const improvedCode = this.extractCodeBlocks(response)[0] || code;

      // Extract issues and suggestions from AI response
      const issues = this.extractIssues(response);
      const suggestions = this.extractSuggestions(response);

      return {
        success: true,
        file: filePath,
        summary: response.split('\n')[0] || 'No summary',
        issue: issues.length > 0 ? issues[0].message : 'No major issues',
        improvedCode: improvedCode,
        fullResponse: response,
        issues: issues,
        suggestions: suggestions,
      };
    } catch (error) {
      console.error('Error in analyzeCode:', error);
      return {
        success: false,
        error: error.message,
        file: filePath
      };
    }
  }

  extractCodeBlocks(text) {
    if (!text) return [];
    
    const codeBlocks = [];
    const codeBlockRegex = /```(?:javascript|js|typescript|ts)?\n([\s\S]*?)\n```/g;
    let match;
    
    while ((match = codeBlockRegex.exec(text)) !== null) {
      codeBlocks.push(match[1]);
    }
    
    return codeBlocks.length > 0 ? codeBlocks : [];
    ast.body.forEach((node) => {
      if (node.type === 'Program') {
        node.body.forEach((childNode) => {
          if (childNode.type === 'ExpressionStatement' && childNode.expression.type === 'Literal' && childNode.expression.value === '```') {
            const codeBlock = childNode.nextSibling;
            if (codeBlock && codeBlock.type === 'BlockStatement') {
              codeBlocks.push(codeBlock.body.map((childCodeBlock) => childCodeBlock.type === 'ExpressionStatement' ? childCodeBlock.expression : '').join('\n'));
            }
          }
        });
      }
    });
    return codeBlocks;
  }

  extractIssues(analysis) {
    const issues = [];
    const lines = analysis.split('\n');
    for (const line of lines) {
      if (line.toLowerCase().includes('error:') || line.toLowerCase().includes('warning:')) {
        const severity = line.toLowerCase().includes('error:') ? 'error' : 'warning';
        const message = line.split(':').slice(1).join(':').trim();
        if (message) {
          issues.push({ severity, message });
        }
      }
    }
    return issues;
  }

  extractSuggestions(analysis) {
    const suggestions = [];
    const lines = analysis.split('\n');
    for (const line of lines) {
      if ((line.trim().startsWith('- ') || line.trim().startsWith('* ') || line.trim().match(/^\d+\./)) && !line.toLowerCase().includes('error:') && !line.toLowerCase().includes('warning:')) {
        const suggestion = line.replace(/^[\s*\d\.-]+/, '').trim();
        if (suggestion) {
          suggestions.push(suggestion);
        }
      }
    }
    return suggestions;
  }
}

module.exports = { GroqAIAnalyzer };