# WooCommerce API Troubleshooting Guide

## Current Status

The build is successful, but you're getting **401 Unauthorized** errors when trying to access the WooCommerce API. This indicates an authentication/permissions issue.

## Error Message

```
{"code":"woocommerce_rest_cannot_view","message":"متأسفانه نمی‌توانید منابع را لیست کنید","data":{"status":401}}
```

Translation: "Unfortunately, you cannot list resources"

## Solutions

### 1. Check API Key Permissions

The API keys need **"Read"** permissions at minimum. To verify:

1. Go to **WordPress Admin → WooCommerce → Settings → Advanced → REST API**
2. Find your API key (the one with Consumer Key: `ck_de4d6b3149a711e79894fc781e4b325f1ebe71f7`)
3. Check the **Permissions** column - it should say **"Read"** or **"Read/Write"**
4. If it says something else or is missing, you need to:
   - Delete the old key
   - Create a new key with **"Read"** permissions

### 2. Verify User Permissions

The API key is linked to a WordPress user. That user needs proper capabilities:

1. Go to **WordPress Admin → Users**
2. Find the user associated with your API key
3. Ensure they have at least **"Editor"** role (or custom role with WooCommerce read capabilities)

### 3. Test API Authentication

Test the API with Basic Auth (which the code now uses):

```bash
curl -u "ck_de4d6b3149a711e79894fc781e4b325f1ebe71f7:cs_315d15918f22dc72a02c39f2315ff386cd469c5a" \
  "http://localhost:8000/wp-json/wc/v3/products?per_page=1"
```

Or with query parameters (fallback method):

```bash
curl "http://localhost:8000/wp-json/wc/v3/products?consumer_key=ck_de4d6b3149a711e79894fc781e4b325f1ebe71f7&consumer_secret=cs_315d15918f22dc72a02c39f2315ff386cd469c5a&per_page=1"
```

### 4. Check WordPress Permalinks

According to [WooCommerce REST API documentation](https://woocommerce.com/document/woocommerce-rest-api/), permalinks must be set to something other than "Plain":

1. Go to **WordPress Admin → Settings → Permalinks**
2. Select **"Day and name"** or any option other than **"Plain"**
3. Click **"Save Changes"**

### 5. Verify WooCommerce is Active

Ensure WooCommerce plugin is installed and activated:

1. Go to **WordPress Admin → Plugins**
2. Verify WooCommerce is **Active**

### 6. Check REST API is Enabled

The REST API should be enabled by default, but verify:

1. Go to **WordPress Admin → WooCommerce → Settings → Advanced → REST API**
2. You should see a list of API keys
3. If the section is missing, WooCommerce might not be properly installed

## Current Implementation

The code now uses **Basic Authentication** (recommended for server-side) with a fallback to query parameters. The authentication is handled in `/src/lib/woocommerce.ts`.

## Next Steps

1. **Verify API key permissions** in WordPress admin
2. **Test the API directly** using the curl commands above
3. **Check WordPress permalinks** are not set to "Plain"
4. **Restart the Next.js dev server** after making changes

Once the API keys have proper permissions, the 401 errors should be resolved and products will load correctly.


