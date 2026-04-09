import React, { createContext, useContext, useState } from "react";
import { ChatConversation, ChatMessage, mockConversations } from "@/data/mockData";

interface ChatContextType {
  conversations: ChatConversation[];
  activeConversation: string | null;
  setActiveConversation: (id: string | null) => void;
  sendMessage: (conversationId: string, senderId: string, senderName: string, content: string) => void;
  startConversation: (participants: { id: string; name: string }[], relatedTo?: ChatConversation['relatedTo']) => string;
  getUnreadCount: () => number;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [conversations, setConversations] = useState<ChatConversation[]>(mockConversations);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);

  const sendMessage = (conversationId: string, senderId: string, senderName: string, content: string) => {
    const msg: ChatMessage = {
      id: `msg_${Date.now()}`, senderId, senderName, content,
      timestamp: new Date().toISOString(), type: 'text',
    };
    setConversations(prev => prev.map(c => c.id === conversationId ? {
      ...c, messages: [...c.messages, msg],
      lastMessage: content, lastMessageTime: msg.timestamp, unreadCount: 0,
    } : c));
  };

  const startConversation = (participants: { id: string; name: string }[], relatedTo?: ChatConversation['relatedTo']) => {
    const existing = conversations.find(c =>
      c.participants.length === participants.length &&
      participants.every(p => c.participants.some(cp => cp.id === p.id))
    );
    if (existing) return existing.id;
    const id = `c_${Date.now()}`;
    setConversations(prev => [{
      id, participants, messages: [], relatedTo,
      lastMessage: '', lastMessageTime: new Date().toISOString(), unreadCount: 0,
    }, ...prev]);
    return id;
  };

  const getUnreadCount = () => conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  return (
    <ChatContext.Provider value={{
      conversations, activeConversation, setActiveConversation,
      sendMessage, startConversation, getUnreadCount,
    }}>
      {children}
    </ChatContext.Provider>
  );
};
