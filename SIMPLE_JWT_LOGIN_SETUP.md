# Simple JWT Login Plugin Setup

## Plugin Installed ✅

You've installed the **Simple JWT Login** plugin. This is the best solution for customer authentication in headless WordPress/WooCommerce setups.

## Plugin Features

According to the [plugin documentation](https://fa.wordpress.org/plugins/simple-jwt-login/):

- ✅ Login, register, and authenticate users via JWT
- ✅ Works with email or username
- ✅ Returns JWT token for API authentication
- ✅ Supports customer role
- ✅ Secure token-based authentication

## ⚠️ IMPORTANT: Configure Plugin First!

The plugin endpoint returns 404 until it's configured. Follow these steps:

### 1. Activate and Configure the Plugin

1. Go to `http://localhost:8000/wp-admin`
2. Navigate to **Settings → Simple JWT Login**
3. **Configure General Settings:**
   - **JWT Decryption Key**: Set a strong random key (e.g., generate with: `openssl rand -base64 32`)
   - **JWT Algorithm**: Choose **HS256** (recommended)
   - ✅ **Allow Authentication**: Enable this checkbox
   - Click **Save Settings**

4. **Configure Login Settings:**
   - ✅ **Allow Auto Login**: Enable
   - **JWT Payload Key**: Leave default or set to `email` or `id`
   - **Redirect After Login**: Set to "Homepage" or custom URL

5. **Configure Register Settings (Optional):**
   - ✅ **Allow Register**: Enable if you want API registration
   - **New User Role**: Set to **Customer**
   - Click **Save Settings**

### 2. Verify Plugin is Working

After configuration, test the endpoint:

```bash
curl -X POST "http://localhost:8000/wp-json/simple-jwt-login/v1/auth" \
  -H "Content-Type: application/json" \
  -d '{"email":"mohseni676","password":"alimohseni@62"}'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "jwt": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "user": { ... }
  }
}
```

If you still get 404:
- Make sure plugin is **activated**
- Check that REST API is enabled
- Verify the endpoint in plugin settings

### 2. Test the Endpoint

Test if the plugin is working:

```bash
curl -X POST "http://localhost:8000/wp-json/simple-jwt-login/v1/auth" \
  -H "Content-Type: application/json" \
  -d '{"email":"mohseni676","password":"alimohseni@62"}'
```

Or with username:
```bash
curl -X POST "http://localhost:8000/wp-json/simple-jwt-login/v1/auth" \
  -H "Content-Type: application/json" \
  -d '{"username":"mohseni676","password":"alimohseni@62"}'
```

Expected response:
```json
{
  "success": true,
  "data": {
    "jwt": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "user": {
      "ID": 1,
      "user_login": "mohseni676",
      ...
    }
  }
}
```

### 3. Use JWT Token

After login, the JWT token is stored in a cookie. Use it for authenticated API requests:

```bash
curl -X GET "http://localhost:8000/wp-json/wp/v2/users/me" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Code Updates

I've updated the Next.js code to:

1. ✅ **Try JWT Login First** - Uses `/simple-jwt-login/v1/auth` endpoint
2. ✅ **Store JWT Token** - Saves token in secure cookie
3. ✅ **Use JWT for API Calls** - Automatically uses JWT for authenticated requests
4. ✅ **Fallback Methods** - Falls back to other auth methods if JWT fails

## API Endpoints

The plugin provides these endpoints:

- **POST `/wp-json/simple-jwt-login/v1/auth`** - Login and get JWT
- **POST `/wp-json/simple-jwt-login/v1/users`** - Register new user (if enabled)
- **GET `/wp-json/simple-jwt-login/v1/auth/validate`** - Validate JWT token

## Benefits

✅ **Secure** - Token-based authentication  
✅ **Works for Customers** - No special role requirements  
✅ **Standard JWT** - Compatible with all JWT libraries  
✅ **No Application Passwords Needed** - Uses regular username/password  
✅ **Stateless** - No session management needed  

## Troubleshooting

### Plugin endpoint returns 404

- Make sure plugin is **activated** in WordPress
- Check that REST API is enabled
- Verify endpoint: `/wp-json/simple-jwt-login/v1/auth`

### Login fails

- Check plugin settings (JWT key must be set)
- Verify user credentials
- Check plugin logs in WordPress admin

### JWT token not working

- Verify JWT key is configured correctly
- Check token expiration settings
- Ensure token is sent in `Authorization: Bearer` header

## Documentation

- Plugin Page: https://fa.wordpress.org/plugins/simple-jwt-login/
- Plugin Docs: https://simplejwtlogin.com/docs

