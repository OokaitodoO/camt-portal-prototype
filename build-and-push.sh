#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if Docker is installed
if ! command_exists docker; then
    print_error "Docker is not installed or not in PATH"
    exit 1
fi

# Check if Docker daemon is running
if ! docker info >/dev/null 2>&1; then
    print_error "Docker daemon is not running"
    exit 1
fi

print_info "Docker Build and Push Script"
echo "======================================"

# Get user inputs
read -p "Enter your Docker Hub username: " DOCKER_USERNAME
if [ -z "$DOCKER_USERNAME" ]; then
    print_error "Username cannot be empty"
    exit 1
fi

read -p "Enter repository name: " REPO_NAME
if [ -z "$REPO_NAME" ]; then
    print_error "Repository name cannot be empty"
    exit 1
fi

read -p "Enter image tag (default: latest): " IMAGE_TAG
IMAGE_TAG=${IMAGE_TAG:-latest}

read -p "Enter build target (development/ci/deploy, default: deploy): " BUILD_TARGET
BUILD_TARGET=${BUILD_TARGET:-deploy}

# Validate build target
if [[ ! "$BUILD_TARGET" =~ ^(development|ci|deploy)$ ]]; then
    print_error "Invalid build target. Must be one of: development, ci, deploy"
    exit 1
fi

# Get build arguments for development target
if [ "$BUILD_TARGET" = "development" ]; then
    read -p "Enter USER_ID (default: $(id -u)): " USER_ID
    USER_ID=${USER_ID:-$(id -u)}
    
    read -p "Enter GROUP_ID (default: $(id -g)): " GROUP_ID
    GROUP_ID=${GROUP_ID:-$(id -g)}
    
    BUILD_ARGS="--build-arg USER_ID=$USER_ID --build-arg GROUP_ID=$GROUP_ID"
else
    BUILD_ARGS=""
fi

# Construct full image name
FULL_IMAGE_NAME="$DOCKER_USERNAME/$REPO_NAME:$IMAGE_TAG"

print_info "Configuration:"
echo "  Username: $DOCKER_USERNAME"
echo "  Repository: $REPO_NAME"
echo "  Tag: $IMAGE_TAG"
echo "  Build Target: $BUILD_TARGET"
echo "  Full Image Name: $FULL_IMAGE_NAME"

# Confirm before proceeding
echo ""
read -p "Do you want to proceed with the build and push? (y/N): " CONFIRM
if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
    print_info "Operation cancelled"
    exit 0
fi

# Docker Hub Login
print_info "Logging into Docker Hub..."
echo "Please enter your Docker Hub credentials:"

# Try to login
if ! docker login; then
    print_error "Failed to login to Docker Hub"
    exit 1
fi

print_success "Successfully logged into Docker Hub"

# Build the Docker image
print_info "Building Docker image: $FULL_IMAGE_NAME"
print_info "Build target: $BUILD_TARGET"

if [ -n "$BUILD_ARGS" ]; then
    print_info "Build arguments: $BUILD_ARGS"
    BUILD_COMMAND="docker build $BUILD_ARGS --target $BUILD_TARGET -t $FULL_IMAGE_NAME ."
else
    BUILD_COMMAND="docker build --target $BUILD_TARGET -t $FULL_IMAGE_NAME ."
fi

print_info "Executing: $BUILD_COMMAND"

if eval $BUILD_COMMAND; then
    print_success "Docker image built successfully"
else
    print_error "Failed to build Docker image"
    exit 1
fi

# Ask if user wants to push immediately
echo ""
read -p "Do you want to push the image to Docker Hub now? (Y/n): " PUSH_CONFIRM
if [[ ! "$PUSH_CONFIRM" =~ ^[Nn]$ ]]; then
    # Push the image
    print_info "Pushing image to Docker Hub: $FULL_IMAGE_NAME"
    
    if docker push "$FULL_IMAGE_NAME"; then
        print_success "Image pushed successfully to Docker Hub"
        print_info "Image available at: https://hub.docker.com/r/$DOCKER_USERNAME/$REPO_NAME"
        
        # Trigger deployment webhook
        print_info "Triggering deployment webhook..."
        WEBHOOK_URL="https://dev.camt.cmu.ac.th/api/stacks/webhooks/7e231d6e-b64a-490b-b208-aa85b8203073"
        
        if curl -X POST "$WEBHOOK_URL" -H "Content-Type: application/json" -d "{\"image\":\"$FULL_IMAGE_NAME\",\"tag\":\"$IMAGE_TAG\"}" --silent --show-error --fail; then
            print_success "Deployment webhook triggered successfully"
        else
            print_warning "Failed to trigger deployment webhook, but image was pushed successfully"
            print_info "You can manually trigger deployment at: $WEBHOOK_URL"
        fi
    else
        print_error "Failed to push image to Docker Hub"
        exit 1
    fi
else
    print_info "Skipping push. You can push later with:"
    print_info "docker push $FULL_IMAGE_NAME"
fi

# Show image details
print_info "Image details:"
docker images "$FULL_IMAGE_NAME" --format "table {{.Repository}}\t{{.Tag}}\t{{.ID}}\t{{.CreatedAt}}\t{{.Size}}"

print_success "Script completed successfully!"

# Optional: Clean up old images
echo ""
read -p "Do you want to clean up dangling images? (y/N): " CLEANUP_CONFIRM
if [[ "$CLEANUP_CONFIRM" =~ ^[Yy]$ ]]; then
    print_info "Cleaning up dangling images..."
    docker image prune -f
    print_success "Cleanup completed"
fi

print_info "Done!" 