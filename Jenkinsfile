pipeline {
    agent any
tools {
        nodejs 'node20' // 👈 ชื่อนี้ต้องตรงกับช่อง Name ในหน้า Tools (ข้อ 1)
    }
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
                // Example: trivy image ${DOCKER_IMAGE}:${DOCKER_TAG}
            }
        }

        stage('Test Run & Health Check') {
            steps {
                script {
                    try {
                        // 1. สั่งรัน Container
                        sh "docker run -d --name teller-preview -p ${APP_PORT}:${APP_PORT} ${DOCKER_IMAGE}:${DOCKER_TAG}"
                        echo "Waiting for service to start..."
                        
                        // 2. เพิ่มเวลาเผื่อให้ NestJS บูทเสร็จ (เปลี่ยนจาก 10 เป็น 15-20 วินาที)
                        sh "sleep 15"
                        
                        // 3. เปลี่ยน localhost เป็น host.docker.internal (สำหรับ Mac)
                        sh "curl -f http://host.docker.internal:${APP_PORT}/health/liveness"
                        
                        echo "Health check passed!"
                    } catch (Exception e) {
                        // 4. ถ้า Health Check พัง ให้ปริ้นท์ Log ของแอปออกมาดูก่อนลบทิ้ง
                        echo "Health check failed! Fetching container logs..."
                        sh "docker logs teller-preview"
                        throw e // โยน Error กลับไปให้ Pipeline แจ้งเตือนว่า Failed
                    } finally {
                        // 5. ล้าง Container ทิ้งเสมอ ไม่ว่าจะผ่านหรือพัง
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
