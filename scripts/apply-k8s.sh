#!/bin/bash
# Apply all Kubernetes manifests
# Usage: ./scripts/apply-k8s.sh [namespace]

set -e

NAMESPACE="${1:-30tel}"
KUBECTL="${KUBECTL:-kubectl}"

echo "=========================================="
echo "Applying Kubernetes Manifests"
echo "=========================================="
echo "Namespace: ${NAMESPACE}"
echo ""

# Check if kubectl is available
if ! command -v ${KUBECTL} &> /dev/null; then
    echo "❌ kubectl not found. Please install kubectl."
    exit 1
fi

# Create namespace if it doesn't exist
if ! ${KUBECTL} get namespace ${NAMESPACE} &>/dev/null; then
    echo "Creating namespace: ${NAMESPACE}"
    ${KUBECTL} create namespace ${NAMESPACE}
fi

# Apply manifests in order
echo "Step 1: Applying namespace..."
${KUBECTL} apply -f k8s/namespace.yaml

echo "Step 2: Applying configmap..."
${KUBECTL} apply -f k8s/configmap.yaml

echo "Step 3: Applying secrets..."
${KUBECTL} apply -f k8s/secret.yaml

echo "Step 4: Applying deployment..."
${KUBECTL} apply -f k8s/deployment.yaml

echo "Step 5: Applying service..."
${KUBECTL} apply -f k8s/service.yaml

echo "Step 6: Applying ingress..."
${KUBECTL} apply -f k8s/ingress.yaml

echo ""
echo "=========================================="
echo "✅ All manifests applied!"
echo "=========================================="
echo ""
echo "To check status:"
echo "  kubectl get all -n ${NAMESPACE}"
echo ""

