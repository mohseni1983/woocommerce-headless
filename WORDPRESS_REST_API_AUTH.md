# WordPress REST API Authentication Guide

## Official WordPress REST API Documentation

According to [WordPress REST API Handbook](https://developer.wordpress.org/rest-api/):

### User Registration (`POST /wp-json/wp/v2/users`)

**Requirements:**
1. **Public Registration**: If "Anyone can register" is enabled in WordPress Settings → General, users can be created without authentication.
2. **Authenticated Registration**: If public registration is disabled, the request must be authenticated with a user who has `create_users` capability.

### Authentication Methods

WordPress REST API supports several authentication methods:

1. **Application Passwords** (WordPress 5.6+)
   - Users → Profile → Application Passwords
   - Generate a password for API access
   - Use Basic Auth: `username:application_password`

2. **Cookie Authentication** (for same-domain requests)
   - Requires logging in via `wp-login.php` first
   - Cookies are then used for subsequent requests

3. **OAuth 1.0a** (requires plugin)

4. **JWT Authentication** (requires plugin)

### Important Notes

- **WooCommerce API Keys** (`ck_` and `cs_`) are ONLY for WooCommerce endpoints (`/wp-json/wc/v3/*`)
- **WordPress Core API** (`/wp-json/wp/v2/*`) requires different authentication
- **User creation** requires either:
  - Public registration enabled, OR
  - Authenticated request with `create_users` capability

## Current Implementation

Our code tries:
1. Public registration (if enabled)
2. Falls back to WooCommerce customer creation

## Recommended Solution

### Option 1: Enable Public Registration (Easiest)

1. Go to `http://localhost:8000/wp-admin`
2. **Settings → General**
3. Check **"Anyone can register"**
4. Set **"New User Default Role"** to **"Customer"**
5. Click **"Save Changes"**

### Option 2: Use Application Passwords

1. Go to `http://localhost:8000/wp-admin`
2. **Users → Profile** (or edit any Administrator user)
3. Scroll to **"Application Passwords"**
4. Enter a name (e.g., "Next.js App")
5. Click **"Add New Application Password"**
6. Copy the generated password (shown only once!)
7. Update `.env.local`:
   ```env
   WORDPRESS_USERNAME=your_admin_username
   WORDPRESS_APP_PASSWORD=xxxx xxxx xxxx xxxx xxxx xxxx
   ```

Then use Basic Auth with `username:application_password` for WordPress API calls.

### Option 3: Use WooCommerce Customer Creation Only

Modify the code to create customers via WooCommerce API first, then optionally create WordPress users.

## Testing

Test public registration:
```bash
curl -X POST "http://localhost:8000/wp-json/wp/v2/users" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "test123456"
  }'
```

If you get `rest_cannot_create_user`, public registration is disabled.

