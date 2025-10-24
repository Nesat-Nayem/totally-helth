import { RequestHandler, Request, Response, NextFunction } from 'express';
import { User } from '../modules/auth/auth.model';
import mongoose from 'mongoose';

export interface AuthenticatedRequest extends Request {
  user?: any;
  userPermissions?: any;
}

// Middleware to check if user has specific permission
export const checkPermission = (requiredPermission: string): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthenticatedRequest;
    try {
      if (!authReq.user) {
        return res.status(401).json({
          success: false,
          statusCode: 401,
          message: 'Authentication required'
        });
      }

      const userId = authReq.user._id || authReq.user.id;
      
      // Get user with role information
      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          statusCode: 404,
          message: 'User not found'
        });
      }

      // Check if user has menuAccess permissions
      if (user.menuAccess && Object.keys(user.menuAccess).length > 0) {
        // Check if user has the required permission
        const hasPermission = checkRolePermission(user.menuAccess, requiredPermission);
        
        if (!hasPermission) {
          return res.status(403).json({
            success: false,
            statusCode: 403,
            message: 'Insufficient permissions'
          });
        }
      } else {
        // If no menuAccess assigned, check if user is admin
        if (user.role !== 'admin' && user.role !== 'Admin') {
          return res.status(403).json({
            success: false,
            statusCode: 403,
            message: 'Insufficient permissions'
          });
        }
      }

      next();
    } catch (error: any) {
      res.status(500).json({
        success: false,
        statusCode: 500,
        message: 'Permission check failed'
      });
    }
  };
};

// Middleware to check if user has any of the specified permissions
export const checkAnyPermission = (requiredPermissions: string[]): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthenticatedRequest;
    try {
      if (!authReq.user) {
        return res.status(401).json({
          success: false,
          statusCode: 401,
          message: 'Authentication required'
        });
      }

      const userId = authReq.user._id || authReq.user.id;
      
      // Get user with role information
      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          statusCode: 404,
          message: 'User not found'
        });
      }

      // Check if user has menuAccess permissions
      if (user.menuAccess && Object.keys(user.menuAccess).length > 0) {
        // Check if role has any of the required permissions
        const hasAnyPermission = requiredPermissions.some(permission => 
          checkRolePermission(user.menuAccess || {}, permission)
        );
        
        if (!hasAnyPermission) {
          return res.status(403).json({
            success: false,
            statusCode: 403,
            message: 'Insufficient permissions'
          });
        }
      } else {
        // If no menuAccess assigned, check if user is admin
        if (user.role !== 'admin' && user.role !== 'Admin') {
          return res.status(403).json({
            success: false,
            statusCode: 403,
            message: 'Insufficient permissions'
          });
        }
      }

      next();
    } catch (error: any) {
      res.status(500).json({
        success: false,
        statusCode: 500,
        message: 'Permission check failed'
      });
    }
  };
};

// Helper function to check if role has specific permission
function checkRolePermission(menuAccess: Record<string, any>, permission: string): boolean {
  // Split permission by dot to handle nested permissions
  const permissionParts = permission.split('.');
  
  if (permissionParts.length === 1) {
    // Top-level permission
    const module = menuAccess[permissionParts[0]];
    return module && module.checked === true;
  } else if (permissionParts.length === 2) {
    // Nested permission (module.subPermission)
    const [moduleName, subPermission] = permissionParts;
    const module = menuAccess[moduleName];
    return module && module.checked === true && module.children && module.children[subPermission] === true;
  }
  
  return false;
}

// Middleware to check if user has admin role
export const requireAdmin: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  const authReq = req as AuthenticatedRequest;
  try {
    if (!authReq.user) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: 'Authentication required'
      });
    }

    const userId = authReq.user._id || authReq.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: 'User not found'
      });
    }

    // Check if user is admin or has admin role
    if (user.role === 'admin' || user.role === 'Admin') {
      return next();
    }

    return res.status(403).json({
      success: false,
      statusCode: 403,
      message: 'Admin access required'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: 'Admin check failed'
    });
  }
};

// Middleware to check if user has manager or admin role
export const requireManagerOrAdmin: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  const authReq = req as AuthenticatedRequest;
  try {
    if (!authReq.user) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: 'Authentication required'
      });
    }

    const userId = authReq.user._id || authReq.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: 'User not found'
      });
    }

    // Check if user is admin or manager
    if (user.role === 'admin' || user.role === 'Admin' || user.role === 'Manager') {
      return next();
    }

    return res.status(403).json({
      success: false,
      statusCode: 403,
      message: 'Manager or Admin access required'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: 'Role check failed'
    });
  }
};

// Middleware to get user permissions
export const getUserPermissions: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  const authReq = req as AuthenticatedRequest;
  try {
    if (!authReq.user) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: 'Authentication required'
      });
    }

    const userId = authReq.user._id || authReq.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: 'User not found'
      });
    }

    let permissions = {};

    // If user has menuAccess, use it
    if (user.menuAccess && Object.keys(user.menuAccess).length > 0) {
      permissions = user.menuAccess;
    } else if (user.role === 'admin' || user.role === 'Admin') {
      // Admin has all permissions
      permissions = {
        'dashboard': { checked: true, children: {} },
        'pos-module': { checked: true, children: {} },
        'menu-master': { checked: true, children: {} },
        'brands': { checked: true, children: {} },
        'contact-us': { checked: true, children: {} },
        'faqs': { checked: true, children: {} },
        'meal-plan': { checked: true, children: {} },
        'payment-method': { checked: true, children: {} },
        'privacy-policy': { checked: true, children: {} },
        'role-management': { checked: true, children: {} }
      };
    }

    authReq.userPermissions = permissions;
    next();
  } catch (error: any) {
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: 'Failed to get user permissions'
    });
  }
};