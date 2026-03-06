'use client';

import React, { useState, useEffect, useMemo } from "react";
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
  RefreshCw
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

  // Queries
  const pendingCertsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, "crops"), 
      where("status", "==", "pending_expert_review"), 
      orderBy("createdAt", "desc")
    );
  }, [firestore]);
  const { data: pendingCerts, isLoading: loadingCerts } = useCollection(pendingCertsQuery);

  const inventoryQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "crops"), where("isCertified", "==", true), orderBy("name", "asc"));
  }, [firestore]);
  const { data: inventory, isLoading: loadingInventory } = useCollection(inventoryQuery);

  const filteredInventory = useMemo(() => {
    if (!inventory) return [];
    return inventory.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.diseaseName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [inventory, searchQuery]);

  // Sync edit state when a crop is selected for detailed review
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

  const handleSyncDraft = () => {
    if (!firestore || !selectedReviewCrop) return;
    const docRef = doc(firestore, "crops", selectedReviewCrop.id);
    updateDocumentNonBlocking(docRef, {
      name: editName,
      diseaseName: editDisease,
      chemicalCure: editChemicalCure,
      desiNuskha: editDesiNuskha,
      expertNotes: editExpertPov,
      isCertified: isCertifiedToggle,
      updatedAt: new Date().toISOString()
    });
    toast({ title: "Draft Synchronized", description: "Real-time updates pushed to the farmer's dashboard." });
  };

  const handleCertifyProtocol = async (cropData: any, isNew = false) => {
    if (!firestore || !user) return;

    const finalData = {
      name: isNew ? cropData.name : editName,
      diseaseName: isNew ? cropData.diseaseName : editDisease,
      chemicalCure: isNew ? cropData.chemicalCure : editChemicalCure,
      desiNuskha: isNew ? cropData.desiNuskha : editDesiNuskha,
      imageUrl: isNew ? cropData.imageUrl : editImageUrl,
      isCertified: true,
      status: "resolved",
      verifiedBy: user.uid,
      verifiedByName: expertName,
      verifiedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expertNotes: isNew ? cropData.expertNotes : editExpertPov || `Certified by ${expertName}. Professional botanical protocol synchronized.`
    };

    if (isNew) {
      addDocumentNonBlocking(collection(firestore, "crops"), { ...finalData, category: "Plant", createdAt: new Date().toISOString() });
      setIsAddCropOpen(false);
      toast({ title: "Protocol Published", description: "New crop cure synced with the national grid." });
    } else {
      const targetId = cropData?.id || selectedReviewCrop?.id;
      if (!targetId) return;

      const docRef = doc(firestore, "crops", targetId);
      updateDocumentNonBlocking(docRef, finalData);
      
      const recipientId = cropData?.reportedBy || selectedReviewCrop?.reportedBy;
      if (recipientId) {
        dispatchGridNotification(firestore, recipientId, {
          title: "Scientific Certification Issued",
          message: `Expert ${expertName} has verified your ${finalData.name} request. Check the certified POV now!`,
          type: 'update'
        });
      }
      
      setSelectedReviewCrop(null);
      toast({ title: "Grid Certified", description: "Scientific badge and POV synced to the recipient." });
    }
  };

  const handleDeleteCrop = (id: string) => {
    if (!firestore) return;
    deleteDocumentNonBlocking(doc(firestore, "crops", id));
    toast({ title: "Protocol Removed", description: "Crop record purged from the national inventory." });
  };

  if (role !== "Expert" && role !== "Authority") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="h-20 w-20 bg-destructive/10 rounded-full flex items-center justify-center text-destructive">
          <AlertCircle className="h-10 w-10" />
        </div>
        <h3 className="text-2xl font-black">Expert Access Required</h3>
        <p className="text-muted-foreground max-w-sm">This hub is restricted to verified Grid Scientists.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black flex items-center gap-4 text-slate-900 tracking-tighter">
            <ShieldCheck className="h-10 w-10 text-primary" />
            Scientific Command Center
          </h2>
          <p className="text-muted-foreground font-medium mt-1 uppercase text-[10px] tracking-[0.2em]">Live Auditing & Collaborative POV Refinement</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={() => {
              setEditName(""); setEditDisease(""); setEditChemicalCure(""); setEditDesiNuskha(""); setEditImageUrl(""); setEditExpertPov("");
              setIsAddCropOpen(true);
            }}
            className="rounded-2xl h-14 px-8 font-black gap-2 bg-slate-900 text-white shadow-xl hover:bg-slate-800 transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="h-5 w-5" /> New Grid Protocol
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-muted/50 rounded-full p-1 h-14 mb-10 w-fit">
          <TabsTrigger value="protocols" className="rounded-full px-10 h-12 data-[state=active]:bg-primary data-[state=active]:text-white font-black text-xs uppercase tracking-widest gap-2">
            Audit Queue <Badge className="bg-white/20 text-[10px]">{pendingCerts?.length || 0}</Badge>
          </TabsTrigger>
          <TabsTrigger value="inventory" className="rounded-full px-10 h-12 data-[state=active]:bg-primary data-[state=active]:text-white font-black text-xs uppercase tracking-widest gap-2">
            Solution Library <Badge className="bg-white/20 text-[10px]">{inventory?.length || 0}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="protocols" className="space-y-8">
          {loadingCerts ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-96 rounded-[3rem]" />)}
            </div>
          ) : !pendingCerts?.length ? (
            <Card className="border-dashed border-4 p-32 text-center bg-muted/20 rounded-[4rem]">
              <ClipboardCheck className="h-20 w-20 text-primary/30 mx-auto mb-8" />
              <h3 className="text-3xl font-black">Audit Queue Empty</h3>
              <p className="text-muted-foreground mt-2 font-medium">Monitoring the grid for new farmer field reports...</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {pendingCerts.map((cert) => (
                <Card key={cert.id} className="border-none shadow-2xl bg-white rounded-[3rem] overflow-hidden flex flex-col hover:shadow-primary/10 transition-all border-2 border-transparent hover:border-primary/20">
                  <div className="relative aspect-video">
                    <img src={cert.imageUrl || "https://picsum.photos/seed/agri/800/400"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={cert.name} />
                    <div className="absolute top-6 left-6 flex gap-2">
                      <Badge className="bg-amber-500/90 text-white font-black uppercase text-[10px] tracking-widest px-4 py-1.5 shadow-xl">High Priority</Badge>
                      <Badge className="bg-blue-600/90 text-white font-black uppercase text-[10px] tracking-widest px-4 py-1.5 shadow-xl">Audit Pending</Badge>
                    </div>
                  </div>
                  <CardHeader className="p-10 pb-6">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-3xl font-black tracking-tight">{cert.name}</CardTitle>
                      <Badge variant="outline" className="text-[10px] font-black uppercase border-destructive/20 text-destructive">{cert.diseaseName || 'Unidentified'}</Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                      <User className="h-3 w-3" />
                      <p className="text-[10px] font-bold uppercase tracking-wider">Farmer: {cert.reportedByName || "Regional Node"}</p>
                    </div>
                    <p className="text-sm text-slate-600 mt-4 line-clamp-2 italic font-medium leading-relaxed">"{cert.symptoms}"</p>
                  </CardHeader>
                  <CardFooter className="p-10 pt-0 mt-auto flex gap-4">
                    <Button variant="outline" className="flex-1 h-14 rounded-2xl font-black gap-2 border-primary/20 text-primary hover:bg-primary/5 shadow-sm" onClick={() => setSelectedReviewCrop(cert)}>
                      <Edit3 className="h-5 w-5" /> Refine & Certify
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="inventory" className="space-y-8">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-white p-8 rounded-[2.5rem] shadow-xl border">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input 
                placeholder="Search botanical protocols..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-14 rounded-2xl bg-muted/30 border-none pl-14 font-bold text-lg focus-visible:ring-primary shadow-inner"
              />
            </div>
            <div className="flex items-center gap-4 text-muted-foreground font-bold text-xs uppercase tracking-widest px-4">
              <Calendar className="h-4 w-4" /> Last Sync: {new Date().toLocaleDateString()}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {loadingInventory ? (
              [1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-[2rem]" />)
            ) : filteredInventory.length === 0 ? (
              <div className="text-center py-20 opacity-20">
                <Search className="h-12 w-12 mx-auto mb-4" />
                <p className="font-black uppercase tracking-widest text-xs">No matching protocols in library</p>
              </div>
            ) : (
              filteredInventory.map((crop) => (
                <Card key={crop.id} className="border-none shadow-xl rounded-[2.5rem] bg-white p-8 flex flex-col md:flex-row items-center justify-between gap-10 group hover:shadow-2xl transition-all border-l-8 border-primary/20">
                  <div className="flex items-center gap-8 w-full md:w-1/2">
                    <div className="h-24 w-32 rounded-2xl overflow-hidden shrink-0 shadow-lg border-2 border-white">
                      <img src={crop.imageUrl} className="w-full h-full object-cover" alt={crop.name} />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h4 className="text-2xl font-black tracking-tight">{crop.name}</h4>
                        <Badge className="bg-primary/10 text-primary border-none text-[9px] uppercase font-black px-2">{crop.diseaseName}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <History className="h-3 w-3" />
                          <p className="text-[10px] font-bold uppercase">{new Date(crop.verifiedAt || crop.updatedAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <p className="text-[10px] font-bold uppercase">{crop.verifiedByName || "System Sync"}</p>
                        </div>
                      </div>
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
                      <AlertDialogContent className="rounded-[2rem]">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-2xl font-black">Purge Protocol?</AlertDialogTitle>
                          <AlertDialogDescription>This will permanently remove the <strong>{crop.name} - {crop.diseaseName}</strong> scientific record from the grid.</AlertDialogDescription>
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

      {/* Advanced Verification & POV Dialog */}
      <Dialog open={!!selectedReviewCrop} onOpenChange={() => setSelectedReviewCrop(null)}>
        <DialogContent className="rounded-[3rem] sm:max-w-4xl p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-slate-900 p-10 text-white relative">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <FlaskConical className="h-32 w-32 rotate-12" />
            </div>
            <DialogHeader className="relative z-10">
              <div className="flex items-center gap-4 mb-2">
                <div className="h-12 w-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg">
                  <BrainCircuit className="h-7 w-7" />
                </div>
                <div>
                  <DialogTitle className="text-3xl font-black tracking-tight">Professional POV Hub</DialogTitle>
                  <DialogDescription className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Active Scientist: Dr. {expertName}</DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>
          
          <ScrollArea className="max-h-[70vh]">
            <div className="p-10 space-y-10">
              {/* Field Evidence Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" /> Farmer field Evidence
                  </h4>
                  <div className="flex items-center gap-2 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                    <Bot className="h-3 w-3 text-amber-600" />
                    <span className="text-[8px] font-black text-amber-700 uppercase">AI Reasoning Logs Attached</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative rounded-[2rem] overflow-hidden border-4 border-muted/30 shadow-xl aspect-video bg-muted/50 group">
                    <img src={editImageUrl} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="Audit Evidence" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <p className="text-white text-[10px] font-black uppercase tracking-widest">Click to zoom</p>
                    </div>
                  </div>
                  <div className="p-6 rounded-[2rem] bg-slate-50 border-2 border-slate-100 space-y-3 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5"><Zap className="h-16 w-16" /></div>
                    <h4 className="text-[10px] font-black text-slate-400 tracking-widest uppercase">Initial AI Synthesis</h4>
                    <p className="text-xs font-medium text-slate-600 leading-relaxed italic">
                      "{selectedReviewCrop?.aiReasoning || "AI model prioritized visual lesion patterns for detection."}"
                    </p>
                  </div>
                </div>
              </div>

              {/* Collaborative Editing Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
                    <Edit3 className="h-4 w-4" /> Refine Cures (Expert-Farmer Handshake)
                  </h4>
                  <Badge variant="outline" className="text-[8px] font-black border-primary/20 text-primary uppercase">Draft Sync Active</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground ml-2">Professional Neutralizer ($LaTeX$)</Label>
                    <Textarea 
                      value={editChemicalCure} 
                      onChange={(e) => setEditChemicalCure(e.target.value)} 
                      placeholder="Refine dosage or scientific name..." 
                      className="rounded-2xl bg-muted/20 border-none font-bold min-h-[120px] p-5 shadow-inner focus-visible:ring-primary" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground ml-2">Heritage Wisdom / Desi Nuskha</Label>
                    <Textarea 
                      value={editDesiNuskha} 
                      onChange={(e) => setEditDesiNuskha(e.target.value)} 
                      placeholder="Refine the organic alternative..." 
                      className="rounded-2xl bg-muted/20 border-none font-medium min-h-[120px] p-5 shadow-inner focus-visible:ring-primary" 
                    />
                  </div>
                </div>
              </div>

              {/* Expert Notes & Certification */}
              <div className="space-y-6">
                <div className="flex items-center justify-between border-t pt-8">
                  <h4 className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" /> Professional POV Commentary
                  </h4>
                  <div className="flex items-center gap-3 bg-primary/5 px-4 py-2 rounded-2xl border border-primary/10">
                    <Label className="text-[10px] font-black text-primary uppercase">Certify Protocol</Label>
                    <Switch 
                      checked={isCertifiedToggle} 
                      onCheckedChange={setIsCertifiedToggle} 
                      className="data-[state=checked]:bg-primary"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground ml-2">Scientist's Direct Advice for Farmer</Label>
                  <Textarea 
                    value={editExpertPov} 
                    onChange={(e) => setEditExpertPov(e.target.value)} 
                    placeholder="Type your manual POV advice here. This will be the primary directive for the farmer." 
                    className="rounded-3xl bg-muted/30 border-none font-black text-lg min-h-[160px] p-8 focus-visible:ring-primary shadow-inner leading-relaxed" 
                  />
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="p-10 pt-0 flex flex-col sm:flex-row gap-4">
            <div className="flex-1 flex gap-3">
              <Button variant="outline" className="flex-1 rounded-2xl h-14 font-black text-xs uppercase tracking-widest" onClick={() => setSelectedReviewCrop(null)}>Discard</Button>
              <Button variant="secondary" className="flex-1 rounded-2xl h-14 font-black text-xs uppercase tracking-widest gap-2 bg-muted/50" onClick={handleSyncDraft}>
                <RefreshCw className="h-4 w-4" /> Sync Draft
              </Button>
            </div>
            <Button className="flex-1 rounded-2xl h-14 font-black text-lg gap-3 shadow-2xl shadow-primary/20 bg-primary hover:bg-primary/90" onClick={() => handleCertifyProtocol(null)}>
              <CheckCircle2 className="h-6 w-6" /> {isCertifiedToggle ? "Certify & Publish" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add New Crop Dialog */}
      <Dialog open={isAddCropOpen} onOpenChange={setIsAddCropOpen}>
        <DialogContent className="rounded-[3rem] sm:max-w-2xl p-10 border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black tracking-tight">Register Grid Protocol</DialogTitle>
            <DialogDescription className="italic font-medium text-slate-500">Add a manually verified cure to the Global Botanical Registry.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 pt-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-muted-foreground ml-2">Crop Name</Label>
                <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="e.g. Wheat" className="h-12 rounded-xl bg-muted/30 border-none font-bold" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-muted-foreground ml-2">Disease</Label>
                <Input value={editDisease} onChange={(e) => setEditDisease(e.target.value)} placeholder="e.g. Yellow Rust" className="h-12 rounded-xl bg-muted/30 border-none font-bold" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-muted-foreground ml-2">Scientific Reference Image URL</Label>
              <Input value={editImageUrl} onChange={(e) => setEditImageUrl(e.target.value)} placeholder="https://..." className="h-12 rounded-xl bg-muted/30 border-none font-bold" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-muted-foreground ml-2">Professional Neutralizer</Label>
              <Textarea value={editChemicalCure} onChange={(e) => setEditChemicalCure(e.target.value)} placeholder="Include scientific formulas and dosage..." className="rounded-xl bg-muted/30 border-none font-bold min-h-[100px]" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-muted-foreground ml-2">Heritage Wisdom</Label>
              <Textarea value={editDesiNuskha} onChange={(e) => setEditDesiNuskha(e.target.value)} placeholder="Organic or traditional alternative..." className="rounded-xl bg-muted/30 border-none font-medium min-h-[100px]" />
            </div>
            <DialogFooter>
              <Button className="w-full h-14 rounded-2xl font-black text-lg" onClick={() => handleCertifyProtocol({ 
                name: editName, diseaseName: editDisease, chemicalCure: editChemicalCure, desiNuskha: editDesiNuskha, imageUrl: editImageUrl || "https://picsum.photos/seed/new/800/400"
              }, true)}>Publish to National Grid</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
