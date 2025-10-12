# Node.js AI Pre-commit Hook

An AI-powered pre-commit hook for Node.js projects that analyzes your code changes, suggests improvements, and helps maintain code quality.

## Features

- 🔍 AI-powered code analysis using Gemini
- 🧪 Automatic test generation
- 📊 Web dashboard for visualizing results
- 🔄 Git integration
- ⚙️ Configurable rules and thresholds
- 🛡️ Security vulnerability detection

## Installation

### Prerequisites

- Node.js 14 or higher
- npm or yarn
- Git

### Install as a dev dependency

```bash
npm install --save-dev node-ai-precommit-tester
# or
yarn add --dev node-ai-precommit-tester
```

### Set up with Husky (recommended)

1. Install Husky if you haven't already:
   ```bash
   npx husky-init && npm install
   ```

2. Add the pre-commit hook:
   ```bash
   npx husky add .husky/pre-commit "npx node-ai-precommit"
   ```

### Set up with pre-commit

Add this to your `.pre-commit-config.yaml`:

```yaml
repos:
  - repo: https://github.com/yourusername/node-ai-precommit-tester
    rev: v0.1.0  # Use the latest version
    hooks:
      - id: node-ai-precommit
```

## Configuration

Create a `.aiprecommitrc.yml` file in your project root:

```yaml
# AI settings
ai:
  provider: gemini  # or 'openai' if implemented
  model: gemini-pro
  apiKey: ${GEMINI_API_KEY}  # or paste your API key directly

# Test settings
test:
  generate: true
  directory: __tests__
  framework: jest

# Risk assessment
risk:
  maxAllowed: 7  # Block commits with risk score > 7

# UI settings
ui:
  enableDashboard: true
  port: 3000

# File patterns
include:
  - '**/*.{js,jsx,ts,tsx}'
exclude:
  - '**/node_modules/**'
  - '**/dist/**'
```

## Environment Variables

- `GEMINI_API_KEY`: Your Gemini API key (required for AI features)
- `AI_PRECOMMIT_DEBUG`: Set to 'true' for debug output

## Usage

### Basic Usage

```bash
# Stage your changes
git add .

# Run the pre-commit hook
npx node-ai-precommit

# Or commit as usual (will trigger the hook)
git commit -m "Your commit message"
```

### CLI Options

```
Usage: node-ai-precommit [options]

Options:
  -V, --version      output the version number
  --no-ai            Skip AI analysis
  --no-tests         Skip test generation
  --no-dashboard     Disable web dashboard
  -h, --help         display help for command
```

## Web Dashboard

The web dashboard provides a visual representation of the analysis results:

- Risk score visualization
- Code quality metrics
- Test coverage
- Security vulnerabilities
- Suggested improvements

Access it at `http://localhost:3000` when the pre-commit hook runs.

## Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the project:
   ```bash
   npm run build
   ```
4. Link for local development:
   ```bash
   npm link
   ```

## Contributing

Contributions are welcome! Please read our [contributing guidelines](CONTRIBUTING.md) before submitting pull requests.

## License

MIT © [Your Name]
