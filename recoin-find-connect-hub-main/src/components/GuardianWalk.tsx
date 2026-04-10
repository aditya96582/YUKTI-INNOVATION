import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useItems } from "@/contexts/ItemContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { Navigation, Shield, Clock, CheckCircle, XCircle, Footprints } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface GuardianWalkProps {
  compact?: boolean;
}

const GuardianWalk: React.FC<GuardianWalkProps> = ({ compact = false }) => {
  const { currentUser } = useAuth();
  const { addEmergency } = useItems();
  const { addNotification } = useNotifications();
  const { toast } = useToast();

  const [active, setActive] = useState(false);
  const [destination, setDestination] = useState("");
  const [duration, setDuration] = useState(10); // minutes
  const [timeLeft, setTimeLeft] = useState(0);
  const [checkedIn, setCheckedIn] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startWalk = () => {
    if (!destination.trim()) {
      toast({ title: "Enter a destination", variant: "destructive" });
      return;
    }
    setActive(true);
    setCheckedIn(false);
    setTimeLeft(duration * 60);
    toast({ title: "🚶 Guardian Walk started", description: `Timer: ${duration} min → ${destination}` });
  };

  const checkIn = () => {
    setCheckedIn(true);
    setActive(false);
    setTimeLeft(0);
    if (timerRef.current) clearInterval(timerRef.current);
    toast({ title: "✅ Arrived safely!", description: "Guardian Walk ended" });
  };

  const cancelWalk = () => {
    setActive(false);
    setTimeLeft(0);
    if (timerRef.current) clearInterval(timerRef.current);
    toast({ title: "Walk cancelled" });
  };

  const triggerSOS = useCallback(async () => {
    if (!currentUser) return;
    setActive(false);
    setTimeLeft(0);
    await addEmergency({
      type: 'safety',
      title: `AUTO SOS: ${currentUser.name} didn't check in`,
      description: `Guardian Walk to "${destination}" expired. Last known location: ${currentUser.location || 'Campus'}. Auto-triggered SOS.`,
      location: currentUser.location || 'Campus',
      urgency: 'critical',
      userId: currentUser.id,
      userName: currentUser.name,
      contactNumber: currentUser.phone || '',
    });
    addNotification({ type: 'emergency', title: '🚨 Auto SOS Triggered', description: 'Guardian Walk timer expired' });
    toast({ title: "🚨 SOS Alert Sent!", description: "You didn't check in. Emergency alert sent to nearby users.", variant: "destructive" });
  }, [currentUser, destination]);

  // Timer countdown
  useEffect(() => {
    if (!active || timeLeft <= 0) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          triggerSOS();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [active, triggerSOS]);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const progress = duration > 0 ? (1 - timeLeft / (duration * 60)) * 100 : 0;

  if (compact && !active) {
    return (
      <div className="flex items-center gap-2">
        <Footprints className="h-4 w-4 text-blue-400" />
        <span className="text-xs text-muted-foreground">Guardian Walk</span>
        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setActive(false)}>
          Start
        </Button>
      </div>
    );
  }

  return (
    <Card className={`glass overflow-hidden ${active ? 'border-blue-500/30 glow-accent' : ''}`}>
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-xl bg-blue-500/10">
            <Navigation className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Guardian Walk</h3>
            <p className="text-xs text-muted-foreground">Virtual escort with auto-SOS</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!active ? (
            <motion.div key="setup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              <Input value={destination} onChange={e => setDestination(e.target.value)} placeholder="Where are you going?" className="bg-white/[0.03] border-white/[0.06] text-sm" />
              <div className="flex gap-2">
                {[5, 10, 15, 20, 30].map(m => (
                  <button key={m} onClick={() => setDuration(m)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${duration === m ? 'bg-blue-500 text-white' : 'bg-white/[0.03] hover:bg-white/[0.06]'}`}>
                    {m}m
                  </button>
                ))}
              </div>
              <Button onClick={startWalk} className="w-full bg-blue-500 hover:bg-blue-600 text-white" disabled={!destination.trim()}>
                <Shield className="mr-2 h-4 w-4" /> Start Walk
              </Button>
            </motion.div>
          ) : (
            <motion.div key="active" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              {/* Progress ring */}
              <div className="flex items-center justify-center gap-6">
                <div className="relative w-24 h-24">
                  <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.06)" strokeWidth="6" fill="none" />
                    <circle cx="50" cy="50" r="42" stroke="url(#timerGrad)" strokeWidth="6" fill="none"
                      strokeDasharray={`${2 * Math.PI * 42}`}
                      strokeDashoffset={`${2 * Math.PI * 42 * (1 - progress / 100)}`}
                      strokeLinecap="round" className="transition-all duration-1000" />
                    <defs>
                      <linearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#06b6d4" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold font-mono">{String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}</span>
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-xs text-muted-foreground">Walking to</p>
                  <p className="font-semibold text-sm">{destination}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Footprints className="h-3 w-3 text-blue-400 animate-pulse" />
                    <span className="text-xs text-blue-400">In progress</span>
                  </div>
                </div>
              </div>

              {timeLeft <= 60 && timeLeft > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-center">
                  <p className="text-xs text-red-400 font-medium">⚠️ Less than 1 minute! Check in now to avoid auto-SOS</p>
                </motion.div>
              )}

              <div className="flex gap-2">
                <Button onClick={checkIn} className="flex-1 bg-green-500 hover:bg-green-600 text-white">
                  <CheckCircle className="mr-1 h-4 w-4" /> I Arrived
                </Button>
                <Button onClick={cancelWalk} variant="outline" className="border-white/10">
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default GuardianWalk;
