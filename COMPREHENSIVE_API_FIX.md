# 🔧 Comprehensive WooCommerce API 401 Fix Guide

## The Problem

You're getting `woocommerce_rest_cannot_view` error even though you say permissions are set. This error means the **user** associated with the API key doesn't have the right **WordPress capabilities**, not just API permissions.

## Root Cause

The error `woocommerce_rest_cannot_view` is a **capability check**, not just a permission check. This means:

- ✅ API key has "Read" permission → This is set correctly
- ❌ User associated with API key lacks WordPress capabilities → This is likely the issue

## Solution Steps

### Step 1: Verify the User Associated with Your API Key

1. Go to `http://localhost:8000/wp-admin`
2. Navigate to **WooCommerce → Settings → Advanced → REST API**
3. Find your API key (`ck_238a09970ba629438a350291b62c897e13743b2c`)
4. **Note the "User" column** - this shows which WordPress user the key is linked to
5. Write down that username

### Step 2: Check User Role and Capabilities

1. Go to **Users → All Users**
2. Find the user from Step 1
3. **CRITICAL**: Check their role:
   - ✅ Must be **Administrator** (recommended)
   - ✅ Or **Editor** (minimum)
   - ❌ **Subscriber**, **Contributor**, or **Author** won't work

### Step 3: Fix User Permissions

**Option A: Change User Role to Administrator**

1. Click on the user
2. Scroll to **"Role"** dropdown
3. Select **"Administrator"**
4. Click **"Update User"**

**Option B: Create New API Key with Admin User**

1. Go to **WooCommerce → Settings → Advanced → REST API**
2. Click **"Add Key"**
3. Fill in:
   - **Description**: "30tel Next.js"
   - **User**: Select a user with **Administrator** role
   - **Permissions**: **Read**
4. Click **"Generate API Key"**
5. Copy the new keys and update `.env.local`

### Step 4: Check for Plugin Conflicts

Some plugins can interfere with WooCommerce REST API:

1. Go to **Plugins → Installed Plugins**
2. Temporarily deactivate these if installed:
   - reCAPTCHA plugins
   - Security plugins (Wordfence, iThemes Security, etc.)
   - Caching plugins
3. Test the API again
4. If it works, reactivate plugins one by one to find the culprit

### Step 5: Verify Permalinks (Critical!)

WooCommerce REST API requires permalinks to be configured:

1. Go to **Settings → Permalinks**
2. Select **ANY option except "Plain"** (e.g., "Day and name", "Post name", etc.)
3. Click **"Save Changes"** (even if you don't change anything)
4. This refreshes the rewrite rules

### Step 6: Test with Diagnostic Endpoint

Visit: `http://localhost:3000/api/diagnose`

This will show you:

- Which authentication method works
- Exact error messages
- What's configured correctly

### Step 7: Alternative - Use OAuth 1.0a (If Still Not Working)

Since you're using HTTP (not HTTPS), WooCommerce might prefer OAuth 1.0a. However, this is complex. The easier solution is to ensure the user has Administrator role.

## Quick Verification Commands

Test if it's working:

```bash
# Test with query parameters
curl "http://localhost:8000/wp-json/wc/v3/products?consumer_key=ck_238a09970ba629438a350291b62c897e13743b2c&consumer_secret=cs_737d2b6b47e4d71aa1325ad28c8242f38cc072e6&per_page=1"

# Test with Basic Auth
curl -u "ck_238a09970ba629438a350291b62c897e13743b2c:cs_737d2b6b47e4d71aa1325ad28c8242f38cc072e6" "http://localhost:8000/wp-json/wc/v3/products?per_page=1"
```

**Expected Success Response:**

```json
[{"id":1,"name":"Product Name",...}]
```

**Current Error Response:**

```json
{
  "code": "woocommerce_rest_cannot_view",
  "message": "متاسفانه نمی توانید منابع را لیست کنید."
}
```

## Most Likely Solution

**90% of the time**, this error means:

- The user linked to your API key is **NOT an Administrator**
- Change the user role to **Administrator** (Step 3, Option A)
- Or create a new API key linked to an **Administrator** user (Step 3, Option B)

## Still Not Working?

1. Check the diagnostic endpoint: `http://localhost:3000/api/diagnose`
2. Check WordPress error logs in Docker
3. Verify WooCommerce is activated: **Plugins → Installed Plugins** → WooCommerce should be active
4. Try creating a completely new API key with a fresh Administrator user
