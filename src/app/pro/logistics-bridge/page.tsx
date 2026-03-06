'use client';

import React from "react";
import { FleetManagement } from "@/components/logistics/FleetManagement";
import { Button } from "@/components/ui/button";
import { LogOut, Truck, Globe } from "lucide-react";
import { handleProfessionalLogout } from "@/app/actions/auth";
import { useRouter } from "next/navigation";
import { useAppState } from "@/lib/app-state";

/**
 * Locked Logistics Bridge Page
 * Only accessible via /pro gateway
 */
export default function ProLogisticsBridge() {
  const router = useRouter();
  const { logout } = useAppState();

  const handleLogout = async () => {
    await handleProfessionalLogout();
    logout();
    router.push('/pro/login');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="h-20 border-b glass-card px-10 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <Truck className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight">National Logistics Bridge</h2>
            <div className="flex items-center gap-2">
              <Globe className="h-3 w-3 text-primary" />
              <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest leading-none">Verified Dispatch Node</p>
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
        <FleetManagement />
      </main>
    </div>
  );
}
