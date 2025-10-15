pipeline { agent any

environment { PATH = "/bin:/usr/bin:/usr/local/bin:/opt/homebrew/bin:$PATH" }
stages {
    stage('Build') {
        steps {
            sh 'npm install'
        }
    }
    stage('Generate Tests') {
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
