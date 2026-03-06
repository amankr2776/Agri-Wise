
'use client';

import React, { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ShieldCheck, 
  Lock, 
  UserCircle, 
  ArrowRight, 
  Loader2,
  AlertCircle,
  FlaskConical,
  Truck,
  Info,
  Zap
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { handleProfessionalLogin } from "@/app/actions/auth";
import { useAppState } from "@/lib/app-state";
import { cn } from "@/lib/utils";

export default function ProfessionalLoginPage() {
  const router = useRouter();
  const { login } = useAppState();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // PREFETCHING: Preload the dashboards while the user is typing
  // This makes the final redirection feel instantaneous
  const handlePrefetch = () => {
    router.prefetch('/pro/expert-panel');
    router.prefetch('/pro/logistics-bridge');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsVerifying(true); // Instant UI feedback

    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      try {
        const result = await handleProfessionalLogin(formData);

        if (result.error) {
          setError(result.error);
          setIsVerifying(false);
        } else if (result.success && result.redirect) {
          // Sync client-side state for UI role management
          const roleName = result.redirect.includes('expert') ? 'Expert' : 'Logistics';
          const displayName = result.redirect.includes('expert') ? 'Dr. Aman Kumar' : 'Simran Singh Transport';
          login(roleName as any, displayName);
          
          // Instant navigation to prefetched route
          router.push(result.redirect);
        }
      } catch (err) {
        setError("National Grid Sync Failed. Please retry.");
        setIsVerifying(false);
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[120px] -z-10" />

      <div className="max-w-md w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center space-y-4">
          <div className="mx-auto h-20 w-20 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-center text-primary shadow-2xl shadow-primary/20">
            <ShieldCheck className="h-10 w-10" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">Professional Gateway</h1>
          <p className="text-slate-400 font-medium">Access the National Agricultural Logistics & Science Grid.</p>
        </div>

        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl shadow-2xl rounded-[2.5rem] overflow-hidden">
          <CardHeader className="space-y-1 p-10">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl text-white font-bold">Partner Authentication</CardTitle>
                <CardDescription className="text-slate-500 italic">Enter verified credentials.</CardDescription>
              </div>
              <Badge variant="outline" className="border-primary/30 text-primary font-black text-[8px] uppercase tracking-widest gap-1">
                <Zap className="h-2 w-2" /> Latency: 0ms
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-10 pt-0 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive rounded-2xl animate-in shake-in">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Access Denied</AlertTitle>
                  <AlertDescription className="text-xs font-medium">{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-2">Unique Partner ID</Label>
                <div className="relative">
                  <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-600" />
                  <Input 
                    name="uniqueId" 
                    placeholder="e.g. AMAN_EXP_01" 
                    required 
                    onFocus={handlePrefetch}
                    onChange={handlePrefetch}
                    className="h-14 bg-slate-950 border-slate-800 text-white rounded-2xl pl-12 focus-visible:ring-primary transition-all" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-2">Secure Passkey</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-600" />
                  <Input 
                    name="password" 
                    type="password" 
                    placeholder="••••••••" 
                    required 
                    onFocus={handlePrefetch}
                    className="h-14 bg-slate-950 border-slate-800 text-white rounded-2xl pl-12 focus-visible:ring-primary transition-all" 
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={isVerifying}
                className={cn(
                  "w-full h-14 rounded-2xl font-black text-lg shadow-xl transition-all active:scale-95",
                  isVerifying ? "bg-slate-800 text-slate-400" : "bg-primary hover:bg-primary/90 text-white shadow-primary/20"
                )}
              >
                {isVerifying ? (
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Verifying Identity...</span>
                  </div>
                ) : (
                  <>Enter National Grid <ArrowRight className="h-5 w-5 ml-2" /></>
                )}
              </Button>
            </form>

            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex gap-3 items-start">
              <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-[9px] font-black text-primary uppercase tracking-widest">Demo Credentials (Prefetched)</p>
                <p className="text-[10px] text-slate-400 font-medium">
                  ID: <span className="text-white font-bold">AMAN_EXP_01</span> (Expert) or <span className="text-white font-bold">SIMRAN_LOG_01</span> (Logistics)
                  <br />
                  Passkey: <span className="text-white font-bold">password123</span>
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="p-8 border-t border-slate-800 bg-slate-950/50 flex flex-col items-center gap-4">
            <div className="flex gap-6 opacity-40">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase text-white tracking-widest">
                <FlaskConical className="h-3 w-3 text-blue-400" /> Experts
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase text-white tracking-widest">
                <Truck className="h-3 w-3 text-primary" /> Logistics
              </div>
            </div>
            <p className="text-[10px] text-slate-600 font-medium tracking-tight">© 2025 KisanMitra Security Node v3.0 (Zero-Latency Edition)</p>
          </CardFooter>
        </Card>

        <div className="text-center">
          <Button 
            variant="link" 
            onClick={() => router.push('/')}
            className="text-slate-500 hover:text-primary font-bold text-xs"
          >
            ← Return to Public Farmer Portal
          </Button>
        </div>
      </div>
    </div>
  );
}
