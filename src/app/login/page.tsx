
'use client';

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/firebase";
import { 
  signInWithEmailAndPassword, 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  ConfirmationResult
} from "firebase/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Leaf, Mail, Lock, ArrowRight, Loader2, ShieldCheck, AlertCircle, Phone, Globe } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier;
  }
}

const emailSchema = z.object({
  email: z.string().email({ message: "Please enter a valid work email." }),
  password: z.string().min(6, { message: "Security protocol requires 6+ chars." }),
});

const phoneSchema = z.object({
  phone: z.string().regex(/^[0-9]{10}$/, { message: "10-digit mobile number required." }),
  otp: z.string().optional(),
});

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const recaptchaRef = useRef<HTMLDivElement>(null);

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "", password: "" },
  });

  const phoneForm = useForm<z.infer<typeof phoneSchema>>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: "", otp: "" },
  });

  useEffect(() => {
    if (typeof window !== "undefined" && !window.recaptchaVerifier && auth && recaptchaRef.current) {
      try {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaRef.current, {
          'size': 'invisible',
        });
      } catch (e) {
        console.error("Recaptcha init failed", e);
      }
    }
  }, [auth]);

  async function onEmailSubmit(values: z.infer<typeof emailSchema>) {
    setLoading(true);
    setAuthError(null);
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      toast({ title: "Authorized", description: "Accessing professional dashboard." });
      router.push("/");
    } catch (error: any) {
      setAuthError(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function onPhoneSubmit(values: z.infer<typeof phoneSchema>) {
    setAuthError(null);
    if (!showOtp) {
      setLoading(true);
      try {
        const appVerifier = window.recaptchaVerifier;
        if (!appVerifier) throw new Error("Verifier not ready");
        const result = await signInWithPhoneNumber(auth, `+91${values.phone}`, appVerifier);
        setConfirmationResult(result);
        setShowOtp(true);
        toast({ title: "OTP Dispatched", description: "Verification code sent." });
      } catch (error: any) {
        setAuthError(error.message);
      } finally {
        setLoading(false);
      }
      return;
    }

    if (values.otp && confirmationResult) {
      setLoading(true);
      try {
        await confirmationResult.confirm(values.otp);
        toast({ title: "Verified", description: "Identity confirmed." });
        router.push("/");
      } catch (error: any) {
        setAuthError("Verification failed. Please check OTP.");
      } finally {
        setLoading(false);
      }
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div ref={recaptchaRef}></div>
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary rounded-2xl shadow-xl shadow-primary/20">
              <Leaf className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold font-headline text-white tracking-tight">AgriWise</h1>
          <p className="text-slate-400">Professional Agricultural Partner Portal</p>
        </div>

        {authError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription className="text-xs">
              {authError}
            </AlertDescription>
          </Alert>
        )}

        <Card className="border-none shadow-2xl overflow-hidden bg-white">
          <CardHeader className="bg-slate-50 pb-8">
            <CardTitle className="text-xl flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Secure Login
            </CardTitle>
            <CardDescription>
              Professional credentials required for system access.
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-[-20px] bg-white rounded-t-[30px] pt-8 space-y-6">
            <Tabs defaultValue="phone" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="phone">Mobile Verification</TabsTrigger>
                <TabsTrigger value="email">Work Email</TabsTrigger>
              </TabsList>

              <TabsContent value="phone">
                <Form {...phoneForm}>
                  <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-4">
                    <FormField
                      control={phoneForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Professional Mobile No.</FormLabel>
                          <FormControl>
                            <div className="flex gap-2">
                              <span className="flex items-center px-3 border rounded-md bg-muted text-sm font-bold text-slate-600">+91</span>
                              <Input placeholder="9876543210" className="flex-1 h-11" disabled={showOtp} {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {showOtp && (
                      <FormField
                        control={phoneForm.control}
                        name="otp"
                        render={({ field }) => (
                          <FormItem className="animate-in fade-in slide-in-from-top-2">
                            <FormLabel>OTP Verification Code</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <ShieldCheck className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Enter 6-digit code" className="pl-9 h-11" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    <Button type="submit" className="w-full h-11 font-bold rounded-lg" disabled={loading}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {showOtp ? "Verify Identity" : "Generate OTP"} <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="email">
                <Form {...emailForm}>
                  <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
                    <FormField
                      control={emailForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>System ID / Email</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input placeholder="name@agency.gov.in" className="pl-9 h-11" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={emailForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Security Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input type="password" placeholder="••••••••" className="pl-9 h-11" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full h-11 font-bold rounded-lg" disabled={loading}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Authenticate Session <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="bg-white pb-6 pt-0 border-t flex flex-col items-center">
            <div className="mt-4 flex items-center gap-2 text-[10px] text-slate-400 uppercase tracking-widest font-bold">
              <Globe className="h-3 w-3" />
              Professional Access Only
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
