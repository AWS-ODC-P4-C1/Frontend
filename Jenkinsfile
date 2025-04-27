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
      steps {
        sh '''
        cd backend/odc
        docker compose build
        docker tag backend madicke12/backend:latest
        docker tag frontend madicke12/frontend:latest
        docker push madicke12/backend:latest
        docker push madicke12/frontend:latest

        # Notify the EC2 server
        curl -X POST -H "Content-Type: application/json" -d '{}' ec2-54-191-62-131.us-west-2.compute.amazonaws.com:5000/webhook

        '''
      }
    }
  }

  environment {
    BACKEND_URL = 'https://github.com/AWS-ODC-P4-C1/Backend.git'
    FRONTEND_URL = 'https://github.com/AWS-ODC-P4-C1/Frontend.git'
    PATH = "/usr/local/bin:$PATH"
  }
}
