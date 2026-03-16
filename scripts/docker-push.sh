#!/bin/bash

# Exit on any error
set -e

# Check if Docker Hub username is provided
if [ -z "$1" ]; then
  echo "Usage: npm run docker:push <dockerhub-username>"
  echo "Example: npm run docker:push myusername"
  exit 1
fi

DOCKER_USERNAME=$1
IMAGE_NAME="teller-api"
IMAGE_TAG="latest"

echo "Tagging image for Docker Hub..."
docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${DOCKER_USERNAME}/${IMAGE_NAME}:${IMAGE_TAG}

echo "Pushing image to Docker Hub..."
docker push ${DOCKER_USERNAME}/${IMAGE_NAME}:${IMAGE_TAG}

echo "Success! Image available at ${DOCKER_USERNAME}/${IMAGE_NAME}:${IMAGE_TAG}"
