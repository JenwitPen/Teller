pipeline {
    agent any
    tools {
        nodejs 'node20' // ชื่อนี้ต้องตรงกับที่ตั้งไว้ใน Manage Jenkins > Tools
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
                // Example: sh "trivy image ${DOCKER_IMAGE}:${DOCKER_TAG}"
            }
        }

        stage('Test Run & Health Check') {
            steps {
                script {
                    try {
                        // 1. สร้างไฟล์ .env สำหรับเทสต์ ให้ชี้ไปที่ DB และ Redis บนเครื่อง Mac
                        sh '''
                        cat <<EOF > .env.test
DB_PORT=1433
DB_SERVER=host.docker.internal
DB_DATABASE=teller
DB_USER=sa
DB_PASSWORD=MyPass@word
DB_ENCRYPT=true
DB_MULTI_SUBNET_FAILOVER=true
DB_APPLICATION_INTENT=ReadWrite
REDIS_HOST=host.docker.internal
REDIS_PORT=6379
REDIS_PASSWORD=
CACHE_TTL_SECONDS=60
JWT_EXPIRATION=300
EOF
                        '''

                        // 2. รัน Container ชั่วคราวสำหรับเทสต์
                        sh "docker run -d --name teller-preview -p ${APP_PORT}:${APP_PORT} --env-file .env.test ${DOCKER_IMAGE}:${DOCKER_TAG}"
                        
                        echo "Waiting for service to start..."
                        sh "sleep 15" // เผื่อเวลาให้ NestJS ต่อ DB
                        
                        // 3. ยิง Health Check
                        sh "curl -f http://host.docker.internal:${APP_PORT}/health/liveness"
                        echo "Health check passed!"
                    } catch (Exception e) {
                        echo "Health check failed! Fetching container logs..."
                        sh "docker logs teller-preview"
                        throw e
                    } finally {
                        // 4. ล้าง Container ชั่วคราวและไฟล์ทิ้งเสมอ
                        sh "docker stop teller-preview || true"
                        sh "docker rm teller-preview || true"
                        sh "rm -f .env.test || true"
                    }
                }
            }
        }

        stage('Deploy Application') {
            steps {
                script {
                    echo "Deploying ${DOCKER_IMAGE}:${DOCKER_TAG} for production..."
                    
                    // 1. สร้างไฟล์ .env สำหรับรันจริง
                    sh '''
                    cat <<EOF > .env.deploy
DB_PORT=1433
DB_SERVER=host.docker.internal
DB_DATABASE=teller
DB_USER=sa
DB_PASSWORD=MyPass@word
DB_ENCRYPT=true
DB_MULTI_SUBNET_FAILOVER=true
DB_APPLICATION_INTENT=ReadWrite
REDIS_HOST=host.docker.internal
REDIS_PORT=6379
REDIS_PASSWORD=
CACHE_TTL_SECONDS=60
JWT_EXPIRATION=300
EOF
                    '''

                    // 2. ลบ Container ตัวเก่าที่รันอยู่ทิ้ง (ถ้ามี)
                    sh "docker rm -f teller-api-prod || true"

                    // 3. รัน Container ตัวใหม่แบบ Background และตั้งให้ออโต้รีสตาร์ท
                    sh "docker run -d --name teller-api-prod --restart unless-stopped -p ${APP_PORT}:${APP_PORT} --env-file .env.deploy ${DOCKER_IMAGE}:latest"

                    // 4. ลบไฟล์ .env ทิ้ง
                    sh "rm -f .env.deploy || true"
                    
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
