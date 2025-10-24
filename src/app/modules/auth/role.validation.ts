import { z } from 'zod';

// Define role constants to avoid duplication
const ROLE_OPTIONS = [
  'Super Admin',
  'Admin', 
  'Manager',
  'Supervisor',
  'Cashier',
  'Waiter',
  'Staff'
] as const;

const ROLE_MAPPING: Record<string, string> = {
  'super admin': 'Super Admin',
  'admin': 'Admin',
  'manager': 'Manager',
  'supervisor': 'Supervisor',
  'cashier': 'Cashier',
  'waiter': 'Waiter',
  'staff': 'Staff'
};

// Create Role Validation Schema
export const createRoleSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  email: z.string().email('Invalid email format').toLowerCase(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().min(1, 'Phone is required'),
  role: z.enum(ROLE_OPTIONS).transform(val => {
    // Convert to proper case if needed
    return ROLE_MAPPING[val.toLowerCase()] || val;
  }),
  menuAccess: z.record(z.string(), z.object({
    checked: z.boolean(),
    children: z.record(z.string(), z.boolean()).optional()
  })).optional()
});

// Update Role Validation Schema
export const updateRoleSchema = z.object({
  name: z.string().min(1, 'Name is required').trim().optional(),
  email: z.string().email('Invalid email format').toLowerCase().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  phone: z.string().min(1, 'Phone is required').optional(),
  role: z.enum(ROLE_OPTIONS).transform(val => {
    // Convert to proper case if needed
    return ROLE_MAPPING[val.toLowerCase()] || val;
  }).optional(),
  menuAccess: z.record(z.string(), z.object({
    checked: z.boolean(),
    children: z.record(z.string(), z.boolean()).optional()
  })).optional(),
  status: z.enum(['active', 'inactive']).optional()
});

// Query Parameters Validation Schema
export const querySchema = z.object({
  page: z.string().transform(val => parseInt(val) || 1).optional(),
  limit: z.string().transform(val => parseInt(val) || 10).optional(),
  search: z.string().optional(),
  role: z.string().optional(),
  status: z.string().optional()
});

// Validation helper functions
export const validateCreateRole = (data: any) => {
  return createRoleSchema.parse(data);
};

export const validateUpdateRole = (data: any) => {
  return updateRoleSchema.parse(data);
};

export const validateQuery = (data: any) => {
  return querySchema.parse(data);
};

// Helper function to get available roles
export const getAvailableRoles = () => {
  return ROLE_OPTIONS;
};

// Helper function to validate role string
export const isValidRole = (role: string): boolean => {
  return ROLE_OPTIONS.includes(role as any);
};
