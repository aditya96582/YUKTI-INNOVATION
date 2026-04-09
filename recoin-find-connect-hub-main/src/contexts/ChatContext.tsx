import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { ChatConversation, ChatMessage } from "@/data/mockData";
import { chatApi } from "@/services/api";
import { useAuth } from "./AuthContext";

interface ChatContextType {
  conversations: ChatConversation[];
  activeConversation: string | null;
  setActiveConversation: (id: string | null) => void;
  sendMessage: (conversationId: string, senderId: string, senderName: string, content: string) => void;
  startConversation: (participants: { id: string; name: string }[], relatedTo?: ChatConversation['relatedTo']) => Promise<string>;
  addMember: (conversationId: string, participant: { id: string; name: string }) => Promise<void>;
  getUnreadCount: () => number;
  refreshConversations: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const { currentUser } = useAuth();

  const refreshConversations = useCallback(async () => {
    if (!currentUser) return;
    try {
      const res = await chatApi.getConversations(currentUser.id);
      if (res.success && res.conversations) {
        setConversations(res.conversations);
      }
    } catch (error) {
      console.error("Failed to load conversations:", error);
    }
  }, [currentUser]);

  useEffect(() => {
    refreshConversations();
    const interval = setInterval(refreshConversations, 5000);
    return () => clearInterval(interval);
  }, [refreshConversations]);

  const sendMessage = async (conversationId: string, senderId: string, senderName: string, content: string) => {
    try {
      const res = await chatApi.sendMessage(conversationId, senderId, senderName, content);
      if (res.success && res.message) {
        // Update local state immediately
        setConversations(prev => prev.map(c => {
          if (c.id === conversationId) {
            return {
              ...c,
              messages: [...c.messages, res.message as ChatMessage],
              lastMessage: content,
              lastMessageTime: res.message.timestamp,
              unreadCount: 0,
            };
          }
          return c;
        }));
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const startConversation = async (
    participants: { id: string; name: string }[],
    relatedTo?: ChatConversation['relatedTo']
  ): Promise<string> => {
    try {
      const res = await chatApi.createConversation(participants, relatedTo);
      if (res.success && res.conversation) {
        const newConv = res.conversation;
        if (!res.existing) {
          setConversations(prev => [newConv as any, ...prev]);
        }
        return newConv.id;
      }
    } catch (error) {
      console.error("Failed to create conversation:", error);
    }
    return "";
  };

  const addMember = async (conversationId: string, participant: { id: string; name: string }) => {
    try {
      const res = await chatApi.addMember(conversationId, participant);
      if (res.success) {
        await refreshConversations();
      }
    } catch (error) {
      console.error("Failed to add member:", error);
    }
  };

  const getUnreadCount = () => conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  return (
    <ChatContext.Provider value={{
      conversations, activeConversation, setActiveConversation,
      sendMessage, startConversation, addMember, getUnreadCount, refreshConversations,
    }}>
      {children}
    </ChatContext.Provider>
  );
};
