# WooCommerce API Keys Troubleshooting Guide

## Problem: Updated API Keys But Errors Still Exist

After updating API keys in `secret.yaml`, you may still see errors. This is because:

1. **Kubernetes secrets are not automatically updated** - You must apply the secret
2. **Pods need to be restarted** - Running pods don't pick up secret changes automatically
3. **API keys may not have proper permissions** - Keys need "Read" permissions in WordPress

## Quick Fix Steps

### Step 1: Apply Updated Secret to Kubernetes

```bash
cd /home/mohseni/projects/30tel/woocommerce-headless/k8s
kubectl apply -f secret.yaml -n 30tel
```

### Step 2: Restart Deployment

```bash
kubectl rollout restart deployment/30tel-nextjs -n 30tel
kubectl rollout status deployment/30tel-nextjs -n 30tel
```

### Step 3: Verify Secret is Applied

```bash
# Check current secret values (keys will be base64 encoded)
kubectl get secret 30tel-secrets -n 30tel -o yaml

# Decode and view (masked)
kubectl get secret 30tel-secrets -n 30tel -o jsonpath='{.data.WOOCOMMERCE_CONSUMER_KEY}' | base64 -d | head -c 20 && echo "..."
kubectl get secret 30tel-secrets -n 30tel -o jsonpath='{.data.WOOCOMMERCE_CONSUMER_SECRET}' | base64 -d | head -c 20 && echo "..."
```

### Step 4: Check Pod Environment Variables

```bash
# Get a pod name
POD_NAME=$(kubectl get pods -n 30tel -l app=30tel-nextjs -o jsonpath='{.items[0].metadata.name}')

# Check if environment variables are set
kubectl exec $POD_NAME -n 30tel -- env | grep WOOCOMMERCE
```

### Step 5: Verify API Keys in WordPress

1. **Access WordPress Admin**
   - Go to your WordPress admin panel
   - Navigate to: **WooCommerce → Settings → Advanced → REST API**

2. **Find Your API Key**
   - Look for Consumer Key: `ck_87470022e09320692075b60a437999455aba3a99`
   - Check the **Permissions** column - it MUST say **"Read"** or **"Read/Write"**

3. **Verify User Role**
   - The user associated with the API key must have **Administrator** or **Editor** role
   - Go to **Users → All Users** and verify the user's role

### Step 6: Test API Connection

```bash
# Check pod logs for errors
kubectl logs -f deployment/30tel-nextjs -n 30tel

# Or test via API endpoint (if accessible)
curl https://30tel.com/api/test-connection
```

## Automated Fix Script

Use the provided script to automatically verify and fix:

```bash
cd /home/mohseni/projects/30tel/woocommerce-headless/k8s
./verify-and-fix-api-keys.sh
```

## Common Issues

### Issue 1: Secret Not Applied
**Symptom**: Pods still using old keys
**Fix**: Run `kubectl apply -f secret.yaml -n 30tel`

### Issue 2: Pods Not Restarted
**Symptom**: Environment variables unchanged in running pods
**Fix**: Run `kubectl rollout restart deployment/30tel-nextjs -n 30tel`

### Issue 3: API Keys Don't Have Read Permissions
**Symptom**: 401 Unauthorized errors
**Fix**: 
1. Go to WordPress Admin → WooCommerce → Settings → Advanced → REST API
2. Edit the API key and set Permissions to "Read"
3. Save changes

### Issue 4: User Role Issue
**Symptom**: Error message "woocommerce_rest_cannot_view"
**Fix**: 
1. Go to WordPress Admin → Users → All Users
2. Find the user linked to your API key
3. Change their role to "Administrator"

### Issue 5: Secret Format Issue
**Symptom**: Keys not being read correctly
**Fix**: Ensure `secret.yaml` uses `stringData` (not `data`) for plain text values

## Verification Checklist

- [ ] Secret applied to Kubernetes: `kubectl get secret 30tel-secrets -n 30tel`
- [ ] Deployment restarted: `kubectl rollout status deployment/30tel-nextjs -n 30tel`
- [ ] Pods are running: `kubectl get pods -n 30tel`
- [ ] Environment variables set: Check pod env vars
- [ ] API keys have Read permissions in WordPress
- [ ] User has Administrator role in WordPress
- [ ] Test connection returns success: `/api/test-connection`

## Current API Keys

From `secret.yaml`:
- **Consumer Key**: `ck_87470022e09320692075b60a437999455aba3a99`
- **Consumer Secret**: `cs_6924364c85e3f71afda2870054415b7af534963b`

**Important**: These keys must have "Read" permissions in WordPress!




