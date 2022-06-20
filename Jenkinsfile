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
            archiveArtifacts artifacts: 'coverage/'
        }

        if(buildInfo.versionNoPrefix != null){
            stage('Publish') {
                sh 'npm version ' + buildInfo.versionNoPrefix + ' --allow-same-version'
                try {
                    withCredentials([
                            string(credentialsId: 'JT_NPM_TOKEN', variable: 'AUTH_TOKEN')]) {
                        sh '''
                        echo "//registry.npmjs.org/:_authToken=$AUTH_TOKEN" > ~/.npmrc
                        npm publish --access public
                        '''
                    }
                } catch (e) {
                    println 'Failed to publish: $e'
                } finally {
                    sh 'rm ~/.npmrc'
                    println 'Removed NPM credentials'
                }
            }
        }

    }

}
