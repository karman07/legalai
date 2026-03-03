# Chat System Integration Guide

This backend acts as a **Conversation Manager** and **API Gateway** for your AI service.

## Core Principles

1.  **Isolated Responsibilities**: 
    - This backend handles all **History**, **Session Management**, and **Conversation Naming** (titles).
    - The secondary AI backend is *only* called to generate a response for the current query.
2.  **API URL Configuration**: The URL for the secondary AI app is managed entirely via the `.env` file (`CHAT_AI_URL`).
3.  **Local History**: Every message sent and received is stored in your local MongoDB, ensuring you have a permanent record independent of the AI.

---

## 🔧 Environment Setup (.env)
Set these variables to point to your second app and define your local listening port:

```env
PORT=8000
CHAT_AI_URL=http://localhost:8080/chat  # The endpoint of your target AI app
```

---

## 🚀 API Endpoints

### 1. Send / Continue Chat session
- **URL**: `POST /chat`
- **Public**: Yes (Optional Bearer token to save to a specific user account)
- **Request Body**:
    ```json
    {
      "query": "What is IPC?",
      "conversationId": "optional-id-to-continue-existing-thread"
    }
    ```
- **Backend Action**:
    1.  If no `conversationId`, it generates a unique "Chat Name" (title) from the query.
    2.  Sends exactly `{"query": "..."}` to the service at `CHAT_AI_URL`.
    3.  Receives the response, saves the history locally, and returns the result.

### 2. List Your Conversations
- **URL**: `GET /chat/conversations`
- **Auth**: Required (Bearer Token)
- **Returns**: A list of all your chat sessions with their auto-generated titles and timestamps.

### 3. Get Full Chat Transcript
- **URL**: `GET /chat/history/:conversationId`
- **Auth**: Required (Bearer Token)
- **Returns**: The complete list of messages (queries and responses) for that specific session.

---

## 🛠 Troubleshooting: "Fetch Failed"
If you see a `fetch failed` error in the logs, it means the primary backend could not reach the target AI app. 
**Check these common causes:**
1.  Verify that your second app is correctly running on port `8080` (or the port defined in `CHAT_AI_URL`).
2.  Ensure there are no firewalls blocking the internal request between the two services.
3.  Double-check that the `CHAT_AI_URL` in `.env` matches the AI app's endpoint.
