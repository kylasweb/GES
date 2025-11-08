# Chat System Enhancements Documentation

## New Features Implemented

### 1. ✅ Email Notifications

**What it does:**
- Sends email to all admins when a new chat session starts
- Sends notification when visitors send messages while admins are offline
- Professional HTML email templates with branding

**Files Created:**
- `src/lib/email.ts` - Email utility functions using nodemailer

**Dependencies Added:**
- `nodemailer` - Email sending library
- `@types/nodemailer` - TypeScript types

**Configuration Required:**
Configure SMTP settings in Admin → Settings → Email:
```
SMTP Host: smtp.gmail.com (or your provider)
SMTP Port: 587
SMTP User: your-email@gmail.com
SMTP Password: your-app-password
From Email: support@greenenergysolutions.in
From Name: Green Energy Solutions
```

**Email Templates:**
1. **New Chat Notification** - Sent when visitor starts chat
   - Visitor name, email, phone
   - Department
   - First message
   - Link to admin chat dashboard

2. **Offline Message Notification** - Sent when no admin is online
   - Visitor name
   - List of messages sent while offline
   - Link to respond

---

### 2. ✅ File Upload Support

**What it does:**
- Visitors can upload images (JPEG, PNG, GIF, WEBP) up to 5MB
- Support for documents (PDF, DOC, DOCX) up to 5MB
- Files stored in Cloudinary (cloud storage)
- Automatic file type and size validation

**API Endpoint:**
```typescript
POST /api/v1/chat/upload
FormData: {
  file: File,
  sessionId: string
}

Response: {
  success: true,
  data: {
    url: string,        // Cloudinary URL
    publicId: string,   // Cloudinary ID
    fileName: string,   // Original filename
    fileSize: number,   // Bytes
    fileType: string    // MIME type
  }
}
```

**Updated Schema:**
- `ChatMessage` model now includes:
  - `fileUrl` - Cloudinary URL
  - `fileName` - Original filename
  - `fileSize` - File size in bytes

**Usage in Chat:**
```javascript
// Upload file
const formData = new FormData();
formData.append('file', selectedFile);
formData.append('sessionId', sessionId);

const res = await fetch('/api/v1/chat/upload', {
  method: 'POST',
  body: formData,
});

const { data } = await res.json();

// Send message with file
await fetch('/api/v1/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sessionId,
    message: 'File attached',
    messageType: 'IMAGE', // or 'FILE'
    fileUrl: data.url,
    fileName: data.fileName,
    fileSize: data.fileSize,
  }),
});
```

---

### 3. ✅ Chat Analytics Dashboard

**What it does:**
- Tracks comprehensive chat metrics and KPIs
- Real-time analytics for admin decision making
- Department-wise breakdown
- Rating analysis

**API Endpoint:**
```typescript
GET /api/v1/admin/chat/analytics?days=7
Authorization: Bearer {token}

Response: {
  success: true,
  data: {
    summary: {
      totalChats: 150,
      activeChats: 12,
      resolvedChats: 138,
      resolutionRate: 92.0,          // Percentage
      avgRating: 4.5,                 // Out of 5
      avgResponseTime: 45,            // Seconds
      avgResolutionTime: 320,         // Seconds
      avgMessagesPerChat: 8.5
    },
    departmentStats: {
      general: { count: 80, resolved: 75 },
      sales: { count: 40, resolved: 38 },
      technical: { count: 20, resolved: 18 },
      finance: { count: 10, resolved: 7 }
    },
    dailyVolume: {
      '2024-11-01': 25,
      '2024-11-02': 18,
      ...
    },
    ratingDistribution: {
      5: 90,
      4: 40,
      3: 15,
      2: 3,
      1: 2
    },
    topRatedChats: [...]
  }
}
```

**Metrics Tracked:**
- **Chat Volume**: Total chats, active, resolved
- **Performance**: Response time, resolution time
- **Quality**: Average rating, rating distribution
- **Engagement**: Messages per chat, session duration
- **Department**: Chat distribution and resolution by department

**New Database Models:**
- `ChatAnalytics` - Stores detailed analytics per chat
  - Total messages (visitor/admin breakdown)
  - Response times (avg, shortest, longest)
  - Session duration

**Updated Chat Model:**
- `firstResponseAt` - When admin first replied
- `resolvedAt` - When marked as resolved
- `responseTime` - Seconds until first response
- `resolutionTime` - Seconds until resolved

---

### 4. ✅ Multi-Agent Assignment & Departments

**What it does:**
- Create departments for chat routing
- Assign chats to specific departments
- Track which admin handles which chat
- Department-specific email notifications

**API Endpoints:**

**Departments Management:**
```typescript
// Get all departments
GET /api/v1/admin/chat/departments

// Create department
POST /api/v1/admin/chat/departments
{
  name: "Technical Support",
  slug: "technical",
  description: "Installation and technical help",
  email: "tech@company.com",
  isActive: true,
  sortOrder: 1
}

// Update department
PUT /api/v1/admin/chat/departments
{
  id: "dept_id",
  name: "Updated name"
}

// Delete department
DELETE /api/v1/admin/chat/departments?id=dept_id
```

**Pre-seeded Departments:**
1. General Support (general)
2. Sales (sales)
3. Technical Support (technical)
4. Billing & Finance (finance)

**Chat Model Updates:**
- `department` - Department slug (general, sales, technical, finance)
- `assignedTo` - Admin user ID who's handling the chat

**Department Routing:**
Visitors can select department when starting chat:
```javascript
await fetch('/api/v1/chat', {
  method: 'POST',
  body: JSON.stringify({
    visitorName: 'John Doe',
    message: 'Need technical help',
    department: 'technical'  // Routes to technical department
  })
});
```

---

### 5. ✅ Chat Rating System

**What it does:**
- Visitors can rate support quality (1-5 stars)
- Optional feedback comment
- Rating analytics in admin dashboard
- Identifies top-performing agents

**API Endpoint:**
```typescript
POST /api/v1/chat/rate
{
  sessionId: "sess_123",
  rating: 5,              // 1-5 stars
  comment: "Great help!"  // Optional
}
```

**Chat Model Updates:**
- `rating` - 1-5 star rating
- `ratingComment` - Visitor's feedback text

**Usage Flow:**
1. Chat marked as RESOLVED or CLOSED
2. Display rating modal to visitor
3. Visitor selects stars and optionally adds comment
4. Submit rating
5. Thank you message

**Example Implementation:**
```javascript
// After chat is closed
if (chat.status === 'CLOSED' && !chat.rating) {
  // Show rating modal
  const rating = await showRatingModal();
  
  await fetch('/api/v1/chat/rate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: chat.sessionId,
      rating: rating.stars,
      comment: rating.comment
    })
  });
}
```

**Analytics Integration:**
- Average rating shown in dashboard
- Rating distribution chart
- Top-rated chats list
- Filter chats by rating

---

### 6. ✅ Offline Message Queue

**What it does:**
- Detects when no admin is online
- Queues visitor messages
- Sends email notification to admins
- Auto-updates chat status to WAITING
- Notifies when admin comes online

**How It Works:**

**Admin Presence Tracking:**
```typescript
// Admins send heartbeat every 30 seconds
POST /api/v1/admin/presence
Authorization: Bearer {token}
{
  isOnline: true,
  department: "sales",
  socketId: "socket_abc123"
}

// Check who's online
GET /api/v1/admin/presence
Response: {
  onlineAdmins: [
    {
      userId: "user_123",
      isOnline: true,
      lastSeenAt: "2024-11-08T10:30:00Z",
      department: "sales",
      user: {
        name: "John Admin",
        email: "john@company.com",
        role: "SUPER_ADMIN"
      }
    }
  ],
  count: 5
}
```

**Database Model:**
- `AdminPresence` - Tracks admin online status
  - `userId` - Admin user ID
  - `isOnline` - Boolean status
  - `lastSeenAt` - Last activity timestamp
  - `socketId` - WebSocket connection ID
  - `department` - Admin's department

**Chat Flow:**
1. Visitor sends message
2. System checks `AdminPresence` table
3. If no admin online:
   - Set `chat.isOfflineMessage = true`
   - Set `chat.status = 'WAITING'`
   - Send email to all admins
   - Set `chat.offlineNotificationSent = true`
4. When admin comes online:
   - Update `AdminPresence.isOnline = true`
   - System can notify visitor: "An agent is now available"

**Offline Indicators:**
```javascript
// In chat widget
const { data } = await fetch('/api/v1/chat', {
  method: 'POST',
  body: JSON.stringify({ message, sessionId })
});

if (!data.adminOnline) {
  // Show "No agents online. We'll respond as soon as possible."
  showOfflineMessage();
}
```

---

## Database Schema Changes

### New Tables

**ChatAnalytics**
```prisma
model ChatAnalytics {
  id                    String   @id
  chatId                String   @unique
  totalMessages         Int
  visitorMessages       Int
  adminMessages         Int
  avgResponseTime       Int?
  longestResponseTime   Int?
  shortestResponseTime  Int?
  sessionDuration       Int?
}
```

**ChatDepartment**
```prisma
model ChatDepartment {
  id          String  @id
  name        String  @unique
  slug        String  @unique
  description String?
  email       String?
  isActive    Boolean
  sortOrder   Int
}
```

**AdminPresence**
```prisma
model AdminPresence {
  id         String   @id
  userId     String   @unique
  isOnline   Boolean
  lastSeenAt DateTime
  socketId   String?
  department String?
}
```

### Updated Tables

**Chat Model - New Fields:**
```prisma
department              String?
firstResponseAt         DateTime?
resolvedAt              DateTime?
responseTime            Int?
resolutionTime          Int?
rating                  Int?
ratingComment           String?
isOfflineMessage        Boolean
offlineNotificationSent Boolean
emailNotificationSent   Boolean
analytics               ChatAnalytics?
```

**ChatMessage Model - New Fields:**
```prisma
fileUrl    String?
fileName   String?
fileSize   Int?
```

---

## Configuration

### 1. SMTP Setup (Required for Email Notifications)

**Option A: Gmail**
```
SMTP Host: smtp.gmail.com
SMTP Port: 587
SMTP User: your-email@gmail.com
SMTP Password: <App Password> (not your regular password!)
SMTP Secure: false
From Email: support@greenenergysolutions.in
From Name: Green Energy Solutions
```

Get Gmail App Password:
1. Go to Google Account → Security
2. Enable 2-Step Verification
3. Generate App Password
4. Use that password in SMTP settings

**Option B: SendGrid**
```
SMTP Host: smtp.sendgrid.net
SMTP Port: 587
SMTP User: apikey
SMTP Password: <SendGrid API Key>
From Email: support@greenenergysolutions.in
From Name: Green Energy Solutions
```

**Option C: Mailgun**
```
SMTP Host: smtp.mailgun.org
SMTP Port: 587
SMTP User: postmaster@yourdomain.mailgun.org
SMTP Password: <Mailgun SMTP Password>
```

### 2. Cloudinary (Already Configured)
File uploads use existing Cloudinary configuration:
- Cloud Name: `dfvwt7puv`
- API Key: `776653259463791`
- API Secret: `tiVK1iy8JpkJolsBwx-kAXXSOHU`

Files organized in folders:
- `ges/chat/images/` - Image uploads
- `ges/chat/files/` - Document uploads

---

## Testing Guide

### Test Email Notifications

1. Configure SMTP in Admin → Settings
2. Start a new chat as visitor
3. Check admin email inbox
4. Should receive "New Chat from [Visitor]" email

### Test File Uploads

1. Open chat widget
2. Start a chat
3. Select file (image or PDF)
4. Upload via `/api/v1/chat/upload`
5. Send message with fileUrl
6. Admin should see file in chat

### Test Analytics

1. Create multiple chat sessions
2. Assign to different departments
3. Add ratings to some chats
4. Go to `/admin/chat/analytics`
5. View metrics, charts, reports

### Test Departments

1. Go to `/admin/chat/departments`
2. Create new department
3. Start chat and select department
4. Verify routing and email notification

### Test Ratings

1. Complete a chat session
2. Mark as CLOSED
3. Submit rating (1-5 stars)
4. Add optional comment
5. View in analytics dashboard

### Test Offline Queue

1. Logout all admin users
2. Start chat as visitor
3. Send messages
4. Check admin email for offline notification
5. Login as admin
6. See queued messages

---

## API Reference Summary

### Public APIs

```
POST   /api/v1/chat              - Start/continue chat
GET    /api/v1/chat              - Get messages
POST   /api/v1/chat/upload       - Upload file
POST   /api/v1/chat/rate         - Rate chat
GET    /api/v1/chat/knowledge-base - Search KB
```

### Admin APIs (Auth Required)

```
# Chat Management
GET    /api/v1/admin/chat                  - List chats
POST   /api/v1/admin/chat                  - Send message
PATCH  /api/v1/admin/chat                  - Update status

# Analytics
GET    /api/v1/admin/chat/analytics        - Get metrics

# Departments
GET    /api/v1/admin/chat/departments      - List
POST   /api/v1/admin/chat/departments      - Create
PUT    /api/v1/admin/chat/departments      - Update
DELETE /api/v1/admin/chat/departments      - Delete

# Knowledge Base
GET    /api/v1/admin/chat/knowledge-base   - List
POST   /api/v1/admin/chat/knowledge-base   - Create
PUT    /api/v1/admin/chat/knowledge-base   - Update
DELETE /api/v1/admin/chat/knowledge-base   - Delete

# Presence
POST   /api/v1/admin/presence              - Update status
GET    /api/v1/admin/presence              - Get online admins
```

---

## Performance Considerations

1. **Email Sending**: Async, non-blocking
2. **File Uploads**: Validated before upload (type, size)
3. **Analytics**: Cached for 5 minutes recommended
4. **Presence Tracking**: 30-second heartbeat interval
5. **Offline Queue**: Batch notifications (don't spam)

---

## Security

1. **File Uploads**:
   - Type validation (whitelist)
   - Size limit (5MB)
   - Virus scanning recommended (add Cloudinary add-on)

2. **Email**:
   - Rate limiting recommended
   - Sanitize user input in emails
   - Use DKIM/SPF for deliverability

3. **Admin Presence**:
   - JWT authentication required
   - Heartbeat timeout: 2 minutes

4. **Ratings**:
   - One rating per chat
   - Sanitize comment text

---

## Migration Notes

**New Migration**: `20251108165632_chat_enhancements`

Adds:
- ChatAnalytics table
- ChatDepartment table  
- AdminPresence table
- New fields to Chat model
- New fields to ChatMessage model

**To apply:**
```bash
npx prisma migrate deploy  # Production
npx prisma migrate dev     # Development
```

**To seed:**
```bash
npm run db:seed
```

Adds 4 departments and 6 knowledge base articles.

---

## Next Steps (Future Enhancements)

1. **Chat Transcripts**: Email chat history to visitor
2. **Chatbot Integration**: AI-powered initial responses
3. **Video/Voice Chat**: WebRTC integration
4. **Chat Transfer**: Transfer chat between agents
5. **Canned Responses**: Quick reply templates
6. **Visitor Tracking**: Page views, time on site
7. **Satisfaction Surveys**: Post-chat NPS survey
8. **Agent Performance**: Individual agent metrics
9. **Chat Scheduling**: Schedule chat availability hours
10. **Multilingual Support**: Auto-translate messages

---

**Version**: 2.0  
**Last Updated**: November 8, 2024  
**Dependencies**: nodemailer, cloudinary  
**Database**: PostgreSQL with Prisma
