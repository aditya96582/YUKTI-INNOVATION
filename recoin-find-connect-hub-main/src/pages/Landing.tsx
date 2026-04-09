import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useItems } from "@/contexts/ItemContext";
import { Shield, Search, Pill, Zap, ArrowRight, Users, MapPin, Brain } from "lucide-react";

const Landing = () => {
  const { isAuthenticated } = useAuth();
  const { lostItems, emergencies } = useItems();

  const features = [
    { icon: Brain, title: "AI-Powered Matching", desc: "Smart algorithms match lost items with found reports using NLP & image analysis", color: "text-blue-400" },
    { icon: Shield, title: "Emergency Network", desc: "Instant SOS alerts, blood requests, and accident reporting with live location", color: "text-red-400" },
    { icon: Pill, title: "Medical Connect", desc: "Upload prescriptions, find medicines nearby, connect with pharmacies", color: "text-green-400" },
    { icon: Zap, title: "Earn Rewards", desc: "Get tokens for helping others. Redeem at Jan Aushadhi Kendra & more", color: "text-yellow-400" },
  ];

  const stats = [
    { value: "2,500+", label: "Items Recovered" },
    { value: "95%", label: "Match Accuracy" },
    { value: "10K+", label: "Active Users" },
    { value: "500+", label: "Lives Saved" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

        <div className="container mx-auto px-4 pt-20 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm text-muted-foreground">Powered by AI • Real-time</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="text-gradient">CampusConnect</span>
              <br />
              <span className="text-foreground">AI Network</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Smart Lost & Found • Emergency Response • Medical Network
              <br />
              One platform to protect, connect, and reward your campus community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="glow-primary text-lg px-8">
                <Link to={isAuthenticated ? "/dashboard" : "/auth"}>
                  {isAuthenticated ? "Go to Dashboard" : "Get Started Free"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8">
                <Link to="/lost-items">Browse Lost Items</Link>
              </Button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }} className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20 max-w-3xl mx-auto">
            {stats.map((stat, i) => (
              <div key={i} className="glass p-4 rounded-xl text-center">
                <div className="text-2xl font-bold text-gradient">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-3xl font-bold text-center mb-12">
            Powered by <span className="text-gradient">Intelligence</span>
          </motion.h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Card className="glass h-full hover:glow-primary transition-all duration-300 group cursor-pointer">
                  <CardContent className="p-6">
                    <f.icon className={`h-10 w-10 mb-4 ${f.color} group-hover:scale-110 transition-transform`} />
                    <h3 className="font-semibold mb-2">{f.title}</h3>
                    <p className="text-sm text-muted-foreground">{f.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Activity */}
      <section className="py-20 bg-secondary/20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Live <span className="text-gradient">Activity</span></h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {lostItems.slice(0, 3).map((item, i) => (
              <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Card className="glass hover:glow-primary transition-all">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-xs px-2 py-1 rounded-full bg-destructive/20 text-destructive">Lost</span>
                      <span className="text-xs text-muted-foreground">{item.date}</span>
                    </div>
                    <h3 className="font-semibold mb-1">{item.title}</h3>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" /> {item.location}
                    </div>
                    {item.reward > 0 && (
                      <div className="mt-3 text-sm font-medium text-warning">🪙 {item.reward} tokens reward</div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button asChild variant="outline"><Link to={isAuthenticated ? "/lost-items" : "/auth"}>View All Items <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-border/30">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2026 CampusConnect AI — Built for YUKTI Innovation Challenge</p>
          <p className="mt-1">Smart Lost & Found • Emergency Network • Medical Connect</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
