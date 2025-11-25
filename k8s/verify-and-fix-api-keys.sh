#!/bin/bash
# Script to verify and fix WooCommerce API keys in Kubernetes

set -e

NAMESPACE="30tel"
SECRET_NAME="30tel-secrets"
DEPLOYMENT_NAME="30tel-nextjs"

echo "=========================================="
echo "WooCommerce API Keys Verification & Fix"
echo "=========================================="
echo ""

# Step 1: Check if secret exists
echo "Step 1: Checking if secret exists..."
if kubectl get secret $SECRET_NAME -n $NAMESPACE &>/dev/null; then
    echo "✅ Secret exists"
    
    # Show current keys (masked)
    echo ""
    echo "Current API keys in Kubernetes secret:"
    CURRENT_KEY=$(kubectl get secret $SECRET_NAME -n $NAMESPACE -o jsonpath='{.data.WOOCOMMERCE_CONSUMER_KEY}' | base64 -d)
    CURRENT_SECRET=$(kubectl get secret $SECRET_NAME -n $NAMESPACE -o jsonpath='{.data.WOOCOMMERCE_CONSUMER_SECRET}' | base64 -d)
    
    if [ -n "$CURRENT_KEY" ]; then
        echo "  Consumer Key: ${CURRENT_KEY:0:15}...${CURRENT_KEY: -5}"
    else
        echo "  ❌ Consumer Key: NOT SET"
    fi
    
    if [ -n "$CURRENT_SECRET" ]; then
        echo "  Consumer Secret: ${CURRENT_SECRET:0:15}...${CURRENT_SECRET: -5}"
    else
        echo "  ❌ Consumer Secret: NOT SET"
    fi
else
    echo "❌ Secret does not exist. Creating from secret.yaml..."
    kubectl apply -f secret.yaml
    echo "✅ Secret created"
fi

echo ""
echo "Step 2: Checking secret.yaml file..."
if [ -f "secret.yaml" ]; then
    echo "✅ secret.yaml exists"
    
    # Extract keys from secret.yaml
    FILE_KEY=$(grep "WOOCOMMERCE_CONSUMER_KEY:" secret.yaml | sed 's/.*WOOCOMMERCE_CONSUMER_KEY: "\(.*\)"/\1/')
    FILE_SECRET=$(grep "WOOCOMMERCE_CONSUMER_SECRET:" secret.yaml | sed 's/.*WOOCOMMERCE_CONSUMER_SECRET: "\(.*\)"/\1/')
    
    if [ -n "$FILE_KEY" ] && [ -n "$FILE_SECRET" ]; then
        echo "  Consumer Key in file: ${FILE_KEY:0:15}...${FILE_KEY: -5}"
        echo "  Consumer Secret in file: ${FILE_SECRET:0:15}...${FILE_SECRET: -5}"
        
        # Check if keys match
        if [ "$CURRENT_KEY" != "$FILE_KEY" ] || [ "$CURRENT_SECRET" != "$FILE_SECRET" ]; then
            echo ""
            echo "⚠️  Keys in secret.yaml differ from Kubernetes secret!"
            echo "   Updating Kubernetes secret..."
            kubectl apply -f secret.yaml
            echo "✅ Secret updated"
        else
            echo "✅ Keys match between file and Kubernetes"
        fi
    else
        echo "❌ Keys not found in secret.yaml"
        exit 1
    fi
else
    echo "❌ secret.yaml not found"
    exit 1
fi

echo ""
echo "Step 3: Checking deployment..."
if kubectl get deployment $DEPLOYMENT_NAME -n $NAMESPACE &>/dev/null; then
    echo "✅ Deployment exists"
    
    # Check if pods are using the secret
    echo ""
    echo "Step 4: Restarting deployment to pick up new secret values..."
    kubectl rollout restart deployment/$DEPLOYMENT_NAME -n $NAMESPACE
    echo "✅ Deployment restarted"
    
    echo ""
    echo "Waiting for rollout to complete..."
    kubectl rollout status deployment/$DEPLOYMENT_NAME -n $NAMESPACE --timeout=120s
    
    echo ""
    echo "Step 5: Verifying pods are running..."
    sleep 5
    kubectl get pods -n $NAMESPACE -l app=30tel-nextjs
    
    echo ""
    echo "=========================================="
    echo "✅ Secret update complete!"
    echo "=========================================="
    echo ""
    echo "Next steps:"
    echo "1. Verify API keys have 'Read' permissions in WordPress:"
    echo "   - Go to WordPress Admin → WooCommerce → Settings → Advanced → REST API"
    echo "   - Find your API key (Consumer Key: ${FILE_KEY:0:15}...)"
    echo "   - Ensure it has 'Read' permissions"
    echo ""
    echo "2. Test the API connection:"
    echo "   - Check pod logs: kubectl logs -f deployment/$DEPLOYMENT_NAME -n $NAMESPACE"
    echo "   - Or test endpoint: curl https://30tel.com/api/test-connection"
    echo ""
else
    echo "❌ Deployment not found"
    echo "   Apply deployment: kubectl apply -f deployment.yaml"
fi




