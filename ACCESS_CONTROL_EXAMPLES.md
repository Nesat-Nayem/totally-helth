# Dynamic Access Control System

## 🎯 **How It Works Now - Fully Dynamic**

The system now automatically generates edit/delete routes for **ANY** module that has a "list" permission, based on your complete menu structure.

### ✅ **Automatic List → Edit/Delete Mapping**

For **ANY** user with list access in a module, they automatically get edit/delete access:

#### **Branches Example:**
```json
{
  "branches": {
    "checked": true,
    "children": {
      "list-of-branches": true,
      "add-new-branch": true
    }
  }
}
```

**Auto-generated routes they can access:**
- ✅ `/branches/list-of-branches` - Direct permission
- ✅ `/branches/add-new-branch` - Direct permission  
- ✅ `/branches/edit/:id` - **Auto-granted** (list access)
- ✅ `/branches/delete/:id` - **Auto-granted** (list access)
- ✅ `/branches/:id/edit` - **Auto-granted** (list access)
- ✅ `/branches/:id/delete` - **Auto-granted** (list access)
- ✅ `/branches/edit-new-branch` - **Auto-granted** (list access)
- ✅ `/branches/delete-branch` - **Auto-granted** (list access)
- ✅ `/v1/api/branches/:id` - **Auto-granted** (list access)

#### **Meal Plan Example:**
```json
{
  "meal-plan": {
    "checked": true,
    "children": {
      "meal-plan-list": true,
      "add-meal-plan": true
    }
  }
}
```

**Auto-generated routes they can access:**
- ✅ `/meal-plan/meal-plan-list` - Direct permission
- ✅ `/meal-plan/add-meal-plan` - Direct permission  
- ✅ `/meal-plan/edit/:id` - **Auto-granted** (list access)
- ✅ `/meal-plan/delete/:id` - **Auto-granted** (list access)
- ✅ `/meal-plan/meal-plan-edit/:id` - **Auto-granted** (list access)
- ✅ `/v1/api/meal-plan/:id` - **Auto-granted** (list access)

#### **Works for ALL Modules:**
- ✅ **Brands** - `list-of-brands` → edit/delete access
- ✅ **Aggregators** - `aggregators-list` → edit/delete access  
- ✅ **Inventory** - `inventory-list` → edit/delete access
- ✅ **Customer** - `customer-list` → edit/delete access
- ✅ **Staff** - `waiter-list`, `cashier-list` → edit/delete access
- ✅ **Blog** - `blog-list` → edit/delete access
- ✅ **POS Module** - `view-orders`, `sales-list` → edit/delete access
- ✅ **And ALL other modules with list permissions**

### 🎯 **Logic:**

1. **Direct Permission Check**: If user has specific permission, grant access
2. **List Access Check**: If user has any "list" permission in a module, grant edit/delete access for that module
3. **Admin Bypass**: Admin and super admin can access everything

### 📋 **Examples:**

#### **Cashier with Branches Access:**
```json
{
  "role": "cashier",
  "menuAccess": {
    "branches": {
      "checked": true,
      "children": {
        "list-of-branches": true,
        "add-new-branch": true
      }
    }
  }
}
```
✅ Can: List, Add, Edit, Delete branches  
❌ Cannot: Access other modules

#### **Cashier with Menu Access:**
```json
{
  "role": "cashier", 
  "menuAccess": {
    "menu-master": {
      "checked": true,
      "children": {
        "Restaurant-menu": true,
        "add-new-menu": true
      }
    }
  }
}
```
✅ Can: View restaurant menu, Add new menu, Edit/Delete menu items  
❌ Cannot: Access branches, reports, etc.

#### **Admin:**
```json
{
  "role": "admin",
  "menuAccess": { ... }
}
```
✅ Can: Access **EVERYTHING** (bypasses all restrictions)

### 🎉 **Benefits:**

✅ **Intuitive Logic** - If you can see the list, you can edit/delete items  
✅ **Flexible Permissions** - No need to explicitly grant edit/delete permissions  
✅ **Admin Bypass** - Admins have full access  
✅ **Backward Compatible** - Existing permissions still work  

### 🔍 **Error Response:**

When user doesn't have access:
```json
{
  "success": false,
  "statusCode": 403,
  "message": "You do not have permission to perform this action"
}
```

## 🎯 **That's It!**

Now users with list access can automatically edit and delete items in that list, making the permission system much more intuitive and user-friendly!
