import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { useItems } from "@/contexts/ItemContext";
import { useNotifications } from "@/contexts/NotificationContext";
import Navbar from "@/components/Navbar";
import AnimatedGridBg from "@/components/ui/animated-grid-bg";
import GuardianWalk from "@/components/GuardianWalk";
import { bloodTypes } from "@/data/mockData";
import {
  AlertTriangle, Plus, MapPin, Clock, Users, Heart, Shield, AlertCircle,
  Droplets, Phone, Navigation, CheckCircle, Siren
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

const URGENCY_CONFIG = {
  critical: { color: "border-red-500/40 bg-red-500/10", badge: "bg-red-500/20 text-red-400", text: "text-red-400", icon: "bg-red-500/20", pulse: true },
  high: { color: "border-orange-500/40 bg-orange-500/10", badge: "bg-orange-500/20 text-orange-400", text: "text-orange-400", icon: "bg-orange-500/20", pulse: true },
  medium: { color: "border-yellow-500/40 bg-yellow-500/10", badge: "bg-yellow-500/20 text-yellow-400", text: "text-yellow-400", icon: "bg-yellow-500/20", pulse: false },
  low: { color: "border-blue-400/40 bg-blue-400/10", badge: "bg-blue-400/20 text-blue-300", text: "text-blue-300", icon: "bg-blue-400/20", pulse: false },
};

const TYPE_CONFIG = {
  blood:   { icon: Droplets,    label: "Blood Needed", formColor: "border-red-500/40 bg-red-500/10 text-red-400" },
  medical: { icon: Heart,       label: "Medical Help", formColor: "border-blue-500/40 bg-blue-500/10 text-blue-400" },
  safety:  { icon: Shield,      label: "Safety Alert", formColor: "border-yellow-500/40 bg-yellow-500/10 text-yellow-400" },
  other:   { icon: AlertCircle, label: "Other",        formColor: "border-gray-500/40 bg-gray-500/10 text-gray-400" },
};

const Emergency = () => {
  const { currentUser, isAuthenticated, addTokens, addReputation, incrementHelps } = useAuth();
  const { emergencies, addEmergency, respondToEmergency, loadEmergencies } = useItems();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [urgencyFilter, setUrgencyFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [bloodFilter, setBloodFilter] = useState<string>("");
  const [showResolved, setShowResolved] = useState(false);

  // Form state
  const [form, setForm] = useState({
    type: 'blood' as 'blood' | 'medical' | 'safety' | 'other',
    title: '', description: '', location: '',
    urgency: 'medium' as 'critical' | 'high' | 'medium' | 'low',
    bloodGroup: '', contactNumber: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { if (!isAuthenticated) navigate('/auth'); }, [isAuthenticated]);

  // Blood group request counts
  const bloodCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    bloodTypes.forEach(bt => { counts[bt] = 0; });
    emergencies.filter(e => e.type === 'blood' && !e.resolved).forEach(e => {
      if (e.bloodGroup && counts[e.bloodGroup] !== undefined) counts[e.bloodGroup]++;
    });
    return counts;
  }, [emergencies]);

  // Critical count
  const criticalCount = emergencies.filter(e => e.urgency === 'critical' && !e.resolved).length;

  // Filtered emergencies
  const filtered = useMemo(() => {
    return emergencies.filter(e => {
      if (!showResolved && e.resolved) return false;
      if (urgencyFilter !== "all" && e.urgency !== urgencyFilter) return false;
      if (typeFilter !== "all" && e.type !== typeFilter) return false;
      if (bloodFilter && e.bloodGroup !== bloodFilter) return false;
      return true;
    });
  }, [emergencies, urgencyFilter, typeFilter, bloodFilter, showResolved]);

  // Time ago
  const timeAgo = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const handleAdd = async () => {
    if (!currentUser || !form.title || !form.location) return;
    if (form.type === 'blood' && !form.bloodGroup) {
      toast({ title: "Blood group required", description: "Please select a blood group for blood requests", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      await addEmergency({
        type: form.type,
        title: form.title,
        description: form.description,
        location: form.location,
        urgency: form.urgency,
        bloodGroup: form.type === 'blood' ? form.bloodGroup : '',
        contactNumber: form.contactNumber,
        userId: currentUser.id,
        userName: currentUser.name,
      });
      addNotification({ type: 'emergency', title: '🚨 Emergency Created', description: form.title });
      toast({ title: "Emergency posted successfully ✅" });
      setForm({ type: 'blood', title: '', description: '', location: '', urgency: 'medium', bloodGroup: '', contactNumber: '' });
      setShowAddDialog(false);
    } catch (error) {
      toast({ title: "Failed to post emergency", variant: "destructive" });
    }
    setSubmitting(false);
  };

  const handleRespond = async (emId: string) => {
    if (!currentUser) return;
    const result = await respondToEmergency(emId, currentUser.id, currentUser.name);
    if (result) {
      addTokens(20, "Emergency response");
      addReputation(0.3);
      incrementHelps();
      addNotification({ type: 'reward', title: '🎉 +20 Tokens!', description: 'Thanks for responding to an emergency' });
      toast({ title: "+20 Coins Earned! 🎉", description: "You helped with an emergency request" });
    } else {
      toast({ title: "Could not respond", description: "You may have already responded", variant: "destructive" });
    }
  };

  const handleSOS = async () => {
    if (!currentUser) return;
    await addEmergency({
      type: 'medical',
      title: 'SOS: Immediate Help Needed',
      description: `SOS from ${currentUser.name}. Immediate assistance required.`,
      location: currentUser.location || 'Campus',
      urgency: 'critical',
      userId: currentUser.id,
      userName: currentUser.name,
      contactNumber: currentUser.phone || '',
    });
    toast({ title: "🚨 SOS Alert Sent!", description: "Nearby users have been notified" });
  };

  return (
    <div className="min-h-screen relative">
      <AnimatedGridBg />
      <Navbar />
      <div className="container mx-auto px-4 pt-20 pb-10 relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              Emergency <span className="text-gradient">Network</span>
              {criticalCount > 0 && (
                <span className="relative flex h-6 w-6">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-6 w-6 bg-red-500 text-white text-xs items-center justify-center font-bold">{criticalCount}</span>
                </span>
              )}
            </h1>
            <p className="text-muted-foreground text-sm">Real-time crisis response • Blood requests • Safety alerts</p>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-destructive hover:bg-destructive/90"><AlertTriangle className="mr-2 h-4 w-4" />Raise Emergency</Button>
            </DialogTrigger>
            <DialogContent className="glass-strong max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>🚨 Emergency Alert</DialogTitle></DialogHeader>
              <div className="space-y-5">
                {/* Type Selector */}
                <div>
                  <Label className="text-sm mb-2 block">Emergency Type</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.keys(TYPE_CONFIG) as Array<keyof typeof TYPE_CONFIG>).map(t => {
                      const cfg = TYPE_CONFIG[t];
                      const Icon = cfg.icon;
                      return (
                        <button key={t} type="button" onClick={() => setForm({ ...form, type: t })}
                          className={`p-3 rounded-xl border-2 text-left flex items-center gap-3 transition-all ${form.type === t ? cfg.formColor + ' border-current' : 'border-border/30 hover:border-border/60'}`}>
                          <Icon className="h-5 w-5" />
                          <span className="text-sm font-medium">{cfg.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Blood Group Grid (only for blood type) */}
                {form.type === 'blood' && (
                  <div>
                    <Label className="text-sm mb-2 block">Blood Group Required *</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {bloodTypes.map(bt => (
                        <button key={bt} type="button" onClick={() => setForm({ ...form, bloodGroup: bt })}
                          className={`p-2 rounded-lg text-center font-bold text-sm transition-all ${form.bloodGroup === bt ? 'bg-red-500 text-white' : 'bg-secondary/30 hover:bg-secondary/50'}`}>
                          {bt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div><Label>Title *</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Brief emergency title" className="bg-secondary/50 mt-1" maxLength={255} /></div>
                <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe the emergency..." className="bg-secondary/50 mt-1" /></div>

                {/* Urgency */}
                <div>
                  <Label className="text-sm mb-2 block">Urgency Level</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['critical', 'high', 'medium', 'low'] as const).map(u => (
                      <button key={u} type="button" onClick={() => setForm({ ...form, urgency: u })}
                        className={`p-2 rounded-lg text-center text-xs font-bold uppercase transition-all ${form.urgency === u ? URGENCY_CONFIG[u].badge + ' ring-2 ring-current' : 'bg-secondary/30 hover:bg-secondary/50'}`}>
                        {u}
                      </button>
                    ))}
                  </div>
                </div>

                <div><Label>Location *</Label><Input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Exact location" className="bg-secondary/50 mt-1" /></div>
                <div><Label>Contact Number (optional)</Label><Input value={form.contactNumber} onChange={e => setForm({ ...form, contactNumber: e.target.value })} placeholder="+91 XXXXX XXXXX" className="bg-secondary/50 mt-1" /></div>

                <Button onClick={handleAdd} className="w-full bg-destructive hover:bg-destructive/90" disabled={submitting || !form.title || !form.location}>
                  {submitting ? "Posting..." : "🚨 Send Emergency Alert"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* SOS Button */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mb-6">
          <Card className="glass border-red-500/30 bg-red-500/5">
            <CardContent className="p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-red-400">Quick SOS</h2>
                <p className="text-sm text-muted-foreground">Send an instant emergency alert to all nearby users</p>
              </div>
              <Button size="lg" className="bg-red-500 hover:bg-red-600 text-white animate-pulse" onClick={handleSOS}>
                <Siren className="mr-2 h-5 w-5" /> SOS ALERT
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Guardian Walk */}
        <div className="mb-6">
          <GuardianWalk />
        </div>

        {/* Blood Group Quick Filter */}
        <div className="mb-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <span className="text-xs text-muted-foreground whitespace-nowrap font-medium">Blood:</span>
            <button onClick={() => setBloodFilter("")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${!bloodFilter ? 'bg-red-500 text-white' : 'bg-secondary/30 hover:bg-secondary/50'}`}>
              All
            </button>
            {bloodTypes.map(bt => (
              <button key={bt} onClick={() => setBloodFilter(bloodFilter === bt ? '' : bt)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 ${bloodFilter === bt ? 'bg-red-500 text-white' : 'bg-secondary/30 hover:bg-secondary/50'}`}>
                {bt}
                {bloodCounts[bt] > 0 && <span className="bg-red-600 text-white text-[10px] h-4 w-4 rounded-full flex items-center justify-center">{bloodCounts[bt]}</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Urgency + Type Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          {/* Urgency tabs */}
          {['all', 'critical', 'high', 'medium', 'low'].map(u => (
            <button key={u} onClick={() => setUrgencyFilter(u)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${urgencyFilter === u ? (u === 'all' ? 'bg-primary text-primary-foreground' : URGENCY_CONFIG[u as keyof typeof URGENCY_CONFIG]?.badge || '') : 'bg-secondary/30 hover:bg-secondary/50'}`}>
              {u === 'all' ? 'All Urgency' : u}
            </button>
          ))}
          <div className="w-px bg-border/30 mx-1" />
          {/* Type tabs */}
          {['all', 'blood', 'medical', 'safety', 'other'].map(t => {
            const cfg = t !== 'all' ? TYPE_CONFIG[t as keyof typeof TYPE_CONFIG] : null;
            const Icon = cfg?.icon;
            return (
              <button key={t} onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize flex items-center gap-1 ${typeFilter === t ? 'bg-primary text-primary-foreground' : 'bg-secondary/30 hover:bg-secondary/50'}`}>
                {Icon && <Icon className="h-3 w-3" />}
                {t === 'all' ? 'All Types' : cfg?.label}
              </button>
            );
          })}
          <div className="w-px bg-border/30 mx-1" />
          {/* Resolved toggle */}
          <div className="flex items-center gap-2">
            <Switch checked={showResolved} onCheckedChange={setShowResolved} />
            <span className="text-xs text-muted-foreground">Resolved</span>
          </div>
        </div>

        {/* Emergency Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map((em, i) => {
              const urgCfg = URGENCY_CONFIG[em.urgency as keyof typeof URGENCY_CONFIG] || URGENCY_CONFIG.medium;
              const typeCfg = TYPE_CONFIG[em.type as keyof typeof TYPE_CONFIG] || TYPE_CONFIG.other;
              const Icon = typeCfg.icon;
              const isResolved = em.resolved;
              const alreadyResponded = em.respondentList?.includes(currentUser?.id || '');

              return (
                <motion.div key={em.id}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.03 }}
                  className={isResolved ? 'opacity-60' : ''}>
                  <Card className={`glass transition-all border-l-4 ${urgCfg.color} ${em.urgency === 'critical' && !isResolved ? 'shadow-lg shadow-red-500/10' : ''}`}>
                    <CardContent className="p-5">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-lg ${urgCfg.icon}`}>
                            <Icon className={`h-4 w-4 ${urgCfg.text}`} />
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Badge className={urgCfg.badge}>
                              {urgCfg.pulse && !isResolved && <span className="w-1.5 h-1.5 bg-current rounded-full animate-ping mr-1" />}
                              {em.urgency}
                            </Badge>
                            {isResolved && <Badge className="bg-green-500/20 text-green-400"><CheckCircle className="h-3 w-3 mr-1" />Resolved</Badge>}
                          </div>
                        </div>
                        {em.bloodGroup && (
                          <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-xs font-bold">{em.bloodGroup}</span>
                        )}
                      </div>

                      {/* Title + Description */}
                      <h3 className="font-semibold text-base mb-1">{em.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{em.description}</p>

                      {/* Meta */}
                      <div className="flex flex-col gap-1 text-xs text-muted-foreground mb-3">
                        <div className="flex items-center gap-1"><MapPin className="h-3 w-3" />{em.location}</div>
                        <div className="flex items-center gap-1"><Clock className="h-3 w-3" />{timeAgo(em.timestamp || em.createdAt)}</div>
                        <div className="flex items-center gap-1"><Users className="h-3 w-3" />{em.respondents} responder(s)</div>
                      </div>

                      {/* Contact number */}
                      {em.contactNumber && (em.urgency === 'critical' || em.urgency === 'high') && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                          <Phone className="h-3 w-3" />{em.contactNumber}
                        </div>
                      )}

                      {/* Actions */}
                      {!isResolved && (
                        <div className="flex gap-2">
                          {em.contactNumber && (
                            <a href={`tel:${em.contactNumber}`} className="flex-1">
                              <Button variant="outline" size="sm" className="w-full border-green-500/40 text-green-400 hover:bg-green-500/10">
                                <Phone className="h-3 w-3 mr-1" /> Call
                              </Button>
                            </a>
                          )}
                          <Button size="sm" onClick={() => handleRespond(em.id)}
                            disabled={alreadyResponded}
                            className={`flex-1 ${alreadyResponded ? 'bg-secondary' : 'bg-amber-500 hover:bg-amber-600 text-white'}`}>
                            {alreadyResponded ? '✓ Helped' : '🤝 Help'}
                          </Button>
                        </div>
                      )}

                      <div className="mt-2 text-xs text-muted-foreground">Posted by {em.userName}</div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No emergencies match your filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Emergency;
