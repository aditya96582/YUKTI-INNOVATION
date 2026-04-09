import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/contexts/ChatContext";
import Navbar from "@/components/Navbar";
import { MessageCircle, Send, ArrowLeft, Plus, Search, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { authApi } from "@/services/api";

const Chat = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const { conversations, activeConversation, setActiveConversation, sendMessage, startConversation, addMember } = useChat();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [showNewChat, setShowNewChat] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
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

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (q.length < 2) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const res = await authApi.searchUsers(q);
      if (res.success) setSearchResults(res.users || []);
    } catch { setSearchResults([]); }
    setSearching(false);
  };

  const handleStartChat = async (user: any) => {
    if (!currentUser) return;
    const convId = await startConversation([
      { id: currentUser.id, name: currentUser.name },
      { id: user._id || user.id, name: user.name },
    ]);
    if (convId) {
      setActiveConversation(convId);
      setShowNewChat(false);
      setSearchQuery("");
      setSearchResults([]);
    }
  };

  const handleAddMember = async (user: any) => {
    if (!activeConversation) return;
    await addMember(activeConversation, { id: user._id || user.id, name: user.name });
    setShowAddMember(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 pt-20 pb-10">
        <div className="grid md:grid-cols-3 gap-4 h-[calc(100vh-120px)]">
          {/* Conversations list */}
          <Card className={`glass ${activeConversation ? 'hidden md:block' : ''}`}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Messages</CardTitle>
              <Dialog open={showNewChat} onOpenChange={setShowNewChat}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon"><Plus className="h-4 w-4" /></Button>
                </DialogTrigger>
                <DialogContent className="glass-strong">
                  <DialogHeader><DialogTitle>New Conversation</DialogTitle></DialogHeader>
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input value={searchQuery} onChange={e => handleSearch(e.target.value)} placeholder="Search users by name..." className="pl-10 bg-secondary/50" />
                    </div>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {searching && <p className="text-sm text-muted-foreground text-center py-4">Searching...</p>}
                      {searchResults.map(user => (
                        <div key={user._id || user.id} onClick={() => handleStartChat(user)}
                          className="p-3 rounded-lg bg-secondary/20 hover:bg-secondary/40 cursor-pointer transition-all flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                          <MessageCircle className="h-4 w-4 text-primary" />
                        </div>
                      ))}
                      {searchQuery.length >= 2 && !searching && searchResults.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">No users found</p>
                      )}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="space-y-2 overflow-y-auto">
              {conversations.map(conv => {
                const otherUser = conv.participants.find(p => p.id !== currentUser?.id);
                return (
                  <div key={conv.id} onClick={() => setActiveConversation(conv.id)}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${activeConversation === conv.id ? 'bg-primary/20 border border-primary/30' : 'bg-secondary/20 hover:bg-secondary/40'}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{conv.participants.length > 2 ? conv.participants.map(p => p.name).join(', ') : otherUser?.name || 'Unknown'}</span>
                      {conv.unreadCount > 0 && <span className="bg-primary text-primary-foreground text-xs h-5 w-5 flex items-center justify-center rounded-full">{conv.unreadCount}</span>}
                    </div>
                    {conv.relatedTo && conv.relatedTo.type && <Badge variant="outline" className="mt-1 text-xs">{conv.relatedTo.type}: {conv.relatedTo.title}</Badge>}
                    {conv.lastMessage && <p className="text-xs text-muted-foreground mt-1 truncate">{conv.lastMessage}</p>}
                  </div>
                );
              })}
              {conversations.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No conversations yet. Click + to start one.</p>}
            </CardContent>
          </Card>

          {/* Chat area */}
          <Card className={`glass md:col-span-2 flex flex-col ${!activeConversation ? 'hidden md:flex' : ''}`}>
            {activeConv ? (
              <>
                <CardHeader className="border-b border-border/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setActiveConversation(null)}><ArrowLeft className="h-4 w-4" /></Button>
                      <div>
                        <CardTitle className="text-lg">{activeConv.participants.filter(p => p.id !== currentUser?.id).map(p => p.name).join(', ')}</CardTitle>
                        {activeConv.relatedTo && activeConv.relatedTo.type && <Badge variant="outline" className="text-xs mt-1">{activeConv.relatedTo.type}: {activeConv.relatedTo.title}</Badge>}
                      </div>
                    </div>
                    {/* Add Member Button */}
                    <Dialog open={showAddMember} onOpenChange={setShowAddMember}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" title="Add member"><UserPlus className="h-4 w-4" /></Button>
                      </DialogTrigger>
                      <DialogContent className="glass-strong">
                        <DialogHeader><DialogTitle>Add Member</DialogTitle></DialogHeader>
                        <div className="space-y-4">
                          <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input value={searchQuery} onChange={e => handleSearch(e.target.value)} placeholder="Search users..." className="pl-10 bg-secondary/50" />
                          </div>
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {searchResults.map(user => (
                              <div key={user._id || user.id} onClick={() => handleAddMember(user)}
                                className="p-3 rounded-lg bg-secondary/20 hover:bg-secondary/40 cursor-pointer transition-all flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-sm">{user.name}</p>
                                  <p className="text-xs text-muted-foreground">{user.email}</p>
                                </div>
                                <UserPlus className="h-4 w-4 text-primary" />
                              </div>
                            ))}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
                  {activeConv.messages.map(msg => (
                    <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.senderId === currentUser?.id ? 'justify-end' : msg.type === 'system' ? 'justify-center' : 'justify-start'}`}>
                      {msg.type === 'system' ? (
                        <p className="text-xs text-muted-foreground bg-secondary/30 px-3 py-1 rounded-full">{msg.content}</p>
                      ) : (
                        <div className={`max-w-[70%] p-3 rounded-2xl ${msg.senderId === currentUser?.id ? 'bg-primary text-primary-foreground rounded-br-md' : 'bg-secondary rounded-bl-md'}`}>
                          {msg.senderId !== currentUser?.id && <p className="text-xs font-medium mb-1 opacity-70">{msg.senderName}</p>}
                          <p className="text-sm">{msg.content}</p>
                          <p className="text-xs opacity-60 mt-1">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      )}
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
