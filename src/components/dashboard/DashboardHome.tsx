
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
    { id: "market", label: t("active_alerts"), value: "3", icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10" },
    { id: "market", label: t("best_price"), value: "₹2,150/q", sub: "Wheat (Nashik)", icon: TrendingUp, color: "text-primary", bg: "bg-primary/10" },
    { 
      id: role === "Logistics" ? "fleet" : "logistics", 
      label: t("active_shipments"), 
      value: "2", 
      icon: Truck, 
      color: "text-blue-500", 
      bg: "bg-blue-500/10" 
    },
    { id: "network", label: t("community_posts"), value: "12", icon: Users, color: "text-amber-500", bg: "bg-amber-500/10" },
  ];

  const quickActions = [
    { id: "diagnostics", label: t("ai_scan"), icon: Leaf, desc: "AI Field Scan", color: "text-primary", bg: "bg-primary/10" },
    { id: "market", label: t("market"), icon: Search, desc: "Market Trends", color: "text-blue-500", bg: "bg-blue-500/10" },
    { id: "logistics", label: t("mandi_link"), icon: Truck, desc: "Transport", color: "text-amber-500", bg: "bg-amber-500/10" },
    { id: "network", label: t("network"), icon: MessageCircle, desc: "Community", color: "text-purple-500", bg: "bg-purple-500/10" },
  ];

  const alerts: AlertDetail[] = [
    { 
      id: "alert-1",
      type: "Critical", 
      title: "Locust Swarm Detected", 
      details: "Schistocerca gregaria observed in high density clusters.",
      impact: "Potential 100% crop loss in 12,000 hectares.",
      region: "Rajasthan Border", 
      time: "2h ago", 
      icon: AlertTriangle,
      volatility: "+18% pulse price hike",
      actionPlan: ["Aerial spray", "Trench digging", "Report sightings"],
      traditionalRemedy: "Neem leaf smoke screens and loud drums."
    }
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-primary p-10 md:p-14 text-white shadow-2xl">
        <div className="relative z-10 space-y-4">
          <Badge className="bg-white/20 text-white border-none">{today}</Badge>
          <h1 className="text-4xl md:text-6xl font-black">
            {t("welcome")}, {name || 'Kisan'} Ji!
          </h1>
          <p className="text-xl md:text-2xl text-primary-foreground/80 font-medium">
            {t("field_status", { city: city || 'Local Area' })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="glass-card cursor-pointer rounded-3xl" onClick={() => onNavigate(stat.id)}>
            <CardContent className="p-8 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase text-muted-foreground">{stat.label}</p>
                <p className="text-3xl font-black">{stat.value}</p>
              </div>
              <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center", stat.bg, stat.color)}>
                <stat.icon className="h-7 w-7" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-black flex items-center gap-3">
          <Zap className="h-6 w-6 text-primary" /> {t("shortcuts")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action) => (
            <button key={action.id} onClick={() => onNavigate(action.id)} className="flex flex-col items-center p-10 glass-card rounded-[2.5rem] hover:bg-primary group transition-all">
              <div className={cn("h-16 w-16 mb-6 rounded-2xl flex items-center justify-center group-hover:bg-white/20", action.bg)}>
                <action.icon className={cn("h-8 w-8 group-hover:text-white", action.color)} />
              </div>
              <p className="font-black text-xl group-hover:text-white">{action.label}</p>
              <p className="text-[10px] font-black uppercase opacity-60 group-hover:text-white">{action.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
