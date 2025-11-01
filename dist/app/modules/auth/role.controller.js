"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRoleStats = exports.deleteRole = exports.updateRole = exports.getRoleById = exports.getAllRoles = exports.createRole = void 0;
const auth_model_1 = require("./auth.model");
const role_validation_1 = require("./role.validation");
// CREATE Role
const createRole = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validatedData = (0, role_validation_1.validateCreateRole)(req.body);
        // Check if email already exists
        const existingUser = yield auth_model_1.User.findOne({ email: validatedData.email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                statusCode: 400,
                message: 'User with this email already exists'
            });
        }
        // Check if phone already exists
        const existingPhone = yield auth_model_1.User.findOne({ phone: validatedData.phone });
        if (existingPhone) {
            return res.status(400).json({
                success: false,
                statusCode: 400,
                message: 'User with this phone already exists'
            });
        }
        const user = new auth_model_1.User(validatedData);
        yield user.save();
        res.status(201).json({
            success: true,
            statusCode: 201,
            message: 'Role created successfully',
            data: user
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            statusCode: 400,
            message: error.message
        });
    }
});
exports.createRole = createRole;
// READ All Roles
const getAllRoles = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validatedQuery = (0, role_validation_1.validateQuery)(req.query);
        const { page = 1, limit = 10, search = '', role: roleFilter = '', status } = validatedQuery;
        const skip = (page - 1) * limit;
        // Build filter object
        const filter = {};
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { role: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }
        if (roleFilter) {
            filter.role = roleFilter;
        }
        if (status) {
            filter.status = status;
        }
        const users = yield auth_model_1.User.find(filter)
            .select('name email phone role menuAccess status createdAt updatedAt')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();
        const total = yield auth_model_1.User.countDocuments(filter);
        const totalPages = Math.ceil(total / limit);
        // Get available roles for filter dropdown
        const availableRoles = (0, role_validation_1.getAvailableRoles)();
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: 'Roles fetched successfully',
            data: {
                roles: users,
                total,
                page,
                limit,
                totalPages,
                availableRoles: availableRoles.map(role => ({
                    value: role,
                    label: role
                }))
            }
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            statusCode: 400,
            message: error.message
        });
    }
});
exports.getAllRoles = getAllRoles;
// READ Single Role
const getRoleById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const user = yield auth_model_1.User.findById(id).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                statusCode: 404,
                message: 'Role not found'
            });
        }
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: 'Role fetched successfully',
            data: user
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            statusCode: 400,
            message: error.message
        });
    }
});
exports.getRoleById = getRoleById;
// UPDATE Role
const updateRole = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const validatedData = (0, role_validation_1.validateUpdateRole)(req.body);
        // Check if email already exists for other users
        if (validatedData.email) {
            const existingUser = yield auth_model_1.User.findOne({
                email: validatedData.email,
                _id: { $ne: id }
            });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    statusCode: 400,
                    message: 'User with this email already exists'
                });
            }
        }
        // Check if phone already exists for other users
        if (validatedData.phone) {
            const existingPhone = yield auth_model_1.User.findOne({
                phone: validatedData.phone,
                _id: { $ne: id }
            });
            if (existingPhone) {
                return res.status(400).json({
                    success: false,
                    statusCode: 400,
                    message: 'User with this phone already exists'
                });
            }
        }
        const user = yield auth_model_1.User.findByIdAndUpdate(id, Object.assign(Object.assign({}, validatedData), { updatedAt: new Date() }), { new: true, runValidators: true }).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                statusCode: 404,
                message: 'Role not found'
            });
        }
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: 'Role updated successfully',
            data: user
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            statusCode: 400,
            message: error.message
        });
    }
});
exports.updateRole = updateRole;
// DELETE Role
const deleteRole = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const user = yield auth_model_1.User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                statusCode: 404,
                message: 'Role not found'
            });
        }
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: 'Role deleted successfully'
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            statusCode: 400,
            message: error.message
        });
    }
});
exports.deleteRole = deleteRole;
// GET Role Statistics and Filters
const getRoleStats = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get total count
        const totalRoles = yield auth_model_1.User.countDocuments();
        // Get count by role
        const roleStats = yield auth_model_1.User.aggregate([
            {
                $group: {
                    _id: '$role',
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);
        // Get count by status
        const statusStats = yield auth_model_1.User.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);
        // Get available roles for filter dropdown
        const availableRoles = (0, role_validation_1.getAvailableRoles)();
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: 'Role statistics fetched successfully',
            data: {
                totalRoles,
                roleStats: roleStats.map(stat => ({
                    role: stat._id,
                    count: stat.count
                })),
                statusStats: statusStats.map(stat => ({
                    status: stat._id,
                    count: stat.count
                })),
                availableRoles: availableRoles.map(role => ({
                    value: role,
                    label: role
                }))
            }
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            statusCode: 400,
            message: error.message
        });
    }
});
exports.getRoleStats = getRoleStats;
