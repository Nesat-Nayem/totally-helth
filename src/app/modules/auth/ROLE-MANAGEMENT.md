# Role Management System

## Overview
This system uses a simplified approach where roles are managed directly within the User model. No separate Role model is needed.

## File Structure
- `auth.model.ts` - User model with role and menuAccess fields
- `role.controller.ts` - Role CRUD operations
- `role.routes.ts` - Role API routes
- `role.validation.ts` - Validation schemas and helper functions
- `auth.routes.ts` - Main auth routes (includes role routes)

## User Model Structure

### Fields
- `name`: User's full name
- `email`: User's email address (unique)
- `password`: Hashed password using bcrypt
- `phone`: User's phone number (unique)
- `role`: User's role - can be 'admin', 'vendor', 'user', 'super admin', 'manager', 'supervisor', 'cashier', 'waiter', 'staff'
- `menuAccess`: Object containing menu permissions
- `status`: User status ('active', 'inactive', 'pending')
- `img`: Profile image URL
- `otp`: OTP for verification
- `otpExpires`: OTP expiration time
- `packageFeatures`: Array of package features
- `menuBookmarks`: Array of menu bookmarks

### Menu Access Structure
```javascript
menuAccess: {
  "pos-module": {
    checked: true,
    children: {
      "pos-main": true,
      "settle-bill": true,
      "print-order": true,
      "pos-reports": false,
      "view-orders": true,
      "transaction-history": false,
      "split-bill": false,
      "apply-discount": true,
      "meal-plan-list": false,
      "sales-list": false,
      "calculator": true,
      "start-shift": false
    }
  },
  "menu-master": {
    checked: false,
    children: {
      "Restaurant-menu": true,
      "online-menu": true,
      "membership-menu": false,
      "add-new-menu": true,
      "menu-category": true
    }
  }
}
```

**Note:** The `menuAccess` field uses `Schema.Types.Mixed` to store plain JavaScript objects without creating MongoDB `_id` fields for each menu item, keeping the structure clean.

## API Endpoints

### Create Role
- **POST** `/v1/api/auth/roles`
- **Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "1234567890",
  "role": "Manager",
  "menuAccess": {
    "pos-module": {
      "checked": true,
      "children": {
        "pos-main": true,
        "settle-bill": true
      }
    }
  }
}
```

### Get All Roles (Combined with Available Roles)
- **GET** `/v1/api/auth/roles`
- **Authentication:** Admin access required
- **Query Parameters:**
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)
  - `search`: Search by name, email, or phone (case-insensitive)
  - `role`: Filter by specific role (e.g., "Manager", "Cashier")
  - `status`: Filter by status ("active", "inactive", "pending")
- **Response includes:**
  - List of roles with pagination
  - Available roles for filter dropdown
  - Total count and pagination info

### Get Role Statistics
- **GET** `/v1/api/auth/roles/stats`
- **Authentication:** Admin access required
- **Response:** Returns role statistics and filter options
- **Data includes:**
  - Total role count
  - Count by role type
  - Count by status
  - Available roles for filter dropdown

### Get Role by ID
- **GET** `/v1/api/auth/roles/:id`
- **Authentication:** Admin access required

### Update Role
- **PUT** `/v1/api/auth/roles/:id`
- **Authentication:** Admin access required
- **Body:** Same as create, but all fields are optional

### Delete Role
- **DELETE** `/v1/api/auth/roles/:id`
- **Authentication:** Admin access required

## Authentication
All role management endpoints require **Admin access** using the `auth('admin')` middleware.

## Password Security
- Passwords are automatically hashed using bcrypt before saving
- Password comparison is handled by the `comparePassword` method

## Validation
- Email format validation
- Phone number validation
- Password minimum length (6 characters)
- Role enum validation (lowercase only)
- Menu access structure validation
- All validation logic is centralized in `role.validation.ts`
- Role values are stored in lowercase format

## Available Roles
The system supports the following roles in hierarchical order:
1. **super admin** - Highest level access
2. **admin** - Administrative access
3. **manager** - Management level access
4. **supervisor** - Supervisory access
5. **cashier** - Cash handling access
6. **waiter** - Service access
7. **staff** - Basic staff access

Plus legacy roles: `admin`, `vendor`, `user`

## Usage Example

### Creating a Manager Role
```javascript
const roleData = {
  name: "Jane Smith",
  email: "jane@example.com",
  password: "manager123",
  phone: "9876543210",
  role: "manager",
  menuAccess: {
    "pos-module": {
      checked: true,
      children: {
        "pos-main": true,
        "settle-bill": true,
        "print-order": true,
        "pos-reports": true,
        "view-orders": true,
        "transaction-history": true,
        "split-bill": true,
        "apply-discount": true,
        "meal-plan-list": true,
        "sales-list": true,
        "calculator": true,
        "start-shift": true
      }
    },
    "menu-master": {
      checked: true,
      children: {
        "Restaurant-menu": true,
        "online-menu": true,
        "membership-menu": true,
        "add-new-menu": true,
        "menu-category": true
      }
    }
  }
};

// POST to /v1/api/auth/roles
```

### Search and Filter Examples

#### Combined List with Available Roles
```javascript
// GET /v1/api/auth/roles
// Response includes both roles list and available roles for dropdown:
{
  "success": true,
  "data": {
    "roles": [
      {
        "_id": "68fa0dd2743c7f484a1c0a4d",
        "name": "Shivangi Gupta",
        "email": "shivangi123@gmail.com",
        "role": "Manager",
        "phone": "8989898980"
      }
    ],
    "total": 8,
    "page": 1,
    "limit": 10,
    "totalPages": 1,
    "availableRoles": [
      { "value": "Super Admin", "label": "Super Admin" },
      { "value": "Manager", "label": "Manager" },
      { "value": "Cashier", "label": "Cashier" }
    ]
  }
}
```

#### Search by Name
```javascript
// GET /v1/api/auth/roles?search=Shivangi
// Returns all roles with "Shivangi" in name, email, or phone
```

#### Filter by Role
```javascript
// GET /v1/api/auth/roles?role=Manager
// Returns only Manager roles
```

#### Combined Search and Filter
```javascript
// GET /v1/api/auth/roles?search=admin&role=Super Admin&status=active
// Returns active Super Admin roles with "admin" in name/email/phone
```

#### Get Role Statistics
```javascript
// GET /v1/api/auth/roles/stats
// Response:
{
  "success": true,
  "data": {
    "totalRoles": 8,
    "roleStats": [
      { "role": "Manager", "count": 3 },
      { "role": "Cashier", "count": 2 },
      { "role": "Super Admin", "count": 1 }
    ],
    "statusStats": [
      { "status": "active", "count": 7 },
      { "status": "inactive", "count": 1 }
    ],
    "availableRoles": [
      { "value": "Super Admin", "label": "Super Admin" },
      { "value": "Manager", "label": "Manager" }
    ]
  }
}
```

### Login Flow
1. User logs in with email/password
2. System validates credentials
3. User object is returned with role and menuAccess
4. Frontend uses menuAccess to show/hide menu items
5. Backend checks permissions using the user's role and menuAccess

## Benefits of This Approach
1. **Simplified**: No need for separate Role model
2. **Flexible**: Each user can have custom menu access
3. **Efficient**: Single query to get user and permissions
4. **Maintainable**: All user data in one place
5. **Scalable**: Easy to add new roles and permissions
