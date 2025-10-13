const { Groq } = require('groq-sdk');
const esprima = require('esprima');

class GroqAIAnalyzer {
  constructor(config) {
    // ...
  }

  async analyzeCode(code, filePath) {
    // ...

    try {
      const prompt = `Review this code and provide:
1. One-line summary of what it does
2. One potential issue to fix
3. Improved version with fixes

Code:\n\`\`\`\n${code}\n\`\`\``;

      const completion = await this.groq.chat.completions.create({
        // ...
      });

      const response = completion.choices[0]?.message?.content || 'No response';

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
      // ...
    }
  }

  extractCodeBlocks(text) {
    const ast = esprima.parseScript(text);
    const codeBlocks = [];
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