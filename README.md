# 30tel - Next.js Headless WooCommerce E-Commerce

A modern, fully responsive Next.js headless e-commerce site for 30tel.com, a smartphone and gadget shop, built with WordPress/WooCommerce backend.

## ✨ Features

- ✅ **Fully RTL (Right-to-Left)** - Complete Persian/Farsi language support
- ✅ **Server-Side Rendering (SSR)** - All pages are SSR for optimal SEO
- ✅ **Complete SEO Optimization** - Structured data, sitemap, robots.txt, meta tags
- ✅ **AJAX Search** - Real-time product search with debouncing
- ✅ **Dynamic Hero Slider** - Pulls featured products from WooCommerce
- ✅ **Modern UI/UX** - Apple-inspired design with smooth animations
- ✅ **Vazirmatn Font** - Beautiful Persian font from Next.js font package
- ✅ **Tailwind CSS** - Fully responsive design
- ✅ **Framer Motion** - Smooth animations and transitions
- ✅ **WooCommerce Integration** - Full API integration with error handling

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes (proxy to WooCommerce)
│   ├── products/          # Product listing and detail pages
│   ├── categories/        # Category pages
│   ├── cart/              # Shopping cart
│   ├── checkout/          # Checkout page
│   ├── about/             # About page
│   ├── contact/           # Contact page
│   ├── faq/               # FAQ page
│   ├── privacy/           # Privacy policy
│   ├── terms/             # Terms and conditions
│   ├── shipping/          # Shipping info
│   ├── warranty/          # Warranty info
│   ├── sitemap.ts         # Dynamic sitemap
│   └── robots.ts          # Robots.txt
├── components/            # React components
│   ├── Header.tsx         # Navigation header with search
│   ├── Footer.tsx         # Site footer
│   ├── ProductCard.tsx    # Product card component
│   ├── HeroSlider.tsx     # Dynamic hero slider
│   ├── CategorySection.tsx # Category grid
│   ├── SearchBar.tsx       # AJAX search component
│   └── FAQAccordion.tsx   # FAQ accordion
└── lib/                   # Utilities
    ├── woocommerce.ts     # WooCommerce API client
    └── seo.ts             # SEO utilities
```

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# WooCommerce API Configuration
WOOCOMMERCE_URL=http://localhost:8000
WOOCOMMERCE_CONSUMER_KEY=your_consumer_key_here
WOOCOMMERCE_CONSUMER_SECRET=your_consumer_secret_here

# Site URL for SEO and absolute URLs
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Get WooCommerce API Credentials

1. Go to WordPress Admin → WooCommerce → Settings → Advanced → REST API
2. Click "Add Key"
3. Set description and permissions (Read)
4. Copy Consumer Key and Consumer Secret to `.env.local`

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📄 Pages

- **Home** (`/`) - Hero slider, featured products, categories
- **Products** (`/products`) - Product listing with filters
- **Product Detail** (`/products/[id]`) - Single product page
- **Categories** (`/categories`) - All categories
- **Category** (`/categories/[slug]`) - Category product listing
- **Cart** (`/cart`) - Shopping cart
- **Checkout** (`/checkout`) - Checkout form
- **About** (`/about`) - About us page
- **Contact** (`/contact`) - Contact form
- **FAQ** (`/faq`) - Frequently asked questions
- **Privacy** (`/privacy`) - Privacy policy
- **Terms** (`/terms`) - Terms and conditions
- **Shipping** (`/shipping`) - Shipping information
- **Warranty** (`/warranty`) - Warranty information

## 🔌 API Routes

All API routes proxy requests to WooCommerce:

- `GET /api/products` - Get products list
- `GET /api/products/[id]` - Get single product
- `GET /api/search?q=query` - Search products
- `GET /api/categories` - Get categories
- `GET /api/hero-slides` - Get hero slider slides

## 🎨 Design Features

- **Apple-inspired Design** - Clean, modern, minimalist
- **Smooth Animations** - Framer Motion for transitions
- **Responsive** - Mobile-first design
- **RTL Support** - Full right-to-left layout
- **Persian Typography** - Vazirmatn font family

## 🔍 SEO Features

- Meta tags (title, description, keywords)
- Open Graph tags
- Twitter Card tags
- Structured data (JSON-LD)
  - Organization
  - Product
  - Breadcrumb
- Dynamic sitemap.xml
- robots.txt
- Canonical URLs

## 🛠️ Technologies

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Utility-first CSS
- **Framer Motion** - Animation library
- **Lucide React** - Icon library
- **Vazirmatn Font** - Persian font

## 📦 Production Build

```bash
npm run build
npm start
```

## 🐛 Troubleshooting

### Cannot connect to WooCommerce API

1. Ensure WordPress/WooCommerce is running on port 8000
2. Verify REST API is enabled in WooCommerce settings
3. Check API credentials in `.env.local`
4. Test API endpoint: `http://localhost:8000/wp-json/wc/v3/products`

### Images not loading

1. Update `next.config.ts` to allow your WordPress domain
2. Ensure images are accessible from Next.js server
3. Check CORS settings if accessing from different domain

### Search not working

- Search requires at least 3 characters
- Check browser console for API errors
- Verify `/api/search` route is accessible

## 📝 Notes

- The hero slider automatically uses featured products from WooCommerce
- If no featured products exist, default slides are shown
- All product images should be hosted on WordPress or accessible URLs
- The site is fully SSR for better SEO and performance

## 📄 License

This project is private and proprietary.
