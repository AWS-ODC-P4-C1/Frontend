pipeline {
  agent any

  environment {
    BACKEND_URL = 'https://github.com/AWS-ODC-P4-C1/Backend.git'
    FRONTEND_URL = 'https://github.com/AWS-ODC-P4-C1/Frontend.git'
    PATH = "/usr/local/bin:$PATH"
    SONARQUBE_ENV = 'sonar1'  // Replace with the name of your SonarQube server in Jenkins config
  }

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
        '''
      }
    }

    stage('SonarQube Analysis for backend') {
      steps {
        dir('backend') {
          withSonarQubeEnv("${SONARQUBE_ENV}") {
            sh '''
              sonar-scanner \
                -Dsonar.projectKey=odc-backend \
                -Dsonar.sources=. \
                -Dsonar.exclusions=**/venv/**,**/migrations/**,**/tests/**,**/static/**,**/templates/**,**/__pycache__/**,manage.py \
                -Dsonar.host.url=$SONAR_HOST_URL \
                -Dsonar.login=$SONAR_AUTH_TOKEN
            '''
          }
        }
      }
    }
    stage('wait for SonarQube analysis') {
      steps {
        script {
          timeout(time: 2, unit: 'MINUTES') {
            waitForQualityGate abortPipeline: true
          }
        }
      }
    }
  stage ('SonarQube Analysis for frontend') {
      steps {
        dir('frontend') {
          withSonarQubeEnv("${SONARQUBE_ENV}") {
            sh '''
              sonar-scanner \
                -Dsonar.projectKey=odc-frontend \
                -Dsonar.sources=. \
                -Dsonar.exclusions=**/node_modules/**,**/dist/**,**/build/**,**/coverage/**,**/__tests__/** \
                -Dsonar.host.url=$SONAR_HOST_URL \
                -Dsonar.login=$SONAR_AUTH_TOKEN
            '''
          }
        }
      }
    }


    stage("Quality Gate") {
      steps {
        timeout(time: 2, unit: 'MINUTES') {
          waitForQualityGate abortPipeline: true
        }
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

          curl -X POST -H "Content-Type: application/json" -d '{}' ec2-54-191-62-131.us-west-2.compute.amazonaws.com:5000/webhook
        '''
      }
    }
  }
}
