// src/pages/Messages.jsx  –  real API + Socket.io
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { messageAPI } from '../services/api';
import { useSocket } from '../hooks/useSocket';
import Avatar from '../components/Avatar';

export default function Messages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeId,      setActiveId]      = useState(null);
  const [messages,      setMessages]      = useState([]);
  const [msg,           setMsg]           = useState('');
  const [loading,       setLoading]       = useState(true);
  const bottomRef = useRef(null);

  // Real-time: receive incoming messages
  const onMessageReceived = useCallback((incoming) => {
    if (incoming.senderId === activeId) {
      setMessages(prev => [...prev, {
        _id: Date.now(),
        sender: { _id: incoming.senderId },
        content: incoming.content,
        createdAt: incoming.createdAt,
        mine: false,
      }]);
    }
  }, [activeId]);

  const { sendMessage: socketSend, onlineUsers } = useSocket(user?._id, onMessageReceived);

  // Load conversations on mount
  useEffect(() => {
    messageAPI.getConversations()
      .then(res => {
        setConversations(res.conversations);
        if (res.conversations.length > 0) setActiveId(res.conversations[0].contact._id);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Load messages when active conversation changes
  useEffect(() => {
    if (!activeId) return;
    messageAPI.getMessages(activeId)
      .then(res => setMessages(res.messages.map(m => ({
        ...m,
        mine: m.sender._id === user?._id,
      }))))
      .catch(console.error);
  }, [activeId, user?._id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:'smooth' });
  }, [messages]);

  const send = async () => {
    if (!msg.trim() || !activeId) return;
    const content = msg;
    setMsg('');
    // Optimistic UI
    setMessages(prev => [...prev, {
      _id: Date.now(),
      sender: { _id: user._id, name: user.name },
      content,
      createdAt: new Date(),
      mine: true,
    }]);
    // Send via socket (real-time) AND REST (persistence)
    socketSend(activeId, content);
    try { await messageAPI.sendMessage(activeId, { content }); }
    catch (e) { console.error(e); }
  };

  const activeConv = conversations.find(c => c.contact._id === activeId);
  const isOnline   = (id) => onlineUsers.includes(id);

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'calc(100vh - 70px)', color:'var(--text2)' }}>
      ⏳ Loading messages...
    </div>
  );

  return (
    <div className="chat-layout">
      {/* Conversation list */}
      <div className="chat-list">
        <div style={{ padding:'16px 20px 12px', borderBottom:'1px solid var(--border)' }}>
          <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:16, marginBottom:12 }}>Messages</div>
          <input style={{ width:'100%', background:'var(--bg3)', border:'1px solid var(--border)',
            borderRadius:8, padding:'8px 12px', color:'var(--text)', fontSize:13, outline:'none' }}
            placeholder="Search..." />
        </div>
        {conversations.length === 0 ? (
          <div style={{ padding:24, color:'var(--text2)', fontSize:14, textAlign:'center' }}>
            No conversations yet.<br />Message someone from Community!
          </div>
        ) : conversations.map(c => (
          <div key={c.contact._id} className={`chat-item ${activeId===c.contact._id?'active':''}`}
            onClick={() => setActiveId(c.contact._id)}>
            <div className="avatar-wrap">
              <Avatar initials={(c.contact.name||'U').slice(0,2).toUpperCase()} size="sm" />
              {isOnline(c.contact._id) && <div className="online-dot" />}
            </div>
            <div style={{ flex:1, overflow:'hidden' }}>
              <div style={{ display:'flex', justifyContent:'space-between' }}>
                <div style={{ fontWeight:600, fontSize:14 }}>{c.contact.name}</div>
                <div style={{ fontSize:12, color:'var(--text3)', whiteSpace:'nowrap' }}>
                  {c.lastMessage ? new Date(c.lastMessage.createdAt).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }) : ''}
                </div>
              </div>
              <div style={{ fontSize:13, color:'var(--text2)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', marginTop:2 }}>
                {c.lastMessage?.content || 'Start a conversation...'}
              </div>
            </div>
            {c.unreadCount > 0 && (
              <div style={{ background:'var(--accent)', color:'#080C14', borderRadius:10, fontSize:11, fontWeight:700, padding:'2px 7px' }}>
                {c.unreadCount}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Chat window */}
      <div className="chat-window">
        {activeConv ? (
          <>
            <div className="chat-header">
              <div className="avatar-wrap">
                <Avatar initials={(activeConv.contact.name||'U').slice(0,2).toUpperCase()} size="sm" />
                {isOnline(activeConv.contact._id) && <div className="online-dot" />}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700 }}>{activeConv.contact.name}</div>
                <div style={{ fontSize:12, color: isOnline(activeConv.contact._id) ? 'var(--green)' : 'var(--text3)' }}>
                  {isOnline(activeConv.contact._id) ? '● Online' : '● Offline'}
                </div>
              </div>
              <button className="btn btn-ghost btn-sm">View Profile</button>
            </div>

            <div className="messages">
              {messages.map(m => (
                <div key={m._id} className={`message ${m.mine?'mine':''}`}>
                  {!m.mine && <Avatar initials={(m.sender?.name||'U').slice(0,2).toUpperCase()} size="sm" />}
                  <div>
                    <div className="msg-bubble">{m.content}</div>
                    <div className="msg-time">
                      {new Date(m.createdAt).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            <div className="chat-input-bar">
              <input className="chat-input" placeholder="Type a message..." value={msg}
                onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key==='Enter' && send()} />
              <button className="send-btn" onClick={send}>➤</button>
            </div>
          </>
        ) : (
          <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text2)' }}>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:48, opacity:0.3 }}>💬</div>
              <div style={{ marginTop:12 }}>Select a conversation or message someone from Community</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
