# WooCommerce Customer Login Setup

## Problem

WordPress REST API doesn't support Basic Authentication with regular passwords for customers. We need a proper authentication method for customers with the "customer" role.

## Solution: Custom WordPress REST API Endpoint

I've created a custom WordPress REST API endpoint that uses `wp_signon()` - the proper WordPress way to authenticate users, including customers.

## Step 1: Add Custom Endpoint to WordPress

Copy the code from `wordpress-custom-login-endpoint.php` and add it to your WordPress installation:

### Option A: Add to Theme's functions.php

1. Go to `http://localhost:8000/wp-admin`
2. Navigate to **Appearance → Theme Editor**
3. Select your active theme
4. Click on **functions.php**
5. Add the code from `wordpress-custom-login-endpoint.php` at the end
6. Click **Update File**

### Option B: Create a Custom Plugin (Recommended)

1. Create a new file: `wp-content/plugins/woocommerce-customer-login/woocommerce-customer-login.php`
2. Add this header at the top:
```php
<?php
/**
 * Plugin Name: WooCommerce Customer Login API
 * Description: Custom REST API endpoint for customer login
 * Version: 1.0.0
 */
```
3. Add the code from `wordpress-custom-login-endpoint.php`
4. Go to **Plugins** in WordPress admin and activate it

## Step 2: Test the Endpoint

Test if the endpoint works:
```bash
curl -X POST "http://localhost:8000/wp-json/wc/v3/customer/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"mohseni676","password":"alimohseni@62"}' \
  -c cookies.txt
```

If it returns user data, it's working!

## Step 3: Use in Next.js

The Next.js code has been updated to automatically try this endpoint first. It will:
1. Try WooCommerce custom endpoint (`/wp-json/wc/v3/customer/login`)
2. Fall back to cookie-based authentication
3. Fall back to Application Password

## How It Works

The custom endpoint:
- Uses `wp_authenticate()` to verify credentials
- Uses `wp_signon()` to properly sign in the user (sets WordPress cookies)
- Returns user and customer data
- Works for customers, administrators, and shop managers

## Benefits

✅ Uses WordPress's native authentication (`wp_signon()`)  
✅ Properly sets WordPress session cookies  
✅ Works for customers with "customer" role  
✅ Returns both WordPress user and WooCommerce customer data  
✅ Secure - uses WordPress's built-in security functions  

## Troubleshooting

If the endpoint returns 404:
- Make sure the code is added to WordPress
- Check that the REST API is enabled
- Verify the endpoint URL: `/wp-json/wc/v3/customer/login`

If login fails:
- Check WordPress error logs
- Verify user credentials
- Ensure user has "customer" role (or administrator/shop_manager)

## Alternative: Without Custom Endpoint

If you can't add the custom endpoint, you can:
1. Use Application Passwords (see `WORDPRESS_LOGIN_SETUP.md`)
2. Install a JWT authentication plugin
3. Use the cookie-based method (may have limitations)

