# Live Chat System Documentation

## Overview

The live chat system provides real-time communication between website visitors and admin support agents. It includes:

- **Public Chat Widget**: Floating chat button on all public pages
- **Admin Chat Management**: Comprehensive dashboard for managing conversations
- **Knowledge Base**: Searchable articles with auto-suggestions
- **Real-time Messaging**: WebSocket support via Socket.IO
- **Smart Suggestions**: Keyword-based article recommendations

## Features

### For Visitors
- ✅ Floating chat button on all pages (bottom-right corner)
- ✅ Start chat with optional contact information
- ✅ Real-time messaging with support agents
- ✅ Auto-suggested knowledge base articles while typing
- ✅ Chat history persisted in browser
- ✅ Read receipts for admin messages

### For Admins
- ✅ View all active, waiting, and closed chats
- ✅ Send messages to visitors in real-time
- ✅ Update chat status (Active, Waiting, Assigned, Resolved, Closed)
- ✅ Create and manage knowledge base articles
- ✅ View chat statistics and message history
- ✅ Assign chats to specific agents

## Quick Start

### 1. Access Admin Chat Management

```
URL: https://your-domain.com/admin/chat
Login: admin@greenenergysolutions.in / admin123
```

### 2. Create Knowledge Base Articles

1. Go to Admin → Chat → Knowledge Base tab
2. Click "Add New Article"
3. Fill in:
   - **Title**: Brief article title
   - **Category**: e.g., "Solar Panels", "Installation", "Support"
   - **Keywords**: Comma-separated (e.g., "solar, panel, installation")
   - **Content**: Detailed answer or information
4. Click "Create Article"

**Example Article:**
```
Title: How to choose the right solar panel?
Category: Solar Panels
Keywords: solar, panel, choose, select, buy
Content: When choosing a solar panel, consider efficiency, warranty, power output...
```

### 3. Manage Incoming Chats

1. Visitors click the chat button and send a message
2. Chat appears in your Admin Chat dashboard
3. Click on a chat to view messages
4. Type and send replies
5. Update status when resolved

### 4. Test the Chat Widget

**As a Visitor:**
1. Visit any public page (homepage, products, etc.)
2. Click the floating chat button (bottom-right)
3. Enter your name and message (email/phone optional)
4. Click "Start Chat"
5. Type keywords like "solar panel" to see auto-suggestions

**As Admin:**
1. Login to `/admin/chat`
2. You'll see the new chat in the list
3. Click to open and reply

## API Endpoints

### Public API

```typescript
// Start or continue chat
POST /api/v1/chat
{
  sessionId?: string,      // Optional: for existing chat
  visitorName?: string,
  visitorEmail?: string,
  visitorPhone?: string,
  message: string,
  metadata?: any
}

// Get chat messages
GET /api/v1/chat?sessionId={sessionId}

// Search knowledge base
GET /api/v1/chat/knowledge-base?q={query}&category={category}
```

### Admin API (Requires Authentication)

```typescript
// Get all chats
GET /api/v1/admin/chat?status={status}&page={page}&limit={limit}

// Send admin message
POST /api/v1/admin/chat
{
  chatId: string,
  message: string,
  messageType?: 'TEXT' | 'IMAGE' | 'FILE' | 'KNOWLEDGE_BASE' | 'SYSTEM'
}

// Update chat status
PATCH /api/v1/admin/chat
{
  chatId: string,
  status: 'ACTIVE' | 'WAITING' | 'ASSIGNED' | 'RESOLVED' | 'CLOSED',
  assignedTo?: string
}

// Knowledge Base CRUD
GET /api/v1/admin/chat/knowledge-base?category={category}&search={search}
POST /api/v1/admin/chat/knowledge-base { title, content, keywords, category }
PUT /api/v1/admin/chat/knowledge-base { id, ...updates }
DELETE /api/v1/admin/chat/knowledge-base?id={id}
```

## WebSocket Events

### Client Events (Emit)

```typescript
// Join a chat room
socket.emit('join-chat', {
  sessionId: string,
  role: 'visitor' | 'admin'
});

// Send message
socket.emit('chat-message', {
  sessionId: string,
  message: string,
  senderType: 'visitor' | 'admin',
  senderName?: string
});

// Typing indicator
socket.emit('typing', {
  sessionId: string,
  isTyping: boolean,
  role: 'visitor' | 'admin'
});

// Leave chat
socket.emit('leave-chat', {
  sessionId: string
});

// Admin: Join notification channel
socket.emit('join-admin');

// Notify admins of new chat
socket.emit('new-chat', {
  sessionId: string,
  visitorName?: string
});
```

### Server Events (Listen)

```typescript
// Connection established
socket.on('connected', (data) => {
  console.log('Connected:', data.timestamp);
});

// User joined chat
socket.on('user-joined', (data) => {
  console.log(`${data.role} joined at ${data.timestamp}`);
});

// New message received
socket.on('chat-message', (data) => {
  console.log(`${data.senderType}: ${data.message}`);
});

// User is typing
socket.on('typing', (data) => {
  console.log(`${data.role} is typing: ${data.isTyping}`);
});

// User left chat
socket.on('user-left', (data) => {
  console.log('User left at', data.timestamp);
});

// New chat notification (admin only)
socket.on('new-chat', (data) => {
  console.log('New chat from', data.visitorName);
});
```

## Database Schema

### Chat
```prisma
model Chat {
  id           String      @id @default(cuid())
  visitorName  String?
  visitorEmail String?
  visitorPhone String?
  sessionId    String      @unique
  status       ChatStatus  @default(ACTIVE)
  assignedTo   String?
  startedAt    DateTime    @default(now())
  endedAt      DateTime?
  lastMessageAt DateTime   @default(now())
  metadata     Json?
  messages     ChatMessage[]
}
```

### ChatMessage
```prisma
model ChatMessage {
  id         String      @id @default(cuid())
  chatId     String
  senderId   String?
  senderType SenderType
  message    String
  messageType MessageType @default(TEXT)
  metadata   Json?
  isRead     Boolean     @default(false)
  createdAt  DateTime    @default(now())
}
```

### ChatKnowledgeBase
```prisma
model ChatKnowledgeBase {
  id          String   @id @default(cuid())
  title       String
  content     String
  keywords    String[]
  category    String?
  isActive    Boolean  @default(true)
  sortOrder   Int      @default(0)
  views       Int      @default(0)
  helpful     Int      @default(0)
  notHelpful  Int      @default(0)
  createdBy   String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

## Customization

### Chat Widget Appearance

Edit `src/components/chat/chat-widget.tsx`:

```typescript
// Change colors
className="bg-primary text-white"  // Header color
className="bg-primary text-white"  // Visitor messages
className="bg-gray-100"            // Admin messages

// Change position
className="fixed bottom-6 right-6"  // Default
className="fixed bottom-6 left-6"   // Left side
className="fixed top-6 right-6"     // Top right

// Change size
className="w-96 h-[600px]"  // Default
className="w-80 h-[500px]"  // Smaller
```

### Knowledge Base Matching

Edit `src/app/api/v1/chat/knowledge-base/route.ts`:

```typescript
// Adjust matching logic
keywords: { hasSome: query.toLowerCase().split(' ') }  // Match any keyword
keywords: { hasEvery: query.toLowerCase().split(' ') } // Match all keywords

// Change result limit
take: 5,  // Default
take: 10, // More results
```

## Best Practices

1. **Response Time**: Aim to respond within 1-2 minutes for best customer experience
2. **Knowledge Base**: Keep articles updated and comprehensive
3. **Keywords**: Use multiple variations (e.g., "solar panel", "solar", "panel", "PV")
4. **Categories**: Organize articles by topic for easier management
5. **Chat Status**: Update status promptly to track resolution
6. **Proactive Help**: Create articles for common questions

## Troubleshooting

### Chat widget not showing
- Check browser console for errors
- Verify `ChatWidget` is in `layout.tsx`
- Clear browser cache

### Messages not sending
- Check network tab for API errors
- Verify authentication token (admin)
- Check database connection

### Knowledge base not suggesting
- Ensure articles have relevant keywords
- Check `isActive` is true
- Search requires minimum 2 characters

### WebSocket not connecting
- Verify server.ts is running with Socket.IO
- Check firewall settings
- Verify WebSocket URL in code

## Production Deployment

1. **Environment Variables**: No additional variables needed
2. **Database**: Ensure migrations are run (`prisma migrate deploy`)
3. **WebSocket**: Make sure your hosting supports WebSocket connections
4. **Vercel**: WebSocket works with Vercel's deployment
5. **Scaling**: Consider Redis adapter for Socket.IO in multi-instance deployments

## Support

For issues or questions:
- Check `/admin/chat` for active support
- Review API responses in browser console
- Check server logs for errors
- Verify database schema with `npx prisma studio`

---

**Version**: 1.0  
**Last Updated**: November 2024  
**Built with**: Next.js 15, Socket.IO, Prisma, PostgreSQL
