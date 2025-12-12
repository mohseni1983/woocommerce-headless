#!/bin/bash
# Build and push Docker image
# Usage: ./scripts/build-and-push.sh [tag]

set -e

# Configuration
REGISTRY="${REGISTRY:-192.168.160.60:30500}"
IMAGE_NAME="${IMAGE_NAME:-30tel-nextjs}"
TAG="${1:-latest}"
DOCKERFILE="${DOCKERFILE:-Dockerfile}"

FULL_IMAGE_TAG="${REGISTRY}/${IMAGE_NAME}:${TAG}"

echo "=========================================="
echo "Building and Pushing Docker Image"
echo "=========================================="
echo "Image: ${FULL_IMAGE_TAG}"
echo "Registry: ${REGISTRY}"
echo ""

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install Docker."
    exit 1
fi

# Build the image
echo "Step 1: Building Docker image..."
docker build \
    -t ${FULL_IMAGE_TAG} \
    -f ${DOCKERFILE} \
    .

echo "✅ Image built successfully"
echo ""

# Tag as latest if not already
if [ "$TAG" != "latest" ]; then
    echo "Step 2: Tagging as latest..."
    docker tag ${FULL_IMAGE_TAG} ${REGISTRY}/${IMAGE_NAME}:latest
    echo "✅ Tagged as latest"
    echo ""
fi

# Detect Docker installation method
DOCKER_TYPE="systemd"
DAEMON_JSON="/etc/docker/daemon.json"
RESTART_CMD="systemctl restart docker"

if snap list docker &>/dev/null; then
    DOCKER_TYPE="snap"
    DAEMON_JSON="/var/snap/docker/current/config/daemon.json"
    RESTART_CMD="snap restart docker"
fi

# Configure Docker for insecure registry (if needed)
echo "Step 3: Configuring Docker for registry..."
if [ -f "$DAEMON_JSON" ]; then
    echo "⚠️  $DAEMON_JSON exists. Please ensure insecure-registries is configured."
    echo "   Add: {\"insecure-registries\": [\"${REGISTRY}\"]}"
else
    echo "⚠️  Note: If push fails, configure insecure registry:"
    if [ "$DOCKER_TYPE" = "snap" ]; then
        echo "   Run: sudo ./scripts/configure-docker-registry.sh"
        echo "   Or manually:"
        echo "   sudo mkdir -p $(dirname $DAEMON_JSON)"
        echo "   echo '{\"insecure-registries\": [\"${REGISTRY}\"]}' | sudo tee $DAEMON_JSON"
        echo "   sudo snap restart docker"
    else
        echo "   sudo mkdir -p $(dirname $DAEMON_JSON)"
        echo "   echo '{\"insecure-registries\": [\"${REGISTRY}\"]}' | sudo tee $DAEMON_JSON"
        echo "   sudo systemctl restart docker"
    fi
fi

# Push the image
echo "Step 4: Pushing image to registry..."
if docker push ${FULL_IMAGE_TAG} 2>&1 | grep -q "server gave HTTP response to HTTPS client"; then
    echo "❌ Push failed: Registry uses HTTP but Docker is configured for HTTPS"
    echo ""
    echo "🔧 SOLUTION: Configure Docker for insecure registry"
    echo ""
    if [ "$DOCKER_TYPE" = "snap" ]; then
        echo "Docker is installed via snap. Run:"
        echo "  sudo ./scripts/configure-docker-registry.sh"
        echo ""
        echo "Or manually:"
        echo "  sudo mkdir -p $(dirname $DAEMON_JSON)"
        echo "  echo '{\"insecure-registries\": [\"${REGISTRY}\"]}' | sudo tee $DAEMON_JSON"
        echo "  sudo snap restart docker"
    else
        echo "Run these commands:"
        echo "  sudo mkdir -p $(dirname $DAEMON_JSON)"
        echo "  echo '{\"insecure-registries\": [\"${REGISTRY}\"]}' | sudo tee $DAEMON_JSON"
        echo "  sudo systemctl restart docker"
    fi
    echo ""
    echo "Then run this script again."
    exit 1
fi

if [ "$TAG" != "latest" ]; then
    docker push ${REGISTRY}/${IMAGE_NAME}:latest || echo "⚠️  Failed to push latest tag (non-critical)"
fi

echo "✅ Image pushed successfully"
echo ""

echo "=========================================="
echo "✅ Build and Push Complete!"
echo "=========================================="
echo ""
echo "Image: ${FULL_IMAGE_TAG}"
echo ""
echo "To deploy:"
echo "  ./scripts/deploy.sh ${NAMESPACE:-30tel} ${TAG}"
echo ""

