# Chat System Implementation Summary (v2)

The chat system has been enhanced to manage **Conversation Sessions** and group messages together with automatically generated titles (chat names). The backend now handles all history logic independently from the AI.

## External API URL Mapping
- **Local Proxy URL**: `http://localhost:8000/chat`
- **Target AI URL**: `http://localhost:8080/chat` (configurable via `.env`)

---

## API Endpoints & Response Examples

### 1. Send / Continue Message
**Endpoint**: `POST /chat`  
**Auth**: Public (Optional Bearer Token to persist to specific user)  

**Request Body** (New Chat):
```json
{
  "query": "What is IPC?"
}
```

**Request Body** (Continue Existing Chat):
```json
{
  "query": "What is the punishment for theft under IPC?",
  "conversationId": "65e49f..."
}
```

**Success Response**:
```json
{
  "query": "What is IPC?",
  "response": "The Indian Penal Code (IPC) is the official criminal code of India...",
  "conversationId": "65e49f...",
  "title": "What is IPC?"
}
```

---

### 2. List User Conversations
**Endpoint**: `GET /chat/conversations`  
**Auth**: Required (Bearer Token)  

**Success Response**:
```json
[
  {
    "_id": "65e49f...",
    "userId": "65d8a2...",
    "title": "What is IPC?",
    "createdAt": "2024-03-03T15:00:00.000Z",
    "updatedAt": "2024-03-03T15:05:00.000Z"
  },
  {
    "_id": "65f212...",
    "userId": "65d8a2...",
    "title": "Draft a contract...",
    "createdAt": "2024-03-02T10:00:00.000Z",
    "updatedAt": "2024-03-02T10:00:00.000Z"
  }
]
```

---

### 3. Get Conversation Transcript
**Endpoint**: `GET /chat/history/:conversationId`  
**Auth**: Required (Bearer Token)  

**Success Response**:
```json
[
  {
    "_id": "65e4a1...",
    "conversationId": "65e49f...",
    "query": "What is IPC?",
    "response": "The Indian Penal Code (IPC) is the official criminal code of India...",
    "createdAt": "2024-03-03T15:00:00.000Z"
  },
  {
    "_id": "65e4b2...",
    "conversationId": "65e49f...",
    "query": "What is the punishment for theft?",
    "response": "The punishment for theft under IPC Section 379 is imprisonment...",
    "createdAt": "2024-03-03T15:05:00.000Z"
  }
]
```

---

## Database Architecture
- **Conversation Schema**: Stores the "Session" metadata, generated title, and user ownership.
- **Chat Schema**: Stores individual message pairs (query/response) linked to a `conversationId`.

## Environmental Configuration
```env
PORT=8000
CHAT_AI_URL=http://localhost:8080/chat
```
