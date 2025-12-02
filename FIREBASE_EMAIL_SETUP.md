# Firebase Email Setup for LegalPadhai

## 🔥 Firebase Configuration Complete!

Your Firebase credentials have been configured:
- **Project ID**: legal-239c5
- **Client Email**: firebase-adminsdk-fbsvc@legal-239c5.iam.gserviceaccount.com

## 📧 Email System

The system now uses **Firebase Firestore** to queue emails instead of SMTP. Emails are stored in the `mail` collection and can be sent using:

### Option 1: Firebase Email Trigger Extension (Recommended)

1. **Install the Extension:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project: `legal-239c5`
   - Go to **Extensions** in the left menu
   - Click **Install Extension**
   - Search for **"Trigger Email from Firestore"**
   - Click **Install**

2. **Configure the Extension:**
   - **SMTP Connection URI**: Use Gmail SMTP or SendGrid
     - Gmail: `smtps://your-email@gmail.com:your-app-password@smtp.gmail.com:465`
     - SendGrid: `smtps://apikey:YOUR_SENDGRID_API_KEY@smtp.sendgrid.net:465`
   - **Email documents collection**: `mail`
   - **Default FROM email**: `noreply@legal-239c5.firebaseapp.com`

3. **Deploy:**
   - Click **Install Extension**
   - Wait for deployment to complete

### Option 2: Custom Cloud Function (Alternative)

If you prefer to handle emails with a Cloud Function:

```javascript
// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-app-password'
  }
});

exports.sendEmail = functions.firestore
  .document('mail/{mailId}')
  .onCreate(async (snap, context) => {
    const mailData = snap.data();
    
    const mailOptions = {
      from: mailData.from,
      to: mailData.to,
      subject: mailData.message.subject,
      html: mailData.message.html
    };

    try {
      await transporter.sendMail(mailOptions);
      await snap.ref.update({ status: 'sent', sentAt: admin.firestore.FieldValue.serverTimestamp() });
    } catch (error) {
      await snap.ref.update({ status: 'error', error: error.message });
    }
  });
```

Deploy:
```bash
firebase deploy --only functions
```

### Option 3: Using SendGrid (Simple & Free Tier Available)

1. **Get SendGrid API Key:**
   - Sign up at [SendGrid](https://sendgrid.com/)
   - Create an API key
   - Verify your sender email

2. **Install Extension:**
   - Firebase Console → Extensions
   - Install **"Send Email with SendGrid"**
   - Use your SendGrid API key

## 📝 How It Works

1. **Application Code**: Writes email data to Firestore `mail` collection
2. **Firebase Extension/Function**: Watches the collection
3. **Auto-Send**: When new document is added, email is sent automatically
4. **Status Tracking**: Email status is updated in the document

## 🔍 Email Collections in Firestore

### `mail` Collection
Stores all outgoing emails:
```json
{
  "to": "user@example.com",
  "from": "LegalPadhai <noreply@legal-239c5.firebaseapp.com>",
  "message": {
    "subject": "Email Subject",
    "html": "<html>Email content</html>"
  },
  "status": "pending|sent|error",
  "sentAt": "timestamp",
  "error": "error message if failed"
}
```

### `email_verifications` Collection
Tracks verification emails:
```json
{
  "email": "user@example.com",
  "token": "verification-token",
  "link": "http://localhost:3000/verify-email?token=...",
  "createdAt": "timestamp",
  "type": "email_verification"
}
```

### `password_resets` Collection
Tracks password reset requests:
```json
{
  "email": "user@example.com",
  "token": "reset-token",
  "link": "http://localhost:3000/reset-password?token=...",
  "createdAt": "timestamp",
  "expiresAt": "timestamp"
}
```

## ✅ Current Status

- ✅ Firebase credentials configured
- ✅ Email service updated to use Firestore
- ✅ Email templates ready
- ⚠️ **Next Step**: Install Firebase Email Extension or deploy Cloud Function

## 🚀 Quick Start

### Without Email Extension (Testing)

You can run the app now and emails will be queued in Firestore:

```bash
npm run start:dev
```

Emails will appear in Firestore `mail` collection but won't be sent until you configure the extension.

### With Email Extension (Production Ready)

1. Install the extension as described above
2. Configure SMTP settings
3. Restart your app
4. Emails will be sent automatically!

## 🔧 Testing Email Queue

1. Start the app: `npm run start:dev`
2. Register a user via API
3. Check Firestore Console → `mail` collection
4. You should see the email document created
5. Once extension is installed, it will be sent automatically

## 📊 Monitoring

View email logs in:
- Firebase Console → Firestore → `mail` collection
- Check `status` field: `pending`, `sent`, or `error`
- Check `sentAt` timestamp when sent
- Check `error` field if failed

## 💡 Benefits of Firebase Email

- ✅ No SMTP configuration needed in app
- ✅ Automatic retry on failures
- ✅ Email status tracking
- ✅ Scalable and reliable
- ✅ Free tier available
- ✅ Easy to monitor
- ✅ Works with SendGrid, Gmail, etc.

## 🎯 Recommended Setup

For production, I recommend:

1. **Use SendGrid Extension** (easiest)
   - 100 emails/day free
   - Reliable delivery
   - Good analytics

2. **Alternative: Gmail SMTP**
   - Free for low volume
   - 500 emails/day limit
   - Requires app password

3. **Alternative: Custom email service**
   - Full control
   - Use your own SMTP server

Choose based on your email volume and budget!
