'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppState, UserRole } from '@/lib/app-state';
import { Loader2, ShieldAlert } from 'lucide-react';

/**
 * Role-Based View Protection
 * 
 * Verifies that the user is authenticated and their active state 'role' 
 * matches the intended section of the grid.
 */
export function withRoleAuth<P extends object>(
  Component: React.ComponentType<P>,
  allowedRole: UserRole
) {
  return function RoleProtectedComponent(props: P) {
    const router = useRouter();
    const { role, isAuthenticated } = useAppState();

    useEffect(() => {
      // If not authenticated or role doesn't match, redirect to appropriate entry point
      if (!isAuthenticated) {
        router.push('/pro/login');
        return;
      }

      if (role !== allowedRole) {
        console.warn(`Role Mismatch: App state is ${role}, but this section requires ${allowedRole}.`);
        if (role === 'Expert') router.push('/pro/expert-panel');
        else if (role === 'Logistics') router.push('/pro/logistics-bridge');
        else router.push('/');
      }
    }, [role, isAuthenticated, router]);

    if (!isAuthenticated || role !== allowedRole) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white gap-6">
          <div className="h-20 w-20 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-center text-primary animate-pulse">
            <ShieldAlert className="h-10 w-10" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-xl font-black tracking-tight">Verifying Grid Identity...</h3>
            <p className="text-slate-500 text-sm italic font-medium">Please wait while we sync with the National Grid.</p>
          </div>
          <Loader2 className="h-6 w-6 animate-spin text-slate-700" />
        </div>
      );
    }

    return <Component {...props} />;
  };
}