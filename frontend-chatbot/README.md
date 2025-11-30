# Frontend Chatbot - Next.js Application

Modern Next.js frontend for the real-time chatbot application with React 19, TanStack Query, Socket.IO, and Tailwind CSS.

## 📋 Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup](#setup)
- [Components](#components)
- [Hooks](#hooks)
- [Services](#services)
- [Environment Variables](#environment-variables)

## ✨ Features

- **Real-time Chat Widget**: Floating chat interface for users
- **Admin Dashboard**: Comprehensive conversation management
- **Live Typing Indicators**: Role-based typing indicators (AI/Admin/User)
- **Optimistic Updates**: Instant UI feedback with React Query
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Type Safety**: Full TypeScript implementation
- **Modern UI**: Built with Radix UI and shadcn/ui components

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS v4
- **State Management**: TanStack Query (React Query) v5
- **Real-time**: Socket.IO Client 4.8
- **HTTP Client**: Axios
- **UI Components**: Radix UI + shadcn/ui
- **Icons**: Lucide React
- **Language**: TypeScript 5

## 📁 Project Structure

```
frontend-chatbot/
├── app/
│   ├── admin/
│   │   ├── conversation/
│   │   │   └── [id]/
│   │   │       └── page.tsx      # Individual conversation view
│   │   ├── layout.tsx            # Admin layout with sidebar
│   │   └── page.tsx              # Admin dashboard
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   └── globals.css               # Global styles
├── components/
│   ├── admin/
│   │   └── sidebar.tsx           # Admin sidebar navigation
│   ├── ui/                       # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   └── switch.tsx
│   └── chat-widget.tsx           # Floating chat widget
├── hooks/
│   ├── useChat.tsx               # Chat-related React Query hooks
│   └── useAdmin.tsx              # Admin authentication hook
├── services/
│   └── chat.service.ts           # API service layer
├── lib/
│   ├── socket.ts                 # Socket.IO client singleton
│   ├── calculateTime.ts          # Time formatting utility
│   └── utils.ts                  # Utility functions
├── types/
│   └── chat.types.ts             # TypeScript type definitions
├── .env.local                    # Environment variables
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

## 🚀 Setup

### Prerequisites
- Node.js 18+
- Running backend server

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   NEXT_PUBLIC_SOCKET_URL=http://localhost:8000
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

The application will start on `http://localhost:3000`

## 🧩 Components

### Chat Widget (`components/chat-widget.tsx`)
Floating chat interface for users.

**Features:**
- Session management with localStorage
- Real-time message updates
- Typing indicators (AI/Admin)
- Optimistic UI updates
- Auto-scroll to latest message
- Message history

**Usage:**
```tsx
import ChatWidget from '@/components/chat-widget';

<ChatWidget />
```

### Admin Sidebar (`components/admin/sidebar.tsx`)
Navigation sidebar for admin dashboard.

**Features:**
- Active route highlighting
- Navigation links
- Responsive design

### UI Components (`components/ui/`)
Reusable UI components built with Radix UI:
- `Button`: Customizable button component
- `Input`: Form input component
- `Label`: Form label component
- `Switch`: Toggle switch component

## 🪝 Hooks

### `useChat` Hook
Custom React Query hooks for chat operations.

#### `useGetConversations()`
Fetch all conversations (admin).

```typescript
const { data, isLoading, error } = useGetConversations();
```

#### `useGetChatHistory(conversationId, enabled?)`
Fetch messages for a specific conversation.

```typescript
const { data: messages } = useGetChatHistory(conversationId);
```

#### `useSaveMessage()`
Save a new message with optimistic updates.

```typescript
const { mutate: saveMessage, isPending } = useSaveMessage();

saveMessage({
  conversationId: 'sess_123',
  role: 'user',
  message: 'Hello!'
});
```

#### `useToggleAI()`
Toggle AI enabled status for a conversation.

```typescript
const { mutate: toggleAI } = useToggleAI();

toggleAI({
  conversationId: 'sess_123',
  aiEnabled: true
});
```

### `useAdmin` Hook
Admin authentication and state management.

```typescript
const { admin, isLoading, login, logout } = useAdmin();
```

## 🔌 Services

### Chat Service (`services/chat.service.ts`)
API service layer for chat operations.

**Methods:**
- `saveMessage(message)`: Save a new message
- `getChatHistory(conversationId)`: Get conversation messages
- `getAllConversations()`: Get all conversations (admin)
- `toggleAI(conversationId, aiEnabled)`: Toggle AI status

**Example:**
```typescript
import { chatService } from '@/services/chat.service';

const messages = await chatService.getChatHistory('sess_123');
```

## 🔌 Socket.IO Client

### Socket Client (`lib/socket.ts`)
Singleton Socket.IO client for real-time communication.

**Methods:**
- `connect()`: Connect to Socket.IO server
- `disconnect()`: Disconnect from server
- `joinConversation(conversationId)`: Join conversation room
- `adminJoin()`: Join admin room
- `adminJoinConversation(conversationId)`: Admin joins conversation
- `emitTyping(conversationId, isTyping, role)`: Emit typing status
- `onNewMessage(callback)`: Listen for new messages
- `onTyping(callback)`: Listen for typing indicators
- `onConversationUpdate(callback)`: Listen for conversation updates

**Example:**
```typescript
import { socketClient } from '@/lib/socket';

// Connect and join conversation
socketClient.connect();
socketClient.joinConversation('sess_123');

// Listen for messages
socketClient.onNewMessage((message) => {
  console.log('New message:', message);
});

// Emit typing indicator
socketClient.emitTyping('sess_123', true, 'user');
```

## 📝 Types

### Chat Types (`types/chat.types.ts`)

```typescript
type Role = 'user' | 'ai' | 'admin';

interface Message {
  id: string;
  conversationId: string;
  role: Role;
  message: string;
  createdAt?: Date;
}

interface Conversation {
  id: string;
  lastMessage?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  aiEnabled?: boolean;
  messages?: Message[];
}

interface SaveMessageParams {
  conversationId: string;
  role: Role;
  message: string;
}
```

## 🎨 Styling

### Tailwind CSS Configuration
The project uses Tailwind CSS v4 with custom configuration:

- **Animations**: Custom bounce animations for typing indicators
- **Colors**: Consistent color palette for roles (blue for users, purple for admin, gray for AI)
- **Responsive**: Mobile-first breakpoints

### Global Styles
Located in `app/globals.css` with CSS variables for theming.

## 🌍 Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | Yes | - |
| `NEXT_PUBLIC_SOCKET_URL` | Socket.IO server URL | Yes | - |

**Note:** Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.

## 📜 Scripts

```bash
npm run dev      # Start development server with Turbopack
npm run build    # Build for production with Turbopack
npm run start    # Start production server
npm run lint     # Run Biome linter
npm run format   # Format code with Biome
```

## 🔑 Key Features Explained

### Optimistic Updates
React Query is configured for optimistic updates:
- Messages appear instantly in the UI
- Automatic rollback on error
- Background refetching for consistency

### Typing Indicators
Role-based typing indicators with automatic timeout:
- **User Chat Widget**: Shows "AI is typing" or "Admin is typing"
- **Admin Dashboard**: Shows "User is typing"
- 2-second inactivity timeout
- Debounced emission to reduce network traffic

### Session Management
User sessions are stored in localStorage:
- Automatic session ID generation
- Persistent across page refreshes
- Format: `sess_<random_string>`

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
vercel deploy
```

### Environment Variables on Vercel
Set the following in Vercel dashboard:
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_SOCKET_URL`

### Other Platforms
```bash
npm run build
npm run start
```

## 🎯 Pages

### Landing Page (`app/page.tsx`)
Main landing page with chat widget.

### Admin Dashboard (`app/admin/page.tsx`)
**Features:**
- List of all conversations
- Real-time updates
- Last message preview
- AI toggle switches
- Timestamp display
- Click to view conversation

### Conversation View (`app/admin/conversation/[id]/page.tsx`)
**Features:**
- Full conversation history
- Real-time message updates
- Send messages as admin
- Typing indicators
- Auto-scroll to latest message

## 🔧 Development Tips

### Adding New Components
1. Create component in `components/` directory
2. Use TypeScript for type safety
3. Follow existing naming conventions
4. Export from component file

### Adding New Hooks
1. Create hook in `hooks/` directory
2. Use React Query for server state
3. Include proper TypeScript types
4. Export hook function

### Styling Guidelines
- Use Tailwind utility classes
- Follow mobile-first approach
- Maintain consistent spacing
- Use semantic color names

## 🐛 Troubleshooting

### Socket.IO Connection Issues
- Verify `NEXT_PUBLIC_SOCKET_URL` is correct
- Check backend server is running
- Check browser console for connection errors

### API Request Failures
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check network tab for request details
- Ensure backend server is accessible

### Build Errors
- Clear `.next` directory: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npm run lint`

## 🔗 Related Documentation

- [Main README](../README.md)
- [Backend README](../backend-chatbot/README.md)
- [Next.js Documentation](https://nextjs.org/docs)
- [TanStack Query](https://tanstack.com/query/latest)
- [Socket.IO Client](https://socket.io/docs/v4/client-api/)
- [Tailwind CSS](https://tailwindcss.com/docs)
