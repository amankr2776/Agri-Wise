
'use client';

import React from "react";
import { ExpertVerificationPortal } from "@/components/experts/ExpertVerificationPortal";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { LogOut, FlaskConical, ShieldCheck } from "lucide-react";
import { handleProLogout } from "@/app/actions/auth";
import { useRouter } from "next/navigation";
import { useAppState } from "@/lib/app-state";

/**
 * Locked Expert Panel Page
 * Only accessible via /pro gateway
 */
export default function ProExpertPanel() {
  const router = useRouter();
  const { logout } = useAppState();

  const handleLogout = async () => {
    await handleProLogout();
    logout();
    router.push('/pro/login');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="h-20 border-b glass-card px-10 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-blue-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <FlaskConical className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight">Expert Command Center</h2>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-3 w-3 text-blue-500" />
              <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest leading-none">Verified Scientist Node</p>
            </div>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          onClick={handleLogout}
          className="rounded-xl h-11 px-6 font-black gap-2 text-destructive border-destructive/20 hover:bg-destructive/5 transition-all"
        >
          <LogOut className="h-4 w-4" /> Secure Exit
        </Button>
      </header>

      <main className="p-10">
        <ExpertVerificationPortal />
      </main>
    </div>
  );
}
