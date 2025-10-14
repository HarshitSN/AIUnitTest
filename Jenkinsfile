pipeline {
    agent any

    stages {
        stage('Build') {
            steps {
                echo 'Installing dependencies...'
                sh 'npm install'
                echo 'Build stage completed.'
            }
        }

        stage('Generate Tests') {
            steps {
                echo 'Generating tests or performing code quality checks...'
                sh 'npm run lint'
                sh 'npm run format'
                echo 'Test generation and code quality checks completed.'
            }
        }

        stage('Test') {
            steps {
                echo 'Running tests...'
                sh 'npm test'
                echo 'Test stage completed.'
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
