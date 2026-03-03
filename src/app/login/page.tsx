'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  ConfirmationResult
} from "firebase/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Leaf, Mail, Phone, Lock, ArrowRight, Loader2, ShieldCheck, AlertCircle } from "lucide-react";

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

// Extend window interface for Recaptcha
declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier;
  }
}

const emailSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

const phoneSchema = z.object({
  phone: z.string().regex(/^[0-9]{10}$/, { message: "Please enter a valid 10-digit mobile number." }),
  otp: z.string().optional(),
});

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "", password: "" },
  });

  const phoneForm = useForm<z.infer<typeof phoneSchema>>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: "", otp: "" },
  });

  useEffect(() => {
    // Initialize invisible recaptcha
    if (typeof window !== "undefined" && !window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'invisible-recaptcha', {
          'size': 'invisible',
          'callback': () => {
            // reCAPTCHA solved - will proceed with signInWithPhoneNumber automatically
          },
          'expired-callback': () => {
            toast({ variant: "destructive", title: "reCAPTCHA Expired", description: "Please try again." });
          }
        });
      } catch (e) {
        console.error("Recaptcha initialization failed:", e);
      }
    }
  }, [auth, toast]);

  async function onEmailSubmit(values: z.infer<typeof emailSchema>) {
    setLoading(true);
    setAuthError(null);
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, values.email, values.password);
        toast({ title: "Account created!", description: "Welcome to AgriWise." });
      } else {
        await signInWithEmailAndPassword(auth, values.email, values.password);
        toast({ title: "Welcome back!", description: "Logged in successfully." });
      }
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
        if (!appVerifier) throw new Error("Recaptcha not initialized");
        
        const phoneNumber = `+91${values.phone}`;
        const result = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
        setConfirmationResult(result);
        setShowOtp(true);
        toast({ title: "OTP Sent", description: "Verification code sent to your mobile." });
      } catch (error: any) {
        let message = error.message;
        if (error.code === 'auth/billing-not-enabled') {
          message = "Mobile OTP requires a billing account. Please use Email login or add a test number in Firebase Console.";
        }
        setAuthError(message);
      } finally {
        setLoading(false);
      }
      return;
    }

    if (values.otp && confirmationResult) {
      setLoading(true);
      try {
        await confirmationResult.confirm(values.otp);
        toast({ title: "Success!", description: "Logged in with phone number." });
        router.push("/");
      } catch (error: any) {
        setAuthError("Incorrect OTP. Please check and try again.");
      } finally {
        setLoading(false);
      }
    }
  }

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <div id="invisible-recaptcha"></div>
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary rounded-2xl shadow-xl shadow-primary/20">
              <Leaf className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold font-headline text-primary tracking-tight">AgriWise</h1>
          <p className="text-muted-foreground">The digital companion for every Indian farmer.</p>
        </div>

        {authError && (
          <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Authentication Issue</AlertTitle>
            <AlertDescription className="text-xs">
              {authError}
            </AlertDescription>
          </Alert>
        )}

        <Card className="border-none shadow-2xl overflow-hidden bg-white">
          <CardHeader className="bg-primary/5 pb-8">
            <CardTitle className="text-xl">{isRegistering ? "Register Account" : "Farmer Login"}</CardTitle>
            <CardDescription>
              Select your preferred method to access your dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-[-20px] bg-white rounded-t-[30px] pt-8 space-y-6">
            <Tabs defaultValue="phone" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="phone">Mobile OTP</TabsTrigger>
                <TabsTrigger value="email">Email</TabsTrigger>
              </TabsList>

              <TabsContent value="phone">
                <Form {...phoneForm}>
                  <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-4">
                    <FormField
                      control={phoneForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mobile Number</FormLabel>
                          <FormControl>
                            <div className="flex gap-2">
                              <span className="flex items-center px-3 border rounded-md bg-muted text-sm font-bold">+91</span>
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
                            <FormLabel>6-Digit OTP</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <ShieldCheck className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Enter OTP" className="pl-9 h-11" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    <Button type="submit" className="w-full h-11 font-bold rounded-lg" disabled={loading}>
                      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      {showOtp ? "Verify & Login" : "Send OTP"} <ArrowRight className="ml-2 h-4 w-4" />
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
                          <FormLabel>Email ID</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input placeholder="farmer@example.com" className="pl-9 h-11" {...field} />
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
                          <FormLabel>Password</FormLabel>
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
                      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      {isRegistering ? "Create Account" : "Sign In"} <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="bg-white pb-6 pt-0">
            <Button variant="link" className="w-full text-xs text-muted-foreground" onClick={() => setIsRegistering(!isRegistering)}>
              {isRegistering ? "Already registered? Login here" : "New to AgriWise? Register now"}
            </Button>
          </CardFooter>
        </Card>
        
        <p className="text-center text-[10px] text-muted-foreground">
          Note: For testing Phone Auth, use test numbers provided in Firebase Console.
        </p>
      </div>
    </div>
  );
}
