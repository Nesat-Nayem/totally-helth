# Dynamic Role Management - Recommended Approach

## Problem with Current Approach
- Roles are hardcoded in enum validation
- Cannot create new role types at runtime
- Frontend/backend mismatch for role definitions

## Recommended Solution: Separate Role Model

### 1. Create Role Model
```typescript
// src/app/modules/auth/role.model.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IRole extends Document {
  name: string;
  description?: string;
  menuAccess: Record<string, {
    checked: boolean;
    children?: Record<string, boolean>;
  }>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const roleSchema = new Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  menuAccess: {
    type: Schema.Types.Mixed,
    default: {}
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export const Role = mongoose.model<IRole>('Role', roleSchema);
```

### 2. Update User Model
```typescript
// src/app/modules/auth/auth.model.ts
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone: string;
  roleId: mongoose.Types.ObjectId; // Reference to Role
  // Remove hardcoded role enum
  // role: 'admin' | 'vendor'|'user' | 'Admin' | 'Manager' | 'Cashier' | 'Waiter' | 'Staff';
  menuAccess?: Record<string, any>; // Optional: can be overridden per user
  // ... other fields
}

const userSchema = new Schema({
  name: { type: String },
  email: { type: String },
  password: { type: String },
  phone: { type: String, required: true },
  roleId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Role',
    required: true 
  },
  menuAccess: {
    type: Schema.Types.Mixed,
    default: {}
  },
  // ... other fields
});
```

### 3. Dynamic Role Validation
```typescript
// src/app/modules/auth/role.validation.ts
export const createRoleSchema = z.object({
  name: z.string().min(1, 'Role name is required').trim(),
  description: z.string().optional(),
  menuAccess: z.record(z.string(), z.object({
    checked: z.boolean(),
    children: z.record(z.string(), z.boolean()).optional()
  })).optional()
});

export const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  email: z.string().email('Invalid email format').toLowerCase(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().min(1, 'Phone is required'),
  roleId: z.string().min(1, 'Role ID is required'), // Dynamic role reference
  menuAccess: z.record(z.string(), z.object({
    checked: z.boolean(),
    children: z.record(z.string(), z.boolean()).optional()
  })).optional()
});
```

### 4. Role Management APIs
```typescript
// src/app/modules/auth/role.controller.ts

// Create new role type
export const createRoleType: RequestHandler = async (req, res) => {
  const { name, description, menuAccess } = validateCreateRole(req.body);
  const role = new Role({ name, description, menuAccess });
  await role.save();
  res.status(201).json({ success: true, data: role });
};

// Get all role types
export const getAllRoleTypes: RequestHandler = async (req, res) => {
  const roles = await Role.find({ isActive: true });
  res.status(200).json({ success: true, data: roles });
};

// Create user with dynamic role
export const createUserWithRole: RequestHandler = async (req, res) => {
  const { name, email, password, phone, roleId, menuAccess } = validateCreateUser(req.body);
  
  // Verify role exists
  const role = await Role.findById(roleId);
  if (!role) {
    return res.status(400).json({ success: false, message: 'Invalid role ID' });
  }
  
  // Create user with role reference
  const user = new User({ 
    name, email, password, phone, roleId,
    menuAccess: menuAccess || role.menuAccess // Use role's menuAccess as default
  });
  await user.save();
  
  res.status(201).json({ success: true, data: user });
};
```

## Benefits of Dynamic Approach

✅ **Truly Dynamic**: Create new role types at runtime  
✅ **Flexible**: Each role can have custom permissions  
✅ **Scalable**: No code changes needed for new roles  
✅ **Consistent**: Single source of truth for role definitions  
✅ **Maintainable**: Role management separated from user management  

## Migration Strategy

1. **Phase 1**: Create Role model alongside existing User model
2. **Phase 2**: Create default roles (Admin, Manager, Cashier, etc.)
3. **Phase 3**: Update frontend to use dynamic role API
4. **Phase 4**: Migrate existing users to use roleId instead of hardcoded role
5. **Phase 5**: Remove hardcoded role enum from User model

## Recommendation

**For your use case with "Super Admin" and "Supervisor" roles**, I recommend:

1. **Short-term**: Use Option 1 (fix current approach) to support existing UI
2. **Long-term**: Implement Option 2 (dynamic roles) for true flexibility

The dynamic approach is better for:
- Multi-tenant applications
- Applications where role requirements change frequently
- Systems where non-technical users need to manage roles
- Applications with complex permission hierarchies
