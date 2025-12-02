# LegalPadhai Admin API Routes

## Base URL
```
http://localhost:3000/api
```

## Admin Authentication

All admin routes require:
1. Valid JWT token in Authorization header
2. User role must be `admin`

```
Authorization: Bearer {admin_token}
```

---

## Admin User Management Routes

### 1. Create User (Admin)
**Endpoint:** `POST /admin/users`

**Description:** Admin creates a new user with specified role

**Headers:**
```
Authorization: Bearer {admin_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "New User",
  "email": "newuser@example.com",
  "password": "NewUser@123456",
  "role": "user",
  "registrationType": "institute",
  "instituteId": "STU2024002",
  "instituteName": "Mumbai University",
  "phoneNumber": "+919876543222"
}
```

**Response:**
```json
{
  "message": "User created successfully by admin",
  "userId": "507f1f77bcf86cd799439014",
  "email": "newuser@example.com"
}
```

---

### 2. Get All Users (Paginated)
**Endpoint:** `GET /admin/users?page=1&limit=10`

**Description:** Get paginated list of all users

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Items per page |

**Response:**
```json
{
  "users": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Karman Singh",
      "email": "karman@example.com",
      "role": "user",
      "registrationType": "personal",
      "isVerified": true,
      "isActive": true,
      "createdAt": "2024-12-02T10:30:00.000Z",
      "lastLogin": "2024-12-02T14:20:00.000Z"
    }
  ],
  "total": 25,
  "page": 1,
  "limit": 10,
  "totalPages": 3
}
```

---

### 3. Search Users
**Endpoint:** `GET /admin/users/search?q=karman`

**Description:** Search users by name, email, or institute ID

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | Yes | Search query |

**Response:**
```json
{
  "users": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Karman Singh",
      "email": "karman@example.com",
      "role": "user",
      "registrationType": "personal",
      "instituteId": null,
      "instituteName": null,
      "isVerified": true,
      "isActive": true,
      "createdAt": "2024-12-02T10:30:00.000Z"
    }
  ],
  "count": 1
}
```

---

### 4. Get User Statistics
**Endpoint:** `GET /admin/users/stats`

**Description:** Get statistics about all users

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Response:**
```json
{
  "totalUsers": 150,
  "activeUsers": 142,
  "inactiveUsers": 8,
  "verifiedUsers": 145,
  "unverifiedUsers": 5,
  "adminUsers": 3,
  "regularUsers": 147,
  "personalRegistrations": 89,
  "instituteRegistrations": 61
}
```

---

### 5. Get User by ID
**Endpoint:** `GET /admin/users/{userId}`

**Description:** Get detailed information about a specific user

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `userId` | string | MongoDB ObjectId of the user |

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Karman Singh",
  "email": "karman@example.com",
  "role": "user",
  "registrationType": "personal",
  "phoneNumber": "+919876543210",
  "address": "123 Street, Delhi, India",
  "firebaseUid": "firebase-uid-123",
  "isVerified": true,
  "isActive": true,
  "createdAt": "2024-12-02T10:30:00.000Z",
  "updatedAt": "2024-12-02T14:20:00.000Z",
  "lastLogin": "2024-12-02T14:20:00.000Z"
}
```

---

### 6. Get User with Password
**Endpoint:** `GET /admin/users/{userId}/password`

**Description:** Get user details including hashed password (admin only)

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `userId` | string | MongoDB ObjectId of the user |

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "email": "karman@example.com",
  "name": "Karman Singh",
  "password": "$2b$10$abcdefghijklmnopqrstuvwxyz123456789",
  "role": "user",
  "registrationType": "personal",
  "isVerified": true,
  "isActive": true
}
```

**⚠️ Security Note:** Password is bcrypt hashed, not plain text

---

### 7. Verify User (Admin)
**Endpoint:** `PUT /admin/users/{userId}/verify`

**Description:** Manually verify a user's email

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `userId` | string | MongoDB ObjectId of the user |

**Response:**
```json
{
  "message": "User verified successfully",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "karman@example.com",
    "isVerified": true
  }
}
```

---

### 8. Update User Password (Admin)
**Endpoint:** `PUT /admin/users/{userId}/password`

**Description:** Update a user's password (admin override)

**Headers:**
```
Authorization: Bearer {admin_token}
Content-Type: application/json
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `userId` | string | MongoDB ObjectId of the user |

**Request Body:**
```json
{
  "password": "UpdatedPassword@123"
}
```

**Response:**
```json
{
  "message": "Password updated successfully",
  "userId": "507f1f77bcf86cd799439011"
}
```

---

### 9. Update User Role (Admin)
**Endpoint:** `PUT /admin/users/{userId}/role`

**Description:** Change a user's role between 'user' and 'admin'

**Headers:**
```
Authorization: Bearer {admin_token}
Content-Type: application/json
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `userId` | string | MongoDB ObjectId of the user |

**Request Body:**
```json
{
  "role": "admin"
}
```

**Allowed Values:** `"user"` or `"admin"`

**Response:**
```json
{
  "message": "User role updated successfully",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "karman@example.com",
    "role": "admin"
  }
}
```

---

### 10. Toggle User Status (Activate/Deactivate)
**Endpoint:** `PUT /admin/users/{userId}/toggle-status`

**Description:** Toggle user's active status (activate or deactivate account)

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `userId` | string | MongoDB ObjectId of the user |

**Response:**
```json
{
  "message": "User status updated successfully",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "karman@example.com",
    "isActive": false
  }
}
```

**Note:** Inactive users cannot login

---

### 11. Delete User
**Endpoint:** `DELETE /admin/users/{userId}`

**Description:** Permanently delete a user and their Firebase account

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `userId` | string | MongoDB ObjectId of the user |

**Response:**
```json
{
  "message": "User deleted successfully",
  "userId": "507f1f77bcf86cd799439011"
}
```

**⚠️ Warning:** This action is irreversible and deletes:
- MongoDB user document
- Firebase authentication account

---

## Error Responses

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

### 403 Forbidden (Non-Admin)
```json
{
  "statusCode": 403,
  "message": "Forbidden resource",
  "error": "Forbidden"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "User not found",
  "error": "Not Found"
}
```

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": ["role must be one of the following values: user, admin"],
  "error": "Bad Request"
}
```

---

## Admin Login

Admins must login through the regular auth endpoint:

**Endpoint:** `POST /auth/login`

**Request:**
```json
{
  "email": "admin@legalpadhai.com",
  "password": "Admin@123456"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439010",
    "email": "admin@legalpadhai.com",
    "name": "Admin User",
    "role": "admin",
    "isVerified": true,
    "registrationType": "personal"
  }
}
```

---

## Creating First Admin User

Use the provided script to create the first admin:

```bash
npm run create:admin
```

This creates an admin with:
- Email: `admin@legalpadhai.com`
- Password: `Admin@123456`

**⚠️ Change the password immediately after first login!**

---

## Testing with cURL

### Get All Users
```bash
curl -X GET "http://localhost:3000/api/admin/users?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Search Users
```bash
curl -X GET "http://localhost:3000/api/admin/users/search?q=karman" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Create User
```bash
curl -X POST http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New User",
    "email": "newuser@example.com",
    "password": "NewUser@123456",
    "role": "user",
    "registrationType": "personal"
  }'
```

### Update User Role
```bash
curl -X PUT http://localhost:3000/api/admin/users/USER_ID/role \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role": "admin"}'
```

### Delete User
```bash
curl -X DELETE http://localhost:3000/api/admin/users/USER_ID \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## Frontend Integration Example

### React/Next.js Admin Dashboard

```javascript
// Admin Service
class AdminService {
  constructor(token) {
    this.baseUrl = 'http://localhost:3000/api/admin';
    this.token = token;
  }

  // Get all users
  async getAllUsers(page = 1, limit = 10) {
    const response = await fetch(
      `${this.baseUrl}/users?page=${page}&limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      }
    );
    return await response.json();
  }

  // Search users
  async searchUsers(query) {
    const response = await fetch(
      `${this.baseUrl}/users/search?q=${encodeURIComponent(query)}`,
      {
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      }
    );
    return await response.json();
  }

  // Get user statistics
  async getUserStats() {
    const response = await fetch(`${this.baseUrl}/users/stats`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
    });
    return await response.json();
  }

  // Create user
  async createUser(userData) {
    const response = await fetch(`${this.baseUrl}/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    return await response.json();
  }

  // Update user role
  async updateUserRole(userId, role) {
    const response = await fetch(`${this.baseUrl}/users/${userId}/role`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ role }),
    });
    return await response.json();
  }

  // Toggle user status
  async toggleUserStatus(userId) {
    const response = await fetch(
      `${this.baseUrl}/users/${userId}/toggle-status`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      }
    );
    return await response.json();
  }

  // Delete user
  async deleteUser(userId) {
    const response = await fetch(`${this.baseUrl}/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
    });
    return await response.json();
  }

  // Update password
  async updateUserPassword(userId, newPassword) {
    const response = await fetch(`${this.baseUrl}/users/${userId}/password`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password: newPassword }),
    });
    return await response.json();
  }

  // Verify user
  async verifyUser(userId) {
    const response = await fetch(`${this.baseUrl}/users/${userId}/verify`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
    });
    return await response.json();
  }
}

// Usage
const adminToken = localStorage.getItem('admin_token');
const adminService = new AdminService(adminToken);

// Get users with pagination
const usersData = await adminService.getAllUsers(1, 20);

// Search users
const searchResults = await adminService.searchUsers('karman');

// Get statistics
const stats = await adminService.getUserStats();
```

---

## Best Practices

### Security
- ✅ Always verify admin role before accessing routes
- ✅ Use HTTPS in production
- ✅ Rotate JWT tokens regularly
- ✅ Log all admin actions for audit trail
- ✅ Implement rate limiting on sensitive endpoints

### User Management
- ✅ Confirm before deleting users (irreversible)
- ✅ Notify users when their role changes
- ✅ Keep audit logs of password changes
- ✅ Implement soft delete for data recovery

### Performance
- ✅ Use pagination for large user lists
- ✅ Implement caching for statistics
- ✅ Index database fields used in search
- ✅ Batch operations when possible

---

## Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (no token or invalid token) |
| 403 | Forbidden (not admin) |
| 404 | Not Found (user doesn't exist) |
| 409 | Conflict (duplicate email) |
| 500 | Internal Server Error |

---

## Rate Limiting (Production)

Recommended rate limits:
- Search: 100 requests/minute
- Create User: 10 requests/minute
- Update Operations: 30 requests/minute
- Delete User: 5 requests/minute
- Get Operations: 200 requests/minute
