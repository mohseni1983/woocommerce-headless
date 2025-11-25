# ✅ Problem Solved - WooCommerce API Connection

## Summary

**Status**: ✅ **FIXED AND WORKING**

The Next.js application can now successfully connect to WooCommerce and retrieve products!

## The Root Cause

The problem was **NOT** in the Next.js code or API keys, but in the **WordPress URL configuration**.

### What Was Wrong

- **ConfigMap was using**: `http://wordpress.wordpress.svc.cluster.local` (internal Kubernetes service)
- **This internal WordPress**: Did NOT have the API keys configured
- **External WordPress**: `https://app.30tel.com` HAS the API keys configured and working

### The Two WordPress Instances

1. **Internal WordPress** (`wordpress.wordpress.svc.cluster.local`)
   - Running in the `wordpress` namespace
   - Did NOT have the WooCommerce API keys: `ck_de1e09ad6c48903c9231dfca2c363296741b1814`
   - Returned 401 errors

2. **External WordPress** (`https://app.30tel.com`)
   - The production WordPress instance
   - HAS the correct API keys configured
   - Returns products successfully

## The Solution

Changed the `WOOCOMMERCE_URL` in ConfigMap from internal service to external URL:

**Before**:
```yaml
WOOCOMMERCE_URL: "http://wordpress.wordpress.svc.cluster.local"
```

**After**:
```yaml
WOOCOMMERCE_URL: "https://app.30tel.com"
```

## Verification

### Test Results

```bash
Testing from pod: 30tel-nextjs-74846556d-h5r8q
URL: https://app.30tel.com/wp-json/wc/v3/products?per_page=3
Status: 200
✅✅✅ SUCCESS! ✅✅✅
Products returned: 3
  1. ساعت هوشمند اپل Apple Watch Series 9
  2. پایه نگهدارنده موبایل خودرو
  3. کابل USB Type-C به USB Type-C 2 متر
```

## Changes Made

1. **Updated API Keys** (`k8s/secret.yaml`):
   ```yaml
   WOOCOMMERCE_CONSUMER_KEY: "ck_de1e09ad6c48903c9231dfca2c363296741b1814"
   WOOCOMMERCE_CONSUMER_SECRET: "cs_6e74ebe7d1929af3184a3d14b431873682324186"
   ```

2. **Updated WordPress URL** (`k8s/configmap.yaml`):
   ```yaml
   WOOCOMMERCE_URL: "https://app.30tel.com"
   ```

3. **Applied Changes**:
   ```bash
   kubectl apply -f k8s/secret.yaml
   kubectl apply -f k8s/configmap.yaml
   kubectl rollout restart deployment/30tel-nextjs -n 30tel
   ```

## Current Status

- ✅ **Pod Status**: Running (1/1 Ready)
- ✅ **WooCommerce API**: Connected and working
- ✅ **Products**: Successfully retrieved
- ✅ **API Keys**: Valid and have proper permissions
- ✅ **Application**: Fully functional

## Next Steps

The application is now working correctly. No further action needed.

### Optional: Use Internal WordPress (if needed)

If you want to use the internal WordPress service instead, you need to:

1. Access the internal WordPress admin
2. Create the same API keys there
3. Configure with Read permissions
4. Then you can switch back to internal URL

But the current setup using the external URL is working perfectly and is recommended.

## Files Modified

- `/home/mohseni/projects/30tel/woocommerce-headless/k8s/secret.yaml` - Updated API keys
- `/home/mohseni/projects/30tel/woocommerce-headless/k8s/configmap.yaml` - Updated WordPress URL

## Deployment Status

```
NAME                            READY   STATUS    RESTARTS   AGE
30tel-nextjs-74846556d-h5r8q    1/1     Running   0          2m
```

Application is live and serving traffic at: **https://30tel.com**


