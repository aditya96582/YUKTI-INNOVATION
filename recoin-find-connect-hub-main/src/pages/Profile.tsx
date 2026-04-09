import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { useNavigate } from "react-router-dom";
import { User, Coins, Star, HandHelping, MapPin, Calendar, Edit2, Check, X, Clock, Trophy } from "lucide-react";
import { badges as allBadges } from "@/data/mockData";

const Profile = () => {
  const { currentUser, isAuthenticated, updateProfile, getActiveTokens } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', location: '', bio: '', phone: '' });

  useEffect(() => { if (!isAuthenticated) navigate('/auth'); }, [isAuthenticated]);
  useEffect(() => {
    if (currentUser) setForm({ name: currentUser.name, location: currentUser.location, bio: currentUser.bio || '', phone: currentUser.phone || '' });
  }, [currentUser]);

  const handleSave = () => {
    updateProfile(form);
    setEditing(false);
  };

  const activeTokens = getActiveTokens();
  const tokenHistory = (currentUser?.tokenHistory || []).slice().reverse().slice(0, 5);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 pt-20 pb-10 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

          {/* Profile Header */}
          <Card className="glass mb-6">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center text-2xl font-bold text-primary">
                    {currentUser?.name?.charAt(0)}
                  </div>
                  <div>
                    {editing ? (
                      <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                        className="bg-secondary/50 mb-1 h-8 text-lg font-bold" />
                    ) : (
                      <h2 className="text-xl font-bold">{currentUser?.name}</h2>
                    )}
                    <p className="text-sm text-muted-foreground">{currentUser?.email}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Calendar className="h-3 w-3" /> Joined {currentUser?.joinedDate}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {editing ? (
                    <>
                      <Button size="sm" onClick={handleSave}><Check className="h-4 w-4" /></Button>
                      <Button size="sm" variant="outline" onClick={() => setEditing(false)}><X className="h-4 w-4" /></Button>
                    </>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
                      <Edit2 className="h-4 w-4 mr-1" /> Edit
                    </Button>
                  )}
                </div>
              </div>

              {editing && (
                <div className="mt-4 grid grid-cols-1 gap-3">
                  <div>
                    <Label className="text-xs">Location</Label>
                    <Input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}
                      className="bg-secondary/50 h-8" placeholder="Your campus location" />
                  </div>
                  <div>
                    <Label className="text-xs">Phone</Label>
                    <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                      className="bg-secondary/50 h-8" placeholder="+91 XXXXX XXXXX" />
                  </div>
                  <div>
                    <Label className="text-xs">Bio</Label>
                    <Input value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })}
                      className="bg-secondary/50 h-8" placeholder="Tell the community about yourself" />
                  </div>
                </div>
              )}

              {!editing && (
                <div className="mt-4 space-y-1">
                  {currentUser?.bio && <p className="text-sm text-muted-foreground">{currentUser.bio}</p>}
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" /> {currentUser?.location}
                  </div>
                  {currentUser?.phone && <p className="text-sm text-muted-foreground">📞 {currentUser.phone}</p>}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { icon: Coins, label: 'Total Tokens', value: currentUser?.tokens || 0, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
              { icon: Star, label: 'Reputation', value: `${currentUser?.reputation || 0}/5`, color: 'text-purple-400', bg: 'bg-purple-400/10' },
              { icon: HandHelping, label: 'Total Helps', value: currentUser?.totalHelps || 0, color: 'text-green-400', bg: 'bg-green-400/10' },
            ].map((s, i) => (
              <Card key={i} className="glass">
                <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                  <div className={`p-2 rounded-lg ${s.bg}`}><s.icon className={`h-5 w-5 ${s.color}`} /></div>
                  <p className="text-xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Token History with Expiry */}
            <Card className="glass">
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Clock className="h-4 w-4" /> Token History</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 mb-3">
                  <p className="text-xs text-muted-foreground">Active (non-expired)</p>
                  <p className="text-2xl font-bold text-yellow-400">{activeTokens} 🪙</p>
                </div>
                {tokenHistory.length === 0 && <p className="text-xs text-muted-foreground text-center py-2">No token history yet</p>}
                {tokenHistory.map((t, i) => {
                  const expired = new Date(t.expiresAt) < new Date();
                  return (
                    <div key={i} className={`flex items-center justify-between p-2 rounded text-xs ${expired ? 'opacity-40' : 'bg-secondary/20'}`}>
                      <div>
                        <p className="font-medium">{t.reason}</p>
                        <p className="text-muted-foreground">
                          Expires: {new Date(t.expiresAt).toLocaleDateString()} {expired && '(expired)'}
                        </p>
                      </div>
                      <span className={`font-bold ${t.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {t.amount > 0 ? '+' : ''}{t.amount}
                      </span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Badges */}
            <Card className="glass">
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Trophy className="h-4 w-4" /> Badges</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                {allBadges.map((badge, i) => {
                  const earned = currentUser?.badges?.includes(badge.name);
                  return (
                    <div key={i} className={`p-3 rounded-lg text-center transition-all ${earned ? 'bg-primary/10 border border-primary/30' : 'bg-secondary/20 opacity-40'}`}>
                      <span className="text-2xl">{badge.icon}</span>
                      <p className="text-xs font-medium mt-1">{badge.name}</p>
                      <p className="text-xs text-muted-foreground">{badge.description}</p>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
