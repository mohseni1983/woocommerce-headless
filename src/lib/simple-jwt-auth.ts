// Simple JWT Login Plugin API Client
// Documentation: https://simplejwtlogin.com/docs
const WORDPRESS_URL = process.env.WOOCOMMERCE_URL || "http://localhost:8000";
const JWT_PLUGIN_NAMESPACE = "simple-jwt-login/v1";

export interface JWTLoginResponse {
  success: boolean;
  data?: {
    jwt: string;
    user?: any;
  };
  message?: string;
  error?: string;
}

export interface JWTRegisterResponse {
  success: boolean;
  data?: {
    user?: any;
    jwt?: string;
  };
  message?: string;
  error?: string;
}

export interface JWTValidateResponse {
  success: boolean;
  data?: {
    user_id?: number;
    email?: string;
    username?: string;
    expires?: number;
  };
  message?: string;
}

/**
 * Authenticate user and get JWT token
 * Endpoint: POST /wp-json/simple-jwt-login/v1/auth
 * Documentation: https://simplejwtlogin.com/docs/authentication
 */
export async function jwtLogin(
  emailOrUsername: string,
  password: string,
  authCode?: string
): Promise<JWTLoginResponse> {
  try {
    const body: Record<string, string> = {
      password: password,
    };

    // Plugin accepts email, username, or login parameter
    // Try to determine if it's an email
    if (emailOrUsername.includes("@")) {
      body.email = emailOrUsername;
    } else {
      body.username = emailOrUsername;
      // Also try login parameter as fallback
      body.login = emailOrUsername;
    }

    // Add auth code if provided
    if (authCode) {
      body.AUTH_CODE = authCode;
    }

    const response = await fetch(
      `${WORDPRESS_URL}/wp-json/${JWT_PLUGIN_NAMESPACE}/auth`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        cache: "no-store",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.code || "LOGIN_FAILED",
        message: data.message || "خطا در ورود",
      };
    }

    return data as JWTLoginResponse;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      error: "NETWORK_ERROR",
      message: errorMessage,
    };
  }
}

/**
 * Register a new user
 * Endpoint: POST /wp-json/simple-jwt-login/v1/users
 * Documentation: https://simplejwtlogin.com/docs/register-user
 */
export async function jwtRegister(
  email: string,
  password: string,
  username?: string,
  options?: {
    first_name?: string;
    last_name?: string;
    display_name?: string;
    role?: string;
    auth_code?: string;
  }
): Promise<JWTRegisterResponse> {
  try {
    const body: Record<string, string> = {
      email: email,
      password: password,
    };

    if (username) {
      body.username = username;
    }

    if (options?.first_name) {
      body.first_name = options.first_name;
    }

    if (options?.last_name) {
      body.last_name = options.last_name;
    }

    if (options?.display_name) {
      body.display_name = options.display_name;
    }

    if (options?.role) {
      body.role = options.role;
    }

    if (options?.auth_code) {
      body.AUTH_CODE = options.auth_code;
    }

    const response = await fetch(
      `${WORDPRESS_URL}/wp-json/${JWT_PLUGIN_NAMESPACE}/users`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        cache: "no-store",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.code || "REGISTER_FAILED",
        message: data.message || "خطا در ثبت‌نام",
      };
    }

    return data as JWTRegisterResponse;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      error: "NETWORK_ERROR",
      message: errorMessage,
    };
  }
}

/**
 * Validate JWT token
 * Endpoint: GET /wp-json/simple-jwt-login/v1/auth/validate
 * Documentation: https://simplejwtlogin.com/docs/authentication
 */
export async function jwtValidate(
  jwt: string
): Promise<JWTValidateResponse> {
  try {
    const response = await fetch(
      `${WORDPRESS_URL}/wp-json/${JWT_PLUGIN_NAMESPACE}/auth/validate`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${jwt}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "JWT validation failed",
      };
    }

    return data as JWTValidateResponse;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      message: errorMessage,
    };
  }
}

/**
 * Reset user password
 * Endpoint: POST /wp-json/simple-jwt-login/v1/reset-password
 * Documentation: https://simplejwtlogin.com/docs/reset-password
 */
export async function jwtResetPassword(
  email: string,
  authCode?: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const body: Record<string, string> = {
      email: email,
    };

    if (authCode) {
      body.AUTH_CODE = authCode;
    }

    const response = await fetch(
      `${WORDPRESS_URL}/wp-json/${JWT_PLUGIN_NAMESPACE}/reset-password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        cache: "no-store",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.code || "RESET_FAILED",
        message: data.message || "خطا در بازنشانی رمز عبور",
      };
    }

    return {
      success: true,
      message: data.message || "ایمیل بازنشانی رمز عبور ارسال شد",
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      error: "NETWORK_ERROR",
      message: errorMessage,
    };
  }
}

/**
 * Delete WordPress user (requires JWT)
 * Endpoint: POST /wp-json/simple-jwt-login/v1/delete-user
 * Documentation: https://simplejwtlogin.com/docs/delete-wordpress-user
 */
export async function jwtDeleteUser(
  jwt: string,
  email?: string,
  userId?: number,
  authCode?: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const body: Record<string, string | number> = {};

    if (email) {
      body.email = email;
    }

    if (userId) {
      body.user_id = userId;
    }

    if (authCode) {
      body.AUTH_CODE = authCode;
    }

    const response = await fetch(
      `${WORDPRESS_URL}/wp-json/${JWT_PLUGIN_NAMESPACE}/delete-user`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${jwt}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        cache: "no-store",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.code || "DELETE_FAILED",
        message: data.message || "خطا در حذف کاربر",
      };
    }

    return {
      success: true,
      message: data.message || "کاربر با موفقیت حذف شد",
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      error: "NETWORK_ERROR",
      message: errorMessage,
    };
  }
}

/**
 * Get user info using JWT token
 * Uses WordPress REST API /wp/v2/users/me with JWT authentication
 */
export async function getUserWithJWT(jwt: string) {
  try {
    const response = await fetch(`${WORDPRESS_URL}/wp-json/wp/v2/users/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${jwt}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (response.ok) {
      return await response.json();
    }

    return null;
  } catch (error) {
    console.error("Error fetching user with JWT:", error);
    return null;
  }
}

