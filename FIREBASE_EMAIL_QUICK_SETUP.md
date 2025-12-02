# Firebase Email Quick Setup Guide

## ✅ Current Setup Status

The backend is now configured to use **Firebase Authentication's built-in email sending**. Firebase will automatically send emails when you complete the setup below.

## 🔧 Required: Enable Email Sending in Firebase Console

### Step 1: Go to Firebase Authentication Settings
Open: https://console.firebase.google.com/project/legal-239c5/authentication/emails

### Step 2: Customize Email Templates

#### Email Verification Template:
1. Click on "Email address verification" 
2. Click "Edit template (pencil icon)"
3. Customize the template:
   - **Sender name**: LegalPadhai
   - **Reply-to**: support@legalpadhai.com (or your email)
   - **Subject**: Verify your email for LegalPadhai
   - **Body**: Customize the message (optional)
4. Click "SAVE"

#### Password Reset Template:
1. Click on "Password reset"
2. Click "Edit template (pencil icon)"
3. Customize the template:
   - **Sender name**: LegalPadhai
   - **Reply-to**: support@legalpadhai.com
   - **Subject**: Reset your LegalPadhai password
   - **Body**: Customize the message (optional)
4. Click "SAVE"

### Step 3: Configure SMTP (HIGHLY RECOMMENDED for Production)

By default, Firebase uses their email service, but it may have limitations. For better deliverability:

1. Go to: https://console.firebase.google.com/project/legal-239c5/settings/general
2. Scroll to **Project settings** > **Service accounts**
3. Or configure a custom SMTP server (if available in your plan)

## 📧 How It Works Now

### Registration Flow:
```
1. User registers → POST /api/auth/register
2. Backend creates user in Firebase Auth + MongoDB
3. Firebase automatically SENDS verification email to user
4. User clicks link in email
5. Frontend handles Firebase verification
6. Frontend calls POST /api/auth/verify-email with firebaseUid
7. Backend marks user as verified
```

### Password Reset Flow:
```
1. User requests reset → POST /api/auth/forgot-password
2. Firebase automatically SENDS password reset email
3. User clicks link in email
4. Frontend handles password reset with Firebase
5. Frontend calls POST /api/auth/reset-password to sync backend
```

## 🧪 Testing

### Test Email Verification:
```bash
# 1. Start the server
npm run start:dev

# 2. Register a user (use your real email)
POST http://localhost:3000/api/auth/register
{
  "name": "Test User",
  "email": "your-real-email@gmail.com",
  "password": "Test@123456",
  "registrationType": "personal"
}

# 3. Check your email inbox for verification email
# 4. Click the link in the email
# 5. Frontend should handle the verification
```

## 🔍 Troubleshooting

### Emails not received?

**Check 1:** Firebase Console Configuration
- Go to https://console.firebase.google.com/project/legal-239c5/authentication/emails
- Ensure templates are enabled and customized
- Check that "Sender name" is set

**Check 2:** Check Spam Folder
- Firebase emails might land in spam initially
- Mark as "Not Spam" to improve deliverability

**Check 3:** Email Quota
- Free Firebase plans have email sending limits
- Check quota at: https://console.firebase.google.com/project/legal-239c5/usage

**Check 4:** User Already Exists
- Firebase won't send verification email if user email is already verified
- Try with a fresh email address

**Check 5:** Console Logs
- Check server console for the email link (for testing)
- Link format: `https://legal-239c5.firebaseapp.com/__/auth/action?mode=verifyEmail&oobCode=...`

### See the actual link in console
The backend logs the verification/reset link for testing:
```
✅ Verification email sent to: user@example.com
📧 Link (for testing): https://legal-239c5.firebaseapp.com/__/auth/action?mode=verifyEmail&oobCode=ABC123...
```

You can copy this link and open it in a browser for testing without waiting for email.

## 🚀 Production Recommendations

1. **Upgrade Firebase Plan**: Blaze plan for higher email quotas
2. **Custom Domain**: Configure custom email domain for better branding
3. **Email Analytics**: Monitor email delivery rates in Firebase Console
4. **Backup Solution**: Consider SendGrid/Mailgun as backup for critical emails

## 📝 Frontend Integration Needed

Your frontend needs to handle Firebase action links. Here's a sample:

```javascript
// In your React/Next.js app
import { applyActionCode, verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth';

// Handle email verification
const handleEmailVerification = async (auth, oobCode) => {
  try {
    await applyActionCode(auth, oobCode);
    const user = auth.currentUser;
    
    // Notify backend
    await fetch('http://localhost:3000/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firebaseUid: user.uid })
    });
  } catch (error) {
    console.error('Verification failed:', error);
  }
};

// Handle password reset
const handlePasswordReset = async (auth, oobCode, newPassword) => {
  try {
    const email = await verifyPasswordResetCode(auth, oobCode);
    await confirmPasswordReset(auth, oobCode, newPassword);
    
    // Sync with backend
    await fetch('http://localhost:3000/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, newPassword })
    });
  } catch (error) {
    console.error('Reset failed:', error);
  }
};
```

## ✨ Advantages of This Approach

✅ **No Dependencies**: Pure Firebase Auth, no nodemailer, no extensions
✅ **Automatic Sending**: Firebase handles email delivery
✅ **Template Management**: Easy to customize in Firebase Console
✅ **Secure Tokens**: Firebase manages token expiration and security
✅ **Standard Flow**: Industry-standard Firebase auth pattern
✅ **Free Tier**: Reasonable limits on free plan

## 🎯 Next Steps

1. ✅ **Backend is ready** - Email service is configured
2. 🔧 **Configure Firebase Console** - Follow Step 1-2 above (5 minutes)
3. 🧪 **Test with real email** - Register with your email
4. 📱 **Build frontend** - Handle Firebase action links
5. 🚀 **Deploy** - Push to production

---

**Need Help?** 
- Firebase Auth Docs: https://firebase.google.com/docs/auth/web/email-link-auth
- Email Templates: https://firebase.google.com/docs/auth/custom-email-handler
