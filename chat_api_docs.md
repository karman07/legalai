# Chat API Documentation

This module provides an AI-powered chatbot interface with history persistence.

## Endpoints

### 1. Send Message
Sends a query to the AI chatbot.

- **URL**: `/chat`
- **Method**: `POST`
- **Auth**: Required (Bearer Token)
- **Content-Type**: `application/json`

#### Request Body
```json
{
  "query": "What is IPC?"
}
```

#### Response (Success)
- **Status Code**: 201 Created
- **Body**:
```json
{
  "query": "What is IPC?",
  "response": "The Indian Penal Code (IPC) is the official criminal code of India..."
}
```

---

### 2. Get Chat History
Retrieves the recent chat history for the authenticated user.

- **URL**: `/chat/history`
- **Method**: `GET`
- **Auth**: Required (Bearer Token)

#### Response (Success)
- **Status Code**: 200 OK
- **Body**: Array of chat objects
```json
[
  {
    "_id": "65e...",
    "userId": "65d...",
    "query": "What is IPC?",
    "response": "The Indian Penal Code (IPC) is the official criminal code of India...",
    "createdAt": "2024-03-03T15:20:00.000Z",
    "updatedAt": "2024-03-03T15:20:00.000Z",
    "__v": 0
  }
]
```

## Environment Variables
The Chat system uses the following environment variables:
- `GEMINI_API_KEY`: API Key for Gemini.
- `GEMINI_MODEL`: Model name (default: `gemini-1.5-flash`).
