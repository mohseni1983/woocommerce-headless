# WooCommerce REST API Setup Guide

Based on the [official WooCommerce REST API documentation](https://woocommerce.com/document/woocommerce-rest-api/), here are the requirements and troubleshooting steps:

## Requirements

### 1. WordPress Permalinks Configuration

**CRITICAL**: WordPress permalinks must be set to something human-readable (NOT "Plain").

1. Go to **WordPress Admin → Settings → Permalinks**
2. Select **"Day and name"** or any option other than **"Plain"**
3. Click **"Save Changes"**

This is required for the REST API to work properly.

### 2. Verify REST API is Enabled

The WooCommerce REST API is now integrated with the WordPress REST API. To verify:

1. Test the WordPress REST API:
   ```bash
   curl http://localhost:8000/wp-json/
   ```
   You should see JSON output with available endpoints.

2. Test WooCommerce REST API:
   ```bash
   curl http://localhost:8000/wp-json/wc/v3/
   ```
   You should see WooCommerce API information.

### 3. API Keys Configuration

Your API keys are already configured in `.env.local`:
- Consumer Key: `ck_de4d6b3149a711e79894fc781e4b325f1ebe71f7`
- Consumer Secret: `cs_315d15918f22dc72a02c39f2315ff386cd469c5a`

**Verify in WordPress Admin:**
1. Go to **WooCommerce → Settings → Advanced → REST API**
2. Confirm the keys exist and have **Read** permissions (at minimum)

### 4. Test API Connection

Test with your credentials:

```bash
curl "http://localhost:8000/wp-json/wc/v3/products?consumer_key=ck_de4d6b3149a711e79894fc781e4b325f1ebe71f7&consumer_secret=cs_315d15918f22dc72a02c39f2315ff386cd469c5a&per_page=1"
```

**Expected Response:**
- Success: JSON array with product data
- 404 Error: WordPress/WooCommerce not running or permalinks not configured
- 401 Error: Invalid API credentials
- 403 Error: API key doesn't have proper permissions

## Troubleshooting 404 Errors

### Issue: Getting 404 Not Found

**Possible Causes:**

1. **Permalinks not configured** (Most Common)
   - Solution: Set permalinks to "Day and name" in WordPress Admin

2. **WordPress/WooCommerce not running**
   - Solution: Start your Docker container
   ```bash
   docker ps  # Check if running
   docker start <container_name>  # Start if stopped
   ```

3. **Wrong URL/Port**
   - Verify: `http://localhost:8000` is correct
   - Check: Docker port mapping

4. **WooCommerce not installed/activated**
   - Solution: Install and activate WooCommerce plugin in WordPress

### Issue: API Returns Empty Array

This is normal if:
- No products exist in WooCommerce
- Products are not published
- API key has Read permissions but no products match the query

### Issue: CORS Errors

If accessing from a different domain, you may need to add CORS headers in WordPress. For localhost development, this shouldn't be an issue.

## Next.js Implementation

The Next.js app uses the following API structure:

```
http://localhost:8000/wp-json/wc/v3/{endpoint}?consumer_key=...&consumer_secret=...
```

**Endpoints Used:**
- `/wp-json/wc/v3/products` - Get products
- `/wp-json/wc/v3/products/{id}` - Get single product
- `/wp-json/wc/v3/products/categories` - Get categories
- `/wp-json/wc/v3/products/categories/{id}` - Get single category

## Verification Checklist

- [ ] WordPress permalinks set to "Day and name" (not "Plain")
- [ ] WooCommerce plugin installed and activated
- [ ] Docker container running on port 8000
- [ ] API keys generated in WooCommerce → Settings → Advanced → REST API
- [ ] API keys have "Read" permissions
- [ ] Test endpoint returns JSON (not 404 HTML)
- [ ] `.env.local` file contains correct credentials

## Additional Resources

- [WooCommerce REST API Documentation](https://woocommerce.com/document/woocommerce-rest-api/)
- [WooCommerce REST API Developer Docs](https://woocommerce.github.io/woocommerce-rest-api-docs/)
- [WordPress REST API Handbook](https://developer.wordpress.org/rest-api/)


