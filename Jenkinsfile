pipeline {
    agent {
	docker {
            image 'samothx/node-dev:latest'
	    args '-v yarn_cache:/usr/local/share/.cache/yarn'
        }
    }

    environment {
       	CI = 'true'
    }

    stages {

        stage('Build') {
            steps {		
                sh 'yarn install'
                sh 'yarn run build'
            }
        }

        stage('Test') {
            steps {
                sh 'yarn run test'
            }
        }
    }
}
