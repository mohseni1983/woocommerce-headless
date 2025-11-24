// WordPress Authentication API Client
// Uses Simple JWT Login plugin as primary method
// Documentation: https://simplejwtlogin.com/docs
import { jwtLogin, jwtRegister, getUserWithJWT } from "./simple-jwt-auth";

const WORDPRESS_URL = process.env.WOOCOMMERCE_URL || "http://localhost:8000";

export interface WordPressUser {
  id: number;
  username: string;
  name: string;
  first_name: string;
  last_name: string;
  email: string;
  url: string;
  description: string;
  link: string;
  locale: string;
  nickname: string;
  slug: string;
  registered_date: string;
  roles: string[];
  capabilities: Record<string, boolean>;
  extra_capabilities: Record<string, boolean>;
  avatar_urls: Record<string, string>;
  meta: Record<string, any>;
}

export interface LoginResponse {
  success: boolean;
  user?: WordPressUser;
  customer?: any; // WooCommerce customer data
  token?: string;
  cookie?: string;
  error?: string;
  message?: string;
}

export interface RegisterResponse {
  success: boolean;
  user?: WordPressUser;
  error?: string;
  message?: string;
}

/**
 * Login user with WordPress REST API
 * Uses Application Password or Cookie-based authentication
 */
export async function loginUser(
  username: string,
  password: string
): Promise<LoginResponse> {
  try {
    // Method 1: Use Simple JWT Login plugin (primary method)
    // Documentation: https://simplejwtlogin.com/docs/authentication
    try {
      const jwtResult = await jwtLogin(username, password);

      if (jwtResult.success && jwtResult.data?.jwt) {
        const jwt = jwtResult.data.jwt;
        console.log("Login successful via Simple JWT Login plugin");

        // Get full user info from WordPress API using JWT
        let user: WordPressUser | undefined = await getUserWithJWT(jwt);

        // If we couldn't get user from API, try to construct from JWT response
        if (!user && jwtResult.data.user) {
          const userData = jwtResult.data.user;
          user = {
            id: userData.ID || userData.id || userData.user_id,
            username: userData.user_login || userData.username || username,
            name: userData.display_name || userData.name || username,
            first_name: userData.first_name || "",
            last_name: userData.last_name || "",
            email: userData.user_email || userData.email || "",
            url: userData.user_url || "",
            description: userData.description || "",
            link: userData.link || "",
            locale: userData.locale || "",
            nickname: userData.nickname || username,
            slug: userData.user_nicename || username,
            registered_date: userData.user_registered || "",
            roles: userData.roles || ["customer"],
            capabilities: {},
            extra_capabilities: {},
            avatar_urls: {},
            meta: {},
          } as WordPressUser;
        }

        if (user) {
          return {
            success: true,
            user: user,
            token: jwt, // Return JWT token
          };
        }
      } else {
        // JWT login failed, but continue to fallback methods
        console.log("JWT Login failed:", jwtResult.message || jwtResult.error);
      }
    } catch (e: unknown) {
      // Continue to next method
      const errorMessage = e instanceof Error ? e.message : "Unknown error";
      console.log("Method 1 (JWT Login) failed:", errorMessage);
    }

    // Method 2: Try Application Password authentication (WordPress 5.6+)
    // This requires the user to have an application password set
    try {
      const response = await fetch(`${WORDPRESS_URL}/wp-json/wp/v2/users/me`, {
        method: "GET",
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${encodeURIComponent(username)}:${encodeURIComponent(password)}`
          ).toString("base64")}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      if (response.ok) {
        const user = await response.json();
        console.log("Login successful via Basic Auth");
        return {
          success: true,
          user: user as WordPressUser,
        };
      } else {
        const errorText = await response.text();
        console.log("Basic Auth failed:", {
          status: response.status,
          error: errorText.substring(0, 200),
        });
      }
    } catch (e: unknown) {
      // Continue to next method
      const errorMessage = e instanceof Error ? e.message : "Unknown error";
      console.log("Method 2 (Application Password) failed:", errorMessage);
    }

    // Method 2: Try WooCommerce custom login endpoint (if available)
    // This uses wp_signon() which is the proper WordPress way
    try {
      const wcLoginResponse = await fetch(
        `${WORDPRESS_URL}/wp-json/wc/v3/customer/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            password,
          }),
          credentials: "include", // Important for cookies
          cache: "no-store",
        }
      );

      if (wcLoginResponse.ok) {
        const data = await wcLoginResponse.json();
        if (data.success && data.user) {
          console.log(
            "[DEBUG] Login successful via WooCommerce custom endpoint"
          );
          console.log("[DEBUG] User data from WooCommerce:", {
            id: data.user.id,
            username: data.user.username,
            email: data.user.email,
          });

          // Ensure the user object has all required WordPressUser fields
          const user: WordPressUser = {
            id: data.user.id,
            username: data.user.username || data.user.user_login || "",
            name:
              data.user.name ||
              data.user.display_name ||
              data.user.username ||
              "",
            first_name: data.user.first_name || "",
            last_name: data.user.last_name || "",
            email: data.user.email || "",
            url: data.user.url || "",
            description: data.user.description || "",
            link: data.user.link || "",
            locale: data.user.locale || "",
            nickname: data.user.nickname || data.user.username || "",
            slug:
              data.user.slug ||
              data.user.user_nicename ||
              data.user.username ||
              "",
            registered_date:
              data.user.registered_date || data.user.user_registered || "",
            roles: data.user.roles || ["customer"],
            capabilities: data.user.capabilities || {},
            extra_capabilities: data.user.extra_capabilities || {},
            avatar_urls: data.user.avatar_urls || {},
            meta: data.user.meta || {},
          };

          return {
            success: true,
            user: user,
            customer: data.customer,
          };
        } else {
          console.log(
            "[DEBUG] WooCommerce endpoint returned success but no user:",
            data
          );
        }
      } else {
        const errorText = await wcLoginResponse.text();
        console.log(
          "[DEBUG] WooCommerce endpoint failed:",
          wcLoginResponse.status,
          errorText.substring(0, 200)
        );
      }
    } catch (e: unknown) {
      // Custom endpoint not available, continue to next method
      const errorMessage = e instanceof Error ? e.message : "Unknown error";
      console.log(
        "WooCommerce custom login endpoint not available:",
        errorMessage
      );
    }

    // Method 3: Try cookie-based authentication via wp-login.php
    // WordPress requires a test cookie first, then we can login
    try {
      // Step 1: Get test cookie from WordPress
      const testCookieResponse = await fetch(`${WORDPRESS_URL}/wp-login.php`, {
        method: "GET",
        cache: "no-store",
      });

      // Extract test cookie
      let testCookie = "";
      testCookieResponse.headers.forEach((value, key) => {
        if (key.toLowerCase() === "set-cookie") {
          const cookieMatch = value.match(/wordpress_test_cookie=([^;]+)/);
          if (cookieMatch) {
            testCookie = `wordpress_test_cookie=${cookieMatch[1]}`;
          }
        }
      });

      // Step 2: Now login with the test cookie
      const loginResponse = await fetch(`${WORDPRESS_URL}/wp-login.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Cookie: testCookie, // Include test cookie
        },
        body: new URLSearchParams({
          log: username,
          pwd: password,
          "wp-submit": "Log In",
          redirect_to: `${WORDPRESS_URL}/wp-admin/`,
          testcookie: "1",
        }),
        redirect: "manual",
        cache: "no-store",
      });

      // Extract all cookies from login response
      const allCookies: string[] = [];
      if (testCookie) {
        allCookies.push(testCookie);
      }

      loginResponse.headers.forEach((value, key) => {
        if (key.toLowerCase() === "set-cookie") {
          // Extract cookie name and value
          const cookieMatch = value.match(/^([^=]+)=([^;]+)/);
          if (cookieMatch) {
            allCookies.push(`${cookieMatch[1]}=${cookieMatch[2]}`);
          }
        }
      });

      const cookies = allCookies.join("; ");

      // Check if login was successful (302 redirect means success)
      const isSuccess = loginResponse.status === 302;

      if (isSuccess && cookies) {
        // Step 3: Get user info with authentication cookies
        const userResponse = await fetch(
          `${WORDPRESS_URL}/wp-json/wp/v2/users/me`,
          {
            headers: {
              "Content-Type": "application/json",
              Cookie: cookies,
            },
            cache: "no-store",
          }
        );

        if (userResponse.ok) {
          const user = await userResponse.json();
          return {
            success: true,
            user: user as WordPressUser,
            cookie: cookies, // Return cookies for client-side use
          };
        } else {
          const errorText = await userResponse.text();
          console.log("Failed to get user after login:", {
            status: userResponse.status,
            error: errorText.substring(0, 200),
          });
        }
      } else {
        // Login failed - check response body for error message
        const responseText = await loginResponse.text();
        if (
          responseText.includes("incorrect_password") ||
          responseText.includes("invalid_username") ||
          responseText.includes("نام کاربری یا رمز عبور اشتباه") ||
          responseText.includes("خطا")
        ) {
          return {
            success: false,
            error: "INVALID_CREDENTIALS",
            message: "نام کاربری یا رمز عبور اشتباه است",
          };
        }
        console.log(
          "Login failed, status:",
          loginResponse.status,
          "cookies:",
          cookies
        );
      }
    } catch (e: unknown) {
      // Continue to next method
      const errorMessage = e instanceof Error ? e.message : "Unknown error";
      console.log("Method 3 (Cookie-based) failed:", errorMessage);
    }

    // All methods failed
    // Note: WordPress REST API requires Application Passwords for Basic Auth
    // Regular username/password only works with cookie-based auth or JWT plugin
    console.error("All login methods failed for user:", username);
    return {
      success: false,
      error: "INVALID_CREDENTIALS",
      message:
        "نام کاربری یا رمز عبور اشتباه است. لطفا از Application Password استفاده کنید یا با مدیر سایت تماس بگیرید.",
    };
  } catch (error: any) {
    console.error("Login error:", error);
    return {
      success: false,
      error: "NETWORK_ERROR",
      message: error.message || "خطا در اتصال به سرور. لطفا دوباره تلاش کنید.",
    };
  }
}

/**
 * Register new user
 * Uses Simple JWT Login plugin if available, falls back to WordPress REST API
 * Documentation: https://simplejwtlogin.com/docs/register-user
 */
export async function registerUser(
  username: string,
  email: string,
  password: string,
  firstName?: string,
  lastName?: string
): Promise<RegisterResponse> {
  try {
    // Method 1: Try Simple JWT Login plugin register endpoint
    try {
      const jwtResult = await jwtRegister(email, password, username, {
        first_name: firstName,
        last_name: lastName,
        role: "customer", // Default role for new users
      });

      if (jwtResult.success && jwtResult.data?.user) {
        const userData = jwtResult.data.user;
        const user: WordPressUser = {
          id: userData.ID || userData.id,
          username: userData.user_login || username,
          name: userData.display_name || username,
          first_name: userData.first_name || firstName || "",
          last_name: userData.last_name || lastName || "",
          email: userData.user_email || email,
          url: userData.user_url || "",
          description: userData.description || "",
          link: userData.link || "",
          locale: userData.locale || "",
          nickname: userData.nickname || username,
          slug: userData.user_nicename || username,
          registered_date: userData.user_registered || new Date().toISOString(),
          roles: userData.roles || ["customer"],
          capabilities: {},
          extra_capabilities: {},
          avatar_urls: {},
          meta: {},
        };

        console.log("Registration successful via Simple JWT Login plugin");
        return {
          success: true,
          user: user,
        };
      } else {
        console.log(
          "JWT Register failed:",
          jwtResult.message || jwtResult.error
        );
      }
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "Unknown error";
      console.log("JWT Register method failed:", errorMessage);
    }

    // Method 2: Fallback to WordPress REST API
    // According to WordPress REST API official documentation:
    // POST /wp-json/wp/v2/users works WITHOUT authentication IF "Anyone can register" is enabled
    const response = await fetch(`${WORDPRESS_URL}/wp-json/wp/v2/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        email,
        password,
        name: firstName && lastName ? `${firstName} ${lastName}` : username,
        first_name: firstName || "",
        last_name: lastName || "",
      }),
      cache: "no-store",
    });

    // Check if response is JSON before parsing
    const contentType = response.headers.get("content-type") || "";
    let data: any;

    try {
      if (contentType.includes("application/json")) {
        data = await response.json();
      } else {
        // Not JSON - read as text to see what we got
        const text = await response.text();
        console.error("WordPress API returned non-JSON:", {
          status: response.status,
          contentType,
          preview: text.substring(0, 300),
        });
        return {
          success: false,
          error: "INVALID_RESPONSE",
          message:
            "پاسخ نامعتبر از سرور WordPress دریافت شد. لطفا تنظیمات WordPress را بررسی کنید.",
        };
      }
    } catch (parseError: any) {
      console.error("Failed to parse WordPress API response:", parseError);
      return {
        success: false,
        error: "PARSE_ERROR",
        message: "خطا در پردازش پاسخ سرور",
      };
    }

    // Success case - WordPress returns user object with id on success
    if (response.ok && data && data.id) {
      return {
        success: true,
        user: data as WordPressUser,
      };
    }

    // Error case - handle WordPress REST API error codes
    // Reference: https://developer.wordpress.org/rest-api/reference/users/#create-a-user
    let errorMessage = "خطا در ثبت‌نام";
    const errorCode = data?.code || "";

    if (errorCode === "existing_user_login") {
      errorMessage = "این نام کاربری قبلا استفاده شده است";
    } else if (errorCode === "existing_user_email") {
      errorMessage = "این ایمیل قبلا ثبت شده است";
    } else if (errorCode === "invalid_email") {
      errorMessage = "ایمیل وارد شده معتبر نیست";
    } else if (errorCode === "rest_cannot_create_user") {
      errorMessage =
        "ثبت‌نام عمومی غیرفعال است. لطفا در تنظیمات WordPress (Settings → General)، گزینه 'Anyone can register' را فعال کنید.";
    } else if (errorCode === "rest_user_invalid_password") {
      errorMessage = "رمز عبور معتبر نیست. رمز عبور باید حداقل 6 کاراکتر باشد.";
    } else if (data?.message) {
      errorMessage = data.message;
    }

    console.error("WordPress registration failed:", {
      status: response.status,
      code: errorCode,
      message: data?.message,
      fullResponse: data,
    });

    return {
      success: false,
      error: errorCode || "REGISTRATION_ERROR",
      message: errorMessage,
    };
  } catch (error: any) {
    console.error("Registration error:", error);
    return {
      success: false,
      error: "NETWORK_ERROR",
      message: error.message || "خطا در اتصال به سرور. لطفا دوباره تلاش کنید.",
    };
  }
}

/**
 * Get current user from WordPress
 * Tries JWT token first, then falls back to cookie-based auth
 */
export async function getCurrentUser(
  cookie?: string,
  jwt?: string
): Promise<WordPressUser | null> {
  try {
    // Method 1: Try JWT token if provided
    if (jwt) {
      console.log("[DEBUG] getCurrentUser - Trying JWT token");
      const user = await getUserWithJWT(jwt);
      if (user) {
        console.log(
          "[DEBUG] getCurrentUser - Success with JWT, user ID:",
          user.id
        );
        return user as WordPressUser;
      }
      console.log("[DEBUG] getCurrentUser - JWT failed, trying cookie");
    }

    // Method 2: Fallback to cookie-based auth
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (cookie) {
      headers["Cookie"] = cookie;
      console.log("[DEBUG] getCurrentUser - Using cookie auth");
    } else {
      console.log(
        "[DEBUG] getCurrentUser - No cookie provided, using credentials include"
      );
    }

    const response = await fetch(`${WORDPRESS_URL}/wp-json/wp/v2/users/me`, {
      credentials: "include",
      headers,
      cache: "no-store", // Don't cache auth requests
    });

    if (response.ok) {
      const user = (await response.json()) as WordPressUser;
      console.log(
        "[DEBUG] getCurrentUser - Success with cookie, user ID:",
        user.id
      );
      return user;
    }

    // Log the error for debugging
    const errorText = await response.text();
    console.log(
      `[DEBUG] getCurrentUser - Failed (${response.status}):`,
      errorText.substring(0, 200)
    );

    return null;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("[DEBUG] getCurrentUser - Exception:", errorMessage);
    return null;
  }
}

/**
 * Update user profile
 */
export async function updateUser(
  userId: number,
  data: Partial<WordPressUser>,
  cookie?: string
): Promise<WordPressUser | null> {
  try {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (cookie) {
      headers["Cookie"] = cookie;
    }

    const response = await fetch(
      `${WORDPRESS_URL}/wp-json/wp/v2/users/${userId}`,
      {
        method: "POST",
        credentials: "include",
        headers,
        body: JSON.stringify(data),
      }
    );

    if (response.ok) {
      return (await response.json()) as WordPressUser;
    }

    return null;
  } catch (error) {
    console.error("Update user error:", error);
    return null;
  }
}

/**
 * Logout user
 */
export async function logoutUser(): Promise<boolean> {
  try {
    const response = await fetch(
      `${WORDPRESS_URL}/wp-login.php?action=logout`,
      {
        method: "POST",
        credentials: "include",
      }
    );
    return response.ok;
  } catch (error) {
    console.error("Logout error:", error);
    return false;
  }
}
