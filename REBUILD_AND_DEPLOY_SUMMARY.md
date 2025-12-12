# Rebuild and Deploy Summary

## ✅ Completed Steps

1. **Image Built Successfully**
   - Image: `192.168.160.60:30500/30tel-nextjs:20251124-144525`
   - Latest: `192.168.160.60:30500/30tel-nextjs:latest`
   - Build completed successfully

2. **Deployment Reverted**
   - Reverted to previous working image
   - Pod is running with old image

## ⚠️ Required: Push Image to Registry

The image was built but **not pushed** to the registry. Kubernetes cannot pull it until it's pushed.

### Step 1: Configure Docker for Insecure Registry

The registry `192.168.160.60:30500` uses HTTP, not HTTPS. Configure Docker:

```bash
# Edit Docker daemon configuration
sudo nano /etc/docker/daemon.json
```

Add this content (or merge with existing):
```json
{
  "insecure-registries": ["192.168.160.60:30500"]
}
```

Then restart Docker:
```bash
sudo systemctl restart docker
```

### Step 2: Push the Image

```bash
cd /home/mohseni/projects/30tel/woocommerce-headless

# Push both tags
docker push 192.168.160.60:30500/30tel-nextjs:20251124-144525
docker push 192.168.160.60:30500/30tel-nextjs:latest
```

### Step 3: Update Deployment

Once the image is pushed:

```bash
kubectl set image deployment/30tel-nextjs \
  nextjs=192.168.160.60:30500/30tel-nextjs:20251124-144525 \
  -n 30tel

# Wait for rollout
kubectl rollout status deployment/30tel-nextjs -n 30tel --timeout=300s

# Verify
kubectl get pods -n 30tel -l app=30tel-nextjs
```

## Alternative: Use Latest Tag

If you prefer to use `:latest` tag:

```bash
# After pushing latest tag
kubectl set image deployment/30tel-nextjs \
  nextjs=192.168.160.60:30500/30tel-nextjs:latest \
  -n 30tel
```

## Verify New Image Works

After deployment:

```bash
# Check pod logs for API connection
kubectl logs -f deployment/30tel-nextjs -n 30tel | grep -E "WooCommerce|API|error|401"

# Test from inside pod
POD_NAME=$(kubectl get pods -n 30tel -l app=30tel-nextjs -o jsonpath='{.items[0].metadata.name}')
kubectl exec $POD_NAME -n 30tel -- node -e "
const url = process.env.WOOCOMMERCE_URL + '/wp-json/wc/v3/products?per_page=1';
const key = process.env.WOOCOMMERCE_CONSUMER_KEY;
const secret = process.env.WOOCOMMERCE_CONSUMER_SECRET;
const auth = Buffer.from(key + ':' + secret).toString('base64');
fetch(url, { headers: { 'Authorization': 'Basic ' + auth } })
  .then(async r => {
    const text = await r.text();
    console.log('Status:', r.status);
    if (r.ok) {
      console.log('✅ SUCCESS!');
    } else {
      console.log('Response:', text.substring(0, 300));
    }
  });
"
```

## Quick Commands Summary

```bash
# 1. Configure Docker (if not done)
sudo nano /etc/docker/daemon.json  # Add insecure-registries
sudo systemctl restart docker

# 2. Push image
cd /home/mohseni/projects/30tel/woocommerce-headless
docker push 192.168.160.60:30500/30tel-nextjs:20251124-144525
docker push 192.168.160.60:30500/30tel-nextjs:latest

# 3. Deploy
kubectl set image deployment/30tel-nextjs nextjs=192.168.160.60:30500/30tel-nextjs:20251124-144525 -n 30tel
kubectl rollout status deployment/30tel-nextjs -n 30tel

# 4. Verify
kubectl get pods -n 30tel -l app=30tel-nextjs
kubectl logs -f deployment/30tel-nextjs -n 30tel
```

## Current Status

- ✅ Image built locally
- ⚠️ Image needs to be pushed to registry
- ✅ Deployment reverted to working state
- ⏳ Waiting for image push to complete deployment



