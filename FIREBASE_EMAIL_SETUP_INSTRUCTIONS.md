# Firebase Email Setup Instructions

## Problem
Emails are being queued to Firestore but not actually being sent because the Firebase Trigger Email extension is not installed.

## Solution: Install Firebase Trigger Email Extension

### Step 1: Go to Firebase Console
1. Visit https://console.firebase.google.com
2. Select your project: **legal-239c5**

### Step 2: Install the Trigger Email Extension
1. In the left sidebar, click **Extensions** (or visit https://console.firebase.google.com/project/legal-239c5/extensions)
2. Click **Install Extension** or **Explore Extensions**
3. Search for **"Trigger Email from Firestore"**
4. Click on the extension and then click **Install**

### Step 3: Configure the Extension
During installation, you'll need to configure:

#### Email Provider Settings
Choose one of these options:

**Option A: Gmail (Easiest for testing)**
- **SMTP Server**: `smtp.gmail.com`
- **SMTP Port**: `587`
- **Email Address**: Your Gmail address (e.g., `your-email@gmail.com`)
- **Email Password**: 
  1. Go to https://myaccount.google.com/apppasswords
  2. Create an App Password for "Mail"
  3. Copy the 16-character password
  4. Paste it here

**Option B: SendGrid (Recommended for production)**
- **SMTP Server**: `smtp.sendgrid.net`
- **SMTP Port**: `587`
- **Email Address**: Your verified sender email
- **Email Password**: Your SendGrid API Key

**Option C: Other providers**
- Mailgun, AWS SES, Postmark, etc.

#### Firestore Collection Settings
- **Firestore Collection**: `mail` (this is already what we're using in the code)
- **Email Documents TTL**: `604800` (7 days - optional)

#### Email Defaults
- **Default FROM name**: `LegalPadhai`
- **Default FROM email**: Your verified sender email (e.g., `noreply@legalpadhai.com`)
- **Default REPLY-TO**: (optional)

### Step 4: Deploy the Extension
1. Review the configuration
2. Click **Install Extension**
3. Wait for deployment (usually takes 2-3 minutes)

### Step 5: Test Email Sending

#### Test 1: Register a new user
```bash
# Use the Postman collection
POST http://localhost:3000/api/auth/register
{
  "name": "Test User",
  "email": "your-test-email@gmail.com",
  "password": "Test@123456",
  "registrationType": "personal"
}
```

#### Test 2: Check Firestore
1. Go to Firebase Console → Firestore Database
2. You should see a `mail` collection
3. Check for your email document
4. It should have fields:
   - `to`: recipient email
   - `message`: email content
   - `delivery`: (added by extension after sending)

#### Test 3: Verify Email Receipt
- Check your inbox (and spam folder)
- You should receive the verification email

### Step 6: Monitor Email Delivery

#### Check Extension Logs
1. Go to Extensions → Trigger Email
2. Click **View in Cloud Console**
3. Check logs for any errors

#### Check Firestore Documents
- Successfully sent emails will have `delivery.state = "SUCCESS"`
- Failed emails will have `delivery.state = "ERROR"` with error details

---

## Alternative: Use Nodemailer Directly (Quick Testing)

If you want to test immediately without installing Firebase extensions, we can switch to Nodemailer:

### Update .env file:
```env
# Email Configuration (for Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@legalpadhai.com
```

### Update email.service.ts:
Replace the Firebase email queuing with direct SMTP sending using Nodemailer.

---

## Troubleshooting

### Emails not being sent
1. **Check Firebase Extension is installed**: Go to Extensions tab
2. **Check SMTP credentials**: Make sure App Password is correct
3. **Check Firestore permissions**: Extension needs write access to `mail` collection
4. **Check email logs**: View extension logs for errors
5. **Check spam folder**: Emails might be marked as spam

### Gmail App Password
If using Gmail:
1. Enable 2-Step Verification on your Google Account
2. Visit https://myaccount.google.com/apppasswords
3. Generate a new App Password
4. Use this password (not your regular Gmail password)

### Common Errors
- `535 Authentication failed`: Wrong SMTP credentials
- `550 Relay not permitted`: Need to verify sender domain
- `Network error`: Check SMTP host and port

---

## Current Email Templates

### 1. Verification Email
- Sent after user registration
- Contains verification link: `${FRONTEND_URL}/verify-email?token={token}`
- Link expires in 24 hours

### 2. Password Reset Email
- Sent when user requests password reset
- Contains reset link: `${FRONTEND_URL}/reset-password?token={token}`
- Link expires in 1 hour

### 3. Welcome Email
- Sent after email verification
- Welcome message to verified users

---

## Next Steps

1. **Install Firebase Trigger Email extension**
2. **Configure SMTP provider** (Gmail for testing, SendGrid for production)
3. **Test with real email registration**
4. **Update .env with FRONTEND_URL** if not already set
5. **Verify emails are being received**

## Production Recommendations

For production use:
1. Use a professional email service (SendGrid, Mailgun, AWS SES)
2. Set up a custom domain for sender emails
3. Configure SPF, DKIM, and DMARC records
4. Monitor delivery rates and bounces
5. Implement email templates in a separate service
