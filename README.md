# LegalPadhai - Authentication & User Management System

A comprehensive authentication and user management system built with NestJS, MongoDB, Firebase, and JWT tokens.

## 🚀 Features

### User Authentication
- ✅ User registration with Personal ID or Institute ID
- ✅ Email verification system
- ✅ JWT-based authentication
- ✅ Password reset and forgot password
- ✅ Resend verification emails
- ✅ User profile management
- ✅ Firebase integration for enhanced security

### Admin Panel
- ✅ Create and manage users
- ✅ Verify users manually
- ✅ View all users with pagination
- ✅ View user passwords (hashed)
- ✅ Update user passwords
- ✅ Delete users
- ✅ Activate/Deactivate user accounts
- ✅ Search users by email, name, ID
- ✅ User statistics and analytics

### Security & Best Practices
- ✅ Password hashing with bcrypt
- ✅ JWT token-based authentication
- ✅ Role-based access control (RBAC)
- ✅ Email verification required
- ✅ Secure password reset flow
- ✅ Input validation with class-validator
- ✅ CORS protection
- ✅ Environment variable protection
- ✅ Firebase integration for additional security layer

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account or local MongoDB
- Firebase account
- Gmail account (for sending emails)

## 🔧 Installation

```bash
# Install dependencies
npm install
```

## ⚙️ Configuration

1. **Copy environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Configure MongoDB:**
   - Already configured with your credentials
   - Update `DATABASE_NAME` if needed

3. **Setup Firebase:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a project
   - Enable Authentication, Firestore, and Storage
   - Download service account key
   - Update `.env` with Firebase credentials

4. **Setup Email (Gmail):**
   - Enable 2-Step Verification
   - Generate App Password
   - Update `.env` with email credentials

5. **Update JWT Secrets:**
   - Change `JWT_SECRET` to a strong random string
   - Update other security-related variables

See `SETUP_GUIDE.md` for detailed configuration instructions.

## 🎯 Quick Start

1. **Create Admin User:**
   ```bash
   npm run create:admin
   ```
   
   Default credentials:
   - Email: `admin@legalpadhai.com`
   - Password: `Admin@123456`
   
   ⚠️ Change this password after first login!

2. **Start Development Server:**
   ```bash
   npm run start:dev
   ```

3. **Access API:**
   - Base URL: `http://localhost:3000/api`
   - Auth endpoints: `http://localhost:3000/api/auth`
   - Admin endpoints: `http://localhost:3000/api/admin`

## 📚 Documentation

- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Complete setup instructions
- **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** - Full API reference
- **[postman_collection.json](postman_collection.json)** - Import into Postman

## 🔑 API Endpoints

### Authentication
```
POST   /api/auth/register              - Register new user
POST   /api/auth/login                 - Login
POST   /api/auth/verify-email          - Verify email
POST   /api/auth/forgot-password       - Request password reset
POST   /api/auth/reset-password        - Reset password
POST   /api/auth/resend-verification   - Resend verification email
GET    /api/auth/profile               - Get user profile (authenticated)
```

### Admin (Requires Admin Role)
```
POST   /api/admin/users                - Create user
GET    /api/admin/users                - List all users
GET    /api/admin/users/search         - Search users
GET    /api/admin/users/stats          - Get statistics
GET    /api/admin/users/:id            - Get user by ID
GET    /api/admin/users/:id/password   - Get user with password
PUT    /api/admin/users/:id/verify     - Verify user
PUT    /api/admin/users/:id/password   - Update password
PUT    /api/admin/users/:id/toggle-status - Toggle active status
DELETE /api/admin/users/:id            - Delete user
```

## 🧪 Testing

### Using cURL

**Login as Admin:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@legalpadhai.com","password":"Admin@123456"}'
```

**Register New User:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name":"John Doe",
    "email":"john@example.com",
    "password":"Test@123456",
    "registrationType":"personal",
    "personalId":"TEST123456"
  }'
```

### Using Postman
Import `postman_collection.json` into Postman for a complete collection of requests.

## 📁 Project Structure

```
src/
├── admin/                  # Admin module
│   ├── dto/               # Data transfer objects
│   ├── admin.controller.ts
│   ├── admin.service.ts
│   └── admin.module.ts
├── auth/                   # Authentication module
│   ├── decorators/        # Custom decorators
│   ├── dto/               # DTOs for auth
│   ├── guards/            # JWT and role guards
│   ├── strategies/        # Passport strategies
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.module.ts
├── common/
│   └── enums/             # Enums (roles, types)
├── email/                  # Email service
├── firebase/               # Firebase integration
├── schemas/                # MongoDB schemas
├── app.module.ts          # Root module
└── main.ts                # Entry point
```

## 🔐 Security Notes

1. **Change default credentials immediately**
2. **Use strong JWT secrets in production**
3. **Enable HTTPS in production**
4. **Keep `.env` file secure and never commit it**
5. **Use Firebase security rules**
6. **Keep dependencies updated**
7. **Use environment-specific configurations**

## 🚀 Deployment

### Build for Production

```bash
npm run build
npm run start:prod
```

### Environment Variables for Production

- Set `NODE_ENV=production`
- Use production MongoDB cluster
- Update `FRONTEND_URL` to production URL
- Use strong JWT secrets
- Configure proper CORS settings

## 📝 Scripts

```bash
npm run start          # Start server
npm run start:dev      # Start in development mode
npm run start:prod     # Start in production mode
npm run build          # Build project
npm run create:admin   # Create admin user
npm run lint           # Lint code
npm run format         # Format code
```

## 🛠 Technologies Used

- **NestJS** - Progressive Node.js framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **Firebase** - Authentication and storage
- **JWT** - JSON Web Tokens
- **Bcrypt** - Password hashing
- **Nodemailer** - Email sending
- **Passport** - Authentication middleware
- **Class Validator** - Input validation

## 📞 Support

For issues or questions:
1. Check `SETUP_GUIDE.md` for configuration help
2. Review `API_DOCUMENTATION.md` for API details
3. Check common errors in setup guide

## 📄 License
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
