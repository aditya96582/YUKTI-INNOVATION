import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useItems } from "@/contexts/ItemContext";
import Navbar from "@/components/Navbar";
import { Brain, ArrowRight, CheckCircle, Percent, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Matches = () => {
  const { isAuthenticated } = useAuth();
  const { matches } = useItems();
  const navigate = useNavigate();

  useEffect(() => { if (!isAuthenticated) navigate('/auth'); }, [isAuthenticated]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 pt-20 pb-10">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">AI <span className="text-gradient">Matches</span></h1>
          <p className="text-muted-foreground text-sm">AI-powered item matching results</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {matches.map((match, i) => (
            <motion.div key={match.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className={`glass hover:glow-primary transition-all ${match.confidence >= 90 ? 'border-green-500/30' : 'border-yellow-500/20'}`}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-cyan-400" />
                      <span className="text-sm font-medium">AI Match</span>
                    </div>
                    <div className={`text-xl font-bold ${match.confidence >= 90 ? 'text-green-400' : 'text-yellow-400'}`}>
                      {match.confidence}%
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="p-3 rounded-lg bg-red-500/10">
                      <span className="text-xs text-red-400 font-medium">LOST</span>
                      <p className="text-sm font-medium mt-1">{match.lostTitle}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-green-500/10">
                      <span className="text-xs text-green-400 font-medium">FOUND</span>
                      <p className="text-sm font-medium mt-1">{match.foundTitle}</p>
                    </div>
                  </div>

                  <div className="space-y-1 mb-4">
                    <p className="text-xs font-medium text-muted-foreground">Match Reasons:</p>
                    {match.reasons.map((r, j) => (
                      <div key={j} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CheckCircle className="h-3 w-3 text-green-400" />{r}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{match.matchType} match</Badge>
                    <Button size="sm" onClick={() => navigate('/chat')}>Contact <ArrowRight className="ml-1 h-3 w-3" /></Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        {matches.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No matches yet. Go to Lost & Found and run AI Matching!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Matches;
