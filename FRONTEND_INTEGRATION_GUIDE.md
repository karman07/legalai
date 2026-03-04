# Frontend Integration Guide (Chat CRUD & Auth Updates)

This guide covers the integration of the new Editable Chat features and the tightened Authentication flow.

---

## 🔐 1. Authentication & Security

### **Check/Sync Email Verification**
If you handle verification on the frontend (e.g., via a "I've verified" button or an app-resume pulse), call this to sync the backend database.
- **Endpoint**: `POST /auth/verify-email`
- **Body**: `{ "email": "user@example.com" }`

### **Forgot Password (Send Link)**
- **Endpoint**: `POST /auth/forgot-password`
- **Body**: `{ "email": "user@example.com" }`
- **Action**: Triggers a **Themed HTML Email** containing a Firebase Reset Link.

### **Reset Password**
- **Endpoint**: `POST /auth/reset-password`
- **Body**: `{ "email": "user@example.com", "newPassword": "newSecretPassword", "idToken": "optional-firebase-id-token" }`
- **Usage**: Directly updates the password in both MongoDB and Firebase. If you provide the `idToken` from a Firebase reset success, the backend will **Deep Bind** the Firebase UID to the user account for future unified sign-ins.

### **Login Restriction**
- **Endpoint**: `POST /auth/login`
- **Error Handling**: If the user is unverified, the backend returns a `401 Unauthorized` with the message: `"Please verify your email address first."` 
- **Recommendation**: Redirect unverified users to a "Verify Your Email" screen upon receiving this status.

---

## 💬 2. Chat CRUD Operations (Editable Chat)

### **List Conversations (Sidebar)**
- **Endpoint**: `GET /chat/conversations`
- **Auth**: `Authorization: Bearer <token>`
- **Usage**: Use this to populate your sidebar history list.

### **Rename a Conversation**
- **Endpoint**: `PATCH /chat/conversations/:id`
- **Auth**: `Authorization: Bearer <token>`
- **Body**: `{ "title": "New User-Defined Title" }`

### **Delete an Entire Conversation**
- **Endpoint**: `DELETE /chat/conversations/:id`
- **Auth**: `Authorization: Bearer <token>`
- **Usage**: Removes the session and all message history linked to it.

### **Delete a Single Message**
- **Endpoint**: `DELETE /chat/message/:id`
- **Auth**: `Authorization: Bearer <token>`
- **Usage**: Use the `_id` received in the message object to delete a specific bubble.

---

## 🚀 3. Sending/Continuing Messages
**Endpoint**: `POST /chat`
**Auth**: `Optional Bearer Token` (Token is required for the chat to appear in history)

**New Chat**:
```json
{ "query": "Your first message" }
```

**Continuing Chat**:
```json
{ 
  "query": "Follow up question",
  "conversationId": "65e4..." 
}
```

---

## 💡 Frontend Logic Tips

1.  **State Sync**: When you **Delete** or **Rename**, remember to update your local frontend state (e.g., filter your array or update the object title) immediately to make the UI feel snappy.
2.  **Reset Password**: Use `POST /auth/reset-password` once you have confirmed the user's identity via Firebase verification on the frontend.
3.  **Token Persistence**: Ensure the `Bearer Token` is passed to the `POST /chat` endpoint if you want that conversation to persist in the `GET /chat/conversations` list.
