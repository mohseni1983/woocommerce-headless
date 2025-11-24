// WooCommerce Customer API Client
import { fetchWooCommerce } from "./woocommerce";

export interface WooCommerceCustomer {
  id: number;
  date_created: string;
  date_created_gmt: string;
  date_modified: string;
  date_modified_gmt: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  username: string;
  password?: string;
  billing: {
    first_name: string;
    last_name: string;
    company: string;
    address_1: string;
    address_2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
    email: string;
    phone: string;
  };
  shipping: {
    first_name: string;
    last_name: string;
    company: string;
    address_1: string;
    address_2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
  is_paying_customer: boolean;
  avatar_url: string;
  meta_data: Array<{
    id: number;
    key: string;
    value: any;
  }>;
}

export interface WooCommerceOrder {
  id: number;
  parent_id: number;
  status: string;
  currency: string;
  date_created: string;
  date_created_gmt: string;
  date_modified: string;
  date_modified_gmt: string;
  discount_total: string;
  discount_tax: string;
  shipping_total: string;
  shipping_tax: string;
  cart_tax: string;
  total: string;
  total_tax: string;
  customer_id: number;
  order_key: string;
  billing: {
    first_name: string;
    last_name: string;
    company: string;
    address_1: string;
    address_2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
    email: string;
    phone: string;
  };
  shipping: {
    first_name: string;
    last_name: string;
    company: string;
    address_1: string;
    address_2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
  payment_method: string;
  payment_method_title: string;
  transaction_id: string;
  customer_ip_address: string;
  customer_user_agent: string;
  created_via: string;
  customer_note: string;
  date_completed: string | null;
  date_paid: string | null;
  cart_hash: string;
  number: string;
  meta_data: Array<{
    id: number;
    key: string;
    value: any;
  }>;
  line_items: Array<{
    id: number;
    name: string;
    product_id: number;
    variation_id: number;
    quantity: number;
    tax_class: string;
    subtotal: string;
    subtotal_tax: string;
    total: string;
    total_tax: string;
    taxes: Array<any>;
    meta_data: Array<any>;
    sku: string;
    price: number;
    image?: {
      id: number;
      src: string;
    };
  }>;
  tax_lines: Array<any>;
  shipping_lines: Array<any>;
  fee_lines: Array<any>;
  coupon_lines: Array<any>;
  refunds: Array<any>;
  _links: any;
}

/**
 * Get customer by ID
 */
export async function getCustomer(
  customerId: number
): Promise<WooCommerceCustomer | null> {
  return await fetchWooCommerce(`customers/${customerId}`);
}

/**
 * Get customer by email
 */
export async function getCustomerByEmail(
  email: string
): Promise<WooCommerceCustomer | null> {
  const customers = await fetchWooCommerce("customers", { email });
  return Array.isArray(customers) && customers.length > 0
    ? customers[0]
    : null;
}

/**
 * Create new customer
 */
export async function createCustomer(
  data: Partial<WooCommerceCustomer>
): Promise<WooCommerceCustomer | null> {
  return await fetchWooCommerce("customers", {}, "POST", data);
}

/**
 * Update customer
 */
export async function updateCustomer(
  customerId: number,
  data: Partial<WooCommerceCustomer>
): Promise<WooCommerceCustomer | null> {
  return await fetchWooCommerce(`customers/${customerId}`, {}, "PUT", data);
}

/**
 * Get customer orders
 */
export async function getCustomerOrders(
  customerId: number,
  params: {
    per_page?: number;
    page?: number;
    status?: string;
  } = {}
): Promise<WooCommerceOrder[]> {
  try {
    const defaultParams: any = {
      customer: customerId,
      per_page: params.per_page || 10,
      page: params.page || 1,
    };
    
    // Add status filter if provided
    if (params.status && params.status !== "all") {
      defaultParams.status = params.status;
    }

    console.log("[DEBUG] Fetching orders with params:", defaultParams);
    const orders = await fetchWooCommerce("orders", defaultParams);
    console.log("[DEBUG] Orders fetched:", orders?.length || 0);
    
    return orders || [];
  } catch (error) {
    console.error("[DEBUG] Error in getCustomerOrders:", error);
    return [];
  }
}

/**
 * Get single order
 */
export async function getOrder(orderId: number): Promise<WooCommerceOrder | null> {
  return await fetchWooCommerce(`orders/${orderId}`);
}

