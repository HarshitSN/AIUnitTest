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