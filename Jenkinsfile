pipeline {
    agent any

    environment {
        PATH = "/bin:/usr/bin:/usr/local/bin:/opt/homebrew/bin:$PATH"
        GROQ_API_KEY = credentials('groq-api-key')
        GITHUB_TOKEN = credentials('github-token2')
        GIT_BRANCH = "${env.BRANCH_NAME}"
    }

    stages {
        stage('Checkout SCM') {
            steps {
                checkout scm
                script {
                    sh 'git config user.name "Jenkins AI Bot"'
                    sh 'git config user.email "jenkins-ai@example.com"'

                    env.CURRENT_BRANCH = env.BRANCH_NAME ?: 'pr'
                    echo "🌿 Branch: ${env.CURRENT_BRANCH}"

                    if (sh(script: 'which gh', returnStatus: true) != 0) {
                        error 'GitHub CLI (gh) not installed on agent.'
                    }

                    echo "🔑 Using Jenkins-provided GITHUB_TOKEN for GitHub CLI authentication"
                }
            }
        }

        stage('Build') {
            steps {
                sh '''
                    if [ ! -d node_modules ]; then
                        npm install
                    else
                        echo "✅ Using cached node_modules"
                    fi
                '''
            }
        }

        stage('Generate AI Tests') {
            steps {
                script {
                    def committedFiles = sh(
                        script: '''
                            set -e
                            git diff-tree --no-commit-id --name-only -r --diff-filter=AM HEAD |
                              grep -E "\\.(js|jsx|ts|tsx|mjs)$" |
                              grep -v "^__tests__/" |
                              grep -v "^scripts/" || true
                        ''',
                        returnStdout: true
                    ).trim()

                    if (committedFiles) {
                        echo "🧠 Files changed:\n${committedFiles}"
                        committedFiles.split('\n').each { file ->
                            if (file.trim()) {
                                echo "Generating AI tests for: ${file}"
                                sh "node scripts/generate-tests.js '${file}'"
                            }
                        }
                    } else {
                        echo "ℹ️ No eligible source files changed."
                    }
                }
            }
        }

        stage('Lint and Format') {
            steps {
                sh 'npx eslint . --fix || true'
                sh 'npm run format || true'
                sh 'npm run lint || true'
            }
        }

        stage('Test') {
            steps {
                sh 'npm test'
            }
        }

        stage('Commit Generated Tests and Create PR') {
            steps {
                script {
                    def processedFiles = sh(
                        script: '''
                            git diff-tree --no-commit-id --name-only -r --diff-filter=AM HEAD |
                              grep -E "\\.(js|jsx|ts|tsx|mjs)$" |
                              grep -v "^__tests__/" |
                              grep -v "^scripts/" || true
                        ''',
                        returnStdout: true
                    ).trim().split('\n').findAll { it.trim() }

                    def filesToStage = processedFiles.collect {
                        "__tests__/${it.replaceAll(/\\.js$/, '.test.js')}"
                    }

                    filesToStage.each { tf ->
                        sh "git add '${tf}' || true"
                    }

                    def stagedCount = sh(
                        script: 'git diff --cached --name-only | grep "__tests__/" | wc -l || echo 0',
                        returnStdout: true
                    ).trim().toInteger()

                    if (stagedCount > 0) {
                        sh """
                            git commit -m "🤖 AI-generated unit tests [skip ci]"
                            git push https://${GITHUB_TOKEN}@github.com/HarshitMalik22/AIUnitTest.git HEAD:${env.CURRENT_BRANCH}
                        """
                        echo "✅ ${stagedCount} test file(s) pushed."

                        def prExists = sh(
                            script: "gh pr list --repo HarshitMalik22/AIUnitTest --head ${env.CURRENT_BRANCH} --json number --jq '.[0].number' || echo ''",
                            returnStdout: true
                        ).trim()

                        if (prExists) {
                            echo "♻️ PR #${prExists} already exists."
                        } else {
                            def prTitle = "🤖 AI-Generated Tests for ${env.CURRENT_BRANCH}"
                            def prBody = """
                            ## AI-Generated Unit Tests

                            This PR contains automatically generated unit tests by the Jenkins AI pipeline.

                            **Generated Test Files**
                            ${filesToStage.collect { "- ${it}" }.join('\n')}

                            **Pipeline Run:** ${env.BUILD_URL}
                            """

                            sh """
                                gh pr create \
                                  --repo HarshitMalik22/AIUnitTest \
                                  --title "${prTitle}" \
                                  --body "${prBody}" \
                                  --base main \
                                  --head ${env.CURRENT_BRANCH}
                            """
                            echo "✅ PR created successfully."
                        }
                    } else {
                        echo "ℹ️ No test files staged to commit."
                    }
                }
            }
        }
    } // end stages

    post {
        always { echo 'Pipeline execution finished.' }
        success { echo '✅ Pipeline succeeded!' }
        failure { echo '❌ Pipeline failed — check logs.' }
    }
} // end pipeline
