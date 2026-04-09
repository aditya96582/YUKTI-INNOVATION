import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useItems } from "@/contexts/ItemContext";
import Navbar from "@/components/Navbar";
import AnimatedGridBg from "@/components/ui/animated-grid-bg";
import SpotlightCard from "@/components/ui/spotlight-card";
import { Brain, ArrowRight, CheckCircle, MessageCircle, Sparkles, Zap, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Matches = () => {
  const { isAuthenticated } = useAuth();
  const { matches, runAIMatch } = useItems();
  const navigate = useNavigate();

  useEffect(() => { if (!isAuthenticated) navigate('/auth'); }, [isAuthenticated]);

  const getConfidenceColor = (c: number) => {
    if (c >= 90) return 'text-emerald-400 bg-emerald-500/15 border-emerald-500/25';
    if (c >= 75) return 'text-blue-400 bg-blue-500/15 border-blue-500/25';
    if (c >= 60) return 'text-amber-400 bg-amber-500/15 border-amber-500/25';
    return 'text-muted-foreground bg-white/5 border-white/10';
  };

  const getConfidenceLabel = (c: number) => {
    if (c >= 90) return '🔥 Excellent';
    if (c >= 75) return '✅ High';
    if (c >= 60) return '⚡ Moderate';
    return 'ℹ️ Low';
  };

  return (
    <div className="min-h-screen relative">
      <AnimatedGridBg />
      <Navbar />
      <div className="container mx-auto px-4 pt-20 pb-10 relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Brain className="h-8 w-8 text-cyan-400" />
              AI <span className="text-gradient">Matches</span>
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Gemini AI-powered item matching results • {matches.length} match(es)</p>
          </div>
          <Button onClick={() => runAIMatch()} variant="outline" className="glow-primary">
            <Sparkles className="mr-2 h-4 w-4" /> Re-run Match
          </Button>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Matches', value: matches.length, icon: Target, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
            { label: 'High Confidence', value: matches.filter(m => m.confidence >= 80).length, icon: Zap, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
            { label: 'Pending Review', value: matches.filter(m => m.status === 'pending').length, icon: Brain, color: 'text-amber-400', bg: 'bg-amber-400/10' },
          ].map((stat, i) => (
            <Card key={i} className="glass">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.bg}`}><stat.icon className={`h-5 w-5 ${stat.color}`} /></div>
                <div>
                  <p className="text-xl font-bold">{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {matches.map((match, i) => (
            <motion.div key={match.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <SpotlightCard spotlightColor={match.confidence >= 80 ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.06)'}>
                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-cyan-400" />
                      <span className="text-sm font-medium">AI Match</span>
                    </div>
                    <div className={`px-3 py-1 rounded-full border text-sm font-bold ${getConfidenceColor(match.confidence)}`}>
                      {match.confidence}% — {getConfidenceLabel(match.confidence)}
                    </div>
                  </div>

                  {/* Items comparison */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                      <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Lost Item</span>
                      <p className="text-sm font-medium mt-1 leading-snug">{match.lostTitle}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Found Item</span>
                      <p className="text-sm font-medium mt-1 leading-snug">{match.foundTitle}</p>
                    </div>
                  </div>

                  {/* Confidence bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                      <span>Match Confidence</span>
                      <span>{match.confidence}%</span>
                    </div>
                    <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${match.confidence}%` }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                        className={`h-full rounded-full ${match.confidence >= 80 ? 'bg-gradient-to-r from-emerald-500 to-green-400' : 'bg-gradient-to-r from-amber-500 to-yellow-400'}`}
                      />
                    </div>
                  </div>

                  {/* Reasons */}
                  <div className="space-y-1 mb-4">
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Analysis</p>
                    {(match.reasons || []).map((r: string, j: number) => (
                      <div key={j} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CheckCircle className="h-3 w-3 text-emerald-400 shrink-0" />{r}
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
                    <Badge variant="outline" className="text-[10px]">{match.matchType || 'ai'} match</Badge>
                    <Button size="sm" onClick={() => navigate('/chat')} className="h-8">
                      <MessageCircle className="mr-1 h-3 w-3" /> Contact <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>

        {matches.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <Brain className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <h3 className="text-lg font-medium mb-2">No AI Matches Yet</h3>
            <p className="text-sm max-w-md mx-auto mb-6">Report lost and found items, then click "Run AI Match" on the Lost & Found page. Our Gemini AI will analyze descriptions and find potential matches.</p>
            <Button onClick={() => navigate('/lost-items')}>Go to Lost & Found</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Matches;
