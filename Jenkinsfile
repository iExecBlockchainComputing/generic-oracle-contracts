@Library('global-jenkins-library@2.0.0') _

node('docker') {

    def buildInfo = null

    stage('Build info') {
        buildInfo = getBuildInfo()
    }
        
    docker.image('node:16-alpine').inside {

        stage('Test') {
            checkout scm
            sh '''
            npm ci
            npx hardhat typechain
            npx hardhat coverage
            '''
            //mock versionNoPrefix
            buildInfo.versionNoPrefix = '0.0.0'
        }

        if(buildInfo.versionNoPrefix != null){
            stage('Publish') {
                sh 'npm version ' + buildInfo.versionNoPrefix
                sh 'npm publish --access public'
            }
        }

    }

}
