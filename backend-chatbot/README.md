# Backend Chatbot - Express.js Server

Backend server for the real-time chatbot application with AI integration, Socket.IO for real-time communication, and PostgreSQL database.

## 📋 Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup](#setup)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Socket.IO Events](#socketio-events)
- [Environment Variables](#environment-variables)

## ✨ Features

- **RESTful API**: Express.js REST API for chat operations
- **Real-time Communication**: Socket.IO for instant message delivery
- **AI Integration**: Google Gemini AI for intelligent responses
- **Database**: PostgreSQL with Prisma ORM
- **Type Safety**: Full TypeScript implementation
- **CORS Enabled**: Configured for frontend communication

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js 5
- **Database**: PostgreSQL
- **ORM**: Prisma 6.7
- **Real-time**: Socket.IO 4.8
- **AI**: Google Generative AI (Gemini 2.5 Flash)
- **Language**: TypeScript 5

## 📁 Project Structure

```
backend-chatbot/
├── src/
│   ├── config/
│   │   └── env.ts              # Environment configuration
│   ├── controllers/
│   │   └── chat.controller.ts  # Chat request handlers
│   ├── services/
│   │   ├── chat.service.ts     # Chat business logic
│   │   └── ai.service.ts       # AI integration logic
│   ├── routes/
│   │   └── chat.routes.ts      # API route definitions
│   ├── prisma/
│   │   └── schema.prisma       # Database schema
│   ├── lib/
│   │   └── prisma.ts           # Prisma client instance
│   ├── types/
│   │   └── types.ts            # TypeScript type definitions
│   ├── socket.ts               # Socket.IO configuration
│   ├── app.ts                  # Express app configuration
│   └── server.ts               # Server entry point
├── .env                        # Environment variables
├── package.json
├── tsconfig.json
└── README.md
```

## 🚀 Setup

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Google Gemini API key

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/chatbot"
   GEMINI_API_KEY="your-gemini-api-key"
   CLIENT_URL="http://localhost:3000"
   PORT=8000
   ```

3. **Run database migrations**
   ```bash
   npm run prisma:migrate
   ```

4. **Generate Prisma client**
   ```bash
   npm run prisma:generate
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:8000`

## 📡 API Endpoints

### Chat Endpoints

#### POST /api/chat/messages
Save a new message to a conversation.

**Request Body:**
```json
{
  "conversationId": "string",
  "role": "user" | "ai" | "admin",
  "message": "string"
}
```

**Response:**
```json
{
  "id": "string",
  "conversationId": "string",
  "role": "user" | "ai" | "admin",
  "message": "string",
  "createdAt": "datetime"
}
```

#### GET /api/chat/conversations/:conversationId/messages
Get all messages for a specific conversation.

**Response:**
```json
[
  {
    "id": "string",
    "conversationId": "string",
    "role": "user" | "ai" | "admin",
    "message": "string",
    "createdAt": "datetime"
  }
]
```

#### GET /api/chat/conversations
Get all conversations (admin only).

**Response:**
```json
[
  {
    "id": "string",
    "lastMessage": "string",
    "aiEnabled": boolean,
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
]
```

#### PATCH /api/chat/conversations/:conversationId/toggle-ai
Toggle AI enabled status for a conversation.

**Request Body:**
```json
{
  "aiEnabled": boolean
}
```

**Response:**
```json
{
  "id": "string",
  "lastMessage": "string",
  "aiEnabled": boolean,
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

## 🗄️ Database Schema

### Conversation Model
```prisma
model Conversation {
  id          String    @id @default(uuid())
  lastMessage String?
  aiEnabled   Boolean   @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  messages    Message[]
}
```

### Message Model
```prisma
model Message {
  id             String       @id @default(uuid())
  conversationId String
  role           String       // 'user' | 'ai' | 'admin'
  message        String
  createdAt      DateTime     @default(now())
  conversation   Conversation @relation(fields: [conversationId], references: [id])
}
```

## 🔌 Socket.IO Events

### Client → Server Events

#### `join_conversation`
User joins a conversation room.
```typescript
socket.emit('join_conversation', conversationId: string)
```

#### `admin_join`
Admin joins the admin room to receive all messages.
```typescript
socket.emit('admin_join')
```

#### `admin_join_conversation`
Admin joins a specific conversation room.
```typescript
socket.emit('admin_join_conversation', conversationId: string)
```

#### `typing`
Emit typing indicator status.
```typescript
socket.emit('typing', {
  conversationId: string,
  isTyping: boolean,
  role: 'user' | 'ai' | 'admin'
})
```

### Server → Client Events

#### `new_message`
Broadcast when a new message is saved.
```typescript
{
  id: string,
  conversationId: string,
  role: 'user' | 'ai' | 'admin',
  message: string,
  createdAt: Date
}
```

#### `typing`
Broadcast typing indicator to conversation participants.
```typescript
{
  isTyping: boolean,
  role: 'user' | 'ai' | 'admin'
}
```

#### `conversation_update`
Broadcast when conversation settings change (e.g., AI toggle).
```typescript
{
  id: string,
  aiEnabled: boolean
}
```

## 🔧 Services

### Chat Service
Handles all chat-related business logic:
- Save messages
- Retrieve chat history
- Get all conversations
- Trigger AI responses when enabled

### AI Service
Manages AI integration:
- Generate responses using Google Gemini AI
- Context-aware responses using conversation history
- Configurable response behavior
- Fallback responses for errors

## 🌍 Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Yes | - |
| `GEMINI_API_KEY` | Google Gemini API key | Yes | - |
| `CLIENT_URL` | Frontend URL for CORS | No | `http://localhost:3000` |
| `PORT` | Server port | No | `8000` |

## 📜 Scripts

```bash
npm run dev                    # Start development server with watch mode
npm run build                  # Build TypeScript to JavaScript
npm run start                  # Start production server
npm run prisma:generate        # Generate Prisma client
npm run prisma:migrate         # Run database migrations
npm run prisma:migrate:deploy  # Deploy migrations (production)
npm run build:deploy           # Build and deploy (generate + build + migrate)
```

## 🔒 CORS Configuration

CORS is configured to allow requests from:
- `CLIENT_URL` environment variable
- `http://localhost:3000` (development fallback)

Credentials are enabled for cookie-based authentication.

## 🐛 Error Handling

All API endpoints include comprehensive error handling:
- 400: Bad Request (invalid parameters)
- 500: Internal Server Error (server/database errors)

Errors are logged to the console with descriptive messages.

## 🚀 Deployment

### Using PM2
```bash
npm install -g pm2
npm run build:deploy
pm2 start dist/server.js --name chatbot-backend
```

### Using Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 8000
CMD ["npm", "start"]
```

## 📝 Development Notes

- TypeScript is compiled to JavaScript in the `dist/` directory
- Prisma client is auto-generated on `npm install` (postinstall hook)
- Socket.IO and Express share the same HTTP server
- AI responses are generated asynchronously to avoid blocking

## 🔗 Related Documentation

- [Main README](../README.md)
- [Frontend README](../frontend-chatbot/README.md)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Socket.IO Documentation](https://socket.io/docs/v4/)
- [Google Gemini AI](https://ai.google.dev/docs)
