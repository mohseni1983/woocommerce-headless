# API Keys Update Summary

## ✅ Completed Steps

1. **Verified secret.yaml** - Contains updated API keys:
   - Consumer Key: `ck_87470022e09320692075b60a437999455aba3a99`
   - Consumer Secret: `cs_6924364c85e3f71afda2870054415b7af534963b`

2. **Applied secret to Kubernetes** - Secret updated successfully
   ```bash
   kubectl apply -f secret.yaml -n 30tel
   ```

3. **Restarted deployment** - All pods restarted and running
   ```bash
   kubectl rollout restart deployment/30tel-nextjs -n 30tel
   ```

4. **Verified environment variables** - Pods have correct API keys:
   - ✅ WOOCOMMERCE_URL: `http://wordpress.wordpress.svc.cluster.local`
   - ✅ WOOCOMMERCE_CONSUMER_KEY: `ck_87470022e09320692075b60a437999455aba3a99`
   - ✅ WOOCOMMERCE_CONSUMER_SECRET: `cs_6924364c85e3f71afda2870054415b7af534963b`

## ⚠️ Critical: Verify WordPress API Key Permissions

The API keys are now correctly configured in Kubernetes, but you **MUST** verify they have proper permissions in WordPress:

### Step 1: Access WordPress Admin
1. Go to your WordPress admin panel
2. Navigate to: **WooCommerce → Settings → Advanced → REST API**

### Step 2: Find Your API Key
- Look for Consumer Key: `ck_87470022e09320692075b60a437999455aba3a99`
- Check the **Permissions** column

### Step 3: Verify Permissions
The API key **MUST** have:
- ✅ **"Read"** (minimum required) OR
- ✅ **"Read/Write"** (also works)

If it shows:
- ❌ **"Write"** only - Won't work, needs Read
- ❌ **Blank/Empty** - Won't work
- ❌ **"Custom"** - May not have Read access

### Step 4: Fix Permissions (if needed)
1. Click on the API key to edit it
2. Change **Permissions** to **"Read"** or **"Read/Write"**
3. Click **Save** or **Update**

### Step 5: Verify User Role
The user associated with the API key must have:
- ✅ **Administrator** role OR
- ✅ **Editor** role

To check:
1. Go to **Users → All Users**
2. Find the user linked to your API key
3. Ensure they have Administrator or Editor role

## Test the Connection

After verifying WordPress permissions, test the API:

```bash
# Check pod logs for errors
kubectl logs -f deployment/30tel-nextjs -n 30tel

# Or test via API endpoint (if accessible)
curl https://30tel.com/api/test-connection
```

## Common Error Messages

### 401 Unauthorized
- **Cause**: API keys don't have "Read" permissions
- **Fix**: Set permissions to "Read" in WordPress

### "woocommerce_rest_cannot_view"
- **Cause**: User role doesn't have proper capabilities
- **Fix**: Change user role to Administrator

### 404 Not Found
- **Cause**: WordPress permalinks not configured
- **Fix**: Go to Settings → Permalinks → Select any option other than "Plain"

## Next Steps

1. ✅ Kubernetes secret updated
2. ✅ Deployment restarted
3. ⚠️ **Verify WordPress API key permissions** (CRITICAL!)
4. ⚠️ **Test API connection**

If errors persist after verifying WordPress permissions, check the troubleshooting guide: `API_KEYS_TROUBLESHOOTING.md`




