import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { Coins, Gift, Star, Trophy, Store, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { badges as allBadges } from "@/data/mockData";

const Rewards = () => {
  const { currentUser, isAuthenticated, addTokens, getActiveTokens } = useAuth();
  const navigate = useNavigate();
  const activeTokens = getActiveTokens();
  const expiringTokens = (currentUser?.tokenHistory || []).filter(t => {
    const exp = new Date(t.expiresAt);
    const now = new Date();
    const diff = (exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff > 0 && diff <= 2;
  });

  useEffect(() => { if (!isAuthenticated) navigate('/auth'); }, [isAuthenticated]);

  const redeemOptions = [
    { name: 'Jan Aushadhi Kendra', desc: 'Get medicines at discounted prices', cost: 30, icon: Store },
    { name: 'Campus Canteen', desc: '₹50 meal voucher', cost: 20, icon: Gift },
    { name: 'Library Pass', desc: 'Extended library hours for 1 week', cost: 15, icon: Star },
    { name: 'Print Credits', desc: '50 pages free printing', cost: 10, icon: Gift },
  ];

  const tokenRules = [
    { action: 'Return lost item', tokens: '+10', color: 'text-green-400' },
    { action: 'Respond to emergency', tokens: '+20', color: 'text-green-400' },
    { action: 'Provide medicine', tokens: '+15', color: 'text-green-400' },
    { action: 'Emergency case help', tokens: '+30', color: 'text-green-400' },
    { action: 'Token expiry', tokens: '7-10 days', color: 'text-yellow-400' },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 pt-20 pb-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Rewards & <span className="text-gradient">Tokens</span></h1>
          <p className="text-muted-foreground text-sm">Earn tokens by helping others, redeem for rewards</p>
        </div>

        {/* Token Balance */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="glass glow-primary mb-8">
            <CardContent className="p-8 text-center">
              <Coins className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
              <p className="text-5xl font-bold text-gradient mb-2">{currentUser?.tokens || 0}</p>
              <p className="text-muted-foreground">Total Tokens</p>
              <p className="text-sm text-green-400 mt-1">{activeTokens} active (non-expired)</p>
              <div className="flex items-center justify-center gap-2 mt-4">
                <Star className="h-4 w-4 text-yellow-400" />
                <span className="text-sm">Reputation: {currentUser?.reputation}/5</span>
              </div>
              {expiringTokens.length > 0 && (
                <div className="mt-4 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                  <p className="text-xs text-orange-400 flex items-center justify-center gap-1">
                    <Clock className="h-3 w-3" /> {expiringTokens.length} token batch(es) expiring within 2 days!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Redeem */}
          <Card className="glass">
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Gift className="h-5 w-5" />Redeem Rewards</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {redeemOptions.map((opt, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                  <div className="flex items-center gap-3">
                    <opt.icon className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">{opt.name}</p>
                      <p className="text-xs text-muted-foreground">{opt.desc}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" disabled={(currentUser?.tokens || 0) < opt.cost}
                    onClick={() => addTokens(-opt.cost)}>
                    {opt.cost} 🪙
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* How to Earn */}
          <div className="space-y-6">
            <Card className="glass">
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Coins className="h-5 w-5" />How to Earn</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {tokenRules.map((rule, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded bg-secondary/20">
                    <span className="text-sm">{rule.action}</span>
                    <span className={`text-sm font-bold ${rule.color}`}>{rule.tokens}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Badges */}
            <Card className="glass">
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Trophy className="h-5 w-5" />Badges</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                {allBadges.map((badge, i) => (
                  <div key={i} className={`p-3 rounded-lg text-center ${
                    currentUser?.badges?.includes(badge.name) ? 'bg-primary/10 border border-primary/30' : 'bg-secondary/20 opacity-50'
                  }`}>
                    <span className="text-2xl">{badge.icon}</span>
                    <p className="text-xs font-medium mt-1">{badge.name}</p>
                    <p className="text-xs text-muted-foreground">{badge.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rewards;
