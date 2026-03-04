
'use client';

import React from "react";
import { useRouter } from "next/navigation";
import { 
  Leaf, 
  ShieldCheck, 
  Truck, 
  Users, 
  ChevronRight,
  FlaskConical,
  Globe
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppState, UserRole } from "@/lib/app-state";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAppState();

  const roles = [
    { 
      id: "Farmer" as UserRole, 
      label: "Kisan (Farmer)", 
      desc: "Access crop diagnostics, Mandi prices, and community advice.", 
      icon: Leaf, 
      color: "bg-green-500",
      accent: "text-green-600"
    },
    { 
      id: "Expert" as UserRole, 
      label: "Agri-Scientist", 
      desc: "Verify traditional remedies and professional protocols.", 
      icon: FlaskConical, 
      color: "bg-blue-500",
      accent: "text-blue-600"
    },
    { 
      id: "Authority" as UserRole, 
      label: "Govt. Authority", 
      desc: "Monitor regional outbreaks and market inflation trends.", 
      icon: Globe, 
      color: "bg-amber-500",
      accent: "text-amber-600"
    },
    { 
      id: "Logistics" as UserRole, 
      label: "Logistics Provider", 
      desc: "Manage your transport fleet and Mandi-Link deliveries.", 
      icon: Truck, 
      color: "bg-slate-700",
      accent: "text-slate-800"
    },
  ];

  const handleRoleSelection = (roleId: UserRole) => {
    login(roleId);
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-accent/5 rounded-full blur-3xl -z-10" />

      <div className="max-w-4xl w-full space-y-12 text-center">
        <div className="space-y-4">
          <div className="mx-auto h-20 w-20 bg-primary rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-primary/20 animate-bounce">
            <Leaf className="h-10 w-10" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900">
            Identify Your Role
          </h1>
          <p className="text-lg text-muted-foreground font-medium max-w-xl mx-auto">
            Welcome to <span className="text-primary font-bold text-xl">KisanMitra</span>. Please select your professional profile to access the agricultural grid.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {roles.map((role) => (
            <Card 
              key={role.id}
              onClick={() => handleRoleSelection(role.id)}
              className="group cursor-pointer border-none shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 rounded-[2.5rem] bg-white overflow-hidden text-left"
            >
              <CardContent className="p-8 flex items-center gap-6">
                <div className={`h-16 w-16 ${role.color} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                  <role.icon className="h-8 w-8" />
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className={`text-2xl font-black tracking-tight ${role.accent}`}>{role.label}</h3>
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed">{role.desc}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                  <ChevronRight className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="pt-8 border-t flex flex-col md:flex-row items-center justify-center gap-8 opacity-60">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest">
            <ShieldCheck className="h-4 w-4 text-primary" /> Verified Agricultural Intelligence
          </div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest">
            <Users className="h-4 w-4 text-primary" /> Collaborative Farmer Network
          </div>
        </div>
      </div>
    </div>
  );
}
