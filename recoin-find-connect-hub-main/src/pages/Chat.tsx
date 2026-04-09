import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/contexts/ChatContext";
import Navbar from "@/components/Navbar";
import { MessageCircle, Send, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Chat = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const { conversations, activeConversation, setActiveConversation, sendMessage } = useChat();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConv = conversations.find(c => c.id === activeConversation);

  useEffect(() => {
    if (!isAuthenticated) navigate('/auth');
  }, [isAuthenticated]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv?.messages]);

  const handleSend = () => {
    if (!message.trim() || !activeConversation || !currentUser) return;
    sendMessage(activeConversation, currentUser.id, currentUser.name, message.trim());
    setMessage("");
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 pt-20 pb-10">
        <div className="grid md:grid-cols-3 gap-4 h-[calc(100vh-120px)]">
          <Card className={`glass ${activeConversation ? 'hidden md:block' : ''}`}>
            <CardHeader><CardTitle className="text-lg">Messages</CardTitle></CardHeader>
            <CardContent className="space-y-2 overflow-y-auto">
              {conversations.map(conv => {
                const otherUser = conv.participants.find(p => p.id !== currentUser?.id);
                return (
                  <div key={conv.id} onClick={() => setActiveConversation(conv.id)}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${activeConversation === conv.id ? 'bg-primary/20 border border-primary/30' : 'bg-secondary/20 hover:bg-secondary/40'}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{otherUser?.name || 'Unknown'}</span>
                      {conv.unreadCount > 0 && <span className="bg-primary text-primary-foreground text-xs h-5 w-5 flex items-center justify-center rounded-full">{conv.unreadCount}</span>}
                    </div>
                    {conv.relatedTo && <Badge variant="outline" className="mt-1 text-xs">{conv.relatedTo.type}: {conv.relatedTo.title}</Badge>}
                    {conv.lastMessage && <p className="text-xs text-muted-foreground mt-1 truncate">{conv.lastMessage}</p>}
                  </div>
                );
              })}
              {conversations.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No conversations yet</p>}
            </CardContent>
          </Card>

          <Card className={`glass md:col-span-2 flex flex-col ${!activeConversation ? 'hidden md:flex' : ''}`}>
            {activeConv ? (
              <>
                <CardHeader className="border-b border-border/30">
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setActiveConversation(null)}><ArrowLeft className="h-4 w-4" /></Button>
                    <div>
                      <CardTitle className="text-lg">{activeConv.participants.find(p => p.id !== currentUser?.id)?.name}</CardTitle>
                      {activeConv.relatedTo && <Badge variant="outline" className="text-xs mt-1">{activeConv.relatedTo.type}: {activeConv.relatedTo.title}</Badge>}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
                  {activeConv.messages.map(msg => (
                    <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.senderId === currentUser?.id ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] p-3 rounded-2xl ${msg.senderId === currentUser?.id ? 'bg-primary text-primary-foreground rounded-br-md' : 'bg-secondary rounded-bl-md'}`}>
                        <p className="text-sm">{msg.content}</p>
                        <p className="text-xs opacity-60 mt-1">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </motion.div>
                  ))}
                  <div ref={messagesEndRef} />
                </CardContent>
                <div className="p-4 border-t border-border/30">
                  <div className="flex gap-2">
                    <Input value={message} onChange={e => setMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="Type a message..." className="bg-secondary/50" />
                    <Button onClick={handleSend} size="icon"><Send className="h-4 w-4" /></Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center"><MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>Select a conversation to start chatting</p></div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Chat;
