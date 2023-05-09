pipeline {

    agent any

    tools {
        nodejs "NodeJS"
    }

    stages {

        stage('Install dependencies') {
            steps {
                sh 'npm prune && npm install && node postinstall'
            }
        }

        stage('Compile contracts') {
            steps {
                sh 'truffle compile && truffle migrate --network ropsten'
            }
        }

        stage('Test') {
            steps {
                sh 'npm run test'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Deploy') {
            steps {
                sh 'pm2 start npm --name "api" -- run "build_and_start:prod"'
            }
        }
    }
}