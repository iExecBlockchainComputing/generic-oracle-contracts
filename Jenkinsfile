node('docker') {
        
    docker.image('node:14-alpine').inside {
        stage('Test') {
            sh '''
            npm --v
            npm ci
            npx hardhat coverage
            '''
        }
    }

}
