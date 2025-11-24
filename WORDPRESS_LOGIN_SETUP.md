# WordPress Login Authentication Setup

## Problem

WordPress REST API does **NOT** support Basic Authentication with regular username/password by default. It requires **Application Passwords** (WordPress 5.6+) or a JWT plugin.

## Solution: Use Application Passwords

### Step 1: Create Application Password

1. Go to `http://localhost:8000/wp-admin`
2. Navigate to **Users → Profile** (or edit the user `mohseni676`)
3. Scroll down to **"Application Passwords"** section
4. Enter a name: `Next.js App` or `30tel Frontend`
5. Click **"Add New Application Password"**
6. **Copy the generated password immediately** (it's shown only once!)
   - Format: `xxxx xxxx xxxx xxxx xxxx xxxx` (24 characters with spaces)

### Step 2: Update Login

Use the Application Password instead of the regular password:

```javascript
// Instead of:
username: "mohseni676"
password: "alimohseni@62"

// Use:
username: "mohseni676"
password: "xxxx xxxx xxxx xxxx xxxx xxxx" // Application Password
```

### Step 3: Test

The login should now work with Basic Authentication.

## Alternative: Install JWT Plugin

If you prefer to use regular passwords, install a JWT plugin:

1. Install **JWT Authentication for WP REST API** plugin
2. Configure it according to plugin documentation
3. Update the login function to use JWT tokens

## Current Status

The login endpoint currently tries:
1. ✅ Basic Auth with Application Password (works if configured)
2. ❌ Cookie-based auth (complex, may not work in server-side)
3. ❌ Regular password Basic Auth (not supported by WordPress)

## Quick Test

Test if Application Password works:
```bash
curl -X GET "http://localhost:8000/wp-json/wp/v2/users/me" \
  -H "Authorization: Basic $(echo -n 'mohseni676:YOUR_APP_PASSWORD' | base64)" \
  -H "Content-Type: application/json"
```

If this returns user data, Application Password is working!

