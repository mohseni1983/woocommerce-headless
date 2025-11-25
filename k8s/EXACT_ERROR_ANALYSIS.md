# Exact Error Analysis - From Pod Logs

## 🔴 Error Found

From the pod logs, the exact error is:

```
Error Code: woocommerce_rest_cannot_view
HTTP Status: 401 Unauthorized
Message: "متاسفانه نمی توانید منابع را لیست کنید"
(Translation: "Unfortunately, you cannot list resources")
```

## Root Cause

The error message indicates:
**"USER ROLE ISSUE: The user linked to your API key doesn't have Administrator role."**

## Current API Keys

- **Consumer Key**: `ck_87470022e09320692075b60a437999455aba3a99`
- **Consumer Secret**: `cs_6924364c85e3f71afda2870054415b7af534963b`
- **WooCommerce URL**: `http://wordpress.wordpress.svc.cluster.local`

## The Problem

The API keys are correctly configured in Kubernetes and pods are using them, BUT:

1. **The user associated with these API keys in WordPress doesn't have Administrator role**, OR
2. **The API key doesn't have "Read" permissions enabled**

## Solution Steps

### Step 1: Access WordPress Admin

1. Access your WordPress admin panel
2. Navigate to: **WooCommerce → Settings → Advanced → REST API**

### Step 2: Find Your API Key

Look for the API key with Consumer Key: `ck_87470022e09320692075b60a437999455aba3a99`

### Step 3: Check Two Things

#### A. API Key Permissions
- The **Permissions** column must show: **"Read"** or **"Read/Write"**
- If it shows "Write" only or is blank, that's the problem

#### B. User Role
- Click on the API key to see which user it's linked to
- That user **MUST** have **Administrator** role
- Go to **Users → All Users** and verify

### Step 4: Fix the Issue

**Option A: Edit Existing API Key**
1. Click on the API key
2. Change **Permissions** to **"Read"** or **"Read/Write"**
3. Verify the **User** dropdown shows an Administrator user
4. Click **Save** or **Update**

**Option B: Create New API Key (Recommended)**
1. Click **"Add Key"** or **"Create an API key"**
2. Fill in:
   - **Description**: "30tel Next.js App"
   - **User**: Select a user with **Administrator** role
   - **Permissions**: Select **"Read"** (minimum) or **"Read/Write"**
3. Click **"Generate API Key"**
4. Copy the new Consumer Key and Consumer Secret
5. Update `secret.yaml` with the new keys
6. Apply: `kubectl apply -f secret.yaml -n 30tel`
7. Restart: `kubectl rollout restart deployment/30tel-nextjs -n 30tel`

### Step 5: Verify User Role

Even if the API key has Read permissions, the user must have proper capabilities:

1. Go to **Users → All Users** in WordPress Admin
2. Find the user linked to your API key
3. Ensure their role is **"Administrator"**
4. If not, change it to Administrator

## Test After Fix

After fixing in WordPress, test the connection:

```bash
# Check logs (should see success)
kubectl logs -f deployment/30tel-nextjs -n 30tel

# Or test endpoint
curl https://30tel.com/api/test-connection
```

## Why This Happens

WooCommerce REST API requires:
1. ✅ Valid API keys (you have this)
2. ✅ API keys with "Read" permissions (need to verify)
3. ✅ User with Administrator role (need to verify)

The error `woocommerce_rest_cannot_view` specifically means the user doesn't have the capability to view WooCommerce resources, which is typically because:
- User role is not Administrator
- API key permissions don't include "Read"

## Quick Verification Command

To verify the fix worked, check logs for successful API calls:

```bash
kubectl logs -n 30tel -l app=30tel-nextjs --tail=100 | grep -E "products|categories|success|✅"
```

You should see successful API responses instead of 401 errors.




