# Fix 401 Unauthorized Error

## Problem
The WooCommerce API is returning 401 Unauthorized errors, which means the API keys don't have proper permissions.

## Solution Steps

### Step 1: Verify API Key Permissions in WordPress

1. **Log into WordPress Admin** at `http://localhost:8000/wp-admin`

2. **Navigate to**: WooCommerce → Settings → Advanced → REST API

3. **Find your API key** (Consumer Key: `ck_de4d6b3149a711e79894fc781e4b325f1ebe71f7`)

4. **Check the "Permissions" column**:
   - It should say **"Read"** or **"Read/Write"**
   - If it says something else or is blank, that's the problem!

### Step 2: Fix API Key Permissions

**Option A: Edit Existing Key (if possible)**
- Click on the API key description
- Change permissions to **"Read"**
- Save

**Option B: Create New API Key (Recommended)**
1. Click **"Add Key"** or **"Create an API key"**
2. Fill in:
   - **Description**: "Next.js Headless Site"
   - **User**: Select a user with Editor/Administrator role
   - **Permissions**: Select **"Read"** (minimum required)
3. Click **"Generate API Key"**
4. **Copy the new Consumer Key and Consumer Secret**
5. Update `.env.local` with the new credentials

### Step 3: Verify User Permissions

The API key is linked to a WordPress user. That user needs proper capabilities:

1. Go to **Users → All Users** in WordPress Admin
2. Find the user associated with your API key
3. Ensure they have at least **"Editor"** role
   - Or a custom role with these capabilities:
     - `read_private_products`
     - `read_products`
     - `read_product_categories`

### Step 4: Update Environment Variables

After getting new API keys, update `.env.local`:

```env
WOOCOMMERCE_URL=http://localhost:8000
WOOCOMMERCE_CONSUMER_KEY=your_new_consumer_key_here
WOOCOMMERCE_CONSUMER_SECRET=your_new_consumer_secret_here
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Step 5: Restart Next.js Server

After updating `.env.local`:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 6: Test the API

Test if the API works now:

```bash
curl "http://localhost:8000/wp-json/wc/v3/products?consumer_key=YOUR_KEY&consumer_secret=YOUR_SECRET&per_page=1"
```

You should get JSON product data, not a 401 error.

## Common Issues

### Issue: "Permissions" column is missing
**Solution**: WooCommerce might not be fully activated. Go to Plugins and ensure WooCommerce is Active.

### Issue: Can't change permissions on existing key
**Solution**: Delete the old key and create a new one with "Read" permissions.

### Issue: Still getting 401 after fixing permissions
**Solution**: 
1. Clear WordPress cache (if using a caching plugin)
2. Verify permalinks are NOT set to "Plain" (Settings → Permalinks)
3. Check that the user associated with the API key has proper role

## Why This Happens

According to [WooCommerce REST API documentation](https://woocommerce.com/document/woocommerce-rest-api/), API keys must have explicit permissions set. The default might not include "Read" access, which is required to list products and categories.

## Current Code Status

The code is correctly configured to use query parameter authentication (the standard method for WooCommerce REST API). Once the API keys have proper permissions, everything should work.


