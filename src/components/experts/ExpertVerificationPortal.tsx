
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
  Trash2
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFirestore, useCollection, useUser, useMemoFirebase } from "@/firebase";
import { collection, query, where, doc, addDoc, getDocs, deleteDoc, writeBatch } from "firebase/firestore";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppState } from "@/lib/app-state";
import { useToast } from "@/hooks/use-toast";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError, type SecurityRuleContext } from "@/firebase/errors";

const DEFAULT_CROPS = [
  // Grains
  { name: "Paddy", category: "Grain", diseaseName: "Rice Blast", severity: "High", chemicalCure: "Tricyclazole 75% WP", chemicalDosage: "0.6g / L", desiNuskha: "Neem oil spray (3%) mixed with cow urine.", isCertified: true, imageUrl: "https://images.unsplash.com/photo-1536633340743-0974bb27c7a3?q=80&w=800&auto=format&fit=crop", irrigationInterval: 3, estimatedPrice: 2150, sowingSeason: "Kharif", soilType: "Clayey Loam" },
  { name: "Wheat", category: "Grain", diseaseName: "Brown Rust", severity: "High", chemicalCure: "Propiconazole 25% EC", chemicalDosage: "1ml / L", desiNuskha: "Butter milk spray after fermentation for 3 days.", isCertified: true, imageUrl: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?q=80&w=800&auto=format&fit=crop", irrigationInterval: 12, estimatedPrice: 2450, sowingSeason: "Rabi", soilType: "Loamy" },
  { name: "Maize", category: "Grain", diseaseName: "Fall Armyworm", severity: "Critical", chemicalCure: "Spinetoram 11.7% SC", chemicalDosage: "0.5ml / L", desiNuskha: "Sand and lime mixture in the whorls.", isCertified: true, imageUrl: "https://images.unsplash.com/photo-1551731589-23178d64cb21?q=80&w=800&auto=format&fit=crop", irrigationInterval: 7, estimatedPrice: 1950, sowingSeason: "Kharif", soilType: "Well-drained Loam" },

  // Vegetables
  { name: "Tomato", category: "Vegetable", diseaseName: "Early Blight", severity: "Medium", chemicalCure: "Mancozeb 75% WP", chemicalDosage: "2.5g / L", desiNuskha: "Baking soda and soap water spray.", isCertified: true, imageUrl: "https://images.unsplash.com/photo-1592841200221-a6898f307baa?q=80&w=800&auto=format&fit=crop", irrigationInterval: 4, estimatedPrice: 3200, sowingSeason: "Year-round", soilType: "Sandy Loam" },
  { name: "Potato", category: "Vegetable", diseaseName: "Late Blight", severity: "Critical", chemicalCure: "Metalaxyl 8% + Mancozeb 64%", chemicalDosage: "2g / L", desiNuskha: "Wood ash dusting on damp leaves.", isCertified: true, imageUrl: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?q=80&w=800&auto=format&fit=crop", irrigationInterval: 8, estimatedPrice: 1800, sowingSeason: "Rabi", soilType: "Alluvial" },

  // Fruits
  { name: "Mango", category: "Fruit", diseaseName: "Anthracnose", severity: "High", chemicalCure: "Carbendazim 50% WP", chemicalDosage: "1g / L", desiNuskha: "Pruning and copper oxychloride paste on cuts.", isCertified: true, imageUrl: "https://images.unsplash.com/photo-1553279768-865429fa0078?q=80&w=800&auto=format&fit=crop", irrigationInterval: 15, estimatedPrice: 8500, sowingSeason: "Summer", soilType: "Laterite" },
  { name: "Banana", category: "Fruit", diseaseName: "Panama Wilt", severity: "Critical", chemicalCure: "Carbendazim injection", chemicalDosage: "3ml / plant", desiNuskha: "Crop rotation with paddy and liming of soil.", isCertified: true, imageUrl: "https://images.unsplash.com/photo-1603833665858-e61d17a86224?q=80&w=800&auto=format&fit=crop", irrigationInterval: 5, estimatedPrice: 3500, sowingSeason: "Spring", soilType: "Rich Loam" },

  // Seeds (Example crops often grown from specific seed types)
  { name: "Mustard Seed", category: "Seed", diseaseName: "Alternaria Blight", severity: "Medium", chemicalCure: "Mancozeb 75% WP", chemicalDosage: "2.5g / L", desiNuskha: "Ginger-Garlic-Chili extract spray.", isCertified: true, imageUrl: "https://images.unsplash.com/photo-1508013861974-9f6347163ebe?q=80&w=800&auto=format&fit=crop", irrigationInterval: 20, estimatedPrice: 5400, sowingSeason: "Rabi", soilType: "Light Loam" },
  { name: "Soybean Seed", category: "Seed", diseaseName: "Yellow Mosaic", severity: "High", chemicalCure: "Thiamethoxam 25% WG", chemicalDosage: "0.5g / L", desiNuskha: "Removal of infected plants and neem oil spray.", isCertified: true, imageUrl: "https://images.unsplash.com/photo-1599599810694-b5b37304c041?q=80&w=800&auto=format&fit=crop", irrigationInterval: 10, estimatedPrice: 4200, sowingSeason: "Kharif", soilType: "Black Cotton Soil" },

  // Plants (Plantation/Ornamental/Others)
  { name: "Cotton Plant", category: "Plant", diseaseName: "Pink Bollworm", severity: "Critical", chemicalCure: "Profenophos 50% EC", chemicalDosage: "2ml / L", desiNuskha: "Pheromone traps and light traps.", isCertified: true, imageUrl: "https://images.unsplash.com/photo-1594904351111-a072f80b1a71?q=80&w=800&auto=format&fit=crop", irrigationInterval: 14, estimatedPrice: 7200, sowingSeason: "Kharif", soilType: "Black Cotton" },
  { name: "Tea Plant", category: "Plant", diseaseName: "Blister Blight", severity: "High", chemicalCure: "Copper Oxychloride", chemicalDosage: "2g / L", desiNuskha: "Early pruning and shade management.", isCertified: true, imageUrl: "https://images.unsplash.com/photo-1594631252845-29fc458695d7?q=80&w=800&auto=format&fit=crop", irrigationInterval: 1, estimatedPrice: 12000, sowingSeason: "Perennial", soilType: "Acidic Forest Soil" },
];

export function ExpertVerificationPortal() {
  const firestore = useFirestore();
  const { role } = useAppState();
  const { user } = useUser();
  const { toast } = useToast();
  const [seeding, setSeeding] = useState(false);

  const pendingCertsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, "crops"),
      where("isCertified", "==", false)
    );
  }, [firestore]);

  const { data: pendingCerts, isLoading } = useCollection(pendingCertsQuery);

  const handleVerify = (certId: string) => {
    if (!firestore || !certId) return;
    const docRef = doc(firestore, "crops", certId);
    updateDocumentNonBlocking(docRef, {
      isCertified: true,
      expertId: user?.uid || "anonymous_expert",
      verifiedAt: new Date().toISOString()
    });
    toast({ title: "Protocol Certified", description: "Verified and added to the registry." });
  };

  const purgeAndSeed = async () => {
    if (!firestore) return;
    setSeeding(true);
    toast({ title: "Syncing Registry", description: "Purging old data and re-seeding advanced profiles..." });

    const colRef = collection(firestore, "crops");
    try {
      const existing = await getDocs(colRef);
      const batch = writeBatch(firestore);
      
      // Purge
      existing.docs.forEach(d => batch.delete(d.ref));
      await batch.commit();

      // Seed
      for (const crop of DEFAULT_CROPS) {
        await addDoc(colRef, { ...crop, createdAt: new Date().toISOString() });
      }

      toast({ title: "Registry Re-Seeded", description: `Successfully added ${DEFAULT_CROPS.length} optimized profiles.` });
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
          <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <FlaskConical className="h-8 w-8 text-primary" />
            Advanced Verification Queue
          </h2>
          <p className="text-muted-foreground font-medium mt-1">Manage high-fidelity crop profiles and certification.</p>
        </div>
        <Button 
          variant="outline" 
          onClick={purgeAndSeed} 
          disabled={seeding}
          className="rounded-full border-primary/20 text-primary hover:bg-primary/5 font-black px-6 h-12"
        >
          {seeding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
          Purge & Re-Seed Registry
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-80 rounded-[2.5rem]" />)}
        </div>
      ) : !pendingCerts || pendingCerts.length === 0 ? (
        <Card className="border-dashed border-2 p-24 text-center bg-muted/20 rounded-[3rem]">
          <ClipboardCheck className="h-12 w-12 text-primary opacity-50 mx-auto mb-8" />
          <h3 className="text-2xl font-black text-slate-800">No Pending Submissions</h3>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendingCerts.map((cert) => (
            <Card key={cert.id} className="border-none shadow-xl bg-white rounded-[2.5rem] overflow-hidden flex flex-col">
              <img src={cert.imageUrl} className="aspect-video w-full object-cover" alt={cert.name} />
              <CardHeader className="p-8">
                <CardTitle className="text-2xl font-black">{cert.name}</CardTitle>
                <Badge variant="secondary" className="w-fit mt-2">{cert.category}</Badge>
              </CardHeader>
              <CardFooter className="p-8 pt-0 mt-auto">
                <Button className="w-full h-12 rounded-xl font-bold" onClick={() => handleVerify(cert.id)}>
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
