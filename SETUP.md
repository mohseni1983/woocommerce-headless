# 30tel - Next.js Headless WooCommerce Setup Guide

## Prerequisites

- Node.js 18+ installed
- WordPress with WooCommerce running on Docker (port 8000)
- WooCommerce REST API credentials

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` file in the root directory:
```env
# WooCommerce API Configuration
WOOCOMMERCE_URL=http://localhost:8000
WOOCOMMERCE_CONSUMER_KEY=your_consumer_key_here
WOOCOMMERCE_CONSUMER_SECRET=your_consumer_secret_here

# Site URL for SEO and absolute URLs
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

3. Get WooCommerce API credentials:
   - Go to WordPress Admin → WooCommerce → Settings → Advanced → REST API
   - Click "Add Key"
   - Set description and permissions (Read)
   - Copy Consumer Key and Consumer Secret to `.env.local`

## Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- ✅ Fully RTL (Right-to-Left) support for Farsi/Persian
- ✅ Vazirmatn font integration
- ✅ Server-Side Rendering (SSR) for all pages
- ✅ Complete SEO optimization with structured data
- ✅ AJAX search functionality
- ✅ Dynamic hero slider from WooCommerce
- ✅ Responsive design with modern UI
- ✅ All e-commerce pages (Products, Categories, Cart, Checkout, etc.)
- ✅ Additional pages (About, Contact, FAQ, Privacy, Terms, Shipping, Warranty)

## API Routes

The application includes API routes that proxy requests to WooCommerce:

- `/api/products` - Get products list
- `/api/products/[id]` - Get single product
- `/api/search` - Search products
- `/api/categories` - Get categories
- `/api/hero-slides` - Get hero slider slides

## Troubleshooting

### Cannot connect to WooCommerce API

1. Make sure WordPress/WooCommerce is running on port 8000
2. Check that REST API is enabled in WooCommerce settings
3. Verify API credentials in `.env.local`
4. Check CORS settings if accessing from different domain

### Images not loading

1. Update `next.config.ts` to allow your WordPress domain
2. Make sure images are accessible from the Next.js server

## Production Build

```bash
npm run build
npm start
```

## Notes

- The slider uses featured products from WooCommerce
- Search requires at least 3 characters
- All pages are SSR for better SEO
- Structured data (JSON-LD) is included for better search engine understanding


