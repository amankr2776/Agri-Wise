
'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Leaf } from "lucide-react";

/**
 * Redirect Page
 * Landing on /login now automatically routes to the main dashboard.
 */
export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/");
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <div className="space-y-6">
        <div className="mx-auto h-20 w-20 bg-primary rounded-3xl flex items-center justify-center text-white shadow-2xl animate-bounce">
          <Leaf className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black tracking-tight">KisanMitra National Grid</h1>
          <p className="text-muted-foreground font-medium italic">Synchronizing Identity...</p>
        </div>
        <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
      </div>
    </div>
  );
}
