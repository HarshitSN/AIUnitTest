pipeline { agent any

environment { PATH = "/bin:/usr/bin:/usr/local/bin:/opt/homebrew/bin:$PATH" }
stages {
    stage('Build') {
        steps {
            sh 'npm install'
        }
    }
    stage('Generate AI Tests') {
        steps {
            script {
                // Get the list of committed JavaScript/TypeScript files
                def committedFiles = sh(
                    script: 'git diff --name-only HEAD~1 HEAD | grep -E "\\.(js|jsx|ts|tsx)$" | grep -v "__tests__/" || true',
                    returnStdout: true
                ).trim()

                if (committedFiles) {
                    echo "Committed files to generate tests for:"
                    committedFiles.split('\n').each { file ->
                        if (file.trim()) {
                            echo "- ${file.trim()}"
                        }
                    }

                    // Generate tests for each committed file
                    def files = committedFiles.split('\n').findAll { it.trim() }
                    files.each { file ->
                        def trimmedFile = file.trim()
                        if (trimmedFile && fileExists(trimmedFile)) {
                            echo "Generating AI tests for: ${trimmedFile}"
                            sh """
                                node -e "
                                const { GroqAIAnalyzer } = require('./src/groq-analyzer.cjs');
                                const fs = require('fs').promises;
                                const path = require('path');

                                const config = {
                                    get: (key) => ({
                                        'groq.apiKey': process.env.GROQ_API_KEY || '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',
                                        'groq.model': 'llama-3.1-8b-instant',
                                    })[key],
                                };

                                const analyzer = new GroqAIAnalyzer(config);

                                async function generateTests() {
                                    try {
                                        const code = await fs.readFile('${trimmedFile}', 'utf8');
                                        const result = await analyzer.generateTests(code, '${trimmedFile}');

                                        if (result.success) {
                                            const testFileName = path.basename('${trimmedFile}', path.extname('${trimmedFile}')) + '.test.js';
                                            const testFileDir = path.dirname('${trimmedFile}');
                                            const testFilePath = path.join(testFileDir, '__tests__', testFileName);

                                            await fs.mkdir(path.dirname(testFilePath), { recursive: true });
                                            await fs.writeFile(testFilePath, result.testCode, 'utf8');

                                            console.log('✅ Generated test file: ' + testFilePath);
                                        } else {
                                            console.error('❌ Failed to generate tests for ${trimmedFile}:', result.error);
                                            process.exit(1);
                                        }
                                    } catch (error) {
                                        console.error('❌ Error generating tests for ${trimmedFile}:', error.message);
                                        process.exit(1);
                                    }
                                }

                                generateTests().catch(console.error);
                                "
                            """
                        }
                    }
                } else {
                    echo "No JavaScript/TypeScript files were committed in this build."
                }
            }
        }
    }
    stage('Lint and Format') {
        steps {
            sh 'npm run lint'
            sh 'npm run format'
        }
    }
    stage('Test') {
        steps {
            sh 'npm test'
        }
    }
}

post {
    always {
        echo 'Pipeline execution finished.'
    }
    success {
        echo 'Pipeline succeeded!'
    }
    failure {
        echo 'Pipeline failed. Check the logs for errors.'
    }
}
}