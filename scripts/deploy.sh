#!/bin/bash
# Kubernetes deployment script
# Usage: ./scripts/deploy.sh [image-tag] [namespace]

set -e

# Configuration
REGISTRY="${REGISTRY:-192.168.160.60:30500}"
IMAGE_NAME="${IMAGE_NAME:-30tel-nextjs}"
NAMESPACE="${1:-30tel}"
IMAGE_TAG="${2:-latest}"
DEPLOYMENT_NAME="${DEPLOYMENT_NAME:-30tel-nextjs}"
KUBECTL="${KUBECTL:-kubectl}"

FULL_IMAGE_TAG="${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"

echo "=========================================="
echo "Deploying to Kubernetes"
echo "=========================================="
echo "Image: ${FULL_IMAGE_TAG}"
echo "Namespace: ${NAMESPACE}"
echo "Deployment: ${DEPLOYMENT_NAME}"
echo ""

# Check if kubectl is available
if ! command -v ${KUBECTL} &> /dev/null; then
    echo "❌ kubectl not found. Please install kubectl."
    exit 1
fi

# Check if namespace exists
if ! ${KUBECTL} get namespace ${NAMESPACE} &>/dev/null; then
    echo "⚠️  Namespace ${NAMESPACE} does not exist. Creating..."
    ${KUBECTL} create namespace ${NAMESPACE}
fi

# Check if deployment exists
if ! ${KUBECTL} get deployment ${DEPLOYMENT_NAME} -n ${NAMESPACE} &>/dev/null; then
    echo "⚠️  Deployment ${DEPLOYMENT_NAME} does not exist in namespace ${NAMESPACE}"
    echo "   Please apply the deployment first:"
    echo "   kubectl apply -f k8s/deployment.yaml -n ${NAMESPACE}"
    exit 1
fi

# Update deployment image
echo "Step 1: Updating deployment image..."
${KUBECTL} set image deployment/${DEPLOYMENT_NAME} \
    nextjs=${FULL_IMAGE_TAG} \
    -n ${NAMESPACE}

echo "✅ Deployment image updated"
echo ""

# Wait for rollout
echo "Step 2: Waiting for rollout to complete..."
${KUBECTL} rollout status deployment/${DEPLOYMENT_NAME} \
    -n ${NAMESPACE} \
    --timeout=300s

echo "✅ Rollout completed"
echo ""

# Verify deployment
echo "Step 3: Verifying deployment..."
${KUBECTL} get deployment ${DEPLOYMENT_NAME} -n ${NAMESPACE}
echo ""
${KUBECTL} get pods -n ${NAMESPACE} -l app=${DEPLOYMENT_NAME}
echo ""

# Health check
echo "Step 4: Performing health check..."
sleep 5
POD_NAME=$(${KUBECTL} get pods -n ${NAMESPACE} -l app=${DEPLOYMENT_NAME} -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)

if [ -n "$POD_NAME" ]; then
    echo "Pod: ${POD_NAME}"
    
    # Check pod status
    POD_STATUS=$(${KUBECTL} get pod ${POD_NAME} -n ${NAMESPACE} -o jsonpath='{.status.phase}')
    echo "Pod status: ${POD_STATUS}"
    
    if [ "$POD_STATUS" = "Running" ]; then
        echo "✅ Pod is running"
        
        # Try health check endpoint
        if ${KUBECTL} exec ${POD_NAME} -n ${NAMESPACE} -- wget -q -O- http://localhost:3000/api/health &>/dev/null; then
            echo "✅ Health check passed"
        else
            echo "⚠️  Health check endpoint not available (this is OK if endpoint doesn't exist)"
        fi
    else
        echo "⚠️  Pod is not running. Status: ${POD_STATUS}"
    fi
else
    echo "⚠️  No pods found"
fi

echo ""
echo "=========================================="
echo "✅ Deployment Complete!"
echo "=========================================="
echo ""
echo "To check logs:"
echo "  kubectl logs -f deployment/${DEPLOYMENT_NAME} -n ${NAMESPACE}"
echo ""
echo "To rollback if needed:"
echo "  kubectl rollout undo deployment/${DEPLOYMENT_NAME} -n ${NAMESPACE}"
echo ""

