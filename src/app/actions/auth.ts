
'use server';

import { cookies } from 'next/headers';

/**
 * National Grid Professional Partner Registry (Mock Data)
 * In a production environment, this would verify against a secure DB or Custom Claims.
 */
const PRO_PARTNERS = [
  { 
    uniqueId: 'AMAN_EXP_01', 
    password: 'password123', 
    role: 'expert', 
    name: 'Dr. Aman Kumar',
    redirect: '/pro/expert-panel'
  },
  { 
    uniqueId: 'SIMRAN_LOG_01', 
    password: 'password123', 
    role: 'logistics', 
    name: 'Simran Singh Transport',
    redirect: '/pro/logistics-bridge'
  }
];

/**
 * Professional Login Server Action
 * Validates Partner ID and sets a secure session cookie.
 */
export async function handleProfessionalLogin(formData: FormData) {
  const uniqueId = formData.get('uniqueId') as string;
  const password = formData.get('password') as string;

  const partner = PRO_PARTNERS.find(
    p => p.uniqueId === uniqueId && p.password === password
  );

  if (!partner) {
    return { 
      error: "Access Denied: This portal is for verified partners only. Please check your Unique ID." 
    };
  }

  const cookieStore = await cookies();
  
  // Set a secure session cookie for the pro gateway
  cookieStore.set('professional_session', JSON.stringify({
    id: partner.uniqueId,
    role: partner.role,
    name: partner.name
  }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 8, // 8 Hour session for expert shifts
    path: '/'
  });

  return { success: true, redirect: partner.redirect };
}

/**
 * Professional Logout Server Action
 */
export async function handleProfessionalLogout() {
  const cookieStore = await cookies();
  cookieStore.delete('professional_session');
}
