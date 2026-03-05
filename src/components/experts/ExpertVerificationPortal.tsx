
'use client';

import React, { useState, useEffect, useCallback } from "react";
import { 
  ShieldCheck, 
  FlaskConical, 
  AlertCircle, 
  ClipboardCheck,
  Loader2,
  Database,
  Microscope,
  Trash2,
  Bug,
  Zap,
  Send,
  Edit3,
  MessageSquare,
  Save,
  CheckCircle2,
  Package,
  Truck,
  User,
  History
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { useFirestore, useCollection, useUser, useMemoFirebase } from "@/firebase";
import { collection, query, where, doc, addDoc, getDocs, writeBatch, updateDoc } from "firebase/firestore";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppState } from "@/lib/app-state";
import { useToast } from "@/hooks/use-toast";

export function ExpertVerificationPortal() {
  const firestore = useFirestore();
  const { role } = useAppState();
  const { user } = useUser();
  const { toast } = useToast();
  const [seeding, setSeeding] = useState(false);
  const [activeTab, setActiveTab] = useState("protocols");

  // Fetch Pending Certifications
  const pendingCertsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "crops"), where("isCertified", "==", false));
  }, [firestore]);
  const { data: pendingCerts, isLoading: loadingCerts } = useCollection(pendingCertsQuery);

  // Fetch Logistics Incident Tickets
  const ticketsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "logisticsTickets"), where("status", "in", ["Open", "In Review"]));
  }, [firestore]);
  const { data: tickets, isLoading: loadingTickets } = useCollection(ticketsQuery);

  const handleVerify = (certId: string) => {
    if (!firestore || !certId) return;
    const docRef = doc(firestore, "crops", certId);
    updateDocumentNonBlocking(docRef, {
      isCertified: true,
      verifiedAt: new Date().toISOString(),
      verifiedBy: user?.uid
    });
    toast({ title: "Protocol Certified", description: "Verified and added to the registry." });
  };

  const handleResolveTicket = (ticketId: string) => {
    if (!firestore) return;
    const docRef = doc(firestore, "logisticsTickets", ticketId);
    updateDocumentNonBlocking(docRef, {
      status: "Resolved",
      resolvedAt: new Date().toISOString(),
      resolvedBy: user?.uid
    });
    toast({ title: "Incident Resolved", description: "Farmer has been notified of the resolution." });
  };

  if (role !== "Expert" && role !== "Authority") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="h-20 w-20 bg-destructive/10 rounded-full flex items-center justify-center text-destructive">
          <AlertCircle className="h-10 w-10" />
        </div>
        <h3 className="text-2xl font-black">Expert Access Required</h3>
        <p className="text-muted-foreground max-w-sm">This portal is reserved for certified agricultural scientists and authorities.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black flex items-center gap-3 text-slate-900">
            <ShieldCheck className="h-8 w-8 text-primary" />
            National Grid Command
          </h2>
          <p className="text-muted-foreground font-medium mt-1 uppercase text-[10px] tracking-[0.2em]">Verification Hub & Dispute Resolution</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-muted/50 rounded-full p-1 h-12 mb-10 w-fit">
          <TabsTrigger value="protocols" className="rounded-full px-8 h-10 data-[state=active]:bg-primary data-[state=active]:text-white font-black text-xs uppercase tracking-widest">
            Diagnostic Protocols ({pendingCerts?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="logistics" className="rounded-full px-8 h-10 data-[state=active]:bg-primary data-[state=active]:text-white font-black text-xs uppercase tracking-widest">
            Logistics Tickets ({tickets?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="protocols">
          {loadingCerts ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-80 rounded-[2.5rem]" />)}
            </div>
          ) : !pendingCerts?.length ? (
            <Card className="border-dashed border-2 p-24 text-center bg-muted/20 rounded-[3rem]">
              <ClipboardCheck className="h-12 w-12 text-primary opacity-50 mx-auto mb-8" />
              <h3 className="text-2xl font-black">Protocols Clear</h3>
              <p className="text-muted-foreground mt-2 font-medium">All AI-generated protocols have been certified.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingCerts.map((cert) => (
                <Card key={cert.id} className="border-none shadow-xl bg-white rounded-[2.5rem] overflow-hidden flex flex-col hover:shadow-2xl transition-all">
                  <div className="relative aspect-video">
                    <img src={cert.imageUrl} className="w-full h-full object-cover" alt={cert.name} />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-white/90 text-primary font-black uppercase text-[8px] tracking-widest">Awaiting Scientist</Badge>
                    </div>
                  </div>
                  <CardHeader className="p-8">
                    <CardTitle className="text-2xl font-black">{cert.name}</CardTitle>
                    <p className="text-sm font-bold text-destructive flex items-center gap-2 mt-2">
                      <Bug className="h-4 w-4" /> {cert.diseaseName}
                    </p>
                  </CardHeader>
                  <CardFooter className="p-8 pt-0 mt-auto flex gap-3">
                    <Button variant="outline" className="flex-1 h-12 rounded-xl font-black">Review</Button>
                    <Button className="flex-1 h-12 rounded-xl font-black" onClick={() => handleVerify(cert.id)}>Certify</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="logistics">
          {loadingTickets ? (
            <div className="space-y-6">
              {[1, 2].map((i) => <Skeleton key={i} className="h-40 rounded-[2rem]" />)}
            </div>
          ) : !tickets?.length ? (
            <Card className="border-dashed border-2 p-24 text-center bg-muted/20 rounded-[3rem]">
              <Truck className="h-12 w-12 text-primary opacity-50 mx-auto mb-8" />
              <h3 className="text-2xl font-black">Logistics Grid Smooth</h3>
              <p className="text-muted-foreground mt-2 font-medium">No open disputes or incident reports across national sectors.</p>
            </Card>
          ) : (
            <div className="space-y-6">
              {tickets.map((ticket) => (
                <Card key={ticket.id} className="border-none shadow-xl rounded-[2.5rem] bg-white p-8 hover:shadow-2xl transition-all border-l-8 border-destructive">
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                      <div className="h-16 w-16 bg-destructive/10 rounded-2xl flex items-center justify-center text-destructive">
                        <AlertTriangle className="h-8 w-8" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h4 className="text-xl font-black text-slate-900">{ticket.issueType} Report</h4>
                          <Badge variant="outline" className="bg-destructive/5 text-destructive border-destructive/10 text-[8px] font-black uppercase">{ticket.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                          <User className="h-3.5 w-3.5" /> From Farmer: {ticket.farmerName} (ID: {ticket.farmerId.substring(0, 6)})
                        </p>
                      </div>
                    </div>

                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-600 leading-relaxed italic border-l-2 border-border pl-4">
                        "{ticket.description}"
                      </p>
                    </div>

                    <div className="flex gap-3 w-full lg:w-auto">
                      <Button variant="outline" className="flex-1 lg:w-32 h-12 rounded-xl font-black text-xs uppercase tracking-widest">Details</Button>
                      <Button className="flex-1 lg:w-48 h-12 rounded-xl font-black text-xs uppercase tracking-widest gap-2" onClick={() => handleResolveTicket(ticket.id)}>
                        <ShieldCheck className="h-4 w-4" /> Resolve & Close
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
