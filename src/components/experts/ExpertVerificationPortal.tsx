
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
  // Plants
  { name: "Neem", category: "Plant", diseaseName: "Leaf Spot", severity: "Medium", chemicalCure: "Carbendazim 50% WP", chemicalDosage: "1g/L", desiNuskha: "Neem cake soil application.", isCertified: true, imageUrl: "https://images.unsplash.com/photo-1599307767316-776533da941c?q=80&w=800", irrigationInterval: 10, estimatedMarketPrice: 4500, sowingSeason: "Summer", soilType: "Alluvial" },
  { name: "Aloe Vera", category: "Plant", diseaseName: "Root Rot", severity: "Low", chemicalCure: "Mancozeb 75% WP", chemicalDosage: "2g/L", desiNuskha: "Stop watering for 7 days, apply sand.", isCertified: true, imageUrl: "https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?q=80&w=800", irrigationInterval: 15, estimatedMarketPrice: 8000, sowingSeason: "Year-round", soilType: "Sandy" },
  { name: "Ashwagandha", category: "Plant", diseaseName: "Wilt", severity: "High", chemicalCure: "Copper Oxychloride", chemicalDosage: "3g/L", desiNuskha: "Treated cow dung application.", isCertified: true, imageUrl: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?q=80&w=800", irrigationInterval: 8, estimatedMarketPrice: 25000, sowingSeason: "Monsoon", soilType: "Red soil" },
  
  // Seeds
  { name: "Hybrid Paddy", category: "Seed", diseaseName: "Fungal Infection", severity: "Medium", chemicalCure: "Thiram 75% DS", chemicalDosage: "3g/kg", desiNuskha: "Solar heat treatment.", isCertified: true, imageUrl: "https://images.unsplash.com/photo-1536633340743-0974bb27c7a3?q=80&w=800", irrigationInterval: 2, estimatedMarketPrice: 3500, sowingSeason: "Kharif", soilType: "Clayey" },
  { name: "BT Cotton", category: "Seed", diseaseName: "Seedling Rot", severity: "High", chemicalCure: "Carboxin 75% WP", chemicalDosage: "2g/kg", desiNuskha: "Beejamrutha treatment.", isCertified: true, imageUrl: "https://images.unsplash.com/photo-1594900035071-70e176378e9f?q=80&w=800", irrigationInterval: 5, estimatedMarketPrice: 12000, sowingSeason: "Kharif", soilType: "Black soil" },
  
  // Vegetables
  { name: "Tomato", category: "Vegetable", diseaseName: "Early Blight", severity: "Medium", chemicalCure: "Chlorothalonil 75% WP", chemicalDosage: "2g/L", desiNuskha: "Baking soda spray.", isCertified: true, imageUrl: "https://images.unsplash.com/photo-1592841200221-a6898f307baa?q=80&w=800", irrigationInterval: 4, estimatedMarketPrice: 3500, sowingSeason: "Summer/Winter", soilType: "Loamy" },
  { name: "Potato", category: "Vegetable", diseaseName: "Late Blight", severity: "Critical", chemicalCure: "Cymoxanil 8% + Mancozeb 64%", chemicalDosage: "2.5g/L", desiNuskha: "Wood ash dusting.", isCertified: true, imageUrl: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?q=80&w=800", irrigationInterval: 8, estimatedMarketPrice: 1800, sowingSeason: "Winter", soilType: "Sandy Loam" },
  { name: "Onion", category: "Vegetable", diseaseName: "Purple Blotch", severity: "Medium", chemicalCure: "Tebuconazole 25.9% EC", chemicalDosage: "1ml/L", desiNuskha: "Butter milk and turmeric spray.", isCertified: true, imageUrl: "https://images.unsplash.com/photo-1508747703725-719777637510?q=80&w=800", irrigationInterval: 10, estimatedMarketPrice: 2800, sowingSeason: "Winter/Rabi", soilType: "Sandy Loam" },
  
  // Fruits
  { name: "Mango", category: "Fruit", diseaseName: "Anthracnose", severity: "High", chemicalCure: "Carbendazim 50% WP", chemicalDosage: "1g/L", desiNuskha: "Proper pruning and sanitation.", isCertified: true, imageUrl: "https://images.unsplash.com/photo-1553279768-865429fa0078?q=80&w=800", irrigationInterval: 15, estimatedMarketPrice: 8500, sowingSeason: "Summer", soilType: "Laterite" },
  { name: "Banana", category: "Fruit", diseaseName: "Panama Wilt", severity: "Critical", chemicalCure: "Carbendazim injection", chemicalDosage: "3ml/plant", desiNuskha: "Crop rotation with paddy.", isCertified: true, imageUrl: "https://images.unsplash.com/photo-1603833665858-e61d17a86224?q=80&w=800", irrigationInterval: 5, estimatedMarketPrice: 4200, sowingSeason: "Spring", soilType: "Rich Loam" },
  { name: "Grapes", category: "Fruit", diseaseName: "Downy Mildew", severity: "High", chemicalCure: "Metalaxyl 8% + Mancozeb 64%", chemicalDosage: "2.5g/L", desiNuskha: "Garlic and soap water spray.", isCertified: true, imageUrl: "https://images.unsplash.com/photo-1537640538966-79f369143f8c?q=80&w=800", irrigationInterval: 7, estimatedMarketPrice: 6500, sowingSeason: "Winter", soilType: "Well-drained Sandy" },
  
  // Grains
  { name: "Wheat", category: "Grain", diseaseName: "Brown Rust", severity: "High", chemicalCure: "Propiconazole 25% EC", chemicalDosage: "1ml/L", desiNuskha: "Fermented buttermilk spray.", isCertified: true, imageUrl: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?q=80&w=800", irrigationInterval: 12, estimatedMarketPrice: 2450, sowingSeason: "Rabi", soilType: "Loamy" },
  { name: "Paddy", category: "Grain", diseaseName: "Rice Blast", severity: "High", chemicalCure: "Tricyclazole 75% WP", chemicalDosage: "0.6g/L", desiNuskha: "Neem oil and cow urine spray.", isCertified: true, imageUrl: "https://images.unsplash.com/photo-1536633340743-0974bb27c7a3?q=80&w=800", irrigationInterval: 3, estimatedMarketPrice: 2200, sowingSeason: "Kharif", soilType: "Clayey" },
  { name: "Maize", category: "Grain", diseaseName: "Fall Armyworm", severity: "Critical", chemicalCure: "Spinetoram 11.7% SC", chemicalDosage: "0.5ml/L", desiNuskha: "Sand and lime in the leaf whorls.", isCertified: true, imageUrl: "https://images.unsplash.com/photo-1551731589-23178d64cb21?q=80&w=800", irrigationInterval: 7, estimatedMarketPrice: 1950, sowingSeason: "Kharif/Rabi", soilType: "Loamy" }
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
      verifiedAt: new Date().toISOString()
    });
    toast({ title: "Protocol Certified", description: "Verified and added to the registry." });
  };

  const purgeAndSeed = async () => {
    if (!firestore) return;
    setSeeding(true);
    try {
      const cropsCol = collection(firestore, "crops");
      const existingCrops = await getDocs(cropsCol);
      const batch = writeBatch(firestore);
      existingCrops.docs.forEach(d => batch.delete(d.ref));
      await batch.commit();

      for (const crop of DEFAULT_CROPS) {
        await addDoc(cropsCol, { ...crop, createdAt: new Date().toISOString() });
      }
      toast({ title: "Grid Re-Seeded", description: "Localized professional data deployed." });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Sync Failed", description: e.message });
    } finally {
      setSeeding(false);
    }
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
            <FlaskConical className="h-8 w-8 text-primary" />
            Surveillance Hub
          </h2>
          <p className="text-muted-foreground font-medium mt-1">Deploy regional pest advisories and certify field protocols.</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" onClick={purgeAndSeed} disabled={seeding} className="rounded-2xl font-black px-6 h-14">
            {seeding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Database className="h-4 w-4 mr-2" />}
            Reset & Sync Registry
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
              </div>
              <CardHeader className="p-8">
                <CardTitle className="text-2xl font-black">{cert.name}</CardTitle>
                <div className="space-y-2 mt-4">
                  <p className="text-[10px] font-black text-muted-foreground uppercase">Diagnosed Problem</p>
                  <p className="text-sm font-bold text-destructive">{cert.diseaseName}</p>
                </div>
              </CardHeader>
              <CardFooter className="p-8 pt-0 mt-auto">
                <Button className="w-full h-12 rounded-xl font-black" onClick={() => handleVerify(cert.id)}>
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
