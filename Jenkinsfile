pipeline {
    agent any

    environment {
        DOCKER_IMAGE = "teller-api"
        DOCKER_TAG = "${env.BUILD_NUMBER}"
        APP_PORT = "8000"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Lint & Style') {
            steps {
                sh 'npm run lint'
            }
        }

        stage('Build Application') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh "docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} ."
                sh "docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_IMAGE}:latest"
            }
        }

        stage('Security Scan (Optional)') {
            steps {
                echo "Running security scan on ${DOCKER_IMAGE}:${DOCKER_TAG}..."
                // Example: trivy image ${DOCKER_IMAGE}:${DOCKER_TAG}
            }
        }

        stage('Test Run & Health Check') {
            steps {
                script {
                    try {
                        sh "docker run -d --name teller-preview -p ${APP_PORT}:${APP_PORT} ${DOCKER_IMAGE}:${DOCKER_TAG}"
                        echo "Waiting for service to start..."
                        sh "sleep 10"
                        sh "curl -f http://localhost:${APP_PORT}/health/liveness"
                        echo "Health check passed!"
                    } finally {
                        sh "docker stop teller-preview || true"
                        sh "docker rm teller-preview || true"
                    }
                }
            }
        }

        stage('Push Image') {
            steps {
                echo "Ready to push ${DOCKER_IMAGE}:${DOCKER_TAG} to registry."
                // sh "docker push ${DOCKER_IMAGE}:${DOCKER_TAG}"
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            echo "CI/CD Pipeline finished successfully!"
        }
        failure {
            echo "CI/CD Pipeline failed. Please check the logs."
        }
    }
}
