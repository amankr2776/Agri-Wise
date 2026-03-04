
'use client';

import React, { useMemo, useState } from "react";
import { 
  AlertTriangle, 
  TrendingUp, 
  Truck, 
  Users, 
  Leaf, 
  Search, 
  MessageCircle, 
  ChevronRight,
  Zap,
  Info,
  ShieldAlert,
  MapPin,
  Activity,
  FlaskConical,
  Bug,
  Clock
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { useAppState } from "@/lib/app-state";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface DashboardHomeProps {
  onNavigate: (section: string) => void;
}

interface AlertDetail {
  id: string;
  type: "Critical" | "Warning" | "Info";
  title: string;
  details: string;
  impact: string;
  region: string;
  time: string;
  actionPlan: string[];
  traditionalRemedy: string;
  volatility: string;
  icon: any;
}

export function DashboardHome({ onNavigate }: DashboardHomeProps) {
  const { name, city, role } = useAppState();
  const { t } = useTranslation();
  const [selectedAlert, setSelectedAlert] = useState<AlertDetail | null>(null);

  const today = useMemo(() => {
    return new Date().toLocaleDateString('en-IN', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  }, []);

  const lastUpdated = useMemo(() => {
    return new Date().toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }, []);

  const stats = [
    { id: "market", label: "Active Alerts", value: "3", icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10" },
    { id: "market", label: "Best Price Today", value: "₹2,150/q", sub: "Wheat (Nashik)", icon: TrendingUp, color: "text-primary", bg: "bg-primary/10" },
    { 
      id: role === "Logistics" ? "fleet" : "logistics", 
      label: "Active Shipments", 
      value: "2", 
      icon: Truck, 
      color: "text-blue-500", 
      bg: "bg-blue-500/10" 
    },
    { id: "network", label: "Community Posts", value: "12", icon: Users, color: "text-amber-500", bg: "bg-amber-500/10" },
  ];

  const quickActions = [
    { id: "diagnostics", label: t("ai_scan"), icon: Leaf, desc: "AI-powered pest detection", color: "text-primary", bg: "bg-primary/10" },
    { id: "market", label: t("market"), icon: Search, desc: "Live Mandi price trends", color: "text-blue-500", bg: "bg-blue-500/10" },
    { id: "logistics", label: "Book Transport", icon: Truck, desc: "Mandi-Link delivery", color: "text-amber-500", bg: "bg-amber-500/10" },
    { id: "network", label: t("network"), icon: MessageCircle, desc: "Kisan Network discussions", color: "text-purple-500", bg: "bg-purple-500/10" },
  ];

  const alerts: AlertDetail[] = [
    { 
      id: "alert-1",
      type: "Critical", 
      title: "Locust Swarm Detected", 
      details: "Schistocerca gregaria (Desert Locust) observed in high density clusters migrating from the western corridor.",
      impact: "Potential 100% crop loss in 12,000 hectares if not contained within 48 hours.",
      region: "Rajasthan Border (Jaisalmer Sector)", 
      time: "2h ago", 
      icon: AlertTriangle,
      volatility: "+18% projected price hike in pulse category",
      actionPlan: [
        "Immediate aerial spray of Malathion 95% ULV.",
        "Manual digging of trenches to trap crawlers.",
        "Report sightings to local agricultural outpost immediately."
      ],
      traditionalRemedy: "Create smoke screens using dried neem leaves and beat loud drums/utensils to deter swarms from settling on fields."
    },
    // ... other alerts
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-10">
      <motion.div variants={itemVariants} className="relative overflow-hidden rounded-[2.5rem] bg-primary p-10 md:p-14 text-white shadow-2xl shadow-primary/20">
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <Leaf className="h-72 w-72 rotate-12" />
        </div>
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-3">
            <Badge className="bg-white/20 text-white border-none backdrop-blur-md px-4 py-1 font-black text-[10px] uppercase tracking-widest">
              {today}
            </Badge>
            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-white/60">
              <Clock className="h-3 w-3" /> Grid updated at {lastUpdated}
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter">
            {t("welcome")}, {name || 'Aman Kumar'} Ji!
          </h1>
          <p className="text-xl md:text-2xl text-primary-foreground/80 max-w-2xl font-medium leading-relaxed">
            {t("field_status", { city: city || 'Bengaluru' })}
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div key={i} variants={itemVariants}>
            <Card className="glass-card border-white/20 shadow-xl hover:shadow-primary/10 hover:scale-[1.03] transition-all cursor-pointer rounded-3xl" onClick={() => onNavigate(stat.id)}>
              <CardContent className="p-8 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-black">{stat.value}</p>
                  {stat.sub && <p className="text-[10px] text-primary font-black uppercase italic">{stat.sub}</p>}
                </div>
                <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg", stat.bg, stat.color)}>
                  <stat.icon className="h-7 w-7" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
          <Zap className="h-6 w-6 text-primary" /> 
          Agri-Intelligence Shortcuts
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action) => (
            <motion.button key={action.id} variants={itemVariants} whileHover={{ scale: 1.05 }} onClick={() => onNavigate(action.id)} className="group flex flex-col items-center justify-center p-10 glass-card border-white/20 rounded-[2.5rem] hover:bg-primary transition-all duration-500 shadow-xl text-center">
              <div className={cn("h-16 w-16 mb-6 rounded-[1.5rem] flex items-center justify-center transition-all duration-500 group-hover:bg-white/20 group-hover:scale-110", action.bg)}>
                <action.icon className={cn("h-8 w-8 group-hover:text-white transition-colors", action.color)} />
              </div>
              <p className="font-black text-xl mb-1 group-hover:text-white transition-colors">{action.label}</p>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60 group-hover:text-white/70 transition-colors">{action.desc}</p>
            </motion.button>
          ))}
        </div>
      </div>
      
      {/* ... Recent Alerts Mapping ... */}
    </motion.div>
  );
}
