# LegalPadhai Admin Panel

A beautiful, feature-rich admin panel for managing users on LegalPadhai.ai with dark/light mode support.

## Features

✨ **User Management**
- View all users with pagination
- Search users by name, email, or institute ID
- Create new users with detailed forms
- Update user roles (Admin/User)
- Verify/unverify users
- Activate/deactivate user accounts
- Reset user passwords
- Delete users

📊 **Analytics & Statistics**
- Beautiful statistics cards with icons
- Interactive charts (Pie, Bar, Line)
- User status distribution
- Registration type breakdown
- Verification statistics

🎨 **UI/UX Features**
- Dark/light mode toggle
- Responsive design (mobile, tablet, desktop)
- Beautiful gradient colors
- Smooth animations and transitions
- Toast notifications for all actions
- Confirmation dialogs for destructive actions

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development
- **TailwindCSS** for styling
- **Recharts** for data visualization
- **Axios** for API calls
- **Sonner** for toast notifications
- **Lucide React** for icons
- **Class Variance Authority** for component variants

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure API endpoint:
Edit `src/constants/api.ts` and update the `BASE_URL`:
```typescript
export const API_CONFIG = {
  BASE_URL: 'http://localhost:3000/api', // Change this to your backend URL
  TIMEOUT: 30000,
};
```

3. Start development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── dashboard/
│   │   ├── StatsCards.tsx    # Statistics cards component
│   │   ├── Charts.tsx         # Analytics charts
│   │   └── UserTable.tsx      # User management table
│   ├── layout/
│   │   └── Sidebar.tsx        # Navigation sidebar
│   └── ui/                    # Reusable UI components
├── constants/
│   ├── api.ts                 # API endpoints
│   ├── app.ts                 # App constants
│   └── messages.ts            # Success/error messages
├── contexts/
│   └── ThemeContext.tsx       # Theme provider
├── lib/
│   └── utils.ts               # Utility functions
├── pages/
│   └── Dashboard.tsx          # Main dashboard page
├── services/
│   └── adminService.ts        # API service layer
├── types/
│   └── index.ts               # TypeScript types
└── App.tsx                    # Root component
```

## API Endpoints

The admin panel connects to the following backend endpoints:

### Authentication
- `POST /auth/login` - Admin login

### User Management
- `GET /admin/users` - Get all users (paginated)
- `GET /admin/users/search` - Search users
- `GET /admin/users/stats` - Get user statistics
- `GET /admin/users/:id` - Get user by ID
- `POST /admin/users` - Create new user
- `PUT /admin/users/:id/role` - Update user role
- `PUT /admin/users/:id/password` - Update user password
- `PUT /admin/users/:id/verify` - Verify user
- `PUT /admin/users/:id/toggle-status` - Toggle user status
- `DELETE /admin/users/:id` - Delete user

## Default Admin Credentials

```
Email: admin@legalpadhai.com
Password: Admin@123456
```

⚠️ **Important:** Change these credentials immediately after first login!

## Features Guide

### Dark Mode
Click the moon/sun icon in the sidebar to toggle between dark and light modes. Preference is saved in localStorage.

### User Search
Type in the search bar to search users by name, email, or institute ID. Search is debounced for performance.

### User Actions
Each user has quick action buttons:
- 👁️ View - See detailed user information
- ✅ Verify - Manually verify user email
- 🔑 Password - Reset user password
- 🛡️ Role - Change user role
- ⭕ Toggle - Activate/deactivate account
- 🗑️ Delete - Permanently remove user

### Creating Users
1. Click "Add User" button
2. Fill in required fields (Name, Email, Password)
3. Select role and registration type
4. Add optional information (Phone, Institute details, Address)
5. Click "Create User"

### Pagination
- Select items per page (10, 20, 50, 100)
- Navigate between pages using Previous/Next buttons
- View total users and current page

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

## Security Notes

- All admin routes require valid JWT token
- Tokens are stored in localStorage
- Auto logout on 401 Unauthorized
- Password updates require strong passwords
- Confirmation dialogs for destructive actions
- Rate limiting recommendations included

## Best Practices

✅ Always verify admin role before accessing
✅ Use HTTPS in production
✅ Rotate JWT tokens regularly
✅ Log all admin actions for audit trail
✅ Implement rate limiting on sensitive endpoints
✅ Confirm before deleting users (irreversible)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT

## Support

For issues or questions, please contact the development team.

---

Built with ❤️ for LegalPadhai.ai
