import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useItems } from "@/contexts/ItemContext";
import AnimatedGridBg from "@/components/ui/animated-grid-bg";
import SpotlightCard from "@/components/ui/spotlight-card";
import AnimatedCounter from "@/components/ui/animated-counter";
import {
  Shield, Search, Pill, Zap, ArrowRight, Users, MapPin, Brain,
  Heart, Trophy, Navigation, Sparkles, CheckCircle, Clock, Star
} from "lucide-react";

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };

const Landing = () => {
  const { isAuthenticated } = useAuth();
  const { lostItems, emergencies } = useItems();

  const features = [
    { icon: Brain, title: "AI-Powered Matching", desc: "Smart NLP & image analysis matches lost items with found reports in seconds", color: "text-blue-400", glow: "rgba(59,130,246,0.08)" },
    { icon: Shield, title: "Emergency Network", desc: "Instant SOS, blood requests, accident reporting with real-time crisis response", color: "text-red-400", glow: "rgba(239,68,68,0.08)" },
    { icon: Pill, title: "Medical Connect", desc: "Upload prescriptions, find medicines at nearby pharmacies with live inventory", color: "text-emerald-400", glow: "rgba(16,185,129,0.08)" },
    { icon: Navigation, title: "Guardian Walk", desc: "Virtual escort with dead-man's switch — auto SOS if you don't check in", color: "text-cyan-400", glow: "rgba(6,182,212,0.08)" },
    { icon: MapPin, title: "Safety Heatmap", desc: "AI-powered campus safety zones with crowd-sourced verification", color: "text-purple-400", glow: "rgba(139,92,246,0.08)" },
    { icon: Trophy, title: "Earn & Redeem", desc: "Get tokens for helping. Redeem at Jan Aushadhi Kendra & campus stores", color: "text-amber-400", glow: "rgba(245,158,11,0.08)" },
  ];

  const stats = [
    { value: 2500, suffix: "+", label: "Items Recovered" },
    { value: 95, suffix: "%", label: "AI Match Accuracy" },
    { value: 10, suffix: "K+", label: "Active Users" },
    { value: 500, suffix: "+", label: "Lives Saved" },
  ];

  const steps = [
    { num: "01", title: "Report or Discover", desc: "Lost something? Report it. Found something? List it. Our AI does the rest.", icon: Search },
    { num: "02", title: "AI Matches & Alerts", desc: "Our algorithms find matches instantly and send real-time notifications.", icon: Brain },
    { num: "03", title: "Connect & Recover", desc: "Chat securely, coordinate the return, and earn tokens as rewards.", icon: Heart },
  ];

  return (
    <div className="min-h-screen relative">
      <AnimatedGridBg />

      {/* ═══ Hero ═══ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Extra glow orbs */}
        <div className="absolute top-1/3 left-1/3 w-[600px] h-[600px] bg-amber-500/[0.06] rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-500/[0.05] rounded-full blur-[100px] animate-float" style={{ animationDelay: '3s' }} />

        <div className="container mx-auto px-4 pt-20 relative z-10 text-center">
          <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.15 } } }}>
            {/* Badge */}
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span className="text-sm text-muted-foreground">Powered by AI • Real-time • Blockchain Rewards</span>
            </motion.div>

            {/* Heading */}
            <motion.h1 variants={fadeUp} className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold mb-6 leading-[1.05] tracking-tight">
              <span className="text-gradient">Campus</span>
              <span className="text-foreground">Connect</span>
              <br />
              <span className="text-foreground/80 text-4xl sm:text-5xl md:text-6xl lg:text-7xl">AI Network</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p variants={fadeUp} className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Smart Lost & Found • Emergency Response • Medical Network • Safety Intelligence
              <br />
              <span className="text-foreground/70">One platform to protect, connect, and reward your campus community.</span>
            </motion.p>

            {/* CTAs */}
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="glow-primary text-lg px-10 py-6 font-semibold">
                <Link to={isAuthenticated ? "/dashboard" : "/auth"}>
                  {isAuthenticated ? "Go to Dashboard" : "Get Started Free"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-10 py-6 border-white/10 hover:bg-white/[0.04]">
                <Link to="/lost-items">Browse Lost Items</Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Animated Stats */}
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-24 max-w-3xl mx-auto">
            {stats.map((stat, i) => (
              <SpotlightCard key={i}>
                <div className="p-5 text-center">
                  <div className="text-3xl md:text-4xl font-extrabold text-gradient">
                    <AnimatedCounter end={stat.value} suffix={stat.suffix} duration={2.5} />
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">{stat.label}</div>
                </div>
              </SpotlightCard>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ Features ═══ */}
      <section className="py-24 relative z-10">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Powered by <span className="text-gradient">Intelligence</span>
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">Six powerful modules working together to create the safest, most connected campus experience</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                <SpotlightCard spotlightColor={f.glow} className="h-full">
                  <div className="p-6">
                    <f.icon className={`h-10 w-10 mb-4 ${f.color}`} />
                    <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                  </div>
                </SpotlightCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ How It Works ═══ */}
      <section className="py-24 relative z-10">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It <span className="text-gradient">Works</span></h2>
            <p className="text-muted-foreground">Three simple steps to a safer campus</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((step, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                className="text-center relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 flex items-center justify-center mx-auto mb-5 border border-amber-500/20">
                  <span className="text-2xl font-extrabold text-gradient">{step.num}</span>
                </div>
                <step.icon className="h-6 w-6 text-amber-400 mx-auto mb-3" />
                <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
                {i < 2 && <div className="hidden md:block absolute top-8 -right-4 w-8 text-white/10 text-3xl">→</div>}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Live Activity ═══ */}
      <section className="py-24 relative z-10">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Live <span className="text-gradient">Activity</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {lostItems.slice(0, 3).map((item, i) => (
              <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <SpotlightCard spotlightColor="rgba(239,68,68,0.06)">
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-xs px-2 py-1 rounded-full bg-destructive/20 text-destructive font-medium">Lost</span>
                      <span className="text-xs text-muted-foreground">{item.date}</span>
                    </div>
                    <h3 className="font-semibold mb-1">{item.title}</h3>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" /> {item.location}</div>
                    {item.reward > 0 && <div className="mt-3 text-sm font-medium text-amber-400">🪙 {item.reward} tokens reward</div>}
                  </div>
                </SpotlightCard>
              </motion.div>
            ))}
            {lostItems.length === 0 && (
              <div className="col-span-3 text-center py-12 text-muted-foreground">
                <Search className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p>No lost items reported yet. Sign up to get started!</p>
              </div>
            )}
          </div>
          <div className="text-center mt-10">
            <Button asChild variant="outline" size="lg" className="border-white/10 hover:bg-white/[0.04]">
              <Link to={isAuthenticated ? "/lost-items" : "/auth"}>View All Items <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-24 relative z-10">
        <div className="container mx-auto px-4">
          <SpotlightCard spotlightColor="rgba(245,158,11,0.1)" className="max-w-3xl mx-auto">
            <div className="p-10 md:p-16 text-center">
              <Sparkles className="h-10 w-10 text-amber-400 mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to make your campus safer?</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">Join thousands of students already using CampusConnect AI</p>
              <Button asChild size="lg" className="glow-primary text-lg px-10 py-6 font-semibold">
                <Link to="/auth">Get Started <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
            </div>
          </SpotlightCard>
        </div>
      </section>

      {/* ═══ Footer ═══ */}
      <footer className="py-12 border-t border-white/[0.04] relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-lg text-gradient mb-3">CampusConnect AI</h3>
              <p className="text-sm text-muted-foreground">Smart safety network for educational institutions. Powered by AI, driven by community.</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Features</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>AI Lost & Found</p><p>Emergency Network</p><p>Medical Connect</p><p>Safety Heatmap</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Built For</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>YUKTI Innovation Challenge</p><p>Ministry of Education, India</p><p>Smart Campus Initiative</p>
              </div>
            </div>
          </div>
          <div className="text-center text-xs text-muted-foreground border-t border-white/[0.04] pt-6">
            <p>© 2026 CampusConnect AI — Built for YUKTI Innovation Challenge</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
