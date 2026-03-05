"use client";

import React, { useState, useRef } from "react";
import { Camera, Search, Loader2, CheckCircle2, Leaf, Bug, FlaskConical, Droplets, ShieldCheck, ShieldAlert, UserCheck, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { diagnoseCropPest, FarmerCropPestDiagnosisOutput } from "@/ai/flows/farmer-crop-pest-diagnosis";
import { useFirestore } from "@/firebase";
import { collection } from "firebase/firestore";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useAppState } from "@/lib/app-state";
import { motion } from "framer-motion";

export function DiagnosticTool() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const { language, langCode } = useAppState();
  
  const [cropType, setCropType] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FarmerCropPestDiagnosisOutput | null>(null);
  const [isSentToExpert, setIsSentToExpert] = useState(false);
  
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleDiagnose = async () => {
    if (!cropType) {
      toast({
        variant: "destructive",
        title: "Input Required",
        description: "Please specify the crop, plant, or vegetable for diagnosis.",
      });
      return;
    }
    setLoading(true);
    setIsSentToExpert(false);
    setResult(null);
    
    try {
      const res = await diagnoseCropPest({
        cropType,
        symptomsDescription: symptoms,
        photoDataUri: photo || undefined,
        language: language
      });
      setResult(res);
      
      // Automatically trigger Bhashini TTS for the result in the target language script
      speakResult(res);
      
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "AI Analysis Failed",
        description: "Could not complete the diagnostic scan. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const speakResult = async (resData: FarmerCropPestDiagnosisOutput) => {
    // Combine the translated fields for voice synthesis
    const text = `${resData.diagnosis}. ${resData.suggestedChemicalRemedies[0]}. ${resData.suggestedTraditionalRemedies[0]}`;
    
    setIsSpeaking(true);
    try {
      const response = await fetch('/api/bhashini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, langCode })
      });

      const data = await response.json();

      if (data.audioContent) {
        if (!audioRef.current) audioRef.current = new Audio();
        audioRef.current.src = `data:audio/wav;base64,${data.audioContent}`;
        audioRef.current.onended = () => setIsSpeaking(false);
        audioRef.current.play();
      } else {
        // Fallback to browser TTS if neural bridge is offline, but try to force the correct lang
        const utterance = new SpeechSynthesisUtterance(text);
        const speechLang = langCode === 'hi' ? 'hi-IN' : langCode === 'pa' ? 'pa-IN' : langCode === 'bn' ? 'bn-IN' : 'en-IN';
        utterance.lang = speechLang;
        utterance.onend = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      console.error("Vocal Sync Error:", err);
      setIsSpeaking(false);
    }
  };

  const handleSendToExpert = () => {
    if (!firestore || !result) return;
    
    const colRef = collection(firestore, "crops");
    const newCropData = {
      name: cropType,
      category: "Plant",
      diseaseName: result.diagnosis,
      severity: "Medium",
      imageUrl: photo || `https://picsum.photos/seed/${Date.now()}/800/400`,
      chemicalCure: result.suggestedChemicalRemedies[0] || "Awaiting Professional Review",
      chemicalDosage: "Consult Certified Expert",
      desiNuskha: result.suggestedTraditionalRemedies[0] || "Awaiting Expert Verification",
      isCertified: false,
      irrigationInterval: 7,
      estimatedMarketPrice: 2200,
      sowingSeason: "Spring",
      soilType: "Alluvial",
      createdAt: new Date().toISOString()
    };

    addDocumentNonBlocking(colRef, newCropData);
    setIsSentToExpert(true);
    
    toast({
      title: "Sent to Professional Queue",
      description: "A certified scientist will review this diagnostic scan and update the registry.",
    });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto pb-12">
      <div className="lg:col-span-2 space-y-6">
        <Card className="border-none shadow-xl rounded-[2.5rem] p-8 bg-white overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Leaf className="h-32 w-32 rotate-45" />
          </div>
          <CardHeader className="p-0 mb-8 relative z-10">
            <CardTitle className="text-2xl font-black flex items-center gap-3">
              <FlaskConical className="h-7 w-7 text-primary" />
              Advanced Field Scan
            </CardTitle>
            <CardDescription className="text-muted-foreground font-medium">Identify pests and diseases with Multimodal Agri-AI</CardDescription>
          </CardHeader>
          
          <CardContent className="p-0 space-y-8 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Crop / Plant Species</label>
                  <Input
                    placeholder="e.g. Paddy, Mango, Tomato, Wheat"
                    value={cropType}
                    onChange={(e) => setCropType(e.target.value)}
                    className="rounded-2xl h-12 bg-muted/30 border-none font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Observations</label>
                  <Textarea
                    placeholder="Describe specific symptoms (e.g., leaf curls, yellow spots)..."
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    className="rounded-2xl bg-muted/30 border-none min-h-[140px] font-medium"
                  />
                </div>
              </div>

              <div className="space-y-8">
                <div className="relative group bg-muted/30 border-2 border-dashed border-border rounded-3xl p-6 text-center hover:bg-primary/5 transition-all cursor-pointer overflow-hidden min-h-[220px] flex items-center justify-center">
                  <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-20" onChange={handlePhotoUpload} />
                  <div className="flex flex-col items-center">
                    {photo ? (
                      <div className="relative h-40 w-full">
                        <img src={photo} alt="Preview" className="h-40 w-full object-cover rounded-2xl shadow-md" />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                          <Camera className="text-white h-6 w-6" />
                        </div>
                      </div>
                    ) : (
                      <>
                        <Camera className="h-10 w-10 text-muted-foreground/40 mb-2 group-hover:text-primary transition-colors" />
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Upload Leaf/Pest Image</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <Button 
              className="w-full h-14 text-lg font-black bg-primary hover:bg-primary/90 rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
              disabled={loading}
              onClick={handleDiagnose}
            >
              {loading ? <Loader2 className="h-6 w-6 animate-spin mr-2" /> : <Search className="h-6 w-6 mr-2" />}
              Initiate Multimodal AI Scan
            </Button>
          </CardContent>
        </Card>

        {result && (
          <Card className="border-none shadow-xl rounded-[2.5rem] p-8 bg-white animate-in slide-in-from-bottom-4 space-y-8">
            <CardHeader className="p-0">
              <div className="flex justify-between items-start">
                <CardTitle className="text-2xl font-black flex items-center gap-3 text-primary">
                  <CheckCircle2 className="h-7 w-7" />
                  AI Analysis: {result.diagnosis}
                </CardTitle>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={cn("h-10 w-10 rounded-full", isSpeaking && "bg-primary text-white animate-pulse")}
                    onClick={() => speakResult(result)}
                  >
                    <Volume2 className="h-5 w-5" />
                  </Button>
                  <Badge className="bg-primary/10 text-primary border-none font-bold uppercase tracking-wider text-[10px] px-3">Field Preliminary</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-destructive uppercase tracking-widest flex items-center gap-2">
                    Professional Neutralizers
                  </h4>
                  <ul className="space-y-3">
                    {result.suggestedChemicalRemedies.map((rem, i) => (
                      <li key={i} className="p-4 rounded-2xl bg-destructive/5 text-sm font-bold border border-destructive/10 text-destructive">
                        {rem}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                    Heritage Wisdom (Desi Nuskha)
                  </h4>
                  <ul className="space-y-3">
                    {result.suggestedTraditionalRemedies.map((rem, i) => (
                      <li key={i} className="p-4 rounded-2xl bg-primary/5 text-sm font-medium border border-primary/10 italic text-primary">
                        {rem}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-8 border-t flex flex-col items-center gap-4">
                <div className="flex items-center gap-3 text-sm text-muted-foreground italic font-medium text-center">
                  <ShieldAlert className="h-5 w-5 text-amber-500 shrink-0" />
                  AI results are preliminary. For professional certification, send to expert queue.
                </div>
                <Button 
                  onClick={handleSendToExpert}
                  disabled={isSentToExpert}
                  variant="outline"
                  className={cn(
                    "w-full max-w-md h-12 rounded-xl font-black gap-2 transition-all",
                    isSentToExpert ? "bg-green-50 text-green-600 border-green-200" : "border-primary/20 text-primary hover:bg-primary/5"
                  )}
                >
                  <FlaskConical className="h-5 w-5" /> Request Human Expert Review
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="space-y-6">
        <Card className="border-none shadow-xl rounded-[2.5rem] p-8 bg-white">
          <CardHeader className="p-0 mb-6">
            <CardTitle className="text-[10px] font-black flex items-center gap-2 text-primary uppercase tracking-widest">
              <ShieldCheck className="h-4 w-4" /> Biosecurity Oversight
            </CardTitle>
          </CardHeader>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground uppercase">Vocal Confidence</span>
                  {isSpeaking && (
                    <div className="flex gap-0.5 items-center">
                      {[1, 2, 3].map(i => (
                        <motion.div 
                          key={i} 
                          animate={{ height: [4, 10, 4] }} 
                          transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                          className="w-0.5 bg-primary rounded-full"
                        />
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-primary">{result ? "Neural Active" : "Ready"}</span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div className={cn("h-full bg-primary transition-all duration-1000", result ? "w-[92%]" : "w-0")} />
              </div>
            </div>
            {isSpeaking && (
              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-center gap-3 animate-in fade-in">
                <Volume2 className="h-4 w-4 text-primary animate-pulse" />
                <span className="text-[9px] font-black uppercase text-primary tracking-widest">Bhashini Neural Stream: {language}</span>
              </div>
            )}
          </div>
        </Card>
      </div>
      <audio ref={audioRef} className="hidden" />
    </div>
  );
}
