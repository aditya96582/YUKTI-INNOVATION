import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useItems } from "@/contexts/ItemContext";
import { useNotifications } from "@/contexts/NotificationContext";
import Navbar from "@/components/Navbar";
import { bloodTypes } from "@/data/mockData";
import { AlertTriangle, Plus, MapPin, Clock, Users, Heart, Siren, Car, Navigation } from "lucide-react";
import { useNavigate } from "react-router-dom";
import TrustRating from "@/components/TrustRating";

const Emergency = () => {
  const { currentUser, isAuthenticated, addTokens, incrementHelps } = useAuth();
  const { emergencies, addEmergency, respondToEmergency } = useItems();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [form, setForm] = useState({ type: 'blood' as 'blood' | 'sos' | 'accident', title: '', description: '', location: '', urgency: 'medium' as 'low' | 'medium' | 'critical', bloodType: '' });

  const [sharingLocation, setSharingLocation] = useState(false);
  const [liveLocation, setLiveLocation] = useState<string>('');

  const handleShareLocation = () => {
    if (!navigator.geolocation) return;
    setSharingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`;
        setLiveLocation(loc);
        setForm(f => ({ ...f, location: loc }));
        addNotification({ type: 'emergency', title: '📍 Location Shared', description: `Live location: ${loc}` });
        setSharingLocation(false);
      },
      () => { setSharingLocation(false); }
    );
  };

  const handleAdd = () => {
    if (!currentUser || !form.title || !form.location) return;
    addEmergency({
      ...form, userId: currentUser.id, userName: currentUser.name,
      timestamp: new Date().toISOString(),
    });
    addNotification({ type: 'emergency', title: '🚨 Emergency Created', description: form.title });
    setForm({ type: 'blood', title: '', description: '', location: '', urgency: 'medium', bloodType: '' });
    setShowAddDialog(false);
  };

  const handleRespond = (id: string) => {
    respondToEmergency(id);
    addTokens(20);
    incrementHelps();
    addNotification({ type: 'reward', title: '🎉 +20 Tokens!', description: 'Thanks for responding to an emergency' });
  };

  const typeIcon = { blood: Heart, sos: Siren, accident: Car };
  const urgencyColor = { low: 'bg-green-500/20 text-green-400', medium: 'bg-yellow-500/20 text-yellow-400', critical: 'bg-red-500/20 text-red-400 animate-pulse' };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 pt-20 pb-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">Emergency <span className="text-gradient">Network</span></h1>
            <p className="text-muted-foreground text-sm">Real-time emergency alerts & response</p>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-destructive hover:bg-destructive/90"><AlertTriangle className="mr-2 h-4 w-4" />Raise Emergency</Button>
            </DialogTrigger>
            <DialogContent className="glass-strong">
              <DialogHeader><DialogTitle>Emergency Alert</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Type</Label>
                  <Select value={form.type} onValueChange={v => setForm({ ...form, type: v as any })}>
                    <SelectTrigger className="bg-secondary/50"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blood">🩸 Blood Request</SelectItem>
                      <SelectItem value="sos">🆘 SOS</SelectItem>
                      <SelectItem value="accident">🚗 Accident</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {form.type === 'blood' && (
                  <div><Label>Blood Type</Label>
                    <Select value={form.bloodType} onValueChange={v => setForm({ ...form, bloodType: v })}>
                      <SelectTrigger className="bg-secondary/50"><SelectValue placeholder="Select blood type" /></SelectTrigger>
                      <SelectContent>{bloodTypes.map(bt => <SelectItem key={bt} value={bt}>{bt}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                )}
                <div><Label>Title</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Brief emergency title" className="bg-secondary/50" /></div>
                <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe the emergency..." className="bg-secondary/50" /></div>
                <div><Label>Location</Label>
                  <div className="flex gap-2">
                    <Input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Exact location" className="bg-secondary/50" />
                    <Button type="button" variant="outline" size="sm" onClick={handleShareLocation} disabled={sharingLocation} className="shrink-0">
                      <Navigation className="h-4 w-4" />
                    </Button>
                  </div>
                  {liveLocation && <p className="text-xs text-green-400 mt-1">📍 Live: {liveLocation}</p>}
                </div>
                <div><Label>Urgency</Label>
                  <Select value={form.urgency} onValueChange={v => setForm({ ...form, urgency: v as any })}>
                    <SelectTrigger className="bg-secondary/50"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAdd} className="w-full bg-destructive hover:bg-destructive/90">Send Emergency Alert</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* SOS Button */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mb-8">
          <Card className="glass border-red-500/30 bg-red-500/5">
            <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-red-400">Quick SOS</h2>
                <p className="text-sm text-muted-foreground">Send an instant emergency alert to all nearby users</p>
              </div>
              <Button size="lg" className="bg-red-500 hover:bg-red-600 text-white animate-pulse-glow" onClick={() => {
                addEmergency({
                  type: 'sos', title: 'SOS: Immediate Help Needed',
                  description: `SOS from ${currentUser?.name}`, location: currentUser?.location || 'Campus',
                  urgency: 'critical', userId: currentUser?.id || '', userName: currentUser?.name || '',
                  timestamp: new Date().toISOString(),
                });
              }}>
                <Siren className="mr-2 h-5 w-5" /> SOS ALERT
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Emergency Cards */}
        <div className="grid md:grid-cols-2 gap-4">
          {emergencies.map((em, i) => {
            const Icon = typeIcon[em.type];
            return (
              <motion.div key={em.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className={`glass transition-all ${em.urgency === 'critical' ? 'border-red-500/30 bg-red-500/5' : ''}`}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Icon className={`h-5 w-5 ${em.urgency === 'critical' ? 'text-red-400' : 'text-yellow-400'}`} />
                        <Badge className={urgencyColor[em.urgency]}>{em.urgency}</Badge>
                      </div>
                      <Badge variant="outline">{em.status}</Badge>
                    </div>
                    <h3 className="font-semibold mb-2">{em.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{em.description}</p>
                    {em.bloodType && <Badge variant="outline" className="mb-2">Blood: {em.bloodType}</Badge>}
                    <div className="flex flex-col gap-1 text-xs text-muted-foreground mb-3">
                      <div className="flex items-center gap-1"><MapPin className="h-3 w-3" />{em.location}</div>
                      <div className="flex items-center gap-1"><Users className="h-3 w-3" />{em.responders} responder(s)</div>
                    </div>
                    {em.status === 'active' && (
                      <Button size="sm" onClick={() => handleRespond(em.id)} className="w-full">
                        Respond to Help
                      </Button>
                    )}
                    <div className="mt-2">
                      <TrustRating targetId={em.id} targetName={em.userName} reviews={[]} compact />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Emergency;
