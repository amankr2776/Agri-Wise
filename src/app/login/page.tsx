'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Leaf, Mail, Phone, Lock, ArrowRight, Loader2, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

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

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "", password: "" },
  });

  const phoneForm = useForm<z.infer<typeof phoneSchema>>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: "", otp: "" },
  });

  // Re-captcha for phone auth
  useEffect(() => {
    if (typeof window !== "undefined" && !window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': () => {}
      });
    }
  }, [auth]);

  async function onEmailSubmit(values: z.infer<typeof emailSchema>) {
    setLoading(true);
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
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: error.message || "Invalid credentials. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  async function onPhoneSubmit(values: z.infer<typeof phoneSchema>) {
    if (!showOtp) {
      setLoading(true);
      try {
        const appVerifier = window.recaptchaVerifier;
        const phoneNumber = `+91${values.phone}`;
        const result = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
        setConfirmationResult(result);
        setShowOtp(true);
        toast({ title: "OTP Sent", description: "Verification code sent to your mobile." });
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "SMS Failed",
          description: error.message || "Could not send OTP. Please check your number.",
        });
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
        toast({
          variant: "destructive",
          title: "Invalid Code",
          description: "The OTP you entered is incorrect.",
        });
      } finally {
        setLoading(false);
      }
    }
  }

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <div id="recaptcha-container"></div>
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary rounded-2xl shadow-xl shadow-primary/20">
              <Leaf className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold font-headline text-primary">AgriWise</h1>
          <p className="text-muted-foreground">Digital intelligence for the modern farmer.</p>
        </div>

        <Card className="border-none shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">{isRegistering ? "Create an account" : "Sign in"}</CardTitle>
            <CardDescription>
              Choose your preferred method to access your dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="email" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="email">Email</TabsTrigger>
                <TabsTrigger value="phone">Mobile</TabsTrigger>
              </TabsList>

              <TabsContent value="email">
                <Form {...emailForm}>
                  <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
                    <FormField
                      control={emailForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input placeholder="farmer@example.com" className="pl-9" {...field} />
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
                              <Input type="password" placeholder="••••••••" className="pl-9" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full h-11" disabled={loading}>
                      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      {isRegistering ? "Create Account" : "Sign In"} <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </form>
                </Form>
              </TabsContent>

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
                            <div className="relative">
                              <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                              <div className="flex gap-2">
                                <span className="flex items-center px-3 border rounded-md bg-muted text-sm font-bold text-muted-foreground">+91</span>
                                <Input placeholder="9876543210" className="flex-1" disabled={showOtp} {...field} />
                              </div>
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
                            <FormLabel>Verification Code (OTP)</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <ShieldCheck className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Enter 6-digit code" className="pl-9" {...field} />
                              </div>
                            </FormControl>
                            <FormDescription>Code sent via SMS.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    <Button type="submit" className="w-full h-11" disabled={loading}>
                      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      {showOtp ? "Verify & Login" : "Send OTP"} <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    {showOtp && (
                      <Button variant="link" className="w-full text-xs" onClick={() => setShowOtp(false)}>
                        Change Phone Number
                      </Button>
                    )}
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>
            <Button variant="outline" className="w-full" onClick={() => setIsRegistering(!isRegistering)}>
              {isRegistering ? "Already have an account? Sign in" : "New to AgriWise? Create account"}
            </Button>
          </CardFooter>
        </Card>
        
        <p className="text-center text-[10px] text-muted-foreground">
          By continuing, you agree to our Terms of Service.
        </p>
      </div>
    </div>
  );
}
