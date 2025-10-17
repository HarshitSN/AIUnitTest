pipeline {
    agent any

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
                                    node scripts/generate-tests.js ${trimmedFile}
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

        stage('Commit Generated Tests') {
            steps {
                script {
                    // Always stage any changes in the __tests__ directory (new and modified)
                    sh 'git add __tests__/ || true'

                    // Count staged test files after staging
                    def stagedTests = sh(
                        script: 'git diff --cached --name-only -- "__tests__/" | wc -l',
                        returnStdout: true
                    ).trim()

                    if (stagedTests.toInteger() > 0) {
                        echo "📝 Found ${stagedTests} staged test file(s) to commit..."

                        // Commit with a descriptive message
                        sh """
                            git commit -m "🤖 Update AI-generated unit tests\n\nUpdated by AI test generator for committed JavaScript/TypeScript files.\n\nFiles processed: ${stagedTests} test file(s)"
                        """

                        echo "✅ Committed ${stagedTests} test file(s) locally"

                        // Try to push, but don't fail the build if push fails (common in some CI setups)
                        try {
                            // In Jenkins detached HEAD state, we need to push the current commit
                            sh 'git push origin HEAD:main'
                            echo "✅ Successfully pushed generated test files to repository"
                        } catch (Exception e) {
                            echo "⚠️ Could not push to remote repository: ${e.getMessage()}"
                            echo "💡 Generated test files are committed locally and will be available in the next push"
                            echo "   You can manually push with: git push origin main"
                            echo "   Or the next commit from your local machine will include these changes"
                        }
                    } else {
                        echo "ℹ️ No new or modified test files to commit"
                    }
                }
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
