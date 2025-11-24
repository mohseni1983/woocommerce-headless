# WordPress User Registration Setup

## Problem
The register endpoint returns a 500 error because WordPress REST API requires authentication to create users.

## Solution Options

### Option 1: Enable Public Registration in WordPress (Recommended)

1. Go to WordPress Admin: `http://localhost:8000/wp-admin`
2. Navigate to **Settings → General**
3. Check the box: **"Anyone can register"**
4. Set **"New User Default Role"** to **"Customer"** (for WooCommerce)
5. Click **"Save Changes"**

After this, users can register without authentication.

### Option 2: Use WooCommerce Customer Creation (Alternative)

If you prefer to use WooCommerce API directly, we can modify the registration to create customers via WooCommerce API instead of WordPress users.

### Option 3: Use WordPress API with Authentication

The current code tries to use WooCommerce API keys for authentication, but WordPress user creation might require different permissions.

## Current Implementation

The registration function now:
1. Tries to authenticate using WooCommerce API keys
2. Creates a WordPress user via REST API
3. Then creates a WooCommerce customer

## Testing

After enabling public registration, test with:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "test123456",
    "firstName": "Test",
    "lastName": "User"
  }'
```

## Troubleshooting

If you still get errors:

1. **Check WordPress Settings:**
   - Settings → General → "Anyone can register" must be checked

2. **Check API Keys:**
   - WooCommerce → Settings → Advanced → REST API
   - Ensure API keys have "Write" permissions (not just "Read")

3. **Check User Role:**
   - The API key user must have Administrator role

4. **Check Error Logs:**
   - Look at your Next.js terminal for detailed error messages
   - Check WordPress error logs

## Alternative: Direct WooCommerce Registration

If WordPress registration doesn't work, we can modify the code to:
1. Create customer directly via WooCommerce API
2. Then create WordPress user account (if needed)

Let me know if you want to implement this alternative approach.

