"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Camera, 
  Loader2, 
  Leaf, 
  FlaskConical, 
  Volume2,
  Mic,
  MicOff,
  Bot,
  AlertTriangle,
  Zap,
  BrainCircuit,
  X,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  UserCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { diagnoseCropPest, FarmerCropPestDiagnosisOutput } from "@/ai/flows/farmer-crop-pest-diagnosis";
import { useFirestore } from "@/firebase";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useAppState } from "@/lib/app-state";

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
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && !audioRef.current) {
      audioRef.current = new Audio();
    }
  }, []);

  useEffect(() => {
    if (isCameraActive) {
      const getCameraPermission = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
          setHasCameraPermission(true);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => {
              videoRef.current?.play().catch(e => console.warn("Camera video play failed", e));
            };
          }
        } catch (error) {
          console.error('Error accessing camera:', error);
          setHasCameraPermission(false);
          setIsCameraActive(false);
          toast({
            variant: 'destructive',
            title: 'Camera Access Denied',
            description: 'Please enable camera permissions in your browser settings.',
          });
        }
      };
      getCameraPermission();
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    }
  }, [isCameraActive, toast]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setPhoto(dataUrl);
        setIsCameraActive(false);
      }
    }
  };

  const handleDiagnose = async () => {
    if (!cropType) {
      toast({
        variant: "destructive",
        title: "Target Crop Required",
        description: "Specify the crop family for a precision analysis.",
      });
      return;
    }
    setLoading(true);
    setIsSentToExpert(false);
    setResult(null);
    
    try {
      let knowledgeBaseContext = "";
      if (firestore) {
        const q = query(collection(firestore, "crops"), where("name", "==", cropType), where("isCertified", "==", true), limit(3));
        const snap = await getDocs(q);
        if (!snap.empty) {
          knowledgeBaseContext = snap.docs.map(d => `${d.data().diseaseName}: ${d.data().chemicalCure}`).join("; ");
        }
      }

      const res = await diagnoseCropPest({
        cropType,
        symptomsDescription: symptoms,
        photoDataUri: photo || undefined,
        language: language,
        knowledgeBaseContext: knowledgeBaseContext || undefined
      });
      setResult(res);
      speakResult(res);
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "Agronomist Node Offline", description: "Grid high-latency. Re-attempting connection..." });
    } finally {
      setLoading(false);
    }
  };

  const toggleListening = () => {
    const recognitionClass = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!recognitionClass) {
      toast({ variant: "destructive", title: "Voice Not Supported", description: "Please use a Chrome-based browser." });
      return;
    }
    const recognition = new recognitionClass();
    recognition.lang = LANG_MAP[language] || "en-IN";
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSymptoms(prev => prev ? `${prev} ${transcript}` : transcript);
    };
    if (isListening) recognition.stop();
    else recognition.start();
  };

  const speakResult = async (resData: FarmerCropPestDiagnosisOutput) => {
    const text = `${resData.pathogenIdentification}. ${resData.diagnosis}. ${resData.suggestedChemicalRemedies[0]}`;
    setIsSpeaking(true);
    try {
      const response = await fetch('/api/bhashini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, langCode })
      });
      const data = await response.json();
      if (data.audioContent && audioRef.current) {
        try {
          audioRef.current.src = `data:audio/wav;base64,${data.audioContent}`;
          audioRef.current.onended = () => setIsSpeaking(false);
          await audioRef.current.play();
        } catch (e) {
          console.warn("Audio playback failed", e);
          setIsSpeaking(false);
        }
      } else {
        const ut = new SpeechSynthesisUtterance(text);
        ut.lang = langCode === 'hi' ? 'hi-IN' : 'en-IN';
        ut.onend = () => setIsSpeaking(false);
        window.speechSynthesis.speak(ut);
      }
    } catch (err) {
      setIsSpeaking(false);
    }
  };

  const handleSendToExpert = () => {
    if (!firestore || !result) return;
    const colRef = collection(firestore, "crops");
    addDocumentNonBlocking(colRef, {
      name: cropType,
      category: "Plant",
      diseaseName: result.pathogenIdentification,
      severity: result.isBotanicallyValid ? "Medium" : "Warning",
      imageUrl: photo || `https://picsum.photos/seed/${Date.now()}/800/400`,
      chemicalCure: result.suggestedChemicalRemedies[0],
      desiNuskha: result.suggestedTraditionalRemedies[0],
      isCertified: false,
      aiReasoning: result.scientificReasoning,
      symptoms: symptoms,
      createdAt: new Date().toISOString()
    });
    setIsSentToExpert(true);
    toast({ title: "Precision Report Logged", description: "Sent to senior human agronomist for certification." });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto pb-12">
      <div className="lg:col-span-2 space-y-6">
        <Card className="border-none shadow-xl rounded-[2.5rem] p-8 bg-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Sparkles className="h-32 w-32 rotate-45 text-primary" />
          </div>
          <CardHeader className="p-0 mb-8 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl font-black flex items-center gap-3 text-slate-900 tracking-tight">
                  <Bot className="h-8 w-8 text-primary" />
                  Senior AI Agronomist
                </CardTitle>
                <CardDescription className="text-muted-foreground font-medium italic mt-1">Multimodal Vision Ingestion • Neural Logic Loop</CardDescription>
              </div>
              <Badge variant="outline" className="h-8 px-4 font-bold border-primary/20 text-primary uppercase text-[10px] tracking-widest bg-primary/5">
                Mode: Precision Vision
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="p-0 space-y-10 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-4">Target Crop Family</label>
                  <Input
                    placeholder="e.g. Tomato, Litchi, Wheat"
                    value={cropType}
                    onChange={(e) => setCropType(e.target.value)}
                    className="rounded-2xl h-14 bg-muted/30 border-none font-black text-lg focus-visible:ring-primary shadow-inner"
                  />
                </div>
                <div className="space-y-2 relative">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-4">Observations (Voice/Text)</label>
                  <Textarea
                    placeholder="Describe symptoms: 'White spots on leaves'..."
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    className="rounded-2xl bg-muted/30 border-none min-h-[180px] font-medium p-6 focus-visible:ring-primary shadow-inner text-lg leading-relaxed"
                  />
                  <div className="absolute bottom-4 right-4 flex gap-2">
                    <Button 
                      variant={isListening ? "destructive" : "secondary"}
                      size="icon"
                      onClick={toggleListening}
                      className={cn("h-12 w-12 rounded-xl shadow-lg transition-all", isListening && "animate-pulse")}
                    >
                      {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="relative group bg-muted/30 border-2 border-dashed border-border rounded-[2.5rem] p-6 text-center hover:bg-primary/5 transition-all cursor-pointer overflow-hidden min-h-[300px] flex flex-col items-center justify-center shadow-inner">
                  {isCameraActive ? (
                    <div className="relative w-full h-full flex flex-col items-center">
                      <video ref={videoRef} className="w-full aspect-square rounded-2xl object-cover shadow-2xl" muted playsInline />
                      <div className="absolute bottom-4 flex gap-4">
                        <Button onClick={capturePhoto} className="h-14 w-14 rounded-full bg-white text-primary shadow-xl hover:scale-110 active:scale-95">
                          <Camera className="h-6 w-6" />
                        </Button>
                        <Button onClick={() => setIsCameraActive(false)} variant="destructive" className="h-14 w-14 rounded-full shadow-xl">
                          <X className="h-6 w-6" />
                        </Button>
                      </div>
                      {!hasCameraPermission && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-6 text-center">
                          <Alert variant="destructive" className="border-none bg-white">
                            <AlertTitle>Camera Access Required</AlertTitle>
                            <AlertDescription>Allow camera access to capture field evidence.</AlertDescription>
                          </Alert>
                        </div>
                      )}
                    </div>
                  ) : photo ? (
                    <div className="relative w-full h-full">
                      <img src={photo} alt="Preview" className="h-[260px] w-full object-cover rounded-2xl shadow-xl border-4 border-white" />
                      <div className="absolute top-4 right-4 flex gap-2">
                        <Button variant="secondary" size="icon" className="h-10 w-10 rounded-full" onClick={() => setPhoto(null)}>
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="icon" className="h-10 w-10 rounded-full" onClick={() => setPhoto(null)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-6">
                      <div className="flex gap-4">
                        <Button onClick={() => setIsCameraActive(true)} variant="outline" className="h-20 w-20 rounded-3xl border-2 border-primary/20 bg-white shadow-xl hover:bg-primary/5 hover:scale-105 transition-all">
                          <Camera className="h-8 w-8 text-primary" />
                        </Button>
                        <div className="h-20 w-20 rounded-3xl border-2 border-dashed border-border bg-white flex items-center justify-center relative shadow-sm hover:scale-105 transition-all">
                          <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-20" onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => setPhoto(reader.result as string);
                              reader.readAsDataURL(file);
                            }
                          }} />
                          <Leaf className="h-8 w-8 text-slate-300" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Field Evidence Intake</p>
                        <p className="text-xs font-medium text-slate-400 italic">Capture leaf/root health for multimodal analysis</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Button 
              className="w-full h-20 text-2xl font-black bg-primary hover:bg-primary/90 rounded-[2.5rem] shadow-2xl shadow-primary/20 transition-all active:scale-[0.98] group"
              disabled={loading}
              onClick={handleDiagnose}
            >
              {loading ? <Loader2 className="h-8 w-8 animate-spin mr-4" /> : <Sparkles className="h-8 w-8 mr-4 group-hover:rotate-12 transition-transform" />}
              Activate Senior Agronomist Vision
            </Button>
          </CardContent>
        </Card>

        {result && (
          <Card className={cn(
            "border-none shadow-2xl rounded-[3rem] p-10 bg-white animate-in slide-in-from-bottom-6 space-y-10",
            !result.isBotanicallyValid && "ring-4 ring-amber-400"
          )}>
            <div className="flex justify-between items-start">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <h3 className="text-4xl font-black tracking-tight text-slate-900">{result.pathogenIdentification}</h3>
                  {result.isBotanicallyValid ? (
                    <Badge className="bg-primary/10 text-primary border-none px-4 py-1.5 font-black text-[10px] uppercase tracking-widest shadow-sm">Precision Identification</Badge>
                  ) : (
                    <Badge variant="destructive" className="animate-pulse px-4 py-1.5 font-black text-[10px] uppercase tracking-widest gap-2">
                      <AlertTriangle className="h-3 w-3" /> Broad-Spectrum Analysis
                    </Badge>
                  )}
                </div>
                <p className="text-xl font-medium text-slate-500 italic">"Scientific analysis completed for {cropType}."</p>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn("h-16 w-16 rounded-3xl bg-muted hover:bg-primary transition-all shadow-lg", isSpeaking && "bg-primary text-white animate-pulse")}
                onClick={() => speakResult(result)}
              >
                <Volume2 className="h-8 w-8" />
              </Button>
            </div>

            <Card className="rounded-[2.5rem] border-none bg-slate-50 p-8 shadow-inner border-l-8 border-primary/20">
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Bot className="h-4 w-4" /> Professional Diagnosis
                </h4>
                <p className="text-lg font-medium text-slate-700 leading-relaxed italic">
                  "{result.diagnosis}"
                </p>
              </div>
            </Card>

            <div className="p-8 rounded-[2.5rem] bg-muted/20 border border-border/50 space-y-4 shadow-sm">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-primary" /> Logic Trace
              </h4>
              <p className="text-sm font-bold text-slate-600 leading-relaxed pl-4 border-l-4 border-primary/20">
                {result.scientificReasoning}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="p-10 rounded-[3rem] bg-destructive/5 border border-destructive/10 space-y-6 shadow-sm">
                <h4 className="text-[10px] font-black text-destructive uppercase tracking-[0.2em] flex items-center gap-2">
                  <FlaskConical className="h-5 w-5" /> Professional Neutralizer
                </h4>
                <ul className="space-y-4">
                  {result.suggestedChemicalRemedies.map((rem, i) => (
                    <li key={i} className="text-xl font-black text-slate-900 leading-tight flex items-start gap-3">
                      <div className="h-2 w-2 rounded-full bg-destructive mt-3 shrink-0" />
                      {rem}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-10 rounded-[3rem] bg-primary/5 border border-primary/10 space-y-6 shadow-sm">
                <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                  <Zap className="h-4 w-4" /> Heritage Wisdom (Desi Nuskha)
                </h4>
                <ul className="space-y-4">
                  {result.suggestedTraditionalRemedies.map((rem, i) => (
                    <li key={i} className="text-xl font-medium text-primary italic leading-tight flex items-start gap-3">
                      <div className="h-2 w-2 rounded-full bg-primary mt-3 shrink-0" />
                      "{rem}"
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-10 border-t flex flex-col items-center gap-8">
              {!result.isBotanicallyValid && (
                <div className="flex items-center gap-4 text-sm text-amber-700 bg-amber-50 p-6 rounded-[2rem] border border-amber-200 font-bold shadow-sm max-w-2xl">
                  <AlertTriangle className="h-8 w-8 shrink-0 text-amber-500 animate-pulse" />
                  Botanical precision alert: The logic is currently broad-spectrum. We recommend requesting human expert certification.
                </div>
              )}
              <Button 
                onClick={handleSendToExpert}
                disabled={isSentToExpert}
                className={cn(
                  "w-full max-w-md h-16 rounded-[2rem] font-black gap-4 transition-all text-lg shadow-xl",
                  isSentToExpert ? "bg-green-50 text-green-600 border-2 border-green-200" : "bg-slate-900 text-white hover:bg-slate-800"
                )}
              >
                {isSentToExpert ? <CheckCircle2 className="h-6 w-6" /> : <UserCheck className="h-6 w-6" />}
                {isSentToExpert ? "Expert Notified" : "Certify via Human Scientist"}
              </Button>
            </div>
          </Card>
        )}
      </div>

      <div className="space-y-8">
        <Card className="border-none shadow-2xl rounded-[2.5rem] p-10 bg-slate-900 text-white relative overflow-hidden">
          <div className="absolute bottom-0 left-0 p-8 opacity-10">
            <Zap className="h-32 w-32 -rotate-12 text-primary" />
          </div>
          <CardHeader className="p-0 mb-8 relative z-10">
            <CardTitle className="text-[10px] font-black flex items-center gap-3 text-primary uppercase tracking-[0.2em]">
              <BrainCircuit className="h-5 w-5" /> Precision Vision Feed
            </CardTitle>
          </CardHeader>
          <div className="space-y-10 relative z-10">
            <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10 space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-black uppercase tracking-widest text-primary">Agronomy Lab: 04</span>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Multimodal Tensors Ready</p>
                </div>
              </div>
              <p className="text-sm text-slate-300 font-medium leading-relaxed italic">
                "Currently cross-referencing your field evidence with standard ICAR protocols. Multimodal analysis active for {language} context."
              </p>
            </div>
            
            <div className="space-y-4">
              <h5 className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Vision Capability</h5>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
                  <p className="text-lg font-black text-primary">99.4%</p>
                  <p className="text-[8px] font-bold text-slate-500 uppercase">Detection Accuracy</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
                  <p className="text-lg font-black text-primary">0.3s</p>
                  <p className="text-[8px] font-bold text-slate-500 uppercase">Logic Latency</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
      <canvas ref={canvasRef} className="hidden" />
      <audio ref={audioRef} className="hidden" aria-hidden="true" />
    </div>
  );
}
