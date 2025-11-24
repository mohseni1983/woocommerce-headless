// WooCommerce API Client
const WOOCOMMERCE_URL = process.env.WOOCOMMERCE_URL || "http://localhost:8000";
const WOOCOMMERCE_CONSUMER_KEY = process.env.WOOCOMMERCE_CONSUMER_KEY || "";
const WOOCOMMERCE_CONSUMER_SECRET =
  process.env.WOOCOMMERCE_CONSUMER_SECRET || "";

export interface WooCommerceProduct {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  date_created: string;
  date_modified: string;
  type: string;
  status: string;
  featured: boolean;
  catalog_visibility: string;
  description: string;
  short_description: string;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  purchasable: boolean;
  total_sales: number;
  virtual: boolean;
  downloadable: boolean;
  downloads: any[];
  download_limit: number;
  download_expiry: number;
  external_url: string;
  button_text: string;
  tax_status: string;
  tax_class: string;
  manage_stock: boolean;
  stock_quantity: number | null;
  stock_status: string;
  backorders: string;
  backorders_allowed: boolean;
  backordered: boolean;
  sold_individually: boolean;
  weight: string;
  dimensions: {
    length: string;
    width: string;
    height: string;
  };
  shipping_required: boolean;
  shipping_taxable: boolean;
  shipping_class: string;
  shipping_class_id: number;
  reviews_allowed: boolean;
  average_rating: string;
  rating_count: number;
  upsell_ids: number[];
  cross_sell_ids: number[];
  parent_id: number;
  purchase_note: string;
  categories: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  tags: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  images: Array<{
    id: number;
    src: string;
    name: string;
    alt: string;
  }>;
  attributes: any[];
  default_attributes: any[];
  variations: number[];
  grouped_products: number[];
  menu_order: number;
  price_html: string;
  related_ids: number[];
  meta_data: any[];
  _links: any;
}

export interface WooCommerceCategory {
  id: number;
  name: string;
  slug: string;
  parent: number;
  description: string;
  display: string;
  image: {
    id: number;
    src: string;
    name: string;
    alt: string;
  } | null;
  menu_order: number;
  count: number;
  meta_data?: Array<{
    id: number;
    key: string;
    value: string;
  }>;
  _links: any;
}

export async function fetchWooCommerce(
  endpoint: string,
  params: Record<string, any> = {},
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  body?: any
): Promise<any> {
  // Check if WooCommerce URL is configured
  if (!WOOCOMMERCE_URL) {
    console.warn("WooCommerce URL not configured");
    return endpoint.includes("products") || endpoint.includes("categories")
      ? []
      : null;
  }

  // Clean endpoint - remove leading/trailing slashes and ensure proper format
  const cleanEndpoint = endpoint.replace(/^\/+|\/+$/g, "");

  // Build URL
  const baseUrl = `${WOOCOMMERCE_URL}/wp-json/wc/v3/${cleanEndpoint}`;
  const url = new URL(baseUrl);

  // Add query parameters
  Object.keys(params).forEach((key) => {
    if (params[key] !== undefined && params[key] !== null) {
      url.searchParams.append(key, params[key].toString());
    }
  });

  console.log("[DEBUG] fetchWooCommerce - Endpoint:", cleanEndpoint);
  console.log(
    "[DEBUG] fetchWooCommerce - Full URL:",
    url.toString().replace(/consumer_secret=[^&]+/g, "consumer_secret=***")
  );

  // Prepare headers
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  // Add authentication - Try Basic Auth first (recommended for server-side)
  if (WOOCOMMERCE_CONSUMER_KEY && WOOCOMMERCE_CONSUMER_SECRET) {
    // Use Basic Auth (recommended for server-side)
    const credentials = Buffer.from(
      `${WOOCOMMERCE_CONSUMER_KEY}:${WOOCOMMERCE_CONSUMER_SECRET}`
    ).toString("base64");
    headers["Authorization"] = `Basic ${credentials}`;
  } else {
    // Fallback to query parameters if no credentials
    if (WOOCOMMERCE_CONSUMER_KEY) {
      url.searchParams.append("consumer_key", WOOCOMMERCE_CONSUMER_KEY);
    }
    if (WOOCOMMERCE_CONSUMER_SECRET) {
      url.searchParams.append("consumer_secret", WOOCOMMERCE_CONSUMER_SECRET);
    }
  }

  try {
    const fetchOptions: RequestInit & { next?: { revalidate: number } } = {
      method,
      headers,
    };

    if (method !== "GET" && body) {
      fetchOptions.body = JSON.stringify(body);
    }

    if (method === "GET") {
      (fetchOptions as any).next = { revalidate: 60 }; // Revalidate every 60 seconds for SSR
    }

    const response = await fetch(url.toString(), fetchOptions);

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }

      console.error(
        `[ERROR] WooCommerce API error (${response.status}):`,
        errorText
      );
      console.error(
        `[ERROR] Failed URL: ${url
          .toString()
          .replace(/consumer_secret=[^&]+/g, "consumer_secret=***")}`
      );
      console.error(`[ERROR] Endpoint: ${cleanEndpoint}`);
      console.error(`[ERROR] Method: ${method}`);
      console.error(`[ERROR] Error data:`, errorData);

      // If 401, provide helpful error message
      if (response.status === 401) {
        const errorCode = errorData?.code || "";
        const isCannotView = errorCode === "woocommerce_rest_cannot_view";

        console.error(
          "\n⚠️  API Authentication Error (401):\n" +
            (isCannotView
              ? "   ❌ USER ROLE ISSUE: The user linked to your API key doesn't have Administrator role.\n" +
                "   🔧 QUICK FIX:\n" +
                "      1. Go to WordPress Admin → Users → All Users\n" +
                "      2. Find the user associated with your API key\n" +
                "      3. Change their Role to 'Administrator'\n" +
                "      4. Or create a new API key linked to an Administrator user\n" +
                "   See QUICK_FIX.md for step-by-step instructions\n"
              : "   The API keys don't have proper permissions.\n" +
                "   Please check:\n" +
                "   1. Go to WordPress Admin → WooCommerce → Settings → Advanced → REST API\n" +
                "   2. Find your API key and ensure it has 'Read' permissions\n" +
                "   3. Verify the user associated with the key has Administrator role\n" +
                "   4. See COMPREHENSIVE_API_FIX.md for detailed instructions\n")
        );
      }

      // Return empty array/object instead of throwing to prevent app crashes
      if (endpoint.includes("products")) {
        return [];
      }
      if (endpoint.includes("categories")) {
        return [];
      }
      return null;
    }

    return await response.json();
  } catch (error: any) {
    console.error("WooCommerce API Error:", error);
    console.error(`Failed URL: ${url.toString()}`);

    // Return empty array/object instead of throwing to prevent app crashes
    if (endpoint.includes("products")) {
      return [];
    }
    if (endpoint.includes("categories")) {
      return [];
    }
    return null;
  }
}

export async function getProducts(
  params: {
    per_page?: number;
    page?: number;
    category?: number;
    featured?: boolean;
    on_sale?: boolean;
    search?: string;
    orderby?: string;
    order?: "asc" | "desc";
  } = {}
): Promise<WooCommerceProduct[]> {
  const defaultParams = {
    per_page: 12,
    page: 1,
    status: "publish",
    ...params,
  };

  return fetchWooCommerce("products", defaultParams);
}

export async function getProduct(
  id: number | string
): Promise<WooCommerceProduct | null> {
  // Ensure id is a valid number or string
  const productId = typeof id === "string" ? id.trim() : String(id);

  if (!productId || productId === "undefined" || productId === "null") {
    console.error("[DEBUG] getProduct: Invalid product ID:", id);
    return null;
  }

  console.log("[DEBUG] getProduct: Fetching product with ID:", productId);

  // Try to fetch by ID first
  let product = await fetchWooCommerce(`products/${productId}`);

  // If not found and productId looks like a number, it might be a slug
  // Try fetching by slug as fallback
  if (!product && !isNaN(Number(productId))) {
    // If it's a number but not found, try as slug
    console.log(
      "[DEBUG] getProduct: Product not found by ID, trying as slug:",
      productId
    );
    product = await getProductBySlug(productId);
  } else if (!product) {
    // If it's not a number, try as slug
    console.log(
      "[DEBUG] getProduct: Product not found by ID, trying as slug:",
      productId
    );
    product = await getProductBySlug(productId);
  }

  if (!product) {
    console.error(
      "[DEBUG] getProduct: Product not found for ID/slug:",
      productId
    );
    return null;
  }

  return product;
}

export async function getProductBySlug(
  slug: string
): Promise<WooCommerceProduct | null> {
  const products = await fetchWooCommerce("products", {
    slug,
    status: "publish",
  });
  if (!products || !Array.isArray(products) || products.length === 0) {
    return null;
  }
  return products[0];
}

export async function getCategories(
  params: {
    per_page?: number;
    page?: number;
    parent?: number;
    hide_empty?: boolean;
  } = {}
): Promise<WooCommerceCategory[]> {
  const defaultParams = {
    per_page: 100,
    page: 1,
    ...params,
  };

  return fetchWooCommerce("products/categories", defaultParams);
}

export async function getCategory(
  id: number | string
): Promise<WooCommerceCategory | null> {
  const category = await fetchWooCommerce(`products/categories/${id}`);
  if (!category) {
    return null;
  }
  return category;
}

export async function getCategoryBySlug(
  slug: string
): Promise<WooCommerceCategory | null> {
  const categories = await fetchWooCommerce("products/categories", {
    slug,
  });
  if (!categories || !Array.isArray(categories) || categories.length === 0) {
    return null;
  }
  return categories[0];
}

export async function searchProducts(
  query: string,
  params: {
    per_page?: number;
    page?: number;
  } = {}
): Promise<WooCommerceProduct[]> {
  return getProducts({
    search: query,
    ...params,
  });
}
