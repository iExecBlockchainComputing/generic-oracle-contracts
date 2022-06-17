@Library('global-jenkins-library@2.0.0') _

node('docker') {

    def buildInfo = null

    stage('Git checkout') {
        buildInfo = getBuildInfo()
    }
        
    docker.image('node:16-alpine').inside {

        stage('Test') {
            checkout scm
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
