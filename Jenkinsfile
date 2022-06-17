node('docker') {
        
    docker.image('node:14-alpine').inside {
        stage('Test') {
            checkout scm
            sh '''
            ls -la
            npm --v
            npm ci
            npx hardhat typechain
            npx hardhat coverage
            '''
        }
    }

}
