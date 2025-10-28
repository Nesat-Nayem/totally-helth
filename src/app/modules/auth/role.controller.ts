import { RequestHandler } from 'express';
import { User } from './auth.model';
import {
  validateCreateRole,
  validateUpdateRole,
  validateQuery,
  getAvailableRoles
} from './role.validation';

// CREATE Role
export const createRole: RequestHandler = async (req, res, next) => {
  try {
    const validatedData = validateCreateRole(req.body);
    
    // Check if email already exists
    const existingUser = await User.findOne({ email: validatedData.email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'User with this email already exists'
      });
    }

    // Check if phone already exists
    const existingPhone = await User.findOne({ phone: validatedData.phone });
    if (existingPhone) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'User with this phone already exists'
      });
    }

    const user = new User(validatedData);
    await user.save();
    
    res.status(201).json({
      success: true,
      statusCode: 201,
      message: 'Role created successfully',
      data: user
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      statusCode: 400,
      message: error.message
    });
  }
};

// READ All Roles
export const getAllRoles: RequestHandler = async (req, res, next) => {
  try {
    const validatedQuery = validateQuery(req.query);
    const { page = 1, limit = 10, search = '', role: roleFilter = '', status } = validatedQuery;

    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter: any = {};
    
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

    const users = await User.find(filter)
      .select('name email phone role menuAccess status createdAt updatedAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await User.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    // Get available roles for filter dropdown
    const availableRoles = getAvailableRoles();

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
  } catch (error: any) {
    res.status(400).json({
      success: false,
      statusCode: 400,
      message: error.message
    });
  }
};

// READ Single Role
export const getRoleById: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id).select('-password');
    
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
  } catch (error: any) {
    res.status(400).json({
      success: false,
      statusCode: 400,
      message: error.message
    });
  }
};

// UPDATE Role
export const updateRole: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const validatedData = validateUpdateRole(req.body);
    
    // Check if email already exists for other users
    if (validatedData.email) {
      const existingUser = await User.findOne({ 
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
      const existingPhone = await User.findOne({ 
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

    const user = await User.findByIdAndUpdate(
      id,
      { ...validatedData, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).select('-password');

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
  } catch (error: any) {
    res.status(400).json({
      success: false,
      statusCode: 400,
      message: error.message
    });
  }
};

// DELETE Role
export const deleteRole: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByIdAndDelete(id);
    
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
  } catch (error: any) {
    res.status(400).json({
      success: false,
      statusCode: 400,
      message: error.message
    });
  }
};


// GET Role Statistics and Filters
export const getRoleStats: RequestHandler = async (req, res, next) => {
  try {
    // Get total count
    const totalRoles = await User.countDocuments();
    
    // Get count by role
    const roleStats = await User.aggregate([
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
    const statusStats = await User.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get available roles for filter dropdown
    const availableRoles = getAvailableRoles();
    
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
  } catch (error: any) {
    res.status(400).json({
      success: false,
      statusCode: 400,
      message: error.message
    });
  }
};
