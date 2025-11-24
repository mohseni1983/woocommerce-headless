# 🔧 Fix WooCommerce API 401 Error - Permissions Issue

## Problem
You're getting a 401 error: **"متاسفانه نمی توانید منابع را لیست کنید"** (Unfortunately, you cannot list resources)

This means your API keys exist but **don't have "Read" permissions enabled** in WordPress.

## ✅ Solution: Enable Read Permissions

### Step 1: Go to WordPress Admin
1. Open your browser and go to: `http://localhost:8000/wp-admin`
2. Log in with your WordPress admin credentials

### Step 2: Navigate to WooCommerce REST API Settings
1. In the left sidebar, go to **WooCommerce** → **Settings**
2. Click on the **Advanced** tab
3. Click on **REST API** in the submenu

### Step 3: Find Your API Key
1. You should see a list of API keys
2. Find the key that matches:
   - **Consumer Key**: `ck_238a09970ba629438a350291b62c897e13743b2c`
   - **Description**: Look for "30tel" or "Next.js" or check the date it was created

### Step 4: Edit the API Key
1. Click on the API key to edit it
2. **IMPORTANT**: Check the **Permissions** section
3. Make sure **"Read"** is checked ✅
4. The key should have at least:
   - ✅ **Read** (required for fetching products, categories, etc.)
   - Optionally: **Write** (if you need to create/update products)
   - Optionally: **Read/Write** (full access)

### Step 5: Save Changes
1. Click **Save API Key** or **Update**
2. Wait for the confirmation message

### Step 6: Test the Connection
1. Go back to your Next.js app
2. Visit: `http://localhost:3000/api/test-connection`
3. You should see `"success": true` if it's working

## Alternative: Create a New API Key

If you can't find or edit the existing key:

1. Go to **WooCommerce** → **Settings** → **Advanced** → **REST API**
2. Click **Add Key**
3. Fill in:
   - **Description**: "30tel Next.js App"
   - **User**: Select an Administrator or Editor user
   - **Permissions**: Select **Read** (or **Read/Write** if needed)
4. Click **Generate API Key**
5. **Copy the Consumer Key and Consumer Secret**
6. Update your `.env.local` file:
   ```env
   WOOCOMMERCE_CONSUMER_KEY=ck_your_new_key_here
   WOOCOMMERCE_CONSUMER_SECRET=cs_your_new_secret_here
   ```
7. Restart your Next.js dev server

## Verify User Role

The user associated with the API key must have proper permissions:
- **Administrator** role (recommended)
- **Editor** role (minimum for most operations)

To check:
1. Go to **Users** → **All Users**
2. Find the user associated with your API key
3. Make sure their role is **Administrator** or **Editor**

## Still Not Working?

1. **Check WooCommerce is Active**:
   - Go to **Plugins** → **Installed Plugins**
   - Make sure **WooCommerce** is activated

2. **Check REST API is Enabled**:
   - Go to **WooCommerce** → **Settings** → **Advanced** → **REST API**
   - Make sure the REST API is enabled (it should be by default)

3. **Test Directly in Browser**:
   - Try: `http://localhost:8000/wp-json/wc/v3/products?consumer_key=YOUR_KEY&consumer_secret=YOUR_SECRET&per_page=1`
   - If you still get 401, the permissions are definitely wrong

4. **Check Server Logs**:
   - Check your Docker logs for WordPress
   - Look for any error messages

## Quick Test Command

Run this in your terminal to test the API:

```bash
curl "http://localhost:8000/wp-json/wc/v3/products?consumer_key=ck_238a09970ba629438a350291b62c897e13743b2c&consumer_secret=cs_737d2b6b47e4d71aa1325ad28c8242f38cc072e6&per_page=1"
```

If you get a JSON array with products, it's working! ✅
If you get a 401 error, the permissions are still wrong. ❌

