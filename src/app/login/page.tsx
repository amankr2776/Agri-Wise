'use client';

import React from "react";
import { useRouter } from "next/navigation";
import { Leaf, User, FlaskConical, Truck, ShieldCheck, ArrowRight, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppState, UserRole } from "@/lib/app-state";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function RoleSelectorPage() {
  const router = useRouter();
  const { login } = useAppState();

  const handleRoleSelect = (role: UserRole, name: string) => {
    login(role, name);
    if (role === 'Expert') router.push('/pro/expert-panel');
    else if (role === 'Logistics') router.push('/pro/logistics-bridge');
    else router.push('/');
  };

  const roles = [
    {
      id: 'Farmer',
      title: 'Farmer Perspective',
      name: 'Rajesh Kumar',
      icon: Leaf,
      desc: 'Access crop diagnostics, Mandi rates, and logistics.',
      color: 'bg-primary',
      shadow: 'shadow-primary/20',
      border: 'border-primary/20'
    },
    {
      id: 'Expert',
      title: 'Expert Perspective',
      name: 'Dr. Aman Kumar',
      icon: FlaskConical,
      desc: 'Certify field protocols and monitor regional pathogens.',
      color: 'bg-blue-600',
      shadow: 'shadow-blue-600/20',
      border: 'border-blue-600/20'
    },
    {
      id: 'Logistics',
      title: 'Logistics Perspective',
      name: 'Simran Singh Transport',
      icon: Truck,
      desc: 'Manage service fleets and dispatch harvest loads.',
      color: 'bg-amber-600',
      shadow: 'shadow-amber-600/20',
      border: 'border-amber-600/20'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[120px] -z-10" />

      <div className="max-w-4xl w-full space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center space-y-4">
          <div className="mx-auto h-24 w-24 bg-slate-900 border border-slate-800 rounded-[2.5rem] flex items-center justify-center text-primary shadow-2xl shadow-primary/20 animate-bounce">
            <Leaf className="h-12 w-12" />
          </div>
          <div className="space-y-2">
            <h1 className="text-5xl font-black tracking-tighter text-white">National Grid Gateway</h1>
            <p className="text-slate-400 font-medium text-xl italic">Select your professional perspective to enter the grid.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {roles.map((role, i) => (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card 
                onClick={() => handleRoleSelect(role.id as UserRole, role.name)}
                className={cn(
                  "h-full border-slate-800 bg-slate-900/50 backdrop-blur-xl shadow-2xl rounded-[3rem] overflow-hidden group cursor-pointer hover:scale-105 active:scale-95 transition-all duration-500",
                  "hover:border-primary/50"
                )}
              >
                <CardHeader className="p-10 pb-6 space-y-6">
                  <div className={cn(
                    "h-20 w-20 rounded-[2rem] flex items-center justify-center text-white transition-transform group-hover:rotate-12",
                    role.color
                  )}>
                    <role.icon className="h-10 w-10" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-black text-white tracking-tight">{role.title}</CardTitle>
                    <CardDescription className="text-slate-500 mt-2 font-medium italic">{role.name}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-10 pt-0">
                  <p className="text-slate-400 text-sm leading-relaxed mb-10">
                    {role.desc}
                  </p>
                  <Button className={cn(
                    "w-full h-14 rounded-2xl font-black text-lg gap-2 shadow-xl opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all",
                    role.color,
                    role.shadow
                  )}>
                    Enter Grid <ArrowRight className="h-5 w-5" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-3 px-6 py-2 bg-slate-900/50 border border-slate-800 rounded-full">
            <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">National Agricultural Intelligence Grid v4.5</p>
          </div>
          <div className="flex items-center gap-2 text-slate-600 text-[10px] font-bold uppercase tracking-widest">
            <ShieldCheck className="h-3 w-3" /> Identity Sync Secured via Biometric Handshake
          </div>
        </div>
      </div>
    </div>
  );
}
