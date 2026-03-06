'use client';

import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  FlaskConical, 
  AlertCircle, 
  ClipboardCheck,
  Loader2,
  Microscope,
  Bug,
  Package,
  Truck,
  User,
  AlertTriangle,
  BrainCircuit,
  Info,
  Save,
  Edit3,
  Bot,
  Camera,
  Upload,
  X,
  ImageIcon,
  CheckCircle2
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useFirestore, useCollection, useUser, useMemoFirebase } from "@/firebase";
import { collection, query, where, doc } from "firebase/firestore";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { dispatchGridNotification } from "@/firebase/messaging";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppState } from "@/lib/app-state";
import { useToast } from "@/hooks/use-toast";

export function ExpertVerificationPortal() {
  const firestore = useFirestore();
  const { role, name: expertName } = useAppState();
  const { user } = useUser();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("protocols");
  const [selectedReviewCrop, setSelectedReviewCrop] = useState<any>(null);
  
  // Editable fields for expert modification
  const [editChemicalCure, setEditChemicalCure] = useState("");
  const [editDesiNuskha, setEditDesiNuskha] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");

  // Initialize editable fields when a crop is selected
  useEffect(() => {
    if (selectedReviewCrop) {
      setEditChemicalCure(selectedReviewCrop.chemicalCure || "");
      setEditDesiNuskha(selectedReviewCrop.desiNuskha || "");
      setEditImageUrl(selectedReviewCrop.imageUrl || "");
    }
  }, [selectedReviewCrop]);

  const pendingCertsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "crops"), where("isCertified", "==", false));
  }, [firestore]);
  const { data: pendingCerts, isLoading: loadingCerts } = useCollection(pendingCertsQuery);

  const ticketsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "logisticsTickets"), where("status", "in", ["Open", "In Review"]));
  }, [firestore]);
  const { data: tickets, isLoading: loadingTickets } = useCollection(ticketsQuery);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setEditImageUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleVerify = async (cert: any) => {
    if (!firestore || !cert.id) return;
    const docRef = doc(firestore, "crops", cert.id);
    
    const verificationNotes = `Certified and refined by Scientist ${expertName} on ${new Date().toLocaleDateString()}. Protocol synchronized with National Grid.`;

    updateDocumentNonBlocking(docRef, {
      isCertified: true,
      verifiedAt: new Date().toISOString(),
      verifiedBy: user?.uid,
      verifiedByName: expertName,
      chemicalCure: editChemicalCure || cert.chemicalCure,
      desiNuskha: editDesiNuskha || cert.desiNuskha,
      imageUrl: editImageUrl || cert.imageUrl,
      expertNotes: verificationNotes
    });

    if (cert.reportedBy) {
      dispatchGridNotification(firestore, cert.reportedBy, {
        title: "Scientific Protocol Verified",
        message: `Expert ${expertName} has certified the diagnostic protocol for your ${cert.name}. Check your Solution Library.`,
        type: 'update'
      });
    }

    toast({ 
      title: "Protocol Certified", 
      description: "Verified data has been pushed to the farmer's grid." 
    });
    setSelectedReviewCrop(null);
  };

  if (role !== "Expert" && role !== "Authority") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="h-20 w-20 bg-destructive/10 rounded-full flex items-center justify-center text-destructive">
          <AlertCircle className="h-10 w-10" />
        </div>
        <h3 className="text-2xl font-black">Expert Access Required</h3>
        <p className="text-muted-foreground max-w-sm">This hub is reserved for certified botanical scientists.</p>
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
          <p className="text-muted-foreground font-medium mt-1 uppercase text-[10px] tracking-[0.2em]">Botanical Verification & Precision Audit</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-muted/50 rounded-full p-1 h-12 mb-10 w-fit">
          <TabsTrigger value="protocols" className="rounded-full px-8 h-10 data-[state=active]:bg-primary data-[state=active]:text-white font-black text-xs uppercase tracking-widest">
            Audit Protocols ({pendingCerts?.length || 0})
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
              <h3 className="text-2xl font-black">All Protocols Audited</h3>
              <p className="text-muted-foreground mt-2 font-medium">The diagnostic grid is fully certified.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingCerts.map((cert) => (
                <Card key={cert.id} className="border-none shadow-xl bg-white rounded-[2.5rem] overflow-hidden flex flex-col hover:shadow-2xl transition-all">
                  <div className="relative aspect-video">
                    <img src={cert.imageUrl} className="w-full h-full object-cover" alt={cert.name} />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-white/90 text-primary font-black uppercase text-[8px] tracking-widest">Pending Certification</Badge>
                    </div>
                  </div>
                  <CardHeader className="p-8">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-2xl font-black">{cert.name}</CardTitle>
                      <Badge variant="outline" className="text-[10px] font-black uppercase border-destructive/20 text-destructive">{cert.diseaseName}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 font-bold">Reported By: {cert.reportedByName || "Local Node"}</p>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2 italic font-medium">"{cert.symptoms}"</p>
                  </CardHeader>
                  <CardFooter className="p-8 pt-0 mt-auto flex gap-3">
                    <Button variant="outline" className="flex-1 h-12 rounded-xl font-black gap-2" onClick={() => setSelectedReviewCrop(cert)}>
                      <Edit3 className="h-4 w-4" /> Review & Edit
                    </Button>
                    <Button className="flex-1 h-12 rounded-xl font-black" onClick={() => handleVerify(cert)}>Certify Now</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="logistics">
          <div className="space-y-6">
            {tickets?.map((ticket) => (
              <Card key={ticket.id} className="border-none shadow-xl rounded-[2.5rem] bg-white p-8 border-l-8 border-destructive">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                  <div className="flex items-center gap-6">
                    <div className="h-16 w-16 bg-destructive/10 rounded-2xl flex items-center justify-center text-destructive">
                      <AlertTriangle className="h-8 w-8" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xl font-black">{ticket.issueType} Report</h4>
                      <p className="text-sm text-muted-foreground font-medium">Farmer: {ticket.farmerName}</p>
                    </div>
                  </div>
                  <Button className="h-12 px-8 rounded-xl font-black">Resolve Incident</Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Logic Verification & Editing Dialog */}
      <Dialog open={!!selectedReviewCrop} onOpenChange={() => setSelectedReviewCrop(null)}>
        <DialogContent className="rounded-[3rem] sm:max-w-2xl p-10 overflow-hidden">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <BrainCircuit className="h-6 w-6" />
              </div>
              <DialogTitle className="text-2xl font-black tracking-tight">Protocol Refinement Audit</DialogTitle>
            </div>
            <DialogDescription className="italic font-medium">Verify AI reasoning, modify suggested protocols, and audit field evidence for {selectedReviewCrop?.name}.</DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-8 pt-6">
              {/* Field Evidence / Image Audit Section */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" /> Field Evidence Audit
                </h4>
                <div className="relative group rounded-3xl overflow-hidden border-4 border-muted/30 shadow-xl aspect-video bg-muted/50">
                  {editImageUrl ? (
                    <img src={editImageUrl} className="w-full h-full object-cover" alt="Audit Evidence" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center opacity-30">
                      <Camera className="h-12 w-12 mb-2" />
                      <p className="text-xs font-bold">No evidence attached</p>
                    </div>
                  )}
                  <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white">
                    <Upload className="h-10 w-10 mb-2" />
                    <span className="font-black text-xs uppercase">Replace with High-Res Reference</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                  {editImageUrl !== selectedReviewCrop?.imageUrl && (
                    <button 
                      onClick={() => setEditImageUrl(selectedReviewCrop?.imageUrl)}
                      className="absolute top-4 right-4 bg-destructive text-white p-2 rounded-full shadow-lg"
                      title="Revert to Original"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground italic text-center">Experts can replace farmer photos with certified botanical reference images for the library.</p>
              </div>

              {/* AI Logic Trace */}
              <div className="p-6 rounded-3xl bg-muted/30 border space-y-4">
                <h4 className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
                  <Info className="h-4 w-4" /> AI Scientific Logic Trace
                </h4>
                <p className="text-sm font-medium text-slate-700 leading-relaxed italic border-l-4 border-primary/20 pl-4">
                  "{selectedReviewCrop?.aiReasoning || "No multi-step trace available for this record."}"
                </p>
              </div>

              {/* AI Initial Recommendations (Read-Only) */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase text-amber-600 tracking-widest flex items-center gap-2">
                  <Bot className="h-4 w-4" /> AI Proposed Solutions (Original)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 space-y-1">
                    <p className="text-[8px] font-black text-amber-600 uppercase">AI Neutralizer</p>
                    <p className="text-xs font-bold text-slate-700">"{selectedReviewCrop?.chemicalCure || "None suggested"}"</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 space-y-1">
                    <p className="text-[8px] font-black text-amber-600 uppercase">AI Heritage Wisdom</p>
                    <p className="text-xs font-bold text-slate-700 italic">"{selectedReviewCrop?.desiNuskha || "None suggested"}"</p>
                  </div>
                </div>
              </div>

              {/* Expert Editable Fields */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground ml-2">Professional Neutralizer (Expert Override)</Label>
                  <Textarea 
                    value={editChemicalCure}
                    onChange={(e) => setEditChemicalCure(e.target.value)}
                    placeholder="Refine the chemical or biological protocol..."
                    className="rounded-xl bg-muted/30 border-none font-bold min-h-[80px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground ml-2">Heritage Wisdom / Desi Nuskha (Expert Override)</Label>
                  <Textarea 
                    value={editDesiNuskha}
                    onChange={(e) => setEditDesiNuskha(e.target.value)}
                    placeholder="Modify the traditional remedy based on expert experience..."
                    className="rounded-xl bg-muted/30 border-none font-bold min-h-[80px]"
                  />
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="mt-10 flex gap-4">
            <Button variant="outline" className="flex-1 rounded-xl font-black" onClick={() => setSelectedReviewCrop(null)}>Discard Changes</Button>
            <Button className="flex-1 rounded-xl font-black gap-2" onClick={() => handleVerify(selectedReviewCrop)}>
              <Save className="h-4 w-4" /> Certify & Synchronize
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}