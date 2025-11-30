# Real-Time Chatbot Application

A full-stack real-time chatbot application with AI integration, admin dashboard, and live typing indicators. Built with Next.js, Express, Socket.IO, and Google Gemini AI.

## 🌟 Features

### User Features
- **Real-time Chat Widget**: Floating chat widget for seamless user interaction
- **AI-Powered Responses**: Intelligent responses powered by Google Gemini AI
- **Live Typing Indicators**: See when admin or AI is typing
- **Message History**: Persistent conversation history
- **Session Management**: Automatic session tracking

### Admin Features
- **Admin Dashboard**: Comprehensive view of all conversations
- **Real-time Updates**: Live message updates via Socket.IO
- **Manual Response Mode**: Take over conversations from AI
- **AI Toggle**: Enable/disable AI responses per conversation
- **Typing Indicators**: See when users are typing
- **Conversation Management**: View and manage all user conversations

### Technical Features
- **Real-time Communication**: Socket.IO for instant message delivery
- **Optimistic UI Updates**: Immediate feedback with React Query
- **Type-safe**: Full TypeScript implementation
- **Database**: PostgreSQL with Prisma ORM
- **Responsive Design**: Mobile-first UI with Tailwind CSS

## 📁 Project Structure

```
chatbot/
├── backend-chatbot/          # Express.js backend server
│   ├── src/
│   │   ├── controllers/      # Request handlers
│   │   ├── services/         # Business logic
│   │   ├── routes/           # API routes
│   │   ├── prisma/           # Database schema
│   │   ├── socket.ts         # Socket.IO configuration
│   │   └── server.ts         # Entry point
│   └── README.md             # Backend documentation
│
├── frontend-chatbot/         # Next.js frontend application
│   ├── app/                  # Next.js app directory
│   │   ├── admin/           # Admin dashboard pages
│   │   └── page.tsx         # Main landing page
│   ├── components/          # React components
│   ├── hooks/               # Custom React hooks
│   ├── services/            # API services
│   ├── lib/                 # Utilities and helpers
│   └── README.md            # Frontend documentation
│
└── README.md                # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/pnpm
- PostgreSQL database
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd chatbot
   ```

2. **Set up the backend**
   ```bash
   cd backend-chatbot
   npm install
   ```
   
   Create `.env` file:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/chatbot"
   GEMINI_API_KEY="your-gemini-api-key"
   CLIENT_URL="http://localhost:3000"
   PORT=8000
   ```
   
   Run migrations:
   ```bash
   npm run prisma:migrate
   ```

3. **Set up the frontend**
   ```bash
   cd ../frontend-chatbot
   npm install
   ```
   
   Create `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   NEXT_PUBLIC_SOCKET_URL=http://localhost:8000
   ```

4. **Start the development servers**
   
   Terminal 1 (Backend):
   ```bash
   cd backend-chatbot
   npm run dev
   ```
   
   Terminal 2 (Frontend):
   ```bash
   cd frontend-chatbot
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - Admin Dashboard: http://localhost:3000/admin

## 📚 Documentation

- **[Backend Documentation](./backend-chatbot/README.md)** - API endpoints, database schema, and backend architecture
- **[Frontend Documentation](./frontend-chatbot/README.md)** - Components, hooks, and frontend architecture

## 🛠️ Tech Stack

### Backend
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Real-time**: Socket.IO
- **AI**: Google Gemini AI
- **Language**: TypeScript

### Frontend
- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS v4
- **State Management**: TanStack Query (React Query)
- **Real-time**: Socket.IO Client
- **UI Components**: Radix UI + shadcn/ui
- **Language**: TypeScript

## 🔑 Key Features Explained

### Real-time Typing Indicators
The application shows role-based typing indicators:
- Users see "AI is typing" or "Admin is typing"
- Admins see "User is typing"
- Automatic timeout after 2 seconds of inactivity

### AI Integration
- Powered by Google Gemini 2.5 Flash
- Context-aware responses using conversation history
- Automatic AI responses when enabled
- Manual admin override capability

### Socket.IO Events
- `new_message`: Broadcast new messages
- `typing`: Typing indicator updates
- `conversation_update`: AI toggle status changes
- `join_conversation`: User joins conversation room
- `admin_join`: Admin joins admin room

## 📝 Environment Variables

### Backend (.env)
```env
DATABASE_URL=           # PostgreSQL connection string
GEMINI_API_KEY=        # Google Gemini API key
CLIENT_URL=            # Frontend URL for CORS
PORT=                  # Server port (default: 8000)
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=      # Backend API URL
NEXT_PUBLIC_SOCKET_URL=   # Socket.IO server URL
```

## 🧪 Development

### Backend Development
```bash
cd backend-chatbot
npm run dev              # Start development server
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run database migrations
```

### Frontend Development
```bash
cd frontend-chatbot
npm run dev              # Start development server
npm run build            # Build for production
npm run lint             # Run linter
npm run format           # Format code
```

## 🚢 Deployment

### Backend Deployment
1. Set environment variables
2. Run `npm run build:deploy`
3. Start with `npm start` or use PM2

### Frontend Deployment
1. Set environment variables
2. Run `npm run build`
3. Deploy to Vercel, Netlify, or any Node.js hosting

## 📄 License

This project is licensed under the ISC License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For support, please open an issue in the repository.