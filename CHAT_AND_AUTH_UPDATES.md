# AI Chat CRUD and Auth System Updates

This document outlines the new functionalities added to the backend for both the Chat system and the Authentication flow.

---

## 💬 1. Enhanced Chat CRUD Interface

The chat system now supports full CRUD (Create, Read, Update, Delete) operations. This allows the frontend to manage conversations exactly like modern chat apps.

### **Create/Continue Chat**
- **Endpoint**: `POST /chat`
- **Auth**: Public or Optional Bearer Token
- **Body**: `{ "query": "string", "conversationId": "optional-id" }`

### **List Conversations (Sidebar)**
- **Endpoint**: `GET /chat/conversations`
- **Auth**: Required (Bearer Token)

### **Fetch Transcript**
- **Endpoint**: `GET /chat/history/:conversationId`
- **Auth**: Required (Bearer Token)

### **Update Conversation (Rename)**
- **Endpoint**: `PATCH /chat/conversations/:id`
- **Auth**: Required (Bearer Token)
- **Body**: `{ "title": "New Title Content" }`

### **Delete Conversation**
- **Endpoint**: `DELETE /chat/conversations/:id`
- **Auth**: Required (Bearer Token)
- **Action**: Deletes the session and all its associated messages.

### **Delete Individual Message**
- **Endpoint**: `DELETE /chat/message/:id`
- **Auth**: Required (Bearer Token)

---

## 🔐 2. Authentication Flow (Firebase Bound)

Our system now strictly binds the backend JWT to the user's **Firebase Identity**. Every token issued contains the `firebaseUid` claim. We have tightened the security flow to ensure only verified users can access the system.

### **Forgot Password Route**
- **Endpoint**: `POST /auth/forgot-password`
- **Body**: `{ "email": "user@example.com" }`
- **Action**: Generates a Firebase reset link and sends it via a **Themed LegalAI HTML Template**.

### **Reset Password Route**
- **Endpoint**: `POST /auth/reset-password`
- **Body**: `{ "email": "user@example.com", "newPassword": "string" }`
- **Action**: Updates the hashed password in MongoDB and syncs the new password to Firebase Admin.

### **Firebase Unified Sign-In (Token Binding)**
- **Endpoint**: `POST /auth/firebase-signin`
- **Body**: `{ "idToken": "firebase-id-token" }`
- **Action**: Verifies any Firebase ID Token (Email/Pass, Google, Phone, etc.) and returns a local JWT that is **strictly bound** to the user's `firebaseUid`. Every local JWT payload now contains the `firebaseUid`.

### **Strict Email Verification Enforcement**
- **Sign-up**: Users must now verify their email via the link sent to them.
- **Login Block**: The `POST /auth/login` endpoint will reject sign-ins with a `401 Unauthorized` status if the email is not verified.
- **Auto-Sync**: If a user verifies their email via Firebase, the next time they attempt to login, the backend automatically updates their status to `isVerified: true`.

### **Frontend Sync Endpoint**
- **Endpoint**: `POST /auth/verify-email`
- **Body**: `{ "email": "user@example.com" }`
- **Action**: Allows the frontend to explicitly trigger a verification status check and sync the backend database with Firebase.

---

## 📂 Configuration Recap
Ensure these are set in your `.env`:
```env
PORT=3000
FRONTEND_URL=your-frontend-link
CHAT_AI_URL=your-secondary-ai-url
```
