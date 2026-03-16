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
                        // 1. สร้างไฟล์ .env สำหรับเทสต์ โดยแก้ DB_SERVER และ REDIS_HOST
                        sh '''
                        cat <<EOF > .env.test
                        # Database Configuration
                        DB_PORT=1433
                        DB_SERVER=host.docker.internal
                        DB_DATABASE=teller
                        DB_USER=sa
                        DB_PASSWORD=MyPass@word
                        DB_ENCRYPT=true
                        DB_MULTI_SUBNET_FAILOVER=true
                        DB_APPLICATION_INTENT=ReadWrite
                        
                        # Redis Configuration
                        REDIS_HOST=host.docker.internal
                        REDIS_PORT=6379
                        REDIS_PASSWORD=
                        
                        # Application Settings
                        CACHE_TTL_SECONDS=60
                        JWT_EXPIRATION=300
                        EOF
                                                '''

                        // 2. รัน Container พร้อมแนบไฟล์ .env.test เข้าไป
                        sh "docker run -d --name teller-preview -p ${APP_PORT}:${APP_PORT} --env-file .env.test ${DOCKER_IMAGE}:${DOCKER_TAG}"
                        
                        echo "Waiting for service to start..."
                        sh "sleep 15" // ให้เวลา NestJS ต่อ DB และ Redis
                        
                        // 3. ยิง Health Check
                        sh "curl -f http://host.docker.internal:${APP_PORT}/health/liveness"
                        echo "Health check passed!"
                    } catch (Exception e) {
                        echo "Health check failed! Fetching container logs..."
                        sh "docker logs teller-preview"
                        throw e
                    } finally {
                        // 4. ล้าง Container ทิ้ง
                        sh "docker stop teller-preview || true"
                        sh "docker rm teller-preview || true"
                        sh "rm -f .env.test || true" // ลบไฟล์ .env ชั่วคราวทิ้งด้วย
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
