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
import { useFirestore, useCollection, useUser, useMemoFirebase } from "@/firebase";
import { collection, query, where, doc, orderBy, limit } from "firebase/firestore";
import { updateDocumentNonBlocking, addDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { dispatchGridNotification } from "@/firebase/messaging";
import { Skeleton } from "@/components/ui/skeleton";
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
  
  // Modal States
  const [selectedReviewCrop, setSelectedReviewCrop] = useState<any>(null);
  const [isAddCropOpen, setIsAddCropOpen] = useState(false);

  // Editable fields for expert modification
  const [editName, setEditName] = useState("");
  const [editDisease, setEditDisease] = useState("");
  const [editChemicalCure, setEditChemicalCure] = useState("");
  const [editDesiNuskha, setEditDesiNuskha] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editExpertPov, setEditExpertPov] = useState("");
  const [isCertifiedToggle, setIsCertifiedToggle] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Queries
  const pendingCertsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, "crops"), 
      where("status", "==", "pending_expert_review")
    );
  }, [firestore]);
  const { data: pendingCerts, isLoading: loadingCerts } = useCollection(pendingCertsQuery);

  const inventoryQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "crops"), where("isCertified", "==", true));
  }, [firestore]);
  const { data: inventory, isLoading: loadingInventory } = useCollection(inventoryQuery);

  const filteredInventory = useMemo(() => {
    if (!inventory) return [];
    return inventory.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (c.diseaseName || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [inventory, searchQuery]);

  // Initial Sync when modal opens
  useEffect(() => {
    if (selectedReviewCrop) {
      setEditName(selectedReviewCrop.name || "");
      setEditDisease(selectedReviewCrop.diseaseName || "");
      setEditChemicalCure(selectedReviewCrop.chemicalCure || "");
      setEditDesiNuskha(selectedReviewCrop.desiNuskha || "");
      setEditImageUrl(selectedReviewCrop.imageUrl || "");
      setEditExpertPov(selectedReviewCrop.expertNotes || "");
      setIsCertifiedToggle(selectedReviewCrop.isCertified || false);
    }
  }, [selectedReviewCrop]);

  // Debounced Auto-Sync Logic (Handshake with Farmer Dashboard)
  useEffect(() => {
    if (!selectedReviewCrop || isCertifiedToggle) return;

    const timeout = setTimeout(() => {
      handleSyncDraft();
    }, 2000); // 2 second debounce for live editing

    return () => clearTimeout(timeout);
  }, [editChemicalCure, editDesiNuskha, editExpertPov, editName, editDisease]);

  const handleSyncDraft = useCallback(() => {
    if (!firestore || !selectedReviewCrop) return;
    setIsSyncing(true);
    const docRef = doc(firestore, "crops", selectedReviewCrop.id);
    updateDocumentNonBlocking(docRef, {
      name: editName,
      diseaseName: editDisease,
      chemicalCure: editChemicalCure,
      desiNuskha: editDesiNuskha,
      expertNotes: editExpertPov,
      updatedAt: new Date().toISOString()
    });
    setTimeout(() => setIsSyncing(false), 800);
  }, [firestore, selectedReviewCrop, editName, editDisease, editChemicalCure, editDesiNuskha, editExpertPov]);

  const handleCertifyProtocol = async () => {
    if (!firestore || !user || !selectedReviewCrop) return;

    const finalData = {
      name: editName,
      diseaseName: editDisease,
      chemicalCure: editChemicalCure,
      desiNuskha: editDesiNuskha,
      imageUrl: editImageUrl,
      isCertified: true,
      status: "resolved",
      verifiedBy: user.uid,
      verifiedByName: expertName,
      verifiedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expertNotes: editExpertPov || `Certified by ${expertName}. Follow this protocol for field recovery.`
    };

    const docRef = doc(firestore, "crops", selectedReviewCrop.id);
    updateDocumentNonBlocking(docRef, finalData);
    
    // Dispatch instant notification to the reporter
    if (selectedReviewCrop.reportedBy) {
      dispatchGridNotification(firestore, selectedReviewCrop.reportedBy, {
        title: "Scientific Certification Issued",
        message: `Expert ${expertName} has verified your ${finalData.name} request. Check the certified solution now!`,
        type: 'update'
      });
    }
    
    setSelectedReviewCrop(null);
    toast({ title: "Grid Certified", description: "Protocol has been published and the farmer notified." });
  };

  const handleAddNewProtocol = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !user) return;

    const data = {
      name: editName,
      diseaseName: editDisease,
      chemicalCure: editChemicalCure,
      desiNuskha: editDesiNuskha,
      imageUrl: editImageUrl || "https://picsum.photos/seed/new/800/400",
      category: "Plant",
      isCertified: true,
      status: "resolved",
      verifiedBy: user.uid,
      verifiedByName: expertName,
      verifiedAt: new Date().toISOString(),
      expertNotes: editExpertPov || `Certified profile by ${expertName}.`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    addDocumentNonBlocking(collection(firestore, "crops"), data);
    setIsAddCropOpen(false);
    toast({ title: "Protocol Added", description: "New scientific record synced with the library." });
  };

  const handleDeleteCrop = (id: string) => {
    if (!firestore) return;
    deleteDocumentNonBlocking(doc(firestore, "crops", id));
    toast({ title: "Protocol Removed", description: "Record purged from the national inventory." });
  };

  if (role !== "Expert" && role !== "Authority") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="h-20 w-20 bg-destructive/10 rounded-full flex items-center justify-center text-destructive">
          <AlertCircle className="h-10 w-10" />
        </div>
        <h3 className="text-2xl font-black">Expert Access Required</h3>
        <p className="text-muted-foreground max-w-sm">Please select the Expert persona from the login portal to access this grid.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black flex items-center gap-4 text-slate-900 tracking-tighter">
            <Microscope className="h-10 w-10 text-primary" />
            Scientific Audit Center
          </h2>
          <p className="text-muted-foreground font-medium mt-1 uppercase text-[10px] tracking-[0.2em]">Real-time Verification & POV Refinement</p>
        </div>
        <Button 
          onClick={() => {
            setEditName(""); setEditDisease(""); setEditChemicalCure(""); setEditDesiNuskha(""); setEditImageUrl(""); setEditExpertPov("");
            setIsAddCropOpen(true);
          }}
          className="rounded-2xl h-14 px-8 font-black gap-2 bg-slate-900 text-white shadow-xl hover:bg-slate-800 transition-all"
        >
          <Plus className="h-5 w-5" /> New Registry Record
        </Button>
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
          ) : !pendingCerts?.length ? (
            <Card className="border-dashed border-4 p-32 text-center bg-muted/20 rounded-[4rem]">
              <CheckCircle2 className="h-20 w-20 text-primary/30 mx-auto mb-8" />
              <h3 className="text-3xl font-black text-slate-400">Queue Clear</h3>
              <p className="text-muted-foreground mt-2 font-medium">All field reports have been professionally audited.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {pendingCerts.map((cert) => (
                <Card key={cert.id} className="border-none shadow-2xl bg-white rounded-[3rem] overflow-hidden flex flex-col group border-2 border-transparent hover:border-primary/20 transition-all">
                  <div className="relative aspect-video">
                    <img src={cert.imageUrl || "https://picsum.photos/seed/audit/800/400"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={cert.name} />
                    <div className="absolute top-6 left-6">
                      <Badge className="bg-amber-500/90 text-white font-black uppercase text-[10px] tracking-widest px-4 py-1.5 shadow-xl">Audit Pending</Badge>
                    </div>
                  </div>
                  <CardHeader className="p-10 pb-6">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-2xl font-black tracking-tight">{cert.name}</CardTitle>
                      <Badge variant="outline" className="text-[10px] font-black uppercase border-destructive/20 text-destructive">{cert.diseaseName}</Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                      <User className="h-3 w-3" />
                      <p className="text-[10px] font-bold uppercase tracking-wider">Reporter: {cert.reportedByName}</p>
                    </div>
                    <p className="text-sm text-slate-600 mt-4 line-clamp-2 italic font-medium leading-relaxed">"{cert.symptoms}"</p>
                  </CardHeader>
                  <CardFooter className="p-10 pt-0 mt-auto flex gap-4">
                    <Button className="flex-1 h-14 rounded-2xl font-black gap-2 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90" onClick={() => setSelectedReviewCrop(cert)}>
                      <Edit3 className="h-5 w-5" /> Refine & Certify
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="inventory" className="space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border flex flex-col md:flex-row gap-6 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input 
                placeholder="Search botanical library..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-14 rounded-2xl bg-muted/30 border-none pl-14 font-bold text-lg"
              />
            </div>
            <Badge variant="outline" className="h-10 px-6 font-black uppercase tracking-widest text-[10px]">Registry Sync: {new Date().toLocaleDateString()}</Badge>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {loadingInventory ? (
              [1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-[2rem]" />)
            ) : (
              filteredInventory.map((crop) => (
                <Card key={crop.id} className="border-none shadow-xl rounded-[2.5rem] bg-white p-8 flex flex-col md:flex-row items-center justify-between gap-10 border-l-8 border-primary/20">
                  <div className="flex items-center gap-8 w-full md:w-1/2">
                    <div className="h-24 w-32 rounded-2xl overflow-hidden shrink-0 shadow-lg border-2 border-white">
                      <img src={crop.imageUrl} className="w-full h-full object-cover" alt={crop.name} />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h4 className="text-2xl font-black">{crop.name}</h4>
                        <Badge className="bg-primary/10 text-primary border-none text-[9px] uppercase font-black px-2">{crop.diseaseName}</Badge>
                      </div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                        <UserCheck className="h-3 w-3" /> Certified by: {crop.verifiedByName || "System"}
                      </p>
                    </div>
                  </div>
                  <div className="flex-1 text-sm text-slate-500 font-medium italic border-l-2 pl-8 hidden lg:block line-clamp-2">
                    "{crop.chemicalCure}"
                  </div>
                  <div className="flex gap-3 shrink-0">
                    <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl text-primary hover:bg-primary/10" onClick={() => setSelectedReviewCrop(crop)}>
                      <Edit3 className="h-5 w-5" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl text-destructive hover:bg-destructive/10">
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-[2.5rem]">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-2xl font-black">Purge Record?</AlertDialogTitle>
                          <AlertDialogDescription>This permanently removes the certified protocol for <strong>{crop.name}</strong> from the national grid.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-xl font-bold">Cancel</AlertDialogCancel>
                          <AlertDialogAction className="rounded-xl font-bold bg-destructive text-white" onClick={() => handleDeleteCrop(crop.id)}>Delete Forever</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Advanced POV Audit Dialog */}
      <Dialog open={!!selectedReviewCrop} onOpenChange={() => setSelectedReviewCrop(null)}>
        <DialogContent className="rounded-[3rem] sm:max-w-4xl p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-slate-900 p-10 text-white relative">
            <div className="absolute top-0 right-0 p-8 opacity-10"><Microscope className="h-32 w-32 rotate-12" /></div>
            <DialogHeader className="relative z-10">
              <div className="flex items-center gap-4 mb-2">
                <div className="h-12 w-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20"><BrainCircuit className="h-7 w-7" /></div>
                <div>
                  <DialogTitle className="text-3xl font-black tracking-tight">Professional Audit Mode</DialogTitle>
                  <DialogDescription className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Scientist Node: Dr. {expertName} | AMAN_EXP_01</DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>
          
          <ScrollArea className="max-h-[70vh]">
            <div className="p-10 space-y-10">
              {/* Context & Live Status */}
              <div className="flex items-center justify-between bg-muted/30 p-6 rounded-[2rem] border border-dashed">
                <div className="flex items-center gap-4">
                  <Activity className={cn("h-5 w-5 text-primary", isSyncing && "animate-pulse")} />
                  <p className="text-sm font-black uppercase tracking-widest text-slate-600">
                    {isSyncing ? "Grid Handshake Active: Syncing Draft..." : "Real-time Sync Synchronized"}
                  </p>
                </div>
                <Badge variant="outline" className="bg-white/50 border-primary/20 text-primary font-black uppercase text-[8px]">Handshake Mode Enabled</Badge>
              </div>

              {/* Collaborative Workspaces */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase text-primary ml-2 flex items-center gap-2">
                    <FlaskConical className="h-3 w-3" /> Professional Neutralizer (Refine)
                  </Label>
                  <Textarea 
                    value={editChemicalCure} 
                    onChange={(e) => setEditChemicalCure(e.target.value)}
                    placeholder="Dosage and scientific name..." 
                    className="rounded-3xl bg-muted/20 border-none font-bold min-h-[140px] p-6 focus-visible:ring-primary shadow-inner"
                  />
                </div>
                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase text-primary ml-2 flex items-center gap-2">
                    <Zap className="h-3 w-3" /> Heritage Wisdom (Refine)
                  </Label>
                  <Textarea 
                    value={editDesiNuskha} 
                    onChange={(e) => setEditDesiNuskha(e.target.value)}
                    placeholder="Organic/Traditional alternative..." 
                    className="rounded-3xl bg-muted/20 border-none font-medium italic min-h-[140px] p-6 focus-visible:ring-primary shadow-inner"
                  />
                </div>
              </div>

              {/* Expert Point of View (POV) */}
              <div className="space-y-6 pt-10 border-t">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-black uppercase text-slate-900 ml-2 flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-primary" /> Professional POV & Commentary
                  </Label>
                  <div className="flex items-center gap-3 bg-primary/5 px-4 py-2 rounded-xl border border-primary/10">
                    <span className="text-[10px] font-black text-primary uppercase">Issue Certification</span>
                    <Switch checked={isCertifiedToggle} onCheckedChange={setIsCertifiedToggle} className="data-[state=checked]:bg-primary" />
                  </div>
                </div>
                <Textarea 
                  value={editExpertPov} 
                  onChange={(e) => setEditExpertPov(e.target.value)}
                  placeholder="Share your manual POV and scientific reasoning directly with the farmer. This will be shown as the primary directive." 
                  className="rounded-[2.5rem] bg-muted/30 border-none font-black text-lg min-h-[180px] p-10 focus-visible:ring-primary shadow-inner leading-relaxed"
                />
              </div>

              {/* Field Evidence Attachment */}
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase text-slate-400 ml-2">Field Evidence Attachment</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative rounded-[2rem] overflow-hidden border-4 border-muted/30 aspect-video group">
                    <img src={editImageUrl} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="Audit Evidence" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="outline" size="sm" className="bg-white/20 text-white border-white/40">View Full Evidence</Button>
                    </div>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-[2rem] border-2 border-slate-100 flex flex-col justify-center gap-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Farmer Note:</p>
                    <p className="text-sm font-medium text-slate-600 leading-relaxed italic">"{selectedReviewCrop?.symptoms || 'Visual report only.'}"</p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="p-10 pt-0 flex gap-4">
            <Button variant="outline" className="flex-1 rounded-2xl h-14 font-black uppercase tracking-widest text-xs" onClick={() => setSelectedReviewCrop(null)}>Discard Draft</Button>
            <Button className="flex-1 rounded-2xl h-14 font-black text-lg gap-3 bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/20" onClick={handleCertifyProtocol}>
              <CheckCircle2 className="h-6 w-6" /> {isCertifiedToggle ? "Certify & Notify" : "Save Professional Draft"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add New Protocol Modal */}
      <Dialog open={isAddCropOpen} onOpenChange={setIsAddCropOpen}>
        <DialogContent className="rounded-[3rem] p-10 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black">Register New Protocol</DialogTitle>
            <DialogDescription className="italic font-medium">Add a verified botanical cure to the National Grid.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddNewProtocol} className="space-y-6 pt-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-muted-foreground ml-2">Crop Name</Label>
                <Input value={editName} onChange={(e) => setEditName(e.target.value)} required className="h-12 rounded-xl bg-muted/30 border-none font-bold" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-muted-foreground ml-2">Pathogen</Label>
                <Input value={editDisease} onChange={(e) => setEditDisease(e.target.value)} required className="h-12 rounded-xl bg-muted/30 border-none font-bold" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-muted-foreground ml-2">Reference Image URL</Label>
              <Input value={editImageUrl} onChange={(e) => setEditImageUrl(e.target.value)} placeholder="https://..." className="h-12 rounded-xl bg-muted/30 border-none font-bold" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-muted-foreground ml-2">Scientific Neutralizer</Label>
              <Textarea value={editChemicalCure} onChange={(e) => setEditChemicalCure(e.target.value)} required className="rounded-xl bg-muted/30 border-none font-bold min-h-[100px]" />
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full h-14 rounded-2xl font-black text-lg">Publish to Library</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}