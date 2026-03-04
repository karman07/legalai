# LegalAI Frontend Integration Guide 🚀

Welcome to the LegalAI Frontend Integration Guide. This document provides everything you need to connect your frontend application to our backend systems, covering Authentication, Identity Binding, and the advanced AI Chat system.

---

## 📍 Base URL & Configuration

- **Backend Port**: `3000`
- **Base URL**: `http://localhost:3000` (or your production domain)
- **Content Type**: `application/json`

---

## 🔐 1. Authentication & Security (Firebase Bound)

Our system strictly binds every local JWT (Access Token) to the user's **Firebase Identity**. Every token issued contains the `firebaseUid` claim.

### **Traditional Login**
- **Endpoint**: `POST /auth/login`
- **Restriction**: If the account is not verified, it returns `401 Unauthorized` with message: `"Please verify your email address first."`

### **Unified Firebase Sign-In**
Use this to bridge ANY Firebase login (Google, Email/Pass, Phone) to our backend.
- **Endpoint**: `POST /auth/firebase-signin`
- **Body**: `{ "idToken": "firebase_id_token" }`
- **Result**: Returns a local JWT bound to that Firebase UID.

### **Check/Sync Email Verification**
Call this to manually sync the backend database if the user verifies their email via a frontend pulse.
- **Endpoint**: `POST /auth/verify-email`
- **Body**: `{ "email": "user@example.com" }`

---

## 🔑 2. Password Management (Reset Flow)

Our reset flow is strictly verification-based. It does **not** require the "current password."

### **Forgot Password (Trigger)**
- **Endpoint**: `POST /auth/forgot-password`
- **Body**: `{ "email": "user@example.com" }`
- **Action**: Sends a **Themed LegalAI HTML Email** containing a Firebase Reset Link.

### **Reset Password (Execution)**
Call this after the user has used the Firebase link or verified their identity on the frontend.
- **Endpoint**: `POST /auth/reset-password`
- **Body**: 
  ```json
  { 
    "email": "user@example.com", 
    "newPassword": "newSecretPassword", 
    "idToken": "optional_firebase_id_token" 
  }
  ```
- **Pro-Tip**: Providing the `idToken` will **Deep Bind** the account to Firebase for unified future logins.

---

## 💬 3. Editable AI Chat System (CRUD)

The chat system manages history, session grouping, and auto-naming locally.

### **Start or Continue a Chat**
- **Endpoint**: `POST /chat`
- **Headers**: `Authorization: Bearer <token>` (Required for history persistence)
- **Body**: `{ "query": "string", "conversationId": "optional-id" }`

### **Conversations List (Sidebar)**
- **Endpoint**: `GET /chat/conversations`
- **Returns**: Array of session metadata (id, title, timestamps).

### **Rename a Conversation**
- **Endpoint**: `PATCH /chat/conversations/:id`
- **Body**: `{ "title": "New Title" }`

### **Delete Operations**
- **Full Conversation**: `DELETE /chat/conversations/:id`
- **Single Message**: `DELETE /chat/message/:id`

---

## 💡 Frontend Implementation Tips

1.  **Strict Token Rule**: Only chats sent **with** the `Bearer Token` header will appear in the `GET /chat/conversations` list.
2.  **Snappy UI**: When Renaming or Deleting, update your local State/Store immediately before the API returns for a "premium" feel.
3.  **Verification Redirect**: If the Login API returns a `401` regarding verification, redirect the user immediately to a "Check Your Inbox" screen.
4.  **HTML Emails**: Our system now sends premium, themed HTML emails for password resets to provide a high-end feel for your users.

---
*Developed by Antigravity AI for LegalAI Advanced Services.*
