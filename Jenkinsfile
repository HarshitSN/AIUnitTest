pipeline { agent any

environment {
    PATH = "/bin:/usr/bin:/usr/local/bin:/opt/homebrew/bin:$PATH"
    GROQ_API_KEY = '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'
}
stages {
    stage('Build') {
        steps {
            sh 'npm install'
        }
    }
    stage('Generate AI Tests') {
        steps {
            script {
                // Clean up any existing test files first
                sh 'find . -name "*.test.js" -type f -delete || true'

                // Get the list of committed JavaScript/TypeScript files using git show
                def committedFiles = sh(
                    script: '''
                        # Get files from the latest commit
                        git show --name-only --pretty=format: HEAD | grep -E "\\.(js|jsx|ts|tsx|mjs)$" | grep -v __tests__/ || echo ""
                    ''',
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
                                import { GroqAIAnalyzer } from './src/groq-analyzer.js';
                                const fs = (await import('fs')).promises;
                                const path = await import('path');
                                const { execSync } = await import('child_process');

                                const config = {
                                    get: (key) => ({
                                        'groq.apiKey': process.env.GROQ_API_KEY,
                                        'groq.model': 'llama-3.1-8b-instant',
                                    })[key],
                                };

                                const analyzer = new GroqAIAnalyzer(config);

                                async function generateTests() {
                                    try {
                                        console.log('🔍 Reading file:', '${trimmedFile}');
                                        const code = await fs.readFile('${trimmedFile}', 'utf8');
                                        console.log('📝 Code length:', code.length, 'characters');

                                        console.log('🤖 Calling AI to generate tests...');
                                        const result = await analyzer.generateTests(code, '${trimmedFile}');
                                        console.log('✨ AI response received, success:', result.success);

                                        if (result.success && result.testCode) {
                                            console.log('🧪 Test code generated, length:', result.testCode.length);

                                            const testFileName = path.basename('${trimmedFile}', path.extname('${trimmedFile}')) + '.test.js';
                                            const testFileDir = path.dirname('${trimmedFile}');
                                            const testFilePath = path.join(testFileDir, '__tests__', testFileName);

                                            await fs.mkdir(path.dirname(testFilePath), { recursive: true });
                                            await fs.writeFile(testFilePath, result.testCode, 'utf8');

                                            console.log('✅ Generated test file: ' + testFilePath);
                                        } else {
                                            console.error('❌ Failed to generate tests:', result.error);
                                            if (result.fullResponse) {
                                                console.error('🔍 AI Response:', result.fullResponse.substring(0, 1000));
                                            }
                                        }
                                    } catch (error) {
                                        console.error('💥 Error generating tests:', error.message);
                                        console.error('🔍 Stack trace:', error.stack);
                                    }
                                }

                                generateTests().catch(console.error);

                                // Commit the generated test files
                                try {
                                    execSync('git add .');
                                    execSync('git commit -m "Add AI-generated test files for ' + '${trimmedFile}' + '"');
                                    execSync('git push origin main');
                                    console.log('✅ Committed and pushed test files to repository');
                                } catch (commitError) {
                                    console.error('❌ Failed to commit test files:', commitError.message);
                                }
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