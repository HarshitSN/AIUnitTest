pipeline {
    agent any

    environment {
        PATH = "/bin:/usr/bin:/usr/local/bin:/opt/homebrew/bin:$PATH"
        GROQ_API_KEY = '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'
        GITHUB_TOKEN = credentials('github-token2')
        GIT_BRANCH = "${env.BRANCH_NAME}"
    }

    stages {
        stage('Checkout SCM') {
            steps {
                checkout scm
                script {
                    // Configure git identity for commits
                    sh 'git config user.name "Jenkins AI Bot"'
                    sh 'git config user.email "jenkins-ai@example.com"'
                    
                    // Get the source branch from Jenkins environment (this is the branch the commit came from)
                    env.CURRENT_BRANCH = env.BRANCH_NAME ?: 'pr'
                    echo "Working with commits from branch: ${env.CURRENT_BRANCH}"
                    
                    // Verify GitHub CLI is installed
                    def ghInstalled = sh(
                        script: 'which gh',
                        returnStatus: true
                    )
                    if (ghInstalled != 0) {
                        error 'GitHub CLI (gh) is not installed. Install it on Jenkins agent.'
                    }
                    
                    // Authenticate with GitHub
                    sh 'echo "${GITHUB_TOKEN}" | gh auth login --with-token'
                }
            }
        }

        stage('Build') {
            steps {
                sh 'npm install'
            }
        }

        stage('Generate AI Tests') {
            steps {
                script {
                    // Get the list of files changed in the most recent commit only
                    def committedFiles = sh(
                        script: '''
                            set -e
                            # List files changed in the CURRENT commit only
                            git diff-tree --no-commit-id --name-only -r --diff-filter=AM HEAD \
                              | grep -E "\\.(js|jsx|ts|tsx|mjs)$" \
                              | grep -v "^__tests__/" \
                              | grep -v "^scripts/" || true
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
                // Clean up any auto-generated test files in scripts/__tests__/ that might cause parsing errors
                sh 'rm -rf scripts/__tests__/ || true'

                sh 'npx eslint . --fix'
                sh 'npm run format'
                sh 'npm run lint'  // Final check to ensure no errors remain
            }
        }

        stage('Commit Generated Tests and Create PR') {
            steps {
                script {
                    // Get the list of files processed in this run
                    def processedFiles = []
                    def committedFiles = sh(
                        script: '''
                            set -e
                            git diff-tree --no-commit-id --name-only -r --diff-filter=AM HEAD \
                              | grep -E "\\.(js|jsx|ts|tsx|mjs)$" \
                              | grep -v "^__tests__/" \
                              | grep -v "^scripts/" || true
                        ''',
                        returnStdout: true
                    ).trim()

                    if (committedFiles) {
                        processedFiles = committedFiles.split('\n').findAll { it.trim() }
                    }

                    // Only stage test files for the files that were actually processed
                    def filesToStage = []
                    processedFiles.each { file ->
                        def testFile = "__tests__/${file.replaceAll(/\.js$/, '.test.js')}"
                        filesToStage.add(testFile)
                    }

                    if (filesToStage.size() > 0) {
                        echo "📝 Staging ${filesToStage.size()} test file(s) to commit..."
                        filesToStage.each { testFile ->
                            sh "git add '${testFile}' || true"
                        }

                        // Count staged test files after staging
                        def stagedTests = sh(
                            script: 'git diff --cached --name-only | grep "__tests__/" | wc -l',
                            returnStdout: true
                        ).trim()

                        if (stagedTests.toInteger() > 0) {
                            echo "📝 Found ${stagedTests} staged test file(s) to commit..."

                            // Commit with a descriptive message
                            sh """
                                git commit -m "🤖 AI-generated unit tests
                                
Generated tests for: ${filesToStage.join(', ')}

[skip ci]"
                            """

                            echo "✅ Committed ${stagedTests} test file(s) locally"

                            // Push the current commit (with AI tests) to the source branch
                            try {
                                // Get the current commit hash
                                def currentCommit = sh(returnStdout: true, script: 'git rev-parse HEAD').trim()
                                echo "Pushing commit ${currentCommit} to branch ${env.CURRENT_BRANCH}"
                                
                                // Push the current commit to the source branch
                                sh "git push origin HEAD:${env.CURRENT_BRANCH}"
                                echo "✅ Successfully pushed AI-generated tests to ${env.CURRENT_BRANCH}"
                            } catch (Exception e) {
                                echo "⚠️ Could not push to remote repository: ${e.getMessage()}"
                                error "Failed to push AI tests to ${env.CURRENT_BRANCH}: ${e.getMessage()}"
                            }

                            // Create or update PR using GitHub CLI
                            try {
                                def prExists = sh(
                                    script: "gh pr list --head ${env.CURRENT_BRANCH} --json number --jq '.[0].number'",
                                    returnStdout: true
                                ).trim()

                                if (prExists) {
                                    echo "♻️ PR #${prExists} already exists, updated with new commits"
                                } else {
                                    echo "📬 Creating new pull request..."
                                    
                                    // Build PR body with proper escaping
                                    def fileList = filesToStage.collect { "- ${it}" }.join('\\n')
                                    def prTitle = "🤖 AI-Generated Tests for ${env.CURRENT_BRANCH}"
                                    def prBody = "## AI-Generated Unit Tests\\n\\n" +
                                                 "This PR contains automatically generated unit tests by the Jenkins AI pipeline.\\n\\n" +
                                                 "### Generated Test Files\\n${fileList}\\n\\n" +
                                                 "**Status**: Ready for review\\n" +
                                                 "**Pipeline Run**: ${env.BUILD_URL}"
                                    
                                    sh """
                                        gh pr create \
                                            --title '${prTitle}' \
                                            --body '${prBody}' \
                                            --base main \
                                            --head ${env.CURRENT_BRANCH}
                                    """
                                    echo "✅ Pull request created successfully"
                                }
                            } catch (Exception e) {
                                echo "⚠️ Could not create/update pull request: ${e.getMessage()}"
                                error "Failed to create/update PR: ${e.getMessage()}"
                            }
                        } else {
                            echo "ℹ️ No new or modified test files to commit"
                        }
                    } else {
                        echo "ℹ️ No files were processed for test generation"
                    }
                }
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
