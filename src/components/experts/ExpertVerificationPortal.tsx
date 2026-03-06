'use client';

import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  CheckCircle2,
  Plus,
  Search,
  Trash2,
  Calendar,
  History,
  MessageCircle,
  ArrowRight,
  Globe,
  Award,
  Zap,
  RefreshCw,
  Activity,
  UserCheck
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
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useFirestore, useCollection, useUser, useMemoFirebase } from "@/firebase";
import { collection, query, where, doc, orderBy, limit } from "firebase/firestore";
import { updateDocumentNonBlocking, addDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { dispatchGridNotification } from "@/firebase/messaging";
import { useAppState } from "@/lib/app-state";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export function ExpertVerificationPortal() {
  const firestore = useFirestore();
  const { role, name: expertName } = useAppState();
  const { user } = useUser();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("protocols");
  const [searchQuery, setSearchQuery] = useState("");
  
  const [selectedReviewCrop, setSelectedReviewCrop] = useState<any>(null);
  const [isAddCropOpen, setIsAddCropOpen] = useState(false);

  const [editName, setEditName] = useState("");
  const [editDisease, setEditDisease] = useState("");
  const [editChemicalCure, setEditChemicalCure] = useState("");
  const [editDesiNuskha, setEditDesiNuskha] = useState("");
  const [editExpertPov, setEditExpertPov] = useState("");
  const [isCertifiedToggle, setIsCertifiedToggle] = useState(false);

  const pendingCertsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "crops"), where("status", "==", "pending_expert_review"), limit(20));
  }, [firestore]);
  const { data: pendingCerts, isLoading: loadingCerts } = useCollection(pendingCertsQuery);

  const inventoryQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "crops"), where("isCertified", "==", true), limit(50));
  }, [firestore]);
  const { data: inventory } = useCollection(inventoryQuery);

  useEffect(() => {
    if (selectedReviewCrop) {
      setEditName(selectedReviewCrop.name || "");
      setEditDisease(selectedReviewCrop.diseaseName || "");
      const primarySol = selectedReviewCrop.pinnedSolution || (selectedReviewCrop.solutions ? selectedReviewCrop.solutions[0] : null);
      setEditChemicalCure(primarySol?.chemicalCure || "");
      setEditDesiNuskha(primarySol?.traditionalRemedy || "");
      setEditExpertPov(selectedReviewCrop.expertNotes || "");
      setIsCertifiedToggle(selectedReviewCrop.isCertified || false);
    }
  }, [selectedReviewCrop]);

  const handleCertifyProtocol = async () => {
    if (!firestore || !user || !selectedReviewCrop) return;

    const pinnedSolution = {
      chemicalCure: editChemicalCure,
      traditionalRemedy: editDesiNuskha,
      detailedSteps: ["Follow expert dosage strictly.", "Apply at early dawn for best absorption.", "Certified by National Scientist Node."]
    };

    const finalData = {
      name: editName,
      diseaseName: editDisease,
      pinnedSolution,
      isCertified: true,
      status: "resolved",
      verifiedBy: user.uid,
      verifiedByName: expertName,
      verifiedAt: new Date().toISOString(),
      expertNotes: editExpertPov || `Protocol certified by ${expertName}. This pinned path overrides sequence rotation.`
    };

    updateDocumentNonBlocking(doc(firestore, "crops", selectedReviewCrop.id), finalData);
    
    if (selectedReviewCrop.reportedBy) {
      dispatchGridNotification(firestore, selectedReviewCrop.reportedBy, {
        title: "Scientific Pin Issued",
        message: `Expert ${expertName} has pinned a verified protocol for your ${finalData.name}.`,
        type: 'update'
      });
    }
    
    setSelectedReviewCrop(null);
    toast({ title: "Grid Certified", description: "Protocol pinned and rotation disabled for this record." });
  };

  if (role !== "Expert" && role !== "Authority") return null;

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black flex items-center gap-4 text-slate-900 tracking-tighter">
            <Microscope className="h-10 w-10 text-primary" />
            Scientific Audit Center
          </h2>
          <p className="text-muted-foreground font-medium mt-1 uppercase text-[10px] tracking-[0.2em]">Protocol Pinning & Rotation Override</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-muted/50 rounded-full p-1 h-14 mb-10 w-fit">
          <TabsTrigger value="protocols" className="rounded-full px-10 h-12 data-[state=active]:bg-primary data-[state=active]:text-white font-black text-xs uppercase tracking-widest gap-2">
            Verification Queue <Badge className="bg-white/20 text-[10px]">{pendingCerts?.length || 0}</Badge>
          </TabsTrigger>
          <TabsTrigger value="inventory" className="rounded-full px-10 h-12 data-[state=active]:bg-primary data-[state=active]:text-white font-black text-xs uppercase tracking-widest gap-2">
            Botanical Library <Badge className="bg-white/20 text-[10px]">{inventory?.length || 0}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="protocols" className="space-y-8">
          {loadingCerts ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-96 rounded-[3rem]" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {pendingCerts?.map((cert) => (
                <Card key={cert.id} className="border-none shadow-2xl bg-white rounded-[3rem] overflow-hidden flex flex-col group border-2 border-transparent hover:border-primary/20 transition-all">
                  <div className="relative aspect-video">
                    <img src={cert.imageUrl || "https://picsum.photos/seed/audit/800/400"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={cert.name} />
                    <div className="absolute top-6 left-6">
                      <Badge className="bg-amber-500/90 text-white font-black uppercase text-[10px] tracking-widest px-4 py-1.5 shadow-xl">Audit Pending</Badge>
                    </div>
                  </div>
                  <CardHeader className="p-10 pb-6">
                    <CardTitle className="text-2xl font-black tracking-tight">{cert.name}</CardTitle>
                    <Badge variant="outline" className="text-[10px] font-black uppercase border-destructive/20 text-destructive">{cert.diseaseName}</Badge>
                    <p className="text-sm text-slate-600 mt-4 line-clamp-2 italic font-medium leading-relaxed">"{cert.symptoms}"</p>
                  </CardHeader>
                  <CardFooter className="p-10 pt-0 mt-auto">
                    <Button className="w-full h-14 rounded-2xl font-black gap-2 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90" onClick={() => setSelectedReviewCrop(cert)}>
                      <Edit3 className="h-5 w-5" /> Pin Protocol
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedReviewCrop} onOpenChange={() => setSelectedReviewCrop(null)}>
        <DialogContent className="rounded-[3rem] sm:max-w-4xl p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-slate-900 p-10 text-white relative">
            <div className="absolute top-0 right-0 p-8 opacity-10"><Microscope className="h-32 w-32 rotate-12" /></div>
            <DialogHeader className="relative z-10">
              <div className="flex items-center gap-4 mb-2">
                <div className="h-12 w-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg"><BrainCircuit className="h-7 w-7" /></div>
                <div>
                  <DialogTitle className="text-3xl font-black tracking-tight">Professional Pin Mode</DialogTitle>
                  <DialogDescription className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Scientist Node: {expertName}</DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>
          
          <ScrollArea className="max-h-[70vh]">
            <div className="p-10 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase text-primary ml-2 flex items-center gap-2"><FlaskConical className="h-3 w-3" /> Pin Neutralizer</Label>
                  <Textarea value={editChemicalCure} onChange={(e) => setEditChemicalCure(e.target.value)} placeholder="Dosage..." className="rounded-3xl bg-muted/20 border-none font-bold min-h-[140px] p-6 focus-visible:ring-primary shadow-inner" />
                </div>
                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase text-primary ml-2 flex items-center gap-2"><Zap className="h-3 w-3" /> Pin Heritage Wisdom</Label>
                  <Textarea value={editDesiNuskha} onChange={(e) => setEditDesiNuskha(e.target.value)} placeholder="Organic alternative..." className="rounded-3xl bg-muted/20 border-none font-medium italic min-h-[140px] p-6 focus-visible:ring-primary shadow-inner" />
                </div>
              </div>

              <div className="space-y-6 pt-10 border-t">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-black uppercase text-slate-900 ml-2 flex items-center gap-2"><MessageCircle className="h-4 w-4 text-primary" /> Professional POV</Label>
                  <div className="flex items-center gap-3 bg-primary/5 px-4 py-2 rounded-xl border border-primary/10">
                    <span className="text-[10px] font-black text-primary uppercase">Pin Solution</span>
                    <Switch checked={isCertifiedToggle} onCheckedChange={setIsCertifiedToggle} className="data-[state=checked]:bg-primary" />
                  </div>
                </div>
                <Textarea value={editExpertPov} onChange={(e) => setEditExpertPov(e.target.value)} placeholder="Manual POV will pin this path and override AI rotation." className="rounded-[2.5rem] bg-muted/30 border-none font-black text-lg min-h-[180px] p-10 focus-visible:ring-primary shadow-inner leading-relaxed" />
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="p-10 pt-0 flex gap-4">
            <Button variant="outline" className="flex-1 rounded-2xl h-14 font-black uppercase" onClick={() => setSelectedReviewCrop(null)}>Discard</Button>
            <Button className="flex-1 rounded-2xl h-14 font-black text-lg gap-3 bg-primary" onClick={handleCertifyProtocol}>
              <CheckCircle2 className="h-6 w-6" /> Certify & Pin Path
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
