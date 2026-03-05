'use client';

import React from "react";
import "./globals.css";
import { FirebaseClientProvider } from "@/firebase/client-provider";
import { Toaster } from "@/components/ui/toaster";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>KisanMitra - National Agricultural Grid</title>
        <meta name="description" content="AI-Powered Agricultural Intelligence and Logistics Hub" />
      </head>
      <body className="antialiased">
        <FirebaseClientProvider>
          {children}
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
