import { Request, Response, NextFunction } from 'express';

// Dynamic route to permission mapping based on your menu structure
const generateRouteAccessMap = () => {
  const routeMap: Record<string, string> = {};
  
  // Define the menu structure (based on your POS_ROLE_MENU_ITEMS)
  const menuStructure = [
    { key: 'dashboard', url: '/dashboard' },
    { 
      key: 'sales', 
      children: [
        { key: 'sales-list', url: '/sales/sales-list' },
        { key: 'membership-sales-list', url: '/sales/membership-sales-list' }
      ]
    },
    { 
      key: 'menu-master', 
      children: [
        { key: 'Restaurant-menu', url: '/menu-master/restaurant-menu' },
        { key: 'online-menu', url: '/menu-master/online-menu' },
        { key: 'membership-menu', url: '/menu-master/membership-menu' },
        { key: 'add-new-menu', url: '/menu-master/menu-add' },
        { key: 'menu-category', url: '/menu-master/menu-category' }
      ]
    },
    { 
      key: 'payment-method', 
      children: [
        { key: 'list-of-payment-method', url: '/payment-method/list-of-payment-method' },
        { key: 'add-new-payment-method', url: '/payment-method/add-new-payment-method' }
      ]
    },
    { 
      key: 'branches', 
      children: [
        { key: 'list-of-branches', url: '/branches/list-of-branches' },
        { key: 'add-new-branch', url: '/branches/add-new-branch' }
      ]
    },
    { 
      key: 'brands', 
      children: [
        { key: 'list-of-brands', url: '/brands/list-of-brands' },
        { key: 'brand-menu', url: '/brands/brand-menu' }
      ]
    },
    { 
      key: 'meal-plan', 
      children: [
        { key: 'add-meal-plan', url: '/meal-plan/add-meal-plan' },
        { key: 'meal-plan-list', url: '/meal-plan/meal-plan-list' },
        { key: 'meal-plan-menu', url: '/meal-plan/sample-menu' }
      ]
    },
    { 
      key: 'aggregators', 
      children: [
        { key: 'add-aggregators', url: '/aggregators/add-aggregators' },
        { key: 'aggregators-list', url: '/aggregators/aggregators-list' }
      ]
    },
    { 
      key: 'inventory', 
      children: [
        { key: 'add-inventory', url: '/inventory/add-inventory' },
        { key: 'inventory-list', url: '/inventory/inventory-list' },
        { key: 'supplier-master', url: '/staff/supplier-list' }
      ]
    },
    { 
      key: 'expenses', 
      children: [
        { key: 'add-expense', url: '/expenses/add-expense' },
        { key: 'cash-expense', url: '/expenses/cash-expense' },
        { key: 'credit-expense', url: '/expenses/credit-expense' }
      ]
    },
    { 
      key: 'customer', 
      children: [
        { key: 'customer-add', url: '/customer/customer-add' },
        { key: 'customer-list', url: '/customer/customer-list' },
        { key: 'customer-membership-history-list', url: '/customer/customer-membership-history-list' }
      ]
    },
    { 
      key: 'staff', 
      children: [
        { key: 'waiter-list', url: '/staff/waiter-list' },
        { key: 'cashier-list', url: '/staff/cashier-list' },
        { key: 'add-new-waiter', url: '/staff/waiter-add' },
        { key: 'add-new-cashier', url: '/staff/add-new-cashier' }
      ]
    },
    { key: 'Shift-master', url: '/shift-close' },
    { 
      key: 'reports', 
      children: [
        { key: 'membership-report', url: '/reports/membership-report' },
        { key: 'sales-report', url: '/reports/paytype-wise-report' },
        { key: 'aggregator-sales-report', url: '/reports/aggregator-wise-report' },
        { key: 'branch-sales-report', url: '/reports/branch-sales-report' },
        { key: 'pay-out-sales-report', url: '/reports/pay-out-report' },
        { key: 'supplier-wise-report', url: '/reports/supplier-wise-report' },
        { key: 'cancelled-bills-report', url: '/reports/cancel-report' },
        { key: 'discount-report', url: '/reports/discount-report' },
        { key: 'vat-report', url: '/reports/vat-report' },
        { key: 'day-closing', url: '/reports/day-close-report' }
      ]
    },
    { key: 'more-options', url: '/more-options' },
    { key: 'contact-us', url: '/contact-us' },
    { key: 'meal-plan-order-history', url: '/menu-plan-order-history' },
    { 
      key: 'pages', 
      children: [
        { key: 'home-banner', url: '/pages/home-banner' },
        { key: 'goal', url: '/pages/goal' },
        { key: 'about-us', url: '/pages/about-us' },
        { key: 'pages-brands', url: '/pages/brands' },
        { key: 'meal-plan-work', url: '/pages/meal-plan-work' },
        { key: 'counter', url: '/pages/counter' },
        { key: 'compare', url: '/pages/compare' },
        { key: 'why-choose', url: '/pages/why-choose' },
        { key: 'video', url: '/pages/video' },
        { key: 'testimonial', url: '/pages/testimonial' },
        { key: 'restaurants', url: '/pages/restaurants' },
        { key: 'restaurant-menu', url: '/pages/restaurants-menu' },
        { key: 'restaurant-location', url: '/pages/restaurants-location' }
      ]
    },
    { 
      key: 'blog', 
      children: [
        { key: 'blog-category', url: '/blog/blog-category' },
        { key: 'add-blog', url: '/blog/add-blog' },
        { key: 'blog-list', url: '/blog/blog-list' }
      ]
    },
    { key: 'faqs', url: '/support/faqs' },
    { key: 'privacy-policy', url: '/support/privacy-policy' },
    { key: 'terms-conditions', url: '/support/terms-conditions' },
    { key: 'role-management', url: '/role-management' },
    { key: 'role-management-v2', url: '/role-management-v2' },
    { key: 'settings', url: '/settings' },
    { 
      key: 'pos-module', 
      children: [
        { key: 'settle-bill', url: '/pos/settle-bill' },
        { key: 'print-order', url: '/pos/print-order' },
        { key: 'pos-reports', url: '/pos/reports' },
        { key: 'view-orders', url: '/pos/view-orders' },
        { key: 'transaction-history', url: '/pos/transaction-history' },
        { key: 'split-bill', url: '/pos/split-bill' },
        { key: 'apply-discount', url: '/pos/apply-discount' },
        { key: 'meal-plan-list', url: '/pos/meal-plan-list' },
        { key: 'sales-list', url: '/pos/sales-list' },
        { key: 'calculator', url: '/pos/calculator' },
        { key: 'start-shift', url: '/pos/start-shift' }
      ]
    }
  ];

  // Generate routes for each menu item
  menuStructure.forEach(module => {
    if (module.url) {
      // Top-level routes
      routeMap[module.url] = module.key;
      routeMap[`/v1/api${module.url}`] = module.key;
      
      // Add CRUD routes for top-level modules
      let apiBase = `/v1/api${module.url}`;
      
      // Adjust API base for /support routes (faqs, privacy-policy, terms-conditions)
      if (module.url.startsWith('/support')) {
        apiBase = `/v1/api${module.url.replace('/support', '')}`;
      }
      
      // Add all CRUD routes for top-level modules
      routeMap[apiBase] = module.key; // GET (list), POST (create)
      routeMap[`${apiBase}/:id`] = module.key; // GET (by id), PUT/PATCH (update), DELETE (by id)
      
      // Special routes for specific modules
      if (module.key === 'faqs') {
        routeMap[`${apiBase}/generate-answer`] = module.key;
      } else if (module.key === 'contact-us') {
        routeMap['/v1/api/contracts'] = module.key;
        routeMap['/v1/api/contracts/:id'] = module.key;
        routeMap['/v1/api/contracts/:id/status'] = module.key;
      } else if (module.key === 'Shift-master') {
        routeMap['/v1/api/shift'] = module.key;
        routeMap['/v1/api/shift/current'] = module.key;
        routeMap['/v1/api/shift/start'] = module.key;
        routeMap['/v1/api/shift/close'] = module.key;
        routeMap['/v1/api/shift/day-close'] = module.key;
        routeMap['/v1/api/shift/:id'] = module.key;
      } else if (module.key === 'more-options') {
        routeMap['/v1/api/more-options'] = module.key;
        routeMap['/v1/api/more-options/:id'] = module.key;
      } else if (module.key === 'meal-plan-order-history') {
        routeMap['/v1/api/meal-plan-order-history'] = module.key;
        routeMap['/v1/api/meal-plan-order-history/:id'] = module.key;
      } else if (['role-management', 'role-management-v2', 'settings'].includes(module.key)) {
        const routePath = module.key === 'role-management-v2' ? 'role-management-v2' : module.key;
        routeMap[`/v1/api/${routePath}`] = module.key;
        routeMap[`/v1/api/${routePath}/:id`] = module.key;
      }
    }
    
    if (module.children) {
      module.children.forEach(child => {
        const permissionKey = `${module.key}.${child.key}`;
        
        // Direct child routes
        routeMap[child.url] = permissionKey;
        routeMap[`/v1/api${child.url}`] = permissionKey;
        
        // Check if this is a list permission - if so, add edit/delete routes
        if (child.key.includes('list') || child.key.includes('List')) {
          const baseUrl = child.url.replace(/\/[^/]+$/, '');
          
          // Frontend edit/delete routes
          routeMap[`${baseUrl}/edit/:id`] = permissionKey;
          routeMap[`${baseUrl}/delete/:id`] = permissionKey;
          routeMap[`${baseUrl}/:id/edit`] = permissionKey;
          routeMap[`${baseUrl}/:id/delete`] = permissionKey;
          routeMap[`${baseUrl}/edit`] = permissionKey;
          routeMap[`${baseUrl}/delete`] = permissionKey;
          
          // Special cases for specific modules
          if (module.key === 'meal-plan') {
            routeMap[`/meal-plan/meal-plan-edit/:id`] = permissionKey;
            routeMap[`/meal-plan/meal-plan-edit`] = permissionKey;
          }
          if (module.key === 'branches') {
            routeMap[`/branches/edit-new-branch`] = permissionKey;
            routeMap[`/branches/delete-branch`] = permissionKey;
            routeMap[`/branches/edit-new-branch/:id`] = permissionKey;
            routeMap[`/branches/delete-branch/:id`] = permissionKey;
            routeMap[`/branches/edit-new-branch?id=:id`] = permissionKey;
            routeMap[`/branches/delete-branch?id=:id`] = permissionKey;
          }
          
          // API routes for edit/delete
          const apiBase = `/v1/api${baseUrl}`;
          routeMap[`${apiBase}/:id`] = permissionKey;
          routeMap[`${apiBase}/edit/:id`] = permissionKey;
          routeMap[`${apiBase}/delete/:id`] = permissionKey;
          routeMap[`${apiBase}/edit`] = permissionKey;
          routeMap[`${apiBase}/delete`] = permissionKey;
        }
      });
    }
  });

  return routeMap;
};

const ROUTE_ACCESS = generateRouteAccessMap();

// Routes that should be excluded from access control (public routes)
const EXCLUDED_ROUTES = [
  '/v1/api/auth/signin',
  '/v1/api/auth/signup',
  '/v1/api/auth/request-otp',
  '/v1/api/auth/verify-otp',
  '/v1/api/auth/check-phone',
  '/v1/api/auth/check-email',
  '/v1/api/auth/reset-password',
  '/v1/api/auth/activate-user',
  '/health',
  '/status'
];

// Simple function to check if user has access
const hasAccess = (userMenuAccess: any, requiredPermission: string): boolean => {
  if (!userMenuAccess || !requiredPermission) return false;

  const parts = requiredPermission.split('.');
  
  if (parts.length === 1) {
    // Top level permission like 'dashboard', 'more-options', 'faqs', etc.
    const moduleKey = parts[0];
    return userMenuAccess[moduleKey]?.checked === true;
  } else if (parts.length === 2) {
    // Nested permission like 'sales.sales-list'
    const [parent, child] = parts;
    
    // Check if parent module is checked
    if (!userMenuAccess[parent]?.checked) {
      return false;
    }
    
    // Check if user has direct permission
    if (userMenuAccess[parent]?.children?.[child] === true) {
      return true;
    }
    
    // If user has any list access in this module, grant edit/delete access
    const hasListAccess = Object.keys(userMenuAccess[parent]?.children || {})
      .some(key => (key.includes('list') || key.includes('List')) && userMenuAccess[parent]?.children?.[key] === true);
    
    if (hasListAccess) {
      return true; // User has list access, grant edit/delete access
    }
    
    return false;
  }
  
  return false;
};

// Global access control middleware
export const globalAccessControl = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get the full path - handle both frontend and API routes
      let fullPath = req.originalUrl.split('?')[0]; // Remove query parameters
      
      // Only apply access control to API routes
      if (!fullPath.startsWith('/v1/api')) {
        return next();
      }
      
      // For API routes, use the full path
      fullPath = req.baseUrl + (req.route?.path || req.path);
      
      // Skip access control for excluded routes (public routes)
      if (EXCLUDED_ROUTES.includes(fullPath)) {
        return next();
      }

      // Skip access control for routes not in our mapping (allow all other routes)
      let requiredPermission = ROUTE_ACCESS[fullPath];
      
      // If no exact match, try to match dynamic routes (with :id parameters)
      if (!requiredPermission) {
        for (const routePattern in ROUTE_ACCESS) {
          // Convert Express route patterns to regex for matching
          let regexPattern = routePattern.replace(/:[a-zA-Z0-9_]+/g, '[^/]+');
          
          // Handle query parameters
          if (routePattern.includes('?id=:id')) {
            regexPattern = routePattern.replace('?id=:id', '(\\?id=[^&]+)?');
          }
          
          const regex = new RegExp(`^${regexPattern}$`);
          
          if (regex.test(fullPath)) {
            requiredPermission = ROUTE_ACCESS[routePattern];
            break;
          }
        }
      }
      
      if (!requiredPermission) {
        return next();
      }

      // Get user from request
      const user = (req as any).user;
      
      // If no user, skip access control (let auth middleware handle it)
      if (!user) {
        return next();
      }

      // Admin and super admin have all access - BYPASS ALL RESTRICTIONS
      if (user.role === 'admin' || user.role === 'super admin') {
        return next();
      }

      // For non-admin users, check menuAccess
      const userMenuAccess = user.menuAccess;
      
      if (!userMenuAccess || Object.keys(userMenuAccess).length === 0) {
        return res.status(403).json({
          success: false,
          statusCode: 403,
          message: 'You do not have permission to perform this action'
        });
      }

      // Check if user has access to this specific route
      const hasPermission = hasAccess(userMenuAccess, requiredPermission);
      
      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          statusCode: 403,
          message: 'You do not have permission to perform this action'
        });
      }

      next();
    } catch (error: any) {
      res.status(500).json({
        success: false,
        statusCode: 500,
        message: 'Access check failed'
      });
    }
  };
};