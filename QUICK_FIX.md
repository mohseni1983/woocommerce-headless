# ⚡ Quick Fix for 401 Error

## The Issue
`woocommerce_rest_cannot_view` = The **user** linked to your API key doesn't have Administrator role.

## 30-Second Fix

1. Go to: `http://localhost:8000/wp-admin`
2. **WooCommerce → Settings → Advanced → REST API**
3. Find your key → Note the **"User"** column
4. **Users → All Users** → Find that user
5. Change their **Role** to **Administrator**
6. Click **Update User**
7. Test again!

## Alternative: Create New Key

1. **WooCommerce → Settings → Advanced → REST API → Add Key**
2. **User**: Select an **Administrator**
3. **Permissions**: **Read**
4. Copy new keys to `.env.local`
5. Restart Next.js dev server

That's it! The API key permissions are fine - it's the **user role** that's the problem.

