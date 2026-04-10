import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import AnimatedGridBg from "@/components/ui/animated-grid-bg";
import AnimatedCounter from "@/components/ui/animated-counter";
import SpotlightCard from "@/components/ui/spotlight-card";
import { Trophy, Crown, Medal, Star, Coins, HandHelping, Flame, TrendingUp, Zap, Shield, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Mock leaderboard data (in production, fetch from API)
const LEADERBOARD_DATA = [
  { name: 'Aditya Kumar', coins: 245, helps: 28, reputation: 4.9, badge: 'Safety Champion' },
  { name: 'Priya Sharma', coins: 198, helps: 22, reputation: 4.7, badge: 'Top Helper' },
  { name: 'Ravi Patel', coins: 175, helps: 19, reputation: 4.6, badge: 'Quick Responder' },
  { name: 'Sneha Gupta', coins: 152, helps: 16, reputation: 4.5, badge: 'Life Saver' },
  { name: 'Mohit Singh', coins: 130, helps: 14, reputation: 4.3, badge: 'Community Star' },
  { name: 'Anita Verma', coins: 112, helps: 12, reputation: 4.2, badge: '' },
  { name: 'Rahul Joshi', coins: 98, helps: 10, reputation: 4.0, badge: '' },
  { name: 'Deepa Nair', coins: 85, helps: 9, reputation: 3.9, badge: '' },
  { name: 'Vikram Das', coins: 72, helps: 7, reputation: 3.7, badge: '' },
  { name: 'Meera Reddy', coins: 60, helps: 6, reputation: 3.5, badge: '' },
];

const rankColors = [
  'from-amber-500/30 to-yellow-500/10 border-amber-500/40',
  'from-gray-400/20 to-gray-500/5 border-gray-400/30',
  'from-orange-600/20 to-amber-700/5 border-orange-600/30',
];
const rankIcons = ['🥇', '🥈', '🥉'];

const Leaderboard = () => {
  const { isAuthenticated, currentUser } = useAuth();
  const navigate = useNavigate();
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'alltime'>('alltime');

  useEffect(() => { if (!isAuthenticated) navigate('/auth'); }, [isAuthenticated]);

  // Insert current user into leaderboard if not present
  const data = [...LEADERBOARD_DATA];
  if (currentUser) {
    const idx = data.findIndex(d => d.name === currentUser.name);
    if (idx === -1) {
      data.push({
        name: currentUser.name,
        coins: currentUser.tokens,
        helps: currentUser.totalHelps,
        reputation: currentUser.reputation,
        badge: '',
      });
    } else {
      data[idx].coins = currentUser.tokens;
      data[idx].helps = currentUser.totalHelps;
      data[idx].reputation = currentUser.reputation;
    }
  }
  data.sort((a, b) => b.coins - a.coins);

  const totalCoins = data.reduce((s, d) => s + d.coins, 0);
  const totalHelps = data.reduce((s, d) => s + d.helps, 0);

  return (
    <div className="min-h-screen relative">
      <AnimatedGridBg />
      <Navbar />
      <div className="container mx-auto px-4 pt-20 pb-10 relative z-10 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
          <h1 className="text-3xl font-bold flex items-center justify-center gap-3">
            <Trophy className="h-8 w-8 text-amber-400" />
            Community <span className="text-gradient">Leaderboard</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-2">Recognizing our campus heroes</p>
        </motion.div>

        {/* Period Toggle */}
        <div className="flex justify-center gap-2 mb-8">
          {(['weekly', 'monthly', 'alltime'] as const).map(p => (
            <Button key={p} variant={period === p ? 'default' : 'outline'} size="sm" onClick={() => setPeriod(p)} className="capitalize">
              {p === 'alltime' ? 'All Time' : p}
            </Button>
          ))}
        </div>

        {/* Top 3 Podium */}
        <div className="grid grid-cols-3 gap-4 mb-8 items-end">
          {[1, 0, 2].map(rank => {
            const user = data[rank];
            if (!user) return null;
            const isCenter = rank === 0;
            return (
              <motion.div key={rank} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: rank * 0.15 }}
                className={isCenter ? 'order-2' : rank === 1 ? 'order-1' : 'order-3'}>
                <SpotlightCard spotlightColor={rank === 0 ? 'rgba(245,158,11,0.12)' : 'rgba(255,255,255,0.05)'}>
                  <div className={`p-5 text-center bg-gradient-to-b ${rankColors[rank]} rounded-2xl border ${isCenter ? 'pb-8' : ''}`}>
                    <div className="text-4xl mb-2">{rankIcons[rank]}</div>
                    {isCenter && <Crown className="h-5 w-5 text-amber-400 mx-auto mb-1" />}
                    <p className="font-bold text-base truncate">{user.name}</p>
                    {user.badge && <p className="text-[10px] text-amber-400 font-medium mt-1">{user.badge}</p>}
                    <div className="mt-3 space-y-1">
                      <p className="text-2xl font-bold text-amber-400">
                        <AnimatedCounter end={user.coins} duration={1.5} />
                      </p>
                      <p className="text-xs text-muted-foreground">coins earned</p>
                    </div>
                    <div className="flex justify-center gap-3 mt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><HandHelping className="h-3 w-3" />{user.helps}</span>
                      <span className="flex items-center gap-1"><Star className="h-3 w-3" />{user.reputation.toFixed(1)}</span>
                    </div>
                  </div>
                </SpotlightCard>
              </motion.div>
            );
          })}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { icon: Coins, label: 'Total Coins Earned', value: totalCoins, color: 'text-amber-400', bg: 'bg-amber-400/10' },
            { icon: HandHelping, label: 'Total Helps', value: totalHelps, color: 'text-green-400', bg: 'bg-green-400/10' },
            { icon: Users, label: 'Active Helpers', value: data.length, color: 'text-blue-400', bg: 'bg-blue-400/10' },
          ].map((s, i) => (
            <Card key={i} className="glass">
              <CardContent className="p-4 text-center">
                <div className={`p-2 rounded-lg ${s.bg} w-fit mx-auto mb-2`}><s.icon className={`h-4 w-4 ${s.color}`} /></div>
                <p className="text-xl font-bold"><AnimatedCounter end={s.value} duration={1.5} /></p>
                <p className="text-[10px] text-muted-foreground mt-1">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Full Table */}
        <Card className="glass">
          <CardHeader><CardTitle className="text-base">Full Rankings</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-1">
              {data.map((user, i) => {
                const isCurrentUser = user.name === currentUser?.name;
                return (
                  <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                    className={`flex items-center gap-4 p-3 rounded-xl transition-all ${isCurrentUser ? 'bg-amber-500/10 border border-amber-500/20' : 'hover:bg-white/[0.02]'}`}>
                    <span className={`w-8 text-center font-bold text-sm ${i < 3 ? 'text-amber-400' : 'text-muted-foreground'}`}>
                      {i < 3 ? rankIcons[i] : `#${i + 1}`}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-sm font-bold text-primary">
                      {user.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{user.name} {isCurrentUser && <span className="text-xs text-amber-400">(You)</span>}</p>
                      {user.badge && <p className="text-[10px] text-muted-foreground">{user.badge}</p>}
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-muted-foreground flex items-center gap-1"><HandHelping className="h-3 w-3" />{user.helps}</span>
                      <span className="text-muted-foreground flex items-center gap-1"><Star className="h-3 w-3" />{user.reputation.toFixed(1)}</span>
                      <span className="font-bold text-amber-400 min-w-[50px] text-right">🪙 {user.coins}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
export default Leaderboard;
