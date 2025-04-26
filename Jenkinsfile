pipeline {
  agent any
  stages {
    stage('Checkout') {
      steps {
        dir(path: 'backend') {
          git(branch: 'madicke', url: "${BACKEND_URL}")
        }

        dir(path: 'frontend') {
          git(branch: 'dev', url: "${FRONTEND_URL}")
        }
      }
    }

    stage('Test frontend') {
      steps {
        sh '''
        cd frontend
        npm install
        npm run test
        cd ..
        '''
      }
    }

    stage('Build images and Run containers') {
      when {
        expression {
          currentBuild.result == null || currentBuild.result == 'SUCCESS'
        }
      }
      steps {
        sh '''
        cd backend/odc
        /usr/local/bin/docker compose up --build
        '''
      }
    }
  }

  environment {
    BACKEND_URL = 'https://github.com/AWS-ODC-P4-C1/Backend.git'
    FRONTEND_URL = 'https://github.com/AWS-ODC-P4-C1/Frontend.git'
  }
}
