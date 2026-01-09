# Staff Management System Guide

## Overview
This system now supports multiple user roles with different signup and management approaches:

### User Roles
- **`user`** - Regular customers (public signup allowed)
- **`chef`** - Kitchen professionals (public signup allowed)
- **`employee`** - Kitchen staff (admin creation only)
- **`rider`** - Delivery partners (admin creation only)
- **`admin`** - System administrators (admin creation only)

## Signup Rules

### ✅ Public Signup (Anyone can register)
- **Regular users** (`role: "user"`)
- **Chefs** (`role: "chef"`)

### 🔒 Admin-Only Creation
- **Employees** (`role: "employee"`)
- **Riders** (`role: "rider"`)
- **Admins** (`role: "admin"`)

## API Endpoints

### Public Endpoints
```
POST /auth/register - Create user or chef account
POST /auth/login - Login for any role
```

### Admin-Only Endpoints (Require admin authentication)
```
POST   /auth/staff      - Create employee/rider account
GET    /auth/staff      - List all staff members
PUT    /auth/staff/:id  - Update staff account
DELETE /auth/staff/:id  - Delete staff account
```

## Usage Examples

### 1. Create Employee Account (Admin Only)
```bash
POST /auth/staff
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@kitchen.com",
  "password": "secure123",
  "role": "employee",
  "kitchenNo": "001"
}
```

### 2. Create Rider Account (Admin Only)
```bash
POST /auth/staff
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "firstName": "Mike",
  "lastName": "Smith",
  "email": "mike.smith@kitchen.com",
  "password": "secure123",
  "role": "rider",
  "kitchenNo": "001"
}
```

### 3. List All Staff (Admin Only)
```bash
GET /auth/staff?page=1&limit=10&role=employee&status=active
Authorization: Bearer <admin_token>
```

### 4. Update Staff Account (Admin Only)
```bash
PUT /auth/staff/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Updated",
  "status": "inactive"
}
```

## Testing the System

### 1. Create Admin User
```bash
node src/scripts/createAdmin.js
```

### 2. Create Test Staff Accounts
```bash
node src/scripts/createAdmin.js staff
```

### 3. Test Public Signup
```bash
# This should work
POST /auth/register
{
  "firstName": "Chef",
  "lastName": "Gordon",
  "email": "chef.gordon@kitchen.com",
  "password": "password123",
  "role": "chef"
}

# This should fail
POST /auth/register
{
  "firstName": "Employee",
  "lastName": "Test",
  "email": "employee@kitchen.com",
  "password": "password123",
  "role": "employee"  # ❌ Not allowed
}
```

## Security Features

### Role Validation
- Public signup only allows `user` and `chef` roles
- Admin endpoints require admin authentication
- Role changes are restricted to valid staff roles

### Admin Protection
- Admin accounts cannot be modified via staff endpoints
- Only existing admins can create new admin accounts
- Staff management requires admin privileges

### Notification System
- Admins are notified when new staff members are created
- Other admins receive notifications about staff changes

## Database Schema

### User Model Fields
```javascript
{
  firstName: String (required),
  lastName: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  role: String (enum: ["user", "admin", "chef", "employee", "rider"]),
  kitchenNo: String (default: "001"),
  isActive: Boolean (default: true),
  status: String (enum: ["active", "inactive"]),
  createdAt: Date,
  profileImage: String
}
```

## Frontend Integration

### Role-Based UI
- Show different menus based on user role
- Hide admin features from non-admin users
- Display appropriate signup forms

### Admin Dashboard
- Staff management interface
- User role management
- Kitchen assignment tools

## Troubleshooting

### Common Issues
1. **"You are not authorized to create this role"**
   - Solution: Use admin endpoint for employee/rider creation

2. **"Only admins can create staff accounts"**
   - Solution: Login with admin account first

3. **"Invalid role"**
   - Solution: Use only valid roles: "user", "chef", "employee", "rider"

### Testing Checklist
- [ ] Admin can create employee accounts
- [ ] Admin can create rider accounts
- [ ] Public signup works for users and chefs
- [ ] Public signup fails for employees and riders
- [ ] Staff listing works for admins
- [ ] Staff updates work for admins
- [ ] Role validation works correctly

## Future Enhancements
- Bulk user import
- Advanced permission system
- Role-based access control (RBAC)
- Staff scheduling integration
- Performance metrics tracking
