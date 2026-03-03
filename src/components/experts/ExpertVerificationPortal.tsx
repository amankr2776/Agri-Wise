
'use client';

import React, { useState } from "react";
import { 
  ShieldCheck, 
  FlaskConical, 
  AlertCircle, 
  Leaf, 
  Bug, 
  ClipboardCheck,
  Loader2,
  Database,
  CheckCircle2
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFirestore, useCollection, useUser, useMemoFirebase } from "@/firebase";
import { collection, query, where, doc, addDoc, getDocs } from "firebase/firestore";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppState } from "@/lib/app-state";
import { useToast } from "@/hooks/use-toast";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError, type SecurityRuleContext } from "@/firebase/errors";

const DEFAULT_CROPS = [
  // Grains
  { name: "Paddy", category: "Grain", diseaseName: "Rice Blast", severity: "High", chemicalCure: "Tricyclazole 75% WP", chemicalDosage: "0.6g / L", desiNuskha: "Neem oil spray (3%) mixed with cow urine.", isCertified: false, imageUrl: "https://picsum.photos/seed/paddy1/800/400" },
  { name: "Wheat", category: "Grain", diseaseName: "Brown Rust", severity: "High", chemicalCure: "Propiconazole 25% EC", chemicalDosage: "1ml / L", desiNuskha: "Butter milk spray after fermentation for 3 days.", isCertified: false, imageUrl: "https://picsum.photos/seed/wheat1/800/400" },
  { name: "Maize", category: "Grain", diseaseName: "Fall Armyworm", severity: "Critical", chemicalCure: "Spinetoram 11.7% SC", chemicalDosage: "0.5ml / L", desiNuskha: "Sand and lime mixture in the whorls.", isCertified: false, imageUrl: "https://picsum.photos/seed/maize1/800/400" },
  { name: "Bajra", category: "Grain", diseaseName: "Downy Mildew", severity: "High", chemicalCure: "Metalaxyl 35% WS", chemicalDosage: "6g / kg seed", desiNuskha: "Salt water seed treatment (20% salt solution).", isCertified: false, imageUrl: "https://picsum.photos/seed/bajra1/800/400" },

  // Vegetables
  { name: "Tomato", category: "Vegetable", diseaseName: "Early Blight", severity: "Medium", chemicalCure: "Mancozeb 75% WP", chemicalDosage: "2.5g / L", desiNuskha: "Baking soda and soap water spray.", isCertified: false, imageUrl: "https://picsum.photos/seed/tomato1/800/400" },
  { name: "Potato", category: "Vegetable", diseaseName: "Late Blight", severity: "Critical", chemicalCure: "Metalaxyl 8% + Mancozeb 64%", chemicalDosage: "2g / L", desiNuskha: "Wood ash dusting on damp leaves.", isCertified: false, imageUrl: "https://picsum.photos/seed/potato1/800/400" },
  { name: "Onion", category: "Vegetable", diseaseName: "Purple Blotch", severity: "Medium", chemicalCure: "Tebuconazole 25.9% EC", chemicalDosage: "1ml / L", desiNuskha: "Onion peel extract fermented for 48 hours.", isCertified: false, imageUrl: "https://picsum.photos/seed/onion1/800/400" },
  { name: "Chili", category: "Vegetable", diseaseName: "Leaf Curl", severity: "High", chemicalCure: "Imidacloprid 17.8% SL", chemicalDosage: "0.5ml / L", desiNuskha: "Sour buttermilk spray (5 days old).", isCertified: false, imageUrl: "https://picsum.photos/seed/chili1/800/400" },
  { name: "Brinjal", category: "Vegetable", diseaseName: "Shoot & Fruit Borer", severity: "High", chemicalCure: "Chlorantraniliprole 18.5% SC", chemicalDosage: "0.4ml / L", desiNuskha: "Ginger-Garlic-Chili paste mixed with water.", isCertified: false, imageUrl: "https://picsum.photos/seed/brinjal1/800/400" },
  { name: "Cabbage", category: "Vegetable", diseaseName: "Diamondback Moth", severity: "High", chemicalCure: "Spinosad 45% SC", chemicalDosage: "0.3ml / L", desiNuskha: "Mustard intercropping as trap crop.", isCertified: false, imageUrl: "https://picsum.photos/seed/cabbage1/800/400" },
  { name: "Cauliflower", category: "Vegetable", diseaseName: "Downy Mildew", severity: "Medium", chemicalCure: "Ridomil Gold", chemicalDosage: "2g / L", desiNuskha: "Cow dung and urine extract spray.", isCertified: false, imageUrl: "https://picsum.photos/seed/cauliflower1/800/400" },

  // Fruits
  { name: "Mango", category: "Fruit", diseaseName: "Anthracnose", severity: "High", chemicalCure: "Carbendazim 50% WP", chemicalDosage: "1g / L", desiNuskha: "Pruning and copper oxychloride paste on cuts.", isCertified: false, imageUrl: "https://picsum.photos/seed/mango1/800/400" },
  { name: "Banana", category: "Fruit", diseaseName: "Panama Wilt", severity: "Critical", chemicalCure: "Carbendazim injection", chemicalDosage: "3ml / plant", desiNuskha: "Crop rotation with paddy and liming of soil.", isCertified: false, imageUrl: "https://picsum.photos/seed/banana1/800/400" },
  { name: "Grapes", category: "Fruit", diseaseName: "Downy Mildew", severity: "High", chemicalCure: "Bordeaux Mixture 1%", chemicalDosage: "10g / L", desiNuskha: "Garlic and cinnamon oil emulsion.", isCertified: false, imageUrl: "https://picsum.photos/seed/grapes1/800/400" },
  { name: "Apple", category: "Fruit", diseaseName: "Scab", severity: "High", chemicalCure: "Captan 50% WP", chemicalDosage: "2.5g / L", desiNuskha: "Urea spray (5%) after leaf fall.", isCertified: false, imageUrl: "https://picsum.photos/seed/apple1/800/400" },
  { name: "Guava", category: "Fruit", diseaseName: "Wilt", severity: "Critical", chemicalCure: "Benomyl soil drench", chemicalDosage: "2g / L", desiNuskha: "Application of Aspergillus niger in soil.", isCertified: false, imageUrl: "https://picsum.photos/seed/guava1/800/400" },
  { name: "Pomegranate", category: "Fruit", diseaseName: "Bacterial Blight", severity: "Critical", chemicalCure: "Streptocycline + Copper Oxychloride", chemicalDosage: "0.5g + 2.5g / L", desiNuskha: "Garlic extract and neem oil mixture.", isCertified: false, imageUrl: "https://picsum.photos/seed/pom1/800/400" },

  // Oilseeds
  { name: "Mustard", category: "Oilseed", diseaseName: "Alternaria Blight", severity: "Medium", chemicalCure: "Mancozeb 75% WP", chemicalDosage: "2.5g / L", desiNuskha: "Ginger-Garlic-Chili extract spray.", isCertified: false, imageUrl: "https://picsum.photos/seed/mustard1/800/400" },
  { name: "Sunflower", category: "Oilseed", diseaseName: "Head Rot", severity: "High", chemicalCure: "Sulfur 80% WP", chemicalDosage: "3g / L", desiNuskha: "Application of Trichoderma viride in soil.", isCertified: false, imageUrl: "https://picsum.photos/seed/sunflower1/800/400" },
  { name: "Groundnut", category: "Oilseed", diseaseName: "Tikka Disease", severity: "High", chemicalCure: "Chlorothalonil 75% WP", chemicalDosage: "2g / L", desiNuskha: "Seed treatment with Bijamrita.", isCertified: false, imageUrl: "https://picsum.photos/seed/groundnut1/800/400" },
  { name: "Soybean", category: "Oilseed", diseaseName: "Yellow Mosaic", severity: "High", chemicalCure: "Thiamethoxam 25% WG", chemicalDosage: "0.5g / L", desiNuskha: "Removal of infected plants and neem oil spray.", isCertified: false, imageUrl: "https://picsum.photos/seed/soy1/800/400" },

  // Plantation & Spices
  { name: "Coffee", category: "Plantation", diseaseName: "Leaf Rust", severity: "High", chemicalCure: "Hexaconazole 5% EC", chemicalDosage: "1ml / L", desiNuskha: "Providing shade and improving air circulation.", isCertified: false, imageUrl: "https://picsum.photos/seed/coffee1/800/400" },
  { name: "Tea", category: "Plantation", diseaseName: "Blister Blight", severity: "High", chemicalCure: "Copper Oxychloride + Nickel Chloride", chemicalDosage: "2g + 1g / L", desiNuskha: "Removal of shade trees and early pruning.", isCertified: false, imageUrl: "https://picsum.photos/seed/tea1/800/400" },
  { name: "Turmeric", category: "Spice", diseaseName: "Leaf Spot", severity: "Medium", chemicalCure: "Propiconazole 25% EC", chemicalDosage: "1ml / L", desiNuskha: "Rhizome treatment with cow dung slurry.", isCertified: false, imageUrl: "https://picsum.photos/seed/turmeric1/800/400" },
  { name: "Ginger", category: "Spice", diseaseName: "Soft Rot", severity: "Critical", chemicalCure: "Metalaxyl-M 4% + Mancozeb 64%", chemicalDosage: "2.5g / L", desiNuskha: "Proper drainage and crop rotation.", isCertified: false, imageUrl: "https://picsum.photos/seed/ginger1/800/400" },
  { name: "Black Pepper", category: "Spice", diseaseName: "Quick Wilt", severity: "Critical", chemicalCure: "Potassium Phosphonate", chemicalDosage: "3ml / L", desiNuskha: "Trichoderma harzianum soil application.", isCertified: false, imageUrl: "https://picsum.photos/seed/pepper1/800/400" },
  { name: "Cardamom", category: "Spice", diseaseName: "Katte Disease", severity: "High", chemicalCure: "Monocrotophos 36% SL", chemicalDosage: "1.5ml / L", desiNuskha: "Rogue out infected plants immediately.", isCertified: false, imageUrl: "https://picsum.photos/seed/card1/800/400" },

  // Cash Crops
  { name: "Cotton", category: "Cash Crop", diseaseName: "Pink Bollworm", severity: "Critical", chemicalCure: "Profenophos 50% EC", chemicalDosage: "2ml / L", desiNuskha: "Pheromone traps and light traps.", isCertified: false, imageUrl: "https://picsum.photos/seed/cotton1/800/400" },
  { name: "Sugarcane", category: "Cash Crop", diseaseName: "Red Rot", severity: "Critical", chemicalCure: "Carbendazim 50% WP", chemicalDosage: "1g / L", desiNuskha: "Use of healthy setts and soil liming.", isCertified: false, imageUrl: "https://picsum.photos/seed/sugarcane1/800/400" },
  { name: "Jute", category: "Cash Crop", diseaseName: "Stem Rot", severity: "High", chemicalCure: "Carbendazim 50% WP", chemicalDosage: "2g / L", desiNuskha: "Seed treatment with Garlic extract (2%).", isCertified: false, imageUrl: "https://picsum.photos/seed/jute1/800/400" },
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
    if (!firestore || !certId || !user) return;
    const docRef = doc(firestore, "crops", certId);
    
    updateDocumentNonBlocking(docRef, {
      isCertified: true,
      expertId: user.uid,
      verifiedAt: new Date().toISOString()
    });

    toast({
      title: "Certification Successful",
      description: "The remedy has been verified and added to the public registry.",
    });
  };

  const seedDatabase = async () => {
    if (!firestore) {
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Firestore instance is not available. Please check your connection.",
      });
      return;
    }

    setSeeding(true);
    toast({
      title: "Seeding Started",
      description: "Populating the agricultural registry with expert data...",
    });

    const colRef = collection(firestore, "crops");
    
    try {
      const existing = await getDocs(colRef);
      
      if (existing.empty) {
        let count = 0;
        const promises = DEFAULT_CROPS.map(async (crop) => {
          return addDoc(colRef, crop)
            .then(() => {
              count++;
            })
            .catch(async (serverError) => {
              // Detailed diagnostic reporting with a placeholder ID for rule matching visualization
              const permissionError = new FirestorePermissionError({
                path: `${colRef.path}/_auto_generated_id_`,
                operation: 'create',
                requestResourceData: crop,
              } satisfies SecurityRuleContext);
              errorEmitter.emit('permission-error', permissionError);
            });
        });

        await Promise.all(promises);

        if (count > 0) {
          toast({
            title: "Database Synced",
            description: `Successfully added ${count} professional crop profiles.`,
          });
        }
      } else {
        toast({
          title: "Registry Active",
          description: "Agricultural database is already populated with expert protocols.",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Sync Failed",
        description: "Missing or insufficient permissions. Triggering detailed diagnostic...",
      });
      
      const permissionError = new FirestorePermissionError({
        path: colRef.path,
        operation: 'list',
      } satisfies SecurityRuleContext);
      errorEmitter.emit('permission-error', permissionError);
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
        <p className="text-muted-foreground max-w-sm">This portal is reserved for certified agricultural scientists to verify regional remedies.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-80 rounded-[2.5rem]" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <FlaskConical className="h-8 w-8 text-primary" />
            Verification Queue
          </h2>
          <p className="text-muted-foreground font-medium mt-1 italic">Review and certify regional treatments for the national registry.</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={seedDatabase} 
            disabled={seeding}
            className="rounded-full border-primary/20 text-primary hover:bg-primary/5 font-bold px-6 shadow-sm h-12"
          >
            {seeding ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Seeding...
              </>
            ) : (
              <>
                <Database className="h-4 w-4 mr-2" />
                Populate Agri-Registry
              </>
            )}
          </Button>
        </div>
      </div>

      {!pendingCerts || pendingCerts.length === 0 ? (
        <Card className="border-dashed border-2 p-24 text-center bg-muted/20 rounded-[3rem]">
          <div className="bg-primary/10 h-24 w-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
            <ClipboardCheck className="h-12 w-12 text-primary opacity-50" />
          </div>
          <h3 className="text-2xl font-black text-slate-800">No Pending Items</h3>
          <p className="text-muted-foreground max-w-sm mx-auto mt-4 font-medium leading-relaxed">
            All submitted remedies have been processed. Use the "Populate Agri-Registry" button above to seed professional data if the registry is empty.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendingCerts.map((cert) => (
            <Card key={cert.id} className="border-none shadow-xl bg-white rounded-[2.5rem] overflow-hidden hover:translate-y-[-8px] transition-all duration-300 group">
              <CardHeader className="bg-muted/30 border-b p-8">
                <div className="flex justify-between items-start mb-4">
                  <Badge variant="outline" className="bg-white border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest px-3">
                    {cert.category}
                  </Badge>
                  <div className="h-10 w-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 shadow-sm">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-black text-slate-900">{cert.name}</CardTitle>
                <p className="text-xs font-bold text-muted-foreground uppercase">{cert.diseaseName}</p>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[10px] font-black text-destructive uppercase tracking-widest">
                    <Bug className="h-4 w-4" /> Target Pathogen
                  </div>
                  <p className="text-sm font-bold text-slate-700 bg-destructive/5 p-4 rounded-2xl border border-destructive/10">
                    {cert.diseaseName}
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest">
                    <Leaf className="h-4 w-4" /> Desi Nuskha
                  </div>
                  <p className="text-sm font-medium text-slate-600 bg-primary/5 p-4 rounded-2xl border border-primary/10 italic leading-relaxed">
                    "{cert.desiNuskha}"
                  </p>
                </div>
              </CardContent>
              <CardFooter className="p-8 bg-slate-50/50 border-t">
                <Button 
                  className="w-full bg-primary hover:bg-primary/90 font-black rounded-2xl h-14 shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                  onClick={() => handleVerify(cert.id)}
                >
                  <ShieldCheck className="h-5 w-5" />
                  Certify Professional Protocol
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
