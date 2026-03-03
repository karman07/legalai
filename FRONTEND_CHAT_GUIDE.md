# Frontend Chat Integration Guide (Final)

This backend manages **History**, **Session Grouping**, and **Chat Naming** locally. The AI response itself is proxied from an external service defined in your `.env`.

---

## 🛠 Prerequisites (.env)
The backend uses these variables to connect to your secondary AI app:
```env
PORT=3000
CHAT_AI_URL=http://localhost:8000/chat  # The target AI service
```

---

## 🚀 1. Sending a Message (POST /chat)
This endpoint is **Public**. However, the behavior depends on whether you send an `Authorization` token:

- **Anonymous Guest**: Call without token. Conversation will work, but it won't appear in any "Conversations List."
- **Logged-in User**: Call with `Bearer Token`. The chat history will be stored under your account and will appear in your sidebar.

### Request Payload:
```json
{
  "query": "What is IPC?",
  "conversationId": "optional-id-to-continue-existing-thread"
}
```

### Success Response:
```json
{
  "query": "What is IPC?",
  "response": "The Indian Penal Code is...",
  "conversationId": "65e49f...", // 👈 Use this for subsequent messages
  "title": "What is IPC" // 👈 Generated locally by this backend
}
```

---

## 📂 2. Loading Sidebar (GET /chat/conversations)
**Endpoint**: `GET /chat/conversations`  
**Requires**: `Authorization: Bearer <TOKEN>`  

- **Important**: This will return `[]` if you haven't made any chats *while logged in* (sending the token during `POST /chat`). 
- **Example Response**:
```json
[
  {
    "_id": "65e49f...",
    "title": "What is IPC",
    "createdAt": "2024-03-03T15:00Z",
    "updatedAt": "2024-03-03T15:05Z"
  }
]
```

---

## 📜 3. Fetching Transcript (GET /chat/history/:id)
**Endpoint**: `GET /chat/history/65e49f...`  
**Requires**: `Authorization: Bearer <TOKEN>`

**Response**:
```json
[
  {
    "query": "What is IPC?",
    "response": "..."
  },
  {
    "query": "Punishment for theft?",
    "response": "..."
  }
]
```

---

## 🛠 Why is my history empty (`[]`)?
If you see an empty array from `/chat/conversations`, it is because:
1. You either haven't started a chat yet.
2. OR you started a chat as a **Guest** (you didn't send the `Authorization` header in the `POST /chat` call). To see history, the token must be present when the chat is created.
