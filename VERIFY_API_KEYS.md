# Verify API Key Permissions - Step by Step

## Current Issue
Your API keys are returning 401 Unauthorized, which means they **don't have "Read" permissions** in WordPress.

## Step-by-Step Verification

### Step 1: Access WordPress Admin
1. Open: `http://localhost:8000/wp-admin`
2. Log in with your WordPress admin credentials

### Step 2: Navigate to REST API Settings
1. In the left sidebar, click **"WooCommerce"**
2. Click **"Settings"**
3. Click the **"Advanced"** tab at the top
4. Click **"REST API"** in the left menu

### Step 3: Find Your API Key
Look for the API key with Consumer Key starting with: `ck_aca76c0159603450cc7772f62865d666cbe7b1fe`

### Step 4: Check Permissions Column
Look at the **"Permissions"** column for that key. It should say:
- ✅ **"Read"** (minimum required)
- ✅ **"Read/Write"** (also works)

If it says:
- ❌ **"Write"** only (won't work - needs Read)
- ❌ **Blank/Empty** (won't work)
- ❌ **"Custom"** (might not have Read access)

### Step 5: Fix the Permissions

**Option A: Edit Existing Key (if possible)**
1. Click on the API key description/name
2. Change **"Permissions"** dropdown to **"Read"**
3. Click **"Save"** or **"Update"**

**Option B: Create New Key (Recommended)**
1. Click **"Add Key"** or **"Create an API key"** button
2. Fill in:
   - **Description**: "Next.js Headless Site"
   - **User**: Select a user with **Administrator** or **Editor** role
   - **Permissions**: Select **"Read"** (this is critical!)
3. Click **"Generate API Key"**
4. **IMPORTANT**: Copy both:
   - **Consumer Key** (starts with `ck_`)
   - **Consumer Secret** (starts with `cs_`)
5. Update `.env.local` with the new credentials:
   ```env
   WOOCOMMERCE_CONSUMER_KEY=your_new_consumer_key_here
   WOOCOMMERCE_CONSUMER_SECRET=your_new_consumer_secret_here
   ```

### Step 6: Verify User Role
The user associated with the API key must have proper capabilities:

1. Go to **Users → All Users**
2. Find the user linked to your API key
3. Ensure they have **"Administrator"** or **"Editor"** role
4. If not, change their role or create a new API key for an admin user

### Step 7: Restart Next.js Server
**CRITICAL**: After updating `.env.local`, you MUST restart the dev server:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 8: Test the Connection
After restarting, test the API:

1. Visit: `http://localhost:3000/api/test-connection`
2. You should see a JSON response with `"success": true`
3. If you see `"success": false` with a 401 error, the permissions are still wrong

## Quick Test Command

You can also test directly with curl:

```bash
curl "http://localhost:8000/wp-json/wc/v3/products?consumer_key=YOUR_KEY&consumer_secret=YOUR_SECRET&per_page=1"
```

**Expected Success Response:**
```json
[{"id":1,"name":"Product Name",...}]
```

**Current Error Response:**
```json
{"code":"woocommerce_rest_cannot_view","message":"..."}
```

## Common Mistakes

1. ❌ **Not setting permissions to "Read"** - Most common issue!
2. ❌ **Not restarting Next.js server** after updating `.env.local`
3. ❌ **Using a user without proper role** - User must be Administrator or Editor
4. ❌ **Copying keys incorrectly** - Make sure no extra spaces or line breaks

## Still Not Working?

If you've verified all the above and it's still not working:

1. **Check WordPress Permalinks**: Settings → Permalinks → Must NOT be "Plain"
2. **Clear WordPress Cache**: If using a caching plugin, clear it
3. **Check WooCommerce is Active**: Plugins → Ensure WooCommerce is Active
4. **Try a different user**: Create API key for a different Administrator user


