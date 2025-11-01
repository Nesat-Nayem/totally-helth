"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidRole = exports.getAvailableRoles = exports.validateQuery = exports.validateUpdateRole = exports.validateCreateRole = exports.querySchema = exports.updateRoleSchema = exports.createRoleSchema = void 0;
const zod_1 = require("zod");
// Define role constants to avoid duplication
const ROLE_OPTIONS = [
    'super admin',
    'admin',
    'manager',
    'supervisor',
    'cashier',
    'waiter',
    'staff'
];
const ROLE_MAPPING = {
    'super admin': 'super admin',
    'admin': 'admin',
    'manager': 'manager',
    'supervisor': 'supervisor',
    'cashier': 'cashier',
    'waiter': 'waiter',
    'staff': 'staff'
};
// Create Role Validation Schema
exports.createRoleSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required').trim(),
    email: zod_1.z.string().email('Invalid email format').toLowerCase(),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
    phone: zod_1.z.string().min(1, 'Phone is required'),
    role: zod_1.z.enum(ROLE_OPTIONS),
    menuAccess: zod_1.z.record(zod_1.z.string(), zod_1.z.object({
        checked: zod_1.z.boolean(),
        children: zod_1.z.record(zod_1.z.string(), zod_1.z.boolean()).optional()
    })).optional()
});
// Update Role Validation Schema
exports.updateRoleSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required').trim().optional(),
    email: zod_1.z.string().email('Invalid email format').toLowerCase().optional(),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters').optional(),
    phone: zod_1.z.string().min(1, 'Phone is required').optional(),
    role: zod_1.z.enum(ROLE_OPTIONS).optional(),
    menuAccess: zod_1.z.record(zod_1.z.string(), zod_1.z.object({
        checked: zod_1.z.boolean(),
        children: zod_1.z.record(zod_1.z.string(), zod_1.z.boolean()).optional()
    })).optional(),
    status: zod_1.z.enum(['active', 'inactive']).optional()
});
// Query Parameters Validation Schema
exports.querySchema = zod_1.z.object({
    page: zod_1.z.string().transform(val => parseInt(val) || 1).optional(),
    limit: zod_1.z.string().transform(val => parseInt(val) || 10).optional(),
    search: zod_1.z.string().optional(),
    role: zod_1.z.string().optional(),
    status: zod_1.z.string().optional()
});
// Validation helper functions
const validateCreateRole = (data) => {
    return exports.createRoleSchema.parse(data);
};
exports.validateCreateRole = validateCreateRole;
const validateUpdateRole = (data) => {
    return exports.updateRoleSchema.parse(data);
};
exports.validateUpdateRole = validateUpdateRole;
const validateQuery = (data) => {
    return exports.querySchema.parse(data);
};
exports.validateQuery = validateQuery;
// Helper function to get available roles
const getAvailableRoles = () => {
    return ROLE_OPTIONS;
};
exports.getAvailableRoles = getAvailableRoles;
// Helper function to validate role string
const isValidRole = (role) => {
    return ROLE_OPTIONS.includes(role);
};
exports.isValidRole = isValidRole;
