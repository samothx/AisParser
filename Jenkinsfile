pipeline {
    agent {
        dockerfile {
            dir 'docker'
        }
    }

    environment {
       	CI = 'true'
    }

    stages {

        stage('Build') {
            steps {		
                sh 'npm install'
                sh 'npm run-script build'
            }
        }

        stage('Test') {
            steps {
                sh 'npm test'
            }
        }
    }
}
