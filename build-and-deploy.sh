#!/bin/bash
# Build and deploy Next.js application to Kubernetes

set -e

# Configuration
REGISTRY="192.168.160.60:30500"
IMAGE_NAME="30tel-nextjs"
NAMESPACE="30tel"
DEPLOYMENT_NAME="30tel-nextjs"

# Generate timestamp tag
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
IMAGE_TAG="${REGISTRY}/${IMAGE_NAME}:${TIMESTAMP}"
LATEST_TAG="${REGISTRY}/${IMAGE_NAME}:latest"

echo "=========================================="
echo "Building and Deploying Next.js Application"
echo "=========================================="
echo ""
echo "Image: ${IMAGE_TAG}"
echo "Registry: ${REGISTRY}"
echo ""

# Step 1: Build the Docker image
echo "Step 1: Building Docker image..."
cd "$(dirname "$0")"
docker build -t ${IMAGE_TAG} -t ${LATEST_TAG} -f Dockerfile .
echo "✅ Image built successfully"
echo ""

# Step 2: Push to registry
echo "Step 2: Pushing image to registry..."
if docker push ${IMAGE_TAG} 2>&1 | grep -q "server gave HTTP response to HTTPS client"; then
    echo "⚠️  Registry uses HTTP, attempting workaround..."
    echo "   If push fails, you may need to:"
    echo "   1. Configure Docker daemon with insecure-registries"
    echo "   2. Or manually push: docker push ${IMAGE_TAG}"
    echo ""
    # Try pushing anyway - might work if registry is configured
    docker push ${IMAGE_TAG} || echo "⚠️  Push failed, but continuing..."
    docker push ${LATEST_TAG} || echo "⚠️  Push failed, but continuing..."
else
    docker push ${IMAGE_TAG}
    docker push ${LATEST_TAG}
    echo "✅ Image pushed successfully"
fi
echo ""

# Step 3: Update deployment with new image
echo "Step 3: Updating Kubernetes deployment..."
kubectl set image deployment/${DEPLOYMENT_NAME} \
  nextjs=${IMAGE_TAG} \
  -n ${NAMESPACE}
echo "✅ Deployment updated"
echo ""

# Step 4: Wait for rollout
echo "Step 4: Waiting for rollout to complete..."
kubectl rollout status deployment/${DEPLOYMENT_NAME} -n ${NAMESPACE} --timeout=300s
echo "✅ Rollout completed"
echo ""

# Step 5: Verify deployment
echo "Step 5: Verifying deployment..."
kubectl get deployment ${DEPLOYMENT_NAME} -n ${NAMESPACE}
echo ""
kubectl get pods -n ${NAMESPACE} -l app=${IMAGE_NAME}
echo ""

# Step 6: Show logs
echo "Step 6: Recent pod logs (last 20 lines)..."
POD_NAME=$(kubectl get pods -n ${NAMESPACE} -l app=${IMAGE_NAME} -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
if [ -n "$POD_NAME" ]; then
    kubectl logs ${POD_NAME} -n ${NAMESPACE} --tail=20
else
    echo "⚠️  No pods found yet"
fi

echo ""
echo "=========================================="
echo "✅ Deployment Complete!"
echo "=========================================="
echo ""
echo "Image: ${IMAGE_TAG}"
echo "Latest: ${LATEST_TAG}"
echo ""
echo "To check logs:"
echo "  kubectl logs -f deployment/${DEPLOYMENT_NAME} -n ${NAMESPACE}"
echo ""
echo "To rollback if needed:"
echo "  kubectl rollout undo deployment/${DEPLOYMENT_NAME} -n ${NAMESPACE}"
echo ""

