import { Server } from 'socket.io';

export const setupSocket = (io: Server) => {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Join chat room
    socket.on('join-chat', (data: { sessionId: string; role: 'visitor' | 'admin' }) => {
      socket.join(`chat-${data.sessionId}`);
      console.log(`${data.role} joined chat: ${data.sessionId}`);

      // Notify other participants
      socket.to(`chat-${data.sessionId}`).emit('user-joined', {
        role: data.role,
        timestamp: new Date().toISOString(),
      });
    });

    // Handle chat messages
    socket.on('chat-message', (data: {
      sessionId: string;
      message: string;
      senderType: 'visitor' | 'admin';
      senderName?: string;
    }) => {
      // Broadcast to all participants in the chat room
      io.to(`chat-${data.sessionId}`).emit('chat-message', {
        ...data,
        timestamp: new Date().toISOString(),
      });
    });

    // Typing indicator
    socket.on('typing', (data: { sessionId: string; isTyping: boolean; role: 'visitor' | 'admin' }) => {
      socket.to(`chat-${data.sessionId}`).emit('typing', {
        role: data.role,
        isTyping: data.isTyping,
      });
    });

    // Leave chat room
    socket.on('leave-chat', (data: { sessionId: string }) => {
      socket.leave(`chat-${data.sessionId}`);
      socket.to(`chat-${data.sessionId}`).emit('user-left', {
        timestamp: new Date().toISOString(),
      });
    });

    // Admin notifications for new chats
    socket.on('join-admin', () => {
      socket.join('admins');
      console.log('Admin joined notification channel');
    });

    socket.on('new-chat', (data: { sessionId: string; visitorName?: string }) => {
      io.to('admins').emit('new-chat', {
        ...data,
        timestamp: new Date().toISOString(),
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });

    // Send welcome message
    socket.emit('connected', {
      text: 'Connected to live chat server',
      timestamp: new Date().toISOString(),
    });
  });
};