// src/hooks/useSocket.js
// ─────────────────────────────────────────────
//  Real-time Socket.io connection.
//  Usage: const { sendMessage, onlineUsers } = useSocket(userId);
// ─────────────────────────────────────────────
import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

export const useSocket = (userId, onMessageReceived) => {
  const socketRef  = useRef(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (!userId) return;

    // Connect
    socketRef.current = io(SOCKET_URL, { transports: ['websocket'] });
    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('🔌 Socket connected');
      socket.emit('user_online', userId);
    });

    // Receive a message
    socket.on('receive_message', (msg) => {
      if (onMessageReceived) onMessageReceived(msg);
    });

    // Online users list
    socket.on('online_users', (users) => {
      setOnlineUsers(users);
    });

    return () => {
      socket.disconnect();
    };
  }, [userId]);  // eslint-disable-line

  // ── Send message via socket ──────────────────
  const sendMessage = (receiverId, content) => {
    if (!socketRef.current) return;
    socketRef.current.emit('send_message', { senderId: userId, receiverId, content });
  };

  // ── Typing indicators ────────────────────────
  const emitTyping    = (receiverId) => socketRef.current?.emit('typing',      { senderId: userId, receiverId });
  const emitStopTyping = (receiverId) => socketRef.current?.emit('stop_typing', { senderId: userId, receiverId });

  return { sendMessage, emitTyping, emitStopTyping, onlineUsers };
};
