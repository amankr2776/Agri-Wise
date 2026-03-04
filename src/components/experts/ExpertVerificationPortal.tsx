
'use client';

import React, { useState } from "react";
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
  Send
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { collection, query, where, doc, addDoc, getDocs, writeBatch } from "firebase/firestore";
import { updateDocumentNonBlocking, addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppState } from "@/lib/app-state";
import { useToast } from "@/hooks/use-toast";

const DEFAULT_CROPS = [
  { name: "Paddy", category: "Grain", diseaseName: "Rice Blast", severity: "High", chemicalCure: "Tricyclazole 75% WP", chemicalDosage: "0.6g / L", desiNuskha: "Neem oil spray (3%) mixed with cow urine.", isCertified: true, imageUrl: "https://images.unsplash.com/photo-1536633340743-0974bb27c7a3?q=80&w=800&auto=format&fit=crop", irrigationInterval: 3, estimatedPrice: 2150, sowingSeason: "Kharif", soilType: "Clayey Loam" },
  { name: "Wheat", category: "Grain", diseaseName: "Brown Rust", severity: "High", chemicalCure: "Propiconazole 25% EC", chemicalDosage: "1ml / L", desiNuskha: "Butter milk spray after fermentation for 3 days.", isCertified: true, imageUrl: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?q=80&w=800&auto=format&fit=crop", irrigationInterval: 12, estimatedPrice: 2450, sowingSeason: "Rabi", soilType: "Loamy" },
  { name: "Maize", category: "Grain", diseaseName: "Fall Armyworm", severity: "Critical", chemicalCure: "Spinetoram 11.7% SC", chemicalDosage: "0.5ml / L", desiNuskha: "Sand and lime mixture in the whorls.", isCertified: true, imageUrl: "https://images.unsplash.com/photo-1551731589-23178d64cb21?q=80&w=800&auto=format&fit=crop", irrigationInterval: 7, estimatedPrice: 1950, sowingSeason: "Kharif", soilType: "Well-drained Loam" },
  { name: "Tomato", category: "Vegetable", diseaseName: "Early Blight", severity: "Medium", chemicalCure: "Mancozeb 75% WP", chemicalDosage: "2.5g / L", desiNuskha: "Baking soda and soap water spray.", isCertified: true, imageUrl: "https://images.unsplash.com/photo-1592841200221-a6898f307baa?q=80&w=800&auto=format&fit=crop", irrigationInterval: 4, estimatedPrice: 3200, sowingSeason: "Year-round", soilType: "Sandy Loam" },
  { name: "Potato", category: "Vegetable", diseaseName: "Late Blight", severity: "Critical", chemicalCure: "Metalaxyl 8% + Mancozeb 64%", chemicalDosage: "2g / L", desiNuskha: "Wood ash dusting on damp leaves.", isCertified: true, imageUrl: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?q=80&w=800&auto=format&fit=crop", irrigationInterval: 8, estimatedPrice: 1800, sowingSeason: "Rabi", soilType: "Alluvial" },
  { name: "Onion", category: "Vegetable", diseaseName: "Purple Blotch", severity: "Medium", chemicalCure: "Chlorothalonil 75% WP", chemicalDosage: "2g / L", desiNuskha: "Baking soda and vegetable oil spray.", isCertified: true, imageUrl: "https://images.unsplash.com/photo-1508747703725-719777637510?q=80&w=800&auto=format&fit=crop", irrigationInterval: 10, estimatedPrice: 2800, sowingSeason: "Winter/Rabi", soilType: "Sandy Loam" },
  { name: "Mango", category: "Fruit", diseaseName: "Anthracnose", severity: "High", chemicalCure: "Carbendazim 50% WP", chemicalDosage: "1g / L", desiNuskha: "Pruning and copper oxychloride paste on cuts.", isCertified: true, imageUrl: "https://images.unsplash.com/photo-1553279768-865429fa0078?q=80&w=800&auto=format&fit=crop", irrigationInterval: 15, estimatedPrice: 8500, sowingSeason: "Summer", soilType: "Laterite" },
  { name: "Banana", category: "Fruit", diseaseName: "Panama Wilt", severity: "Critical", chemicalCure: "Carbendazim injection", chemicalDosage: "3ml / plant", desiNuskha: "Crop rotation with paddy and liming of soil.", isCertified: true, imageUrl: "https://images.unsplash.com/photo-1603833665858-e61d17a86224?q=80&w=800&auto=format&fit=crop", irrigationInterval: 5, estimatedPrice: 3500, sowingSeason: "Spring", soilType: "Rich Loam" },
  { name: "Grapes", category: "Fruit", diseaseName: "Downy Mildew", severity: "High", chemicalCure: "Bordeaux Mixture (1%)", chemicalDosage: "10g / L", desiNuskha: "Garlic extract spray with sticker soap.", isCertified: true, imageUrl: "https://images.unsplash.com/photo-1537640538966-79f369143f8c?q=80&w=800&auto=format&fit=crop", irrigationInterval: 7, estimatedPrice: 6500, sowingSeason: "Winter", soilType: "Well-drained Sandy" }
];

const DEFAULT_VEHICLES = [
  { agencyName: "Amritsar Agri-Logistics", type: "Heavy Truck", plateNumber: "PB-02-AT-1122", pricePerKm: 35, city: "Amritsar", state: "Punjab", isAvailable: true, contact: "+919814000000" },
  { agencyName: "Ludhiana Mandi Link", type: "Mini Truck", plateNumber: "PB-10-ML-4545", pricePerKm: 18, city: "Ludhiana", state: "Punjab", isAvailable: true, contact: "+919814100000" },
  { agencyName: "Nashik Onion Express", type: "Heavy Truck", plateNumber: "MH-15-OE-7711", pricePerKm: 32, city: "Nashik", state: "Maharashtra", isAvailable: true, contact: "+919922000000" },
  { agencyName: "Agra Potato Carriers", type: "Heavy Truck", plateNumber: "UP-80-PC-8899", pricePerKm: 30, city: "Agra", state: "Uttar Pradesh", isAvailable: true, contact: "+919415000000" }
];

export function ExpertVerificationPortal() {
  const firestore = useFirestore();
  const { role } = useAppState();
  const { user } = useUser();
  const { toast } = useToast();
  const [seeding, setSeeding] = useState(false);
  const [isAdvisoryDialogOpen, setIsAdvisoryDialogOpen] = useState(false);
  const [isSubmittingAdvisory, setIsSubmittingAdvisory] = useState(false);

  const pendingCertsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "crops"), where("isCertified", "==", false));
  }, [firestore]);

  const { data: pendingCerts, isLoading } = useCollection(pendingCertsQuery);

  const handleVerify = (certId: string) => {
    if (!firestore || !certId) return;
    updateDocumentNonBlocking(doc(firestore, "crops", certId), {
      isCertified: true,
      expertId: user?.uid || "anonymous_expert",
      verifiedAt: new Date().toISOString()
    });
    toast({ title: "Protocol Certified", description: "Verified and added to the registry." });
  };

  const handleIssueAdvisory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!firestore || !user) return;
    setIsSubmittingAdvisory(true);

    const formData = new FormData(e.currentTarget);
    const advisoryData = {
      authorId: user.uid,
      authorName: user.displayName || "Certified Scientist",
      authorRole: "Expert",
      content: `BUG ALERT: ${formData.get("pestName")} is spreading in ${formData.get("region")}. URGENT: Apply ${formData.get("pesticide")} immediately.`,
      category: "Issue Alert",
      isAdvisory: true,
      isVerified: true,
      pestName: formData.get("pestName"),
      region: formData.get("region"),
      recommendedAction: formData.get("pesticide"),
      createdAt: new Date().toISOString(),
      reactions: { "🌾": 0, "👍": 0, "🙏": 0 }
    };

    addDocumentNonBlocking(collection(firestore, "posts"), advisoryData);
    setIsAdvisoryDialogOpen(false);
    setIsSubmittingAdvisory(false);
    toast({ title: "Field Advisory Deployed", description: "Farmers notified via Kisan Network." });
  };

  const purgeAndSeed = async () => {
    if (!firestore) return;
    setSeeding(true);
    try {
      const cropsCol = collection(firestore, "crops");
      const vehiclesCol = collection(firestore, "vehicles");
      const existingCrops = await getDocs(cropsCol);
      const existingVehicles = await getDocs(vehiclesCol);
      const batch = writeBatch(firestore);
      existingCrops.docs.forEach(d => batch.delete(d.ref));
      existingVehicles.docs.forEach(d => batch.delete(d.ref));
      await batch.commit();

      for (const crop of DEFAULT_CROPS) {
        await addDoc(cropsCol, { ...crop, createdAt: new Date().toISOString() });
      }
      for (const vehicle of DEFAULT_VEHICLES) {
        await addDoc(vehiclesCol, { ...vehicle, createdAt: new Date().toISOString() });
      }
      toast({ title: "Grid Re-Seeded", description: "Localized professional data deployed." });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Sync Failed", description: e.message });
    } finally {
      setSeeding(false);
    }
  };

  if (role !== "Expert") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="h-20 w-20 bg-destructive/10 rounded-full flex items-center justify-center text-destructive">
          <AlertCircle className="h-10 w-10" />
        </div>
        <h3 className="text-2xl font-black">Expert Access Required</h3>
        <p className="text-muted-foreground max-w-sm">This portal is reserved for certified agricultural scientists.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black flex items-center gap-3 text-slate-900">
            <FlaskConical className="h-8 w-8 text-primary" />
            Scientist Surveillance Hub
          </h2>
          <p className="text-muted-foreground font-medium mt-1">Deploy regional pest advisories and certify community field protocols.</p>
        </div>
        <div className="flex gap-4">
          <Dialog open={isAdvisoryDialogOpen} onOpenChange={setIsAdvisoryDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-2xl h-14 px-8 font-black text-lg bg-destructive hover:bg-destructive/90 shadow-xl shadow-destructive/20">
                <Bug className="h-6 w-6 mr-2" /> Deploy Field Advisory
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[2.5rem] sm:max-w-[500px] p-10">
              <DialogHeader>
                <DialogTitle className="text-3xl font-black tracking-tight flex items-center gap-3">
                  <Zap className="h-7 w-7 text-destructive" />
                  Issue Pest Alert
                </DialogTitle>
                <DialogDescription className="text-muted-foreground font-medium italic">Notify farmers about active insect spread.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleIssueAdvisory} className="space-y-6 pt-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground">Insect / Pest Species</Label>
                  <Input name="pestName" placeholder="e.g. Locust Swarm" required className="h-12 rounded-xl bg-muted/30 border-none font-bold" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground">Affected Region</Label>
                  <Input name="region" placeholder="e.g. Ludhiana Sector" required className="h-12 rounded-xl bg-muted/30 border-none font-bold" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground">Recommended Action</Label>
                  <Textarea name="pesticide" placeholder="Specify pesticide protocol..." required className="rounded-xl bg-muted/30 border-none min-h-[100px] font-medium" />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isSubmittingAdvisory} className="w-full h-14 rounded-2xl font-black text-lg bg-destructive hover:bg-destructive/90">
                    {isSubmittingAdvisory ? <Loader2 className="animate-spin" /> : "Broadcast to Grid"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={purgeAndSeed} disabled={seeding} className="rounded-2xl font-black px-6 h-14">
            {seeding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
            Reset Grid
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm p-6 bg-primary/5 rounded-3xl">
          <div className="flex items-center gap-3 mb-2">
            <Microscope className="h-5 w-5 text-primary" />
            <h4 className="text-[10px] font-black uppercase text-primary">Protocol Status</h4>
          </div>
          <p className="text-2xl font-black">Active Grid</p>
        </Card>
        <Card className="border-none shadow-sm p-6 bg-destructive/5 rounded-3xl">
          <div className="flex items-center gap-3 mb-2">
            <Bug className="h-5 w-5 text-destructive" />
            <h4 className="text-[10px] font-black uppercase text-destructive">Intelligence</h4>
          </div>
          <p className="text-2xl font-black">Active Surveillance</p>
        </Card>
        <Card className="border-none shadow-sm p-6 bg-slate-50 rounded-3xl">
          <div className="flex items-center gap-3 mb-2">
            <Database className="h-5 w-5 text-slate-500" />
            <h4 className="text-[10px] font-black uppercase text-slate-500">Registry</h4>
          </div>
          <p className="text-2xl font-black">{DEFAULT_CROPS.length} Profiles</p>
        </Card>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-80 rounded-[2.5rem]" />)}
        </div>
      ) : !pendingCerts || pendingCerts.length === 0 ? (
        <Card className="border-dashed border-2 p-24 text-center bg-muted/20 rounded-[3rem]">
          <ClipboardCheck className="h-12 w-12 text-primary opacity-50 mx-auto mb-8" />
          <h3 className="text-2xl font-black">Queue Clear</h3>
          <p className="text-muted-foreground mt-2 font-medium">No pending user-submitted protocols for verification.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendingCerts.map((cert) => (
            <Card key={cert.id} className="border-none shadow-xl bg-white rounded-[2.5rem] overflow-hidden flex flex-col hover:shadow-2xl transition-all duration-300">
              <div className="relative aspect-video">
                <img src={cert.imageUrl} className="w-full h-full object-cover" alt={cert.name} />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-white/90 text-black border-none font-black text-[8px] uppercase">{cert.category}</Badge>
                </div>
              </div>
              <CardHeader className="p-8">
                <CardTitle className="text-2xl font-black">{cert.name}</CardTitle>
                <div className="space-y-2 mt-4">
                  <p className="text-[10px] font-black text-muted-foreground uppercase">Diagnosed Problem</p>
                  <p className="text-sm font-bold text-destructive">{cert.diseaseName}</p>
                </div>
              </CardHeader>
              <CardFooter className="p-8 pt-0 mt-auto">
                <Button className="w-full h-12 rounded-xl font-black shadow-lg shadow-primary/20" onClick={() => handleVerify(cert.id)}>
                  <ShieldCheck className="h-4 w-4 mr-2" /> Certify Protocol
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
