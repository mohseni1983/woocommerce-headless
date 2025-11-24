<?php
/**
 * Custom WordPress REST API Endpoint for Customer Login
 * 
 * Add this to your WordPress theme's functions.php or create a custom plugin
 * 
 * This endpoint uses wp_signon() which is the proper WordPress way to authenticate users
 * and works for customers with the "customer" role.
 */

add_action('rest_api_init', function () {
    register_rest_route('wc/v3', '/customer/login', array(
        'methods' => 'POST',
        'callback' => 'wc_customer_login',
        'permission_callback' => '__return_true', // Public endpoint
    ));
});

function wc_customer_login($request) {
    $username = $request->get_param('username');
    $password = $request->get_param('password');
    
    if (empty($username) || empty($password)) {
        return new WP_Error(
            'missing_credentials',
            'Username and password are required',
            array('status' => 400)
        );
    }
    
    // Use WordPress's native authentication
    $user = wp_authenticate($username, $password);
    
    if (is_wp_error($user)) {
        return new WP_Error(
            'invalid_credentials',
            'Invalid username or password',
            array('status' => 401)
        );
    }
    
    // Check if user has customer role (or allow any role)
    $allowed_roles = array('customer', 'administrator', 'shop_manager');
    $user_roles = $user->roles;
    $has_allowed_role = false;
    
    foreach ($user_roles as $role) {
        if (in_array($role, $allowed_roles)) {
            $has_allowed_role = true;
            break;
        }
    }
    
    if (!$has_allowed_role) {
        return new WP_Error(
            'insufficient_permissions',
            'User does not have required role',
            array('status' => 403)
        );
    }
    
    // Sign in the user (sets cookies)
    $creds = array(
        'user_login' => $username,
        'user_password' => $password,
        'remember' => true
    );
    
    $signon_result = wp_signon($creds, false);
    
    if (is_wp_error($signon_result)) {
        return new WP_Error(
            'signon_failed',
            'Failed to sign in user',
            array('status' => 500)
        );
    }
    
    // Get user data
    $user_data = array(
        'id' => $user->ID,
        'username' => $user->user_login,
        'email' => $user->user_email,
        'name' => $user->display_name,
        'first_name' => $user->first_name,
        'last_name' => $user->last_name,
        'roles' => $user->roles,
    );
    
    // Get WooCommerce customer data if available
    $customer_data = null;
    if (function_exists('wc_get_customer')) {
        $customer = new WC_Customer($user->ID);
        if ($customer->get_id()) {
            $customer_data = array(
                'id' => $customer->get_id(),
                'email' => $customer->get_email(),
                'first_name' => $customer->get_first_name(),
                'last_name' => $customer->get_last_name(),
                'billing' => $customer->get_billing(),
                'shipping' => $customer->get_shipping(),
            );
        }
    }
    
    return new WP_REST_Response(array(
        'success' => true,
        'user' => $user_data,
        'customer' => $customer_data,
    ), 200);
}

