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
  ArrowRight
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

  // Queries
  const pendingCertsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "crops"), where("isCertified", "==", false), orderBy("createdAt", "desc"));
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
    }
  }, [selectedReviewCrop]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setEditImageUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  /**
   * Refactored Certification Logic
   * Handles both "Quick Certify" and "Detailed Audit" without race conditions.
   */
  const handleCertifyProtocol = async (cropData: any, isNew = false) => {
    if (!firestore || !user) return;

    // Use current state for manual audits, or provided crop data for quick actions
    const finalData = {
      name: isNew || !selectedReviewCrop ? cropData.name : editName,
      diseaseName: isNew || !selectedReviewCrop ? cropData.diseaseName : editDisease,
      chemicalCure: isNew || !selectedReviewCrop ? cropData.chemicalCure : editChemicalCure,
      desiNuskha: isNew || !selectedReviewCrop ? cropData.desiNuskha : editDesiNuskha,
      imageUrl: isNew || !selectedReviewCrop ? cropData.imageUrl : editImageUrl,
      isCertified: true,
      verifiedBy: user.uid,
      verifiedByName: expertName,
      verifiedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expertNotes: `Certified by ${expertName}. Professional botanical protocol synchronized.`
    };

    if (isNew) {
      addDocumentNonBlocking(collection(firestore, "crops"), { ...finalData, category: "Plant", createdAt: new Date().toISOString() });
      setIsAddCropOpen(false);
      toast({ title: "Protocol Added", description: "New crop cure published to the national library." });
    } else {
      const targetId = cropData?.id || selectedReviewCrop?.id;
      if (!targetId) return;

      const docRef = doc(firestore, "crops", targetId);
      updateDocumentNonBlocking(docRef, finalData);
      
      // Notify reporting farmer if this was an audit request
      const recipientId = cropData?.reportedBy || selectedReviewCrop?.reportedBy;
      if (recipientId) {
        dispatchGridNotification(firestore, recipientId, {
          title: "Scientific Protocol Verified",
          message: `Expert ${expertName} has certified the cure for ${finalData.name}. Check your library!`,
          type: 'update'
        });
      }
      
      setSelectedReviewCrop(null);
      toast({ title: "Changes Synchronized", description: "The grid library has been updated." });
    }
  };

  const handleDeleteCrop = (id: string) => {
    if (!firestore) return;
    deleteDocumentNonBlocking(doc(firestore, "crops", id));
    toast({ title: "Protocol Removed", description: "Crop record has been purged from the global grid." });
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
    <div className="space-y-10 max-w-7xl mx-auto pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black flex items-center gap-4 text-slate-900 tracking-tighter">
            <ShieldCheck className="h-10 w-10 text-primary" />
            Grid Content Command
          </h2>
          <p className="text-muted-foreground font-medium mt-1 uppercase text-[10px] tracking-[0.2em]">Scientific Audit & Botanical Inventory</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={() => {
              setEditName(""); setEditDisease(""); setEditChemicalCure(""); setEditDesiNuskha(""); setEditImageUrl("");
              setIsAddCropOpen(true);
            }}
            className="rounded-2xl h-14 px-8 font-black gap-2 bg-slate-900 text-white shadow-xl hover:bg-slate-800 transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="h-5 w-5" /> Add New Protocol
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-muted/50 rounded-full p-1 h-14 mb-10 w-fit">
          <TabsTrigger value="protocols" className="rounded-full px-10 h-12 data-[state=active]:bg-primary data-[state=active]:text-white font-black text-xs uppercase tracking-widest gap-2">
            Recent Requests <Badge className="bg-white/20 text-[10px]">{pendingCerts?.length || 0}</Badge>
          </TabsTrigger>
          <TabsTrigger value="inventory" className="rounded-full px-10 h-12 data-[state=active]:bg-primary data-[state=active]:text-white font-black text-xs uppercase tracking-widest gap-2">
            Global Inventory <Badge className="bg-white/20 text-[10px]">{inventory?.length || 0}</Badge>
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
              <h3 className="text-3xl font-black">Queue is Clear</h3>
              <p className="text-muted-foreground mt-2 font-medium">All field requests have been certified by human experts.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {pendingCerts.map((cert) => (
                <Card key={cert.id} className="border-none shadow-2xl bg-white rounded-[3rem] overflow-hidden flex flex-col hover:shadow-primary/10 transition-all border-2 border-transparent hover:border-primary/20">
                  <div className="relative aspect-video">
                    <img src={cert.imageUrl || "https://picsum.photos/seed/agri/800/400"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={cert.name} />
                    <div className="absolute top-6 left-6">
                      <Badge className="bg-amber-500/90 text-white font-black uppercase text-[10px] tracking-widest px-4 py-1.5 shadow-xl">New Request</Badge>
                    </div>
                  </div>
                  <CardHeader className="p-10 pb-6">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-3xl font-black tracking-tight">{cert.name}</CardTitle>
                      <Badge variant="outline" className="text-[10px] font-black uppercase border-destructive/20 text-destructive">{cert.diseaseName || 'Unidentified'}</Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                      <User className="h-3 w-3" />
                      <p className="text-[10px] font-bold uppercase tracking-wider">Reported By: {cert.reportedByName || "Local Node"}</p>
                    </div>
                    <p className="text-sm text-slate-600 mt-4 line-clamp-2 italic font-medium leading-relaxed">"{cert.symptoms}"</p>
                  </CardHeader>
                  <CardFooter className="p-10 pt-0 mt-auto flex gap-4">
                    <Button variant="outline" className="flex-1 h-14 rounded-2xl font-black gap-2 border-primary/20 text-primary hover:bg-primary/5" onClick={() => setSelectedReviewCrop(cert)}>
                      <Edit3 className="h-5 w-5" /> Audit
                    </Button>
                    <Button className="flex-1 h-14 rounded-2xl font-black" onClick={() => handleCertifyProtocol(cert)}>Quick Certify</Button>
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
                placeholder="Search crop or disease..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-14 rounded-2xl bg-muted/30 border-none pl-14 font-bold text-lg focus-visible:ring-primary shadow-inner"
              />
            </div>
            <div className="flex items-center gap-4 text-muted-foreground font-bold text-xs uppercase tracking-widest px-4">
              <Calendar className="h-4 w-4" /> Latest Sync: {new Date().toLocaleDateString()}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {loadingInventory ? (
              [1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-[2rem]" />)
            ) : filteredInventory.length === 0 ? (
              <div className="text-center py-20 opacity-20">
                <Search className="h-12 w-12 mx-auto mb-4" />
                <p className="font-black uppercase tracking-widest text-xs">No matching protocols found</p>
              </div>
            ) : (
              filteredInventory.map((crop) => (
                <Card key={crop.id} className="border-none shadow-xl rounded-[2.5rem] bg-white p-8 flex flex-col md:flex-row items-center justify-between gap-10 group hover:shadow-2xl transition-all border-l-8 border-primary/20">
                  <div className="flex items-center gap-8 w-full md:w-1/2">
                    <div className="h-24 w-32 rounded-2xl overflow-hidden shrink-0 shadow-lg">
                      <img src={crop.imageUrl} className="w-full h-full object-cover" alt={crop.name} />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h4 className="text-2xl font-black tracking-tight">{crop.name}</h4>
                        <Badge className="bg-primary/10 text-primary border-none text-[9px] uppercase font-black">{crop.diseaseName}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <History className="h-3 w-3" />
                          <p className="text-[10px] font-bold uppercase">{new Date(crop.verifiedAt || crop.updatedAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <p className="text-[10px] font-bold uppercase">{crop.verifiedByName || "System"}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 text-sm text-slate-500 font-medium italic border-l-2 pl-8 hidden lg:block">
                    "{crop.chemicalCure?.substring(0, 80)}..."
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
                          <AlertDialogDescription>This will permanently remove the <strong>{crop.name} - {crop.diseaseName}</strong> protocol from the National Grid.</AlertDialogDescription>
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

      {/* Edit/Audit Dialog */}
      <Dialog open={!!selectedReviewCrop} onOpenChange={() => setSelectedReviewCrop(null)}>
        <DialogContent className="rounded-[3rem] sm:max-w-3xl p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-slate-900 p-10 text-white relative">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <FlaskConical className="h-32 w-32 rotate-12" />
            </div>
            <DialogHeader className="relative z-10">
              <div className="flex items-center gap-4 mb-2">
                <div className="h-12 w-12 bg-primary rounded-2xl flex items-center justify-center text-white">
                  <BrainCircuit className="h-7 w-7" />
                </div>
                <div>
                  <DialogTitle className="text-3xl font-black tracking-tight">Scientific Audit Hub</DialogTitle>
                  <DialogDescription className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Registry Protocol v4.2 Active</DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>
          
          <ScrollArea className="max-h-[70vh]">
            <div className="p-10 space-y-10">
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" /> Botanical Evidence
                </h4>
                <div className="relative group rounded-[2rem] overflow-hidden border-4 border-muted/30 shadow-xl aspect-video bg-muted/50">
                  <img src={editImageUrl} className="w-full h-full object-cover" alt="Audit Evidence" />
                  <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white">
                    <Upload className="h-10 w-10 mb-2" />
                    <span className="font-black text-xs uppercase">Replace with High-Res Reference</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground ml-2">Crop Name</Label>
                  <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-12 rounded-xl bg-muted/30 border-none font-bold" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground ml-2">Disease / Pathogen</Label>
                  <Input value={editDisease} onChange={(e) => setEditDisease(e.target.value)} className="h-12 rounded-xl bg-muted/30 border-none font-bold" />
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground ml-2">Professional Neutralizer ($LaTeX$ supported)</Label>
                  <Textarea value={editChemicalCure} onChange={(e) => setEditChemicalCure(e.target.value)} placeholder="e.g. Apply $CuSO_4$ (2g/L)..." className="rounded-xl bg-muted/30 border-none font-bold min-h-[100px]" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground ml-2">Heritage Wisdom / Desi Nuskha</Label>
                  <Textarea value={editDesiNuskha} onChange={(e) => setEditDesiNuskha(e.target.value)} className="rounded-xl bg-muted/30 border-none font-medium min-h-[100px]" />
                </div>
              </div>

              {selectedReviewCrop?.aiReasoning && (
                <div className="p-6 rounded-[2rem] bg-amber-50 border-2 border-amber-100 space-y-3">
                  <h4 className="text-[10px] font-black uppercase text-amber-600 tracking-widest flex items-center gap-2">
                    <Bot className="h-4 w-4" /> AI Scientific Logic Trace
                  </h4>
                  <p className="text-sm font-medium text-amber-900 leading-relaxed italic">
                    "{selectedReviewCrop.aiReasoning}"
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>

          <DialogFooter className="p-10 pt-0 flex gap-4">
            <Button variant="outline" className="flex-1 rounded-xl h-14 font-black" onClick={() => setSelectedReviewCrop(null)}>Discard</Button>
            <Button className="flex-1 rounded-xl h-14 font-black gap-2 shadow-xl shadow-primary/20" onClick={() => handleCertifyProtocol(null)}>
              <Save className="h-5 w-5" /> Certify Protocol
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add New Crop Dialog */}
      <Dialog open={isAddCropOpen} onOpenChange={setIsAddCropOpen}>
        <DialogContent className="rounded-[3rem] sm:max-w-2xl p-10">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black">Register Professional Protocol</DialogTitle>
            <DialogDescription className="italic font-medium">Manually sync a new botanical cure with the National Grid library.</DialogDescription>
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
              <Label className="text-[10px] font-black uppercase text-muted-foreground ml-2">Professional Neutralizer</Label>
              <Textarea value={editChemicalCure} onChange={(e) => setEditChemicalCure(e.target.value)} placeholder="Include scientific name and dosage..." className="rounded-xl bg-muted/30 border-none font-bold" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-muted-foreground ml-2">Heritage Wisdom</Label>
              <Textarea value={editDesiNuskha} onChange={(e) => setEditDesiNuskha(e.target.value)} placeholder="Organic/Traditional alternative..." className="rounded-xl bg-muted/30 border-none font-medium" />
            </div>
            <DialogFooter>
              <Button className="w-full h-14 rounded-2xl font-black text-lg" onClick={() => handleCertifyProtocol({ 
                name: editName, diseaseName: editDisease, chemicalCure: editChemicalCure, desiNuskha: editDesiNuskha, imageUrl: editImageUrl || "https://picsum.photos/seed/new/800/400"
              }, true)}>Publish to Grid</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}