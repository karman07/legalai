# Firebase Authentication Email Integration Guide

## Overview
The system now uses **Firebase Authentication's built-in email functionality** instead of Firestore email queue. This provides automatic email delivery without needing extensions.

## How It Works

### 1. Email Verification Flow
When a user registers:
1. User is created in both Firebase Auth and MongoDB
2. System calls `admin.auth().generateEmailVerificationLink()`
3. Firebase automatically sends verification email (if SMTP configured)
4. Link appears in terminal/console for testing
5. User clicks link → Frontend calls `/api/auth/verify-email` with Firebase UID
6. Backend marks user as verified in both Firebase and MongoDB

### 2. Password Reset Flow
When a user requests password reset:
1. System calls `admin.auth().generatePasswordResetLink()`
2. Firebase automatically sends password reset email
3. Link appears in terminal/console for testing
4. User clicks link → Frontend calls `/api/auth/reset-password` with email and new password
5. Backend updates password in both Firebase and MongoDB

## Firebase Console Email Configuration

### Enable Email Templates
1. Go to: https://console.firebase.google.com/project/legal-239c5/authentication/emails
2. Click on **Email verification** template
3. Edit the template with your branding
4. Set **Sender name**: LegalPadhai
5. Set **Reply-to**: support@legalpadhai.com (or your email)
6. Save changes

### Configure SMTP (Optional but Recommended)
By default, Firebase uses their own email delivery. For better deliverability and custom sender:

1. Go to: https://console.firebase.google.com/project/legal-239c5/settings/general
2. Scroll to **Email settings**
3. Configure SMTP server:
   - **Gmail Option:**
     - SMTP: smtp.gmail.com:587
     - Username: your-gmail@gmail.com
     - Password: [App Password from Google]
   - **SendGrid Option:**
     - SMTP: smtp.sendgrid.net:587
     - Username: apikey
     - Password: [Your SendGrid API Key]

## API Changes

### Old vs New Endpoints

#### Email Verification
**Old:**
```json
POST /api/auth/verify-email
{
  "token": "custom-generated-token-from-email"
}
```

**New:**
```json
POST /api/auth/verify-email
{
  "firebaseUid": "firebase-user-uid-from-link"
}
```

#### Password Reset
**Old:**
```json
POST /api/auth/reset-password
{
  "token": "custom-reset-token",
  "newPassword": "NewPassword@123"
}
```

**New:**
```json
POST /api/auth/reset-password
{
  "email": "user@example.com",
  "newPassword": "NewPassword@123"
}
```

## Frontend Integration

### Email Verification
```javascript
// When user clicks verification link from email
// Firebase link format: https://your-app/__/auth/action?mode=verifyEmail&oobCode=ABC123

// Option 1: Use Firebase SDK (Recommended)
import { applyActionCode } from 'firebase/auth';

async function handleVerifyEmail(auth, oobCode) {
  try {
    // Verify with Firebase
    await applyActionCode(auth, oobCode);
    
    // Get current user's UID
    const user = auth.currentUser;
    
    // Notify backend
    await fetch('http://localhost:3000/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firebaseUid: user.uid })
    });
    
    console.log('Email verified successfully!');
  } catch (error) {
    console.error('Verification failed:', error);
  }
}
```

### Password Reset
```javascript
// When user clicks reset link from email
// Firebase link format: https://your-app/__/auth/action?mode=resetPassword&oobCode=ABC123

// Option 1: Use Firebase SDK (Recommended)
import { confirmPasswordReset } from 'firebase/auth';

async function handleResetPassword(auth, oobCode, newPassword) {
  try {
    // Reset in Firebase
    await confirmPasswordReset(auth, oobCode, newPassword);
    
    // Get email from oobCode first (need to verify code)
    const info = await verifyPasswordResetCode(auth, oobCode);
    
    // Notify backend to sync
    await fetch('http://localhost:3000/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: info.email,
        newPassword: newPassword 
      })
    });
    
    console.log('Password reset successfully!');
  } catch (error) {
    console.error('Reset failed:', error);
  }
}
```

## Testing in Development

### Without SMTP Configuration
The system will log email links to the console:

```
=================================================
EMAIL VERIFICATION LINK FOR: user@example.com
=================================================
https://legal-239c5.firebaseapp.com/__/auth/action?mode=verifyEmail&oobCode=ABC123XYZ...
=================================================
```

**To test:**
1. Copy the link from terminal
2. Open in browser
3. Let Firebase handle the verification
4. Frontend should call backend to sync

### With SMTP Configuration
Emails will be automatically delivered to user's inbox with your custom templates.

## Production Checklist

- [ ] Configure custom email templates in Firebase Console
- [ ] Set up professional SMTP (SendGrid/Mailgun recommended)
- [ ] Set proper sender name and reply-to email
- [ ] Configure frontend to handle Firebase action links
- [ ] Test email delivery in production environment
- [ ] Set up email monitoring/logging
- [ ] Configure SPF/DKIM records for your domain (if using custom domain)

## Advantages Over Previous System

✅ **No Extension Required**: Built into Firebase Authentication
✅ **Automatic Delivery**: Firebase handles email sending
✅ **Better Deliverability**: Firebase's email infrastructure
✅ **Template Management**: Easy to customize in Firebase Console
✅ **Token Security**: Firebase-managed tokens with expiration
✅ **Reduced Complexity**: No manual token generation/storage
✅ **Better UX**: Standard Firebase auth flow

## Troubleshooting

### Emails not being sent
1. Check Firebase Console email settings
2. Verify SMTP credentials if configured
3. Check Firebase Authentication quotas
4. Look for errors in Firebase Console logs

### Links not working
1. Ensure frontend is properly configured to handle action links
2. Check if oobCode is being extracted correctly
3. Verify Firebase SDK is initialized properly

### Backend sync issues
1. Ensure firebaseUid is being passed correctly
2. Check MongoDB connection
3. Verify user exists in database

## Next Steps

1. **Start the server**: `npm run start:dev`
2. **Register a user**: Check console for verification link
3. **Configure Firebase email templates** (optional)
4. **Set up frontend** to handle Firebase action links
5. **Configure SMTP** for production email delivery
