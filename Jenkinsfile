@Library('global-jenkins-library@2.0.0') _

node('docker') {

    buildInfo
        
    docker.image('node:16-alpine').inside {

        stage('Git checkout') {
            buildInfo = getBuildInfo()
        }

        stage('Test') {
            sh '''
            npm ci
            npx hardhat coverage
            '''
        }

        if(buildInfo.versionNoPrefix != null){
            stage('Publish') {
            sh '''
            npm publish --access public --tag ${buildInfo.versionNoPrefix}
            '''
            }
        }

    }

}
