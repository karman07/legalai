# 🚀 LegalPadhai Admin Panel - Quick Start Guide

## ✅ Setup Complete!

Your beautiful admin panel is ready to use! The development server is running at:

**http://localhost:5174/**

---

## 🔐 Login Flow

The app now has a complete authentication flow:

1. **First Visit**: You'll see the beautiful login page
2. **Login**: Use the default admin credentials or your own
3. **Dashboard**: After successful login, you'll be redirected to the dashboard
4. **Logout**: Click logout in sidebar to return to login page
5. **Auto-Logout**: Session expires on 401 errors (invalid token)

**Default Admin Credentials**:
```
Email: admin@legalpadhai.com
Password: Admin@123456
```

Click "Use default admin credentials" button to auto-fill!

---

## 🎯 What's Been Built

### 1. **User Dashboard** 📊
- **8 Beautiful Statistics Cards** with gradient colors and icons
  - Total Users
  - Active Users
  - Inactive Users
  - Verified Users
  - Unverified Users
  - Admin Users
  - Personal Accounts
  - Institute Accounts

### 2. **Interactive Charts** 📈
- User Status Distribution (Pie Chart)
- Verification Status (Pie Chart)
- Registration Types (Bar Chart)
- User Overview (Multi-Bar Chart)
- All charts with custom tooltips and dark mode support

### 3. **User Management Table** 🗂️
- **Search**: Real-time search by name, email, or institute ID (debounced)
- **Pagination**: 10, 20, 50, or 100 users per page
- **Actions for Each User**:
  - 👁️ View detailed information
  - ✅ Verify user email
  - 🔑 Reset password
  - 🛡️ Change role (Admin/User)
  - ⭕ Activate/Deactivate account
  - 🗑️ Delete user (with confirmation)
- **Create New User**: Full form with all fields

### 4. **Beautiful UI Features** 🎨
- ✨ Dark/Light mode toggle (saved in localStorage)
- 📱 Fully responsive (mobile, tablet, desktop)
- 🎨 Gradient colors and smooth animations
- 🔔 Toast notifications for all actions (Sonner)
- ⚠️ Confirmation dialogs for destructive actions
- 🎯 Loading states and error handling

### 5. **Sidebar Navigation** 🧭
- Logo and branding
- User Dashboard link
- Theme toggle (Moon/Sun icon)
- Current admin user info
- Logout button
- Mobile hamburger menu

---

## 🛠️ Technologies Used

| Technology | Purpose |
|------------|---------|
| **React 18** + **TypeScript** | Core framework |
| **Vite** | Build tool & dev server |
| **TailwindCSS** | Styling |
| **Recharts** | Charts & data visualization |
| **Axios** | HTTP client for API calls |
| **Sonner** | Toast notifications |
| **Lucide React** | Icons |
| **CVA** | Component variants |

---

## 📁 Project Structure

```
src/
├── components/
│   ├── dashboard/
│   │   ├── StatsCards.tsx    ✅ Statistics cards
│   │   ├── Charts.tsx         ✅ Analytics charts
│   │   └── UserTable.tsx      ✅ User management
│   ├── layout/
│   │   └── Sidebar.tsx        ✅ Navigation sidebar
│   └── ui/                    ✅ Reusable components
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       ├── select.tsx
│       └── table.tsx
├── constants/
│   ├── api.ts                 ✅ API endpoints
│   ├── app.ts                 ✅ App constants
│   └── messages.ts            ✅ Messages
├── contexts/
│   └── ThemeContext.tsx       ✅ Theme provider
├── lib/
│   └── utils.ts               ✅ Utilities
├── pages/
│   └── Dashboard.tsx          ✅ Main page
├── services/
│   └── adminService.ts        ✅ API service
└── types/
    └── index.ts               ✅ TypeScript types
```

---

## 🔧 Configuration

### API Endpoint
Edit `src/constants/api.ts`:
```typescript
export const API_CONFIG = {
  BASE_URL: 'http://localhost:3000/api', // ← Change this
  TIMEOUT: 30000,
};
```

### Default Admin Credentials
```
Email: admin@legalpadhai.com
Password: Admin@123456
```

---

## 🎬 How to Use

### Starting the Server
```bash
npm run dev
```
Server runs at: http://localhost:5174/

### Building for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

---

## 🔌 API Endpoints Integrated

All these endpoints are configured in `adminService.ts`:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/login` | Admin login |
| `GET` | `/admin/users` | Get all users (paginated) |
| `GET` | `/admin/users/search` | Search users |
| `GET` | `/admin/users/stats` | Get statistics |
| `GET` | `/admin/users/:id` | Get user details |
| `POST` | `/admin/users` | Create user |
| `PUT` | `/admin/users/:id/role` | Update role |
| `PUT` | `/admin/users/:id/password` | Reset password |
| `PUT` | `/admin/users/:id/verify` | Verify user |
| `PUT` | `/admin/users/:id/toggle-status` | Toggle status |
| `DELETE` | `/admin/users/:id` | Delete user |

---

## 🎨 Theme Customization

The app uses Tailwind dark mode with class strategy. Theme preference is saved in localStorage.

**Toggling Theme:**
- Click the Moon/Sun icon in the sidebar
- Automatically applied to all components
- Persists across sessions

---

## 🔔 Notifications

All user actions show beautiful toast notifications:

✅ **Success**: Green toast with success message  
❌ **Error**: Red toast with error details  
⚠️ **Info**: Blue toast for information  

Powered by **Sonner** library.

---

## 📱 Responsive Design

| Screen Size | Behavior |
|-------------|----------|
| **Mobile** (< 1024px) | Collapsible sidebar with hamburger menu |
| **Tablet** (1024px - 1280px) | Fixed sidebar, responsive grid |
| **Desktop** (> 1280px) | Full layout with all features |

---

## 🔒 Security Features

- ✅ JWT token authentication
- ✅ Auto logout on 401 Unauthorized
- ✅ localStorage for token management
- ✅ Confirmation dialogs for destructive actions
- ✅ HTTPS ready for production
- ✅ Error handling for all API calls

---

## 🐛 Error Handling

All errors are handled gracefully:

1. **Network errors** → "Network error. Please check your connection"
2. **Unauthorized** → Auto logout + redirect
3. **Validation errors** → Show field-specific messages
4. **Server errors** → Generic error message

---

## 📊 Dashboard Features

### Statistics Cards
- Real-time user counts
- Percentage calculations
- Gradient icons
- Hover animations

### Charts
- Interactive tooltips
- Dark mode support
- Responsive sizing
- Custom colors

### User Table
- Real-time search
- Sortable columns
- Quick actions
- Pagination controls

---

## 🎯 Next Steps

1. **Connect to Backend**:
   - Update `API_CONFIG.BASE_URL` in `src/constants/api.ts`
   - Ensure CORS is enabled on backend
   - Test all endpoints

2. **Customize Branding**:
   - Update logo in Sidebar component
   - Change color scheme in Tailwind config
   - Update app name in constants

3. **Add More Features** (Optional):
   - Login page with authentication
   - More dashboard sections
   - Activity logs
   - Export data to CSV
   - Advanced filtering

---

## 📚 Component Documentation

### StatsCards
```tsx
<StatsCards stats={stats} loading={loading} />
```

### Charts
```tsx
<Charts stats={stats} loading={loading} />
```

### UserTable
```tsx
<UserTable
  users={users}
  pagination={pagination}
  loading={loading}
  onPageChange={handlePageChange}
  onLimitChange={handleLimitChange}
  onRefresh={handleRefresh}
/>
```

---

## 🎉 You're All Set!

Your admin panel is production-ready with:
- ✅ Beautiful UI with dark mode
- ✅ Complete user management
- ✅ Analytics & charts
- ✅ Toast notifications
- ✅ Responsive design
- ✅ TypeScript & best practices

**Happy coding! 🚀**

---

## 💡 Tips

1. **Theme**: Use the moon/sun button to test both themes
2. **Search**: Try searching for users - it's debounced for performance
3. **Dialogs**: All destructive actions have confirmations
4. **Mobile**: Test responsive design with browser DevTools
5. **Notifications**: Check the toast notifications in top-right

---

## 🆘 Need Help?

Check the main README_ADMIN.md for detailed documentation on:
- API endpoints reference
- Component API
- Customization guide
- Security best practices
- Troubleshooting

---

**Built with ❤️ for LegalPadhai.ai**
