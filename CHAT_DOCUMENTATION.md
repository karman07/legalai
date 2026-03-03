# AI Chat Backend Documentation

This backend acts as a **Conversation Management Layer** and **API Gateway**. It independently manages chat history, session grouping, and conversation naming, while delegating the AI response generation to a secondary service.

## 🏗️ System Architecture

1.  **Primary Backend (This App)**: 
    - Manages MongoDB sessions (`Conversations` and `Chats`).
    - Generates professional "Chat Names" based on user queries.
    - Proxies queries to the Secondary AI Backend.
2.  **Secondary AI Backend**:
    - Receives a simple `{"query": "..."}` payload.
    - Returns a JSON response containing the answer.

---

## ⚙️ Configuration (.env)

Ensure your `.env` is configured correctly:

```env
PORT=8000
CHAT_AI_URL=http://localhost:8080/chat  # URL of your secondary AI service
```

---

## 🚀 API Endpoints

### 1. Send Message (New/Continue Chat)
**URL**: `POST /chat`  
**Auth**: Public (Optional Bearer token to persist messages to a user account)

**Request Body**:
```json
{
  "query": "What is the Indian Penal Code?",
  "conversationId": "65e49f..." // Optional: pass to continue an existing session
}
```

**Workflow**:
- If `conversationId` is missing, the backend creates a new session and generates a title (e.g., "What is the Indian Penal Code").
- The backend sends `{"query": "..."}` to `CHAT_AI_URL`.
- The response is saved locally in MongoDB and returned.

**Response**:
```json
{
  "query": "What is the Indian Penal Code?",
  "response": "The IPC is the official criminal code of India...",
  "conversationId": "65e49f...",
  "title": "What is the Indian Penal Code"
}
```

---

### 2. List Conversations
**URL**: `GET /chat/conversations`  
**Auth**: Required (Bearer Token)

**Response**:
```json
[
  {
    "_id": "65e49f...",
    "title": "What is the Indian Penal Code",
    "createdAt": "2024-03-03T21:00:00.000Z",
    "updatedAt": "2024-03-03T21:05:00.000Z"
  }
]
```

---

### 3. Get Chat History
**URL**: `GET /chat/history/:conversationId`  
**Auth**: Required (Bearer Token)

**Response**:
```json
[
  {
    "query": "What is the Indian Penal Code?",
    "response": "The IPC is...",
    "createdAt": "2024-03-03T21:00:00.000Z"
  }
]
```

---

## 📂 Database Models
- **Conversation**: Stores session metadata (ID, UserID, Title).
- **Chat**: Stores individual message pairs linked to a `ConversationId`.

## 🛠 Troubleshooting
If you receive a **500 Internal Server Error** with "fetch failed", check that:
1. The secondary AI service is online.
2. The `CHAT_AI_URL` in your `.env` is reachable from this server.
