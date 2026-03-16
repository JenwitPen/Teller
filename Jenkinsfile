pipeline {
    agent any
    tools {
        nodejs 'node20' // ชื่อนี้ต้องตรงกับที่ตั้งไว้ใน Manage Jenkins > Tools
    }
    environment {
        DOCKER_IMAGE = "teller-api"
        DOCKER_TAG = "${env.BUILD_NUMBER}"
        APP_PORT = "8000"
        TEST_PORT = "8001" 
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

        // stage('Lint & Style') {
        //     steps {
        //         sh 'npm run lint'
        //     }
        // }

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
                // Example: sh "trivy image ${DOCKER_IMAGE}:${DOCKER_TAG}"
            }
        }

stage('Test Run & Health Check') {
            steps {
                script {
                    try {
                        sh "docker rm -f teller-preview || true"
                        // ไม่ต้องสร้างไฟล์แล้ว เรียกใช้ .env.dev ที่ติดมากับโค้ดได้เลย
                        sh "docker run -d --name teller-preview -p ${TEST_PORT}:${TEST_PORT} --env-file .env.dev ${DOCKER_IMAGE}:${DOCKER_TAG}"
                        
                        echo "Waiting for service to start..."
                        sh "sleep 15"
                        sh "curl -f http://host.docker.internal:${APP_PORT}/health/liveness"
                        echo "Health check passed!"
                    } catch (Exception e) {
                        echo "Health check failed! Fetching logs..."
                        sh "docker logs teller-preview"
                        throw e
                    } finally {
                        sh "docker stop teller-preview || true"
                        sh "docker rm teller-preview || true"
                    }
                }
            }
        }
 stage('Deploy Application') {
            steps {
                script {
                    echo "Deploying ${DOCKER_IMAGE}:${DOCKER_TAG} for dev..."
                    
                    sh "docker rm -f teller-api-dev || true"
                    
                    // เรียกใช้ .env.deploy ที่ติดมากับโค้ด
                    sh "docker run -d --name teller-api-dev --restart unless-stopped -p ${APP_PORT}:${APP_PORT} --env-file .env.dev ${DOCKER_IMAGE}:latest"
                    
                    echo "Deployment Successful! Application is running."
                }
            }
        }
    }
    post {
        always {
            cleanWs()
        }
        success {
            echo "CI/CD Pipeline finished and deployed successfully!"
        }
        failure {
            echo "CI/CD Pipeline failed. Please check the logs."
        }
    }
}
