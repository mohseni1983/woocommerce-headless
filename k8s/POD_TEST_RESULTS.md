# Pod Test Results - Exact Problem Identified

## ✅ What's Working

1. **Kubernetes Configuration**: ✅ Correct
   - Secret applied successfully
   - Pods restarted and running
   - Environment variables correctly set

2. **API Keys in Pod**: ✅ Correct
   - Consumer Key: `ck_87470022e09320692075b60a437999455aba3a99`
   - Consumer Secret: `cs_6924364c85e3f71afda2870054415b7af534963b`
   - WooCommerce URL: `http://wordpress.wordpress.svc.cluster.local`

3. **Network Connection**: ✅ Working
   - Can reach WordPress/WooCommerce server
   - REST API endpoints are accessible

## 🔴 Exact Error from Pod

### Test Results:
```bash
# Tested from inside pod: 30tel-nextjs-66d9b4fcff-98kcq
HTTP Status: 401 Unauthorized
Error Code: woocommerce_rest_cannot_view
Message: "متاسفانه نمی توانید منابع را لیست کنید"
(Translation: "Unfortunately, you cannot list resources")
```

### Full Error Response:
```json
{
  "code": "woocommerce_rest_cannot_view",
  "message": "متاسفانه نمی توانید منابع را لیست کنید.",
  "data": {
    "status": 401
  }
}
```

### Tested Both Authentication Methods:
1. ✅ Basic Auth (Authorization header) - Returns 401
2. ✅ Query Parameters (consumer_key/consumer_secret) - Returns 401

**Both methods fail with the same error**, confirming the issue is NOT with authentication method, but with **permissions**.

## 🎯 Root Cause

The error `woocommerce_rest_cannot_view` specifically means:

**The user associated with API key `ck_87470022e09320692075b60a437999455aba3a99` does NOT have the capability to view WooCommerce resources.**

This happens when:
1. ❌ API key doesn't have "Read" permissions enabled, OR
2. ❌ User linked to API key doesn't have Administrator role

## 🔧 Solution - Must Fix in WordPress

### Step 1: Access WordPress Admin
```
Go to: WordPress Admin → WooCommerce → Settings → Advanced → REST API
```

### Step 2: Find Your API Key
Look for Consumer Key: `ck_87470022e09320692075b60a437999455aba3a99`

### Step 3: Check Permissions
- **Permissions column** MUST show: **"Read"** or **"Read/Write"**
- If it shows "Write" only or is blank → That's the problem!

### Step 4: Check User Role
- Click on the API key to see which user it's linked to
- That user MUST have **Administrator** role
- Verify: Go to **Users → All Users** → Find the user → Check role

### Step 5: Fix It

**Option A: Edit Existing Key**
1. Click on the API key
2. Set **Permissions** to **"Read"** or **"Read/Write"**
3. Ensure **User** is an Administrator
4. Click **Save**

**Option B: Create New Key**
1. Click **"Add Key"**
2. Description: "30tel Next.js App"
3. User: Select Administrator user
4. Permissions: **"Read"** (minimum)
5. Generate and copy new keys
6. Update `secret.yaml` and apply

## 📊 Verification Commands

After fixing in WordPress, verify:

```bash
# Check logs for success (should see product data, not 401 errors)
kubectl logs -n 30tel -l app=30tel-nextjs --tail=50 | grep -E "products|success|✅"

# Test from pod
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
      console.log('✅ SUCCESS! Response:', text.substring(0, 200));
    } else {
      console.log('❌ Still failing:', text);
    }
  });
"
```

## Summary

- ✅ Kubernetes: Correctly configured
- ✅ Pods: Using correct API keys
- ✅ Network: Can reach WordPress
- ❌ **WordPress: API key permissions/user role issue**

**The problem is 100% in WordPress configuration, not Kubernetes.**





