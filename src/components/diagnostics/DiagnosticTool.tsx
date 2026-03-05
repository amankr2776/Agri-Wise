"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Camera, 
  Search, 
  Loader2, 
  CheckCircle2, 
  Leaf, 
  Bug, 
  FlaskConical, 
  Droplets, 
  ShieldCheck, 
  ShieldAlert, 
  UserCheck, 
  Volume2,
  Mic,
  MicOff,
  Bot,
  AlertTriangle
} from "lucide-react";
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

const LANG_MAP: Record<string, string> = {
  "English": "en-IN",
  "Hindi": "hi-IN",
  "Punjabi": "pa-IN",
  "Bengali": "bn-IN",
  "Marathi": "mr-IN",
  "Telugu": "te-IN",
  "Tamil": "ta-IN",
  "Gujarati": "gu-IN",
  "Kannada": "kn-IN",
  "Malayalam": "ml-IN",
};

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
  const [isListening, setIsListening] = useState(false);
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
      
      // Automatically trigger Bhashini TTS for the result
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

  const toggleListening = () => {
    const recognitionClass = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    
    if (!recognitionClass) {
      toast({
        variant: "destructive",
        title: "Voice Not Supported",
        description: "Your browser does not support Bhashini ASR bridge.",
      });
      return;
    }

    const recognition = new recognitionClass();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = LANG_MAP[language] || "en-IN";

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSymptoms(prev => prev ? `${prev} ${transcript}` : transcript);
      toast({ title: "Vocal Input Transcribed", description: `Bhashini Node (${language}) active.` });
    };

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };

  const speakResult = async (resData: FarmerCropPestDiagnosisOutput) => {
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
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = langCode === 'hi' ? 'hi-IN' : 'en-IN';
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
      severity: result.isBotanicallyValid ? "Medium" : "Warning",
      imageUrl: photo || `https://picsum.photos/seed/${Date.now()}/800/400`,
      chemicalCure: result.suggestedChemicalRemedies[0] || "Awaiting Review",
      desiNuskha: result.suggestedTraditionalRemedies[0] || "Awaiting Verification",
      isCertified: false,
      createdAt: new Date().toISOString()
    };

    addDocumentNonBlocking(colRef, newCropData);
    setIsSentToExpert(true);
    
    toast({
      title: "Sent to Professional Queue",
      description: "A certified scientist will review this diagnostic scan.",
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
            <CardTitle className="text-2xl font-black flex items-center gap-3 text-slate-900">
              <FlaskConical className="h-7 w-7 text-primary" />
              Advanced Field Scan
            </CardTitle>
            <CardDescription className="text-muted-foreground font-medium">Multimodal Agronomist Engine • Bhashini ASR Active</CardDescription>
          </CardHeader>
          
          <CardContent className="p-0 space-y-8 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-4">Target Crop family</label>
                  <Input
                    placeholder="e.g. Tomato, Wheat, Mango"
                    value={cropType}
                    onChange={(e) => setCropType(e.target.value)}
                    className="rounded-2xl h-14 bg-muted/30 border-none font-black text-lg focus-visible:ring-primary"
                  />
                </div>
                <div className="space-y-2 relative">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-4">Observations (Speak or Type)</label>
                  <Textarea
                    placeholder="Describe specific symptoms..."
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    className="rounded-2xl bg-muted/30 border-none min-h-[160px] font-medium p-6 focus-visible:ring-primary"
                  />
                  <Button 
                    variant={isListening ? "destructive" : "secondary"}
                    size="icon"
                    onClick={toggleListening}
                    className={cn(
                      "absolute bottom-4 right-4 h-12 w-12 rounded-xl shadow-lg transition-all",
                      isListening && "animate-pulse"
                    )}
                  >
                    {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-8">
                <div className="relative group bg-muted/30 border-2 border-dashed border-border rounded-[2rem] p-6 text-center hover:bg-primary/5 transition-all cursor-pointer overflow-hidden min-h-[220px] flex items-center justify-center">
                  <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-20" onChange={handlePhotoUpload} />
                  <div className="flex flex-col items-center">
                    {photo ? (
                      <div className="relative h-48 w-full">
                        <img src={photo} alt="Preview" className="h-48 w-full object-cover rounded-2xl shadow-md" />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                          <Camera className="text-white h-8 w-8" />
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                          <Camera className="h-8 w-8 text-primary" />
                        </div>
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Snap Affected Leaf</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <Button 
              className="w-full h-16 text-xl font-black bg-primary hover:bg-primary/90 rounded-[2rem] shadow-xl shadow-primary/20 transition-all active:scale-[0.98]"
              disabled={loading}
              onClick={handleDiagnose}
            >
              {loading ? <Loader2 className="h-6 w-6 animate-spin mr-3" /> : <Search className="h-6 w-6 mr-3" />}
              Analyze Botanicals
            </Button>
          </CardContent>
        </Card>

        {result && (
          <Card className={cn(
            "border-none shadow-2xl rounded-[3rem] p-10 bg-white animate-in slide-in-from-bottom-4 space-y-8",
            !result.isBotanicallyValid && "ring-4 ring-amber-400"
          )}>
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-3xl font-black tracking-tight text-slate-900">{result.diagnosis}</h3>
                  {result.isBotanicallyValid ? (
                    <Badge className="bg-primary/10 text-primary border-none px-3 font-black text-[9px] uppercase">Verified logic</Badge>
                  ) : (
                    <Badge variant="destructive" className="animate-pulse px-3 font-black text-[9px] uppercase gap-1">
                      <AlertTriangle className="h-3 w-3" /> Generic Logic
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground font-medium italic">Confidence: {Math.round(result.confidenceScore * 100)}% Match to {cropType} family</p>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn("h-14 w-14 rounded-2xl bg-muted hover:bg-primary hover:text-white transition-all", isSpeaking && "bg-primary text-white animate-pulse")}
                onClick={() => speakResult(result)}
              >
                <Volume2 className="h-6 w-6" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-8 rounded-[2.5rem] bg-destructive/5 border border-destructive/10 space-y-4">
                <h4 className="text-[10px] font-black text-destructive uppercase tracking-[0.2em] flex items-center gap-2">
                  <FlaskConical className="h-4 w-4" /> Professional Neutralizer
                </h4>
                <ul className="space-y-3">
                  {result.suggestedChemicalRemedies.map((rem, i) => (
                    <li key={i} className="text-lg font-bold text-slate-900 leading-tight">
                      • {rem}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-8 rounded-[2.5rem] bg-primary/5 border border-primary/10 space-y-4">
                <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                  <Zap className="h-4 w-4" /> Heritage Wisdom (Desi Nuskha)
                </h4>
                <ul className="space-y-3">
                  {result.suggestedTraditionalRemedies.map((rem, i) => (
                    <li key={i} className="text-lg font-medium text-slate-700 italic leading-tight">
                      "{rem}"
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-8 border-t flex flex-col items-center gap-6">
              {!result.isBotanicallyValid && (
                <div className="flex items-center gap-3 text-sm text-amber-600 bg-amber-50 p-4 rounded-2xl border border-amber-100 font-medium">
                  <AlertTriangle className="h-5 w-5 shrink-0" />
                  Botanical precision alert: This cure is a broad-spectrum fallback. Human Expert review highly recommended.
                </div>
              )}
              <Button 
                onClick={handleSendToExpert}
                disabled={isSentToExpert}
                className={cn(
                  "w-full max-w-md h-14 rounded-2xl font-black gap-3 transition-all",
                  isSentToExpert ? "bg-green-50 text-green-600 border border-green-200" : "bg-slate-900 text-white hover:bg-slate-800"
                )}
              >
                <UserCheck className="h-5 w-5" /> 
                {isSentToExpert ? "Human Scientist Notified" : "Request Human Scientist Review"}
              </Button>
            </div>
          </Card>
        )}
      </div>

      <div className="space-y-6">
        <Card className="border-none shadow-xl rounded-[2.5rem] p-8 bg-slate-900 text-white">
          <CardHeader className="p-0 mb-6">
            <CardTitle className="text-[10px] font-black flex items-center gap-2 text-primary uppercase tracking-widest">
              <ShieldCheck className="h-4 w-4" /> Bhashini Network Node
            </CardTitle>
          </CardHeader>
          <div className="space-y-8">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[10px] font-black uppercase">
                <span className="text-slate-500">Neural Sync</span>
                <span className="text-primary">{result ? "Sync Locked" : "Standby"}</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <div className={cn("h-full bg-primary transition-all duration-1000", result ? "w-[100%]" : "w-0")} />
              </div>
            </div>
            
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-4">
              <div className="flex items-center gap-3">
                <Bot className="h-5 w-5 text-primary" />
                <span className="text-xs font-black uppercase tracking-widest">Grid Status</span>
              </div>
              <p className="text-xs text-slate-400 font-medium leading-relaxed italic">
                "Bhashini Neural Bridge active for {language}. Multi-dialect ASR node processing symptoms via National Grid 02."
              </p>
            </div>
          </div>
        </Card>
      </div>
      <audio ref={audioRef} className="hidden" />
    </div>
  );
}
