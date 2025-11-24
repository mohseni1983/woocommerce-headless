# Simple JWT Login Plugin - Complete Implementation

This document describes the complete implementation of the Simple JWT Login plugin for authentication in the Next.js headless WooCommerce application.

## Documentation Reference

- **Official Documentation**: https://simplejwtlogin.com/docs
- **Plugin Page**: https://fa.wordpress.org/plugins/simple-jwt-login/

## Implementation Overview

The implementation follows the official Simple JWT Login plugin documentation and provides:

1. ✅ **Authentication** - Login with JWT token generation
2. ✅ **User Registration** - Register new users via API
3. ✅ **Password Reset** - Reset user passwords
4. ✅ **JWT Validation** - Validate JWT tokens
5. ✅ **User Management** - Get current user with JWT

## Files Created/Updated

### New Files

1. **`src/lib/simple-jwt-auth.ts`**
   - Complete JWT plugin API client
   - Implements all endpoints from the documentation
   - Functions:
     - `jwtLogin()` - Authenticate and get JWT
     - `jwtRegister()` - Register new user
     - `jwtValidate()` - Validate JWT token
     - `jwtResetPassword()` - Reset password
     - `jwtDeleteUser()` - Delete user (requires JWT)
     - `getUserWithJWT()` - Get user info with JWT

2. **`src/app/api/auth/reset-password/route.ts`**
   - API route for password reset
   - Endpoint: `POST /api/auth/reset-password`

3. **`src/app/api/auth/validate/route.ts`**
   - API route for JWT validation
   - Endpoint: `GET /api/auth/validate`

### Updated Files

1. **`src/lib/wordpress-auth.ts`**
   - Updated `loginUser()` to use Simple JWT Login plugin
   - Updated `registerUser()` to use JWT plugin register endpoint
   - Updated `getCurrentUser()` to support JWT tokens
   - Falls back to other methods if JWT plugin not available

2. **`src/app/api/auth/login/route.ts`**
   - Already uses `loginUser()` which now uses JWT plugin
   - Stores JWT token in secure cookie

3. **`src/app/api/auth/me/route.ts`**
   - Updated to use JWT token for authentication
   - Uses `getCurrentUser()` with JWT support

4. **`src/app/login/page.tsx`**
   - Updated to use AuthContext properly
   - Ensures state updates before redirect

5. **`src/contexts/AuthContext.tsx`**
   - Updated `login()` to refresh user data after login
   - Properly handles JWT tokens

## API Endpoints

### Simple JWT Login Plugin Endpoints

All endpoints use the namespace: `/wp-json/simple-jwt-login/v1/`

#### 1. Authentication
- **Endpoint**: `POST /wp-json/simple-jwt-login/v1/auth`
- **Parameters**:
  - `email` or `username` or `login` (required)
  - `password` or `password_hash` (required)
  - `AUTH_CODE` (optional)
- **Response**: `{ success: true, data: { jwt: "..." } }`

#### 2. Register User
- **Endpoint**: `POST /wp-json/simple-jwt-login/v1/users`
- **Parameters**:
  - `email` (required)
  - `password` (required)
  - `username` (optional)
  - `first_name`, `last_name`, `display_name` (optional)
  - `role` (optional, default: "customer")
  - `AUTH_CODE` (optional)
- **Response**: `{ success: true, data: { user: {...}, jwt: "..." } }`

#### 3. Validate JWT
- **Endpoint**: `GET /wp-json/simple-jwt-login/v1/auth/validate`
- **Headers**: `Authorization: Bearer YOUR_JWT`
- **Response**: `{ success: true, data: { user_id, email, username, expires } }`

#### 4. Reset Password
- **Endpoint**: `POST /wp-json/simple-jwt-login/v1/reset-password`
- **Parameters**:
  - `email` (required)
  - `AUTH_CODE` (optional)
- **Response**: `{ success: true, message: "..." }`

#### 5. Delete User
- **Endpoint**: `POST /wp-json/simple-jwt-login/v1/delete-user`
- **Headers**: `Authorization: Bearer YOUR_JWT`
- **Parameters**:
  - `email` or `user_id` (required)
  - `AUTH_CODE` (optional)
- **Response**: `{ success: true, message: "..." }`

### Next.js API Routes

#### 1. Login
- **Endpoint**: `POST /api/auth/login`
- **Body**: `{ username, password }`
- **Response**: `{ success: true, user: {...}, customer: {...}, token: "..." }`
- **Cookies**: Sets `wp_user_id` and `jwt_token`

#### 2. Register
- **Endpoint**: `POST /api/auth/register`
- **Body**: `{ username, email, password, firstName, lastName }`
- **Response**: `{ success: true, user: {...}, customer: {...} }`
- **Cookies**: Sets `wp_user_id` and `jwt_token` (if JWT returned)

#### 3. Get Current User
- **Endpoint**: `GET /api/auth/me`
- **Cookies**: Uses `jwt_token` or `wp_user_id`
- **Response**: `{ success: true, user: {...}, customer: {...} }`

#### 4. Reset Password
- **Endpoint**: `POST /api/auth/reset-password`
- **Body**: `{ email, auth_code? }`
- **Response**: `{ success: true, message: "..." }`

#### 5. Validate JWT
- **Endpoint**: `GET /api/auth/validate`
- **Cookies**: Uses `jwt_token` or `Authorization: Bearer` header
- **Response**: `{ success: true, data: {...} }`

#### 6. Logout
- **Endpoint**: `POST /api/auth/logout`
- **Response**: `{ success: true }`
- **Cookies**: Clears `wp_user_id` and `jwt_token`

## Authentication Flow

### Login Flow

1. User submits login form
2. Frontend calls `POST /api/auth/login`
3. Next.js API route calls `loginUser()` from `wordpress-auth.ts`
4. `loginUser()` tries Simple JWT Login plugin first:
   - Calls `jwtLogin()` from `simple-jwt-auth.ts`
   - Plugin returns JWT token
   - Gets full user info using JWT
5. API route stores JWT in secure cookie
6. AuthContext updates state with user data
7. User is redirected to account page

### Registration Flow

1. User submits registration form
2. Frontend calls `POST /api/auth/register`
3. Next.js API route calls `registerUser()` from `wordpress-auth.ts`
4. `registerUser()` tries Simple JWT Login plugin first:
   - Calls `jwtRegister()` from `simple-jwt-auth.ts`
   - Plugin creates user and optionally returns JWT
5. WooCommerce customer is created/retrieved
6. API route stores user ID and JWT (if available) in cookies
7. User is redirected to account page

### Authentication Check Flow

1. Protected route checks authentication
2. Calls `GET /api/auth/me`
3. API route gets JWT from cookie
4. Uses `getCurrentUser()` with JWT:
   - Calls `getUserWithJWT()` if JWT available
   - Falls back to cookie-based auth
5. Returns user and customer data

## Configuration Required

### WordPress Plugin Configuration

1. **Install and Activate Plugin**
   - Go to WordPress admin → Plugins → Add New
   - Search for "Simple JWT Login"
   - Install and activate

2. **Configure General Settings**
   - Go to Settings → Simple JWT Login
   - Set **JWT Decryption Key** (strong random string)
   - Choose **JWT Algorithm** (HS256 recommended)
   - Enable **Allow Authentication** ✅

3. **Configure Login Settings**
   - Enable **Allow Auto Login** ✅
   - Set **JWT Parameter Key** (e.g., `email` or `username`)

4. **Configure Register Settings** (Optional)
   - Enable **Allow Register** ✅
   - Set **New User Role** to `customer`

## Benefits

✅ **Secure** - Token-based authentication  
✅ **Stateless** - No session management needed  
✅ **Works for Customers** - No special role requirements  
✅ **Standard JWT** - Compatible with all JWT libraries  
✅ **No Application Passwords Needed** - Uses regular username/password  
✅ **Complete API** - Register, login, reset password, validate token  
✅ **Fallback Support** - Falls back to other methods if plugin not configured  

## Testing

### Test Login
```bash
curl -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"mohseni676","password":"alimohseni@62"}'
```

### Test Register
```bash
curl -X POST "http://localhost:3000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123","firstName":"Test","lastName":"User"}'
```

### Test JWT Validation
```bash
curl -X GET "http://localhost:3000/api/auth/validate" \
  -H "Cookie: jwt_token=YOUR_JWT_TOKEN"
```

### Test Reset Password
```bash
curl -X POST "http://localhost:3000/api/auth/reset-password" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'
```

## Troubleshooting

### Plugin endpoint returns 404
- Make sure plugin is **activated**
- Check plugin settings are saved
- Verify REST API is enabled

### Login fails
- Check JWT Decryption Key is set
- Verify user credentials
- Check plugin logs in WordPress admin

### JWT token not working
- Verify JWT key is configured correctly
- Check token expiration settings
- Ensure token is sent in `Authorization: Bearer` header

## Next Steps

1. ✅ Login with JWT - **Implemented**
2. ✅ Register with JWT - **Implemented**
3. ✅ Password Reset - **Implemented**
4. ✅ JWT Validation - **Implemented**
5. ⏳ Add password reset UI page
6. ⏳ Add JWT refresh token support (if needed)
7. ⏳ Add user deletion functionality (if needed)

## References

- [Simple JWT Login Documentation](https://simplejwtlogin.com/docs)
- [Authentication Guide](https://simplejwtlogin.com/docs/authentication)
- [Register User Guide](https://simplejwtlogin.com/docs/register-user)
- [Reset Password Guide](https://simplejwtlogin.com/docs/reset-password)

