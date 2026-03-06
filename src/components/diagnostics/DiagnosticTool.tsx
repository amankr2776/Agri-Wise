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
  UserCheck,
  Send,
  MessageCircle,
  Activity,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { diagnoseCropPest, FarmerCropPestDiagnosisOutput } from "@/ai/flows/farmer-crop-pest-diagnosis";
import { useFirestore, useUser } from "@/firebase";
import { collection } from "firebase/firestore";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useAppState } from "@/lib/app-state";
import { motion, AnimatePresence } from "framer-motion";
import { getRegistryMatch } from "@/lib/botanical-registry";

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
  const { user } = useUser();
  const { toast } = useToast();
  const { language, langCode, name: userName } = useAppState();
  
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
              try {
                videoRef.current?.play().catch(e => console.warn("Camera video play failed", e));
              } catch (e) {}
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
    if (!cropType && !symptoms && !photo) {
      toast({
        variant: "destructive",
        title: "Information Missing",
        description: "Please provide a crop name, symptoms, or a photo for analysis.",
      });
      return;
    }
    setLoading(true);
    setIsSentToExpert(false);
    setResult(null);

    // 1. Instant Registry Lookup
    const match = getRegistryMatch(cropType, symptoms);
    if (match) {
      const registryResult: FarmerCropPestDiagnosisOutput = {
        pathogenIdentification: match.disease,
        diagnosis: `The National Grid detects ${match.disease} in your ${match.crop}. This identification is verified and strictly synchronized with the registry.`,
        scientificReasoning: `Zero-Latency Registry Match: Symptoms "${match.symptoms}" correspond exactly to verified biological markers for ${match.disease}.`,
        suggestedChemicalRemedies: [match.chemicalCure],
        suggestedTraditionalRemedies: [match.traditionalRemedy],
        isBotanicallyValid: true,
        confidenceScore: 1.0
      };
      
      setResult(registryResult);
      speakResult(registryResult);
      setLoading(false);
      return;
    }
    
    // 2. AI Multimodal Analysis
    try {
      const res = await diagnoseCropPest({
        cropType: cropType || "Unspecified Crop",
        symptomsDescription: symptoms || "Visual analysis requested.",
        photoDataUri: photo || undefined,
        language: language,
      });
      
      setResult(res);
      speakResult(res);
    } catch (err) {
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
    const text = `${resData.pathogenIdentification}. ${resData.diagnosis}. Suggested treatment: ${resData.suggestedChemicalRemedies[0]}`;
    setIsSpeaking(true);
    try {
      const response = await fetch('/api/bhashini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, langCode })
      });
      const data = await response.json();
      if (data.audioContent && audioRef.current) {
        audioRef.current.src = `data:audio/wav;base64,${data.audioContent}`;
        audioRef.current.onended = () => setIsSpeaking(false);
        await audioRef.current.play();
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
    if (!firestore || !result || !user) {
      toast({ variant: "destructive", title: "Syncing Identity", description: "Grid node is initializing. Please wait 2 seconds." });
      return;
    }
    
    const colRef = collection(firestore, "crops");
    addDocumentNonBlocking(colRef, {
      name: cropType || "Unknown Crop",
      category: "Plant",
      diseaseName: result.pathogenIdentification,
      severity: result.isBotanicallyValid ? "Medium" : "Warning",
      imageUrl: photo || `https://picsum.photos/seed/${Date.now()}/800/400`,
      chemicalCure: result.suggestedChemicalRemedies[0],
      desiNuskha: result.suggestedTraditionalRemedies[0],
      isCertified: false,
      status: "pending_expert_review",
      assignedExpertId: "AMAN_EXP_01",
      aiReasoning: result.scientificReasoning,
      symptoms: symptoms || "Visual evidence only.",
      reportedBy: user.uid,
      reportedByName: userName,
      createdAt: new Date().toISOString()
    });
    
    setIsSentToExpert(true);
    toast({ title: "Expert Alerted", description: "Dr. Aman Kumar (AMAN_EXP_01) has received your request for verification." });
  };

  return (
    <div className="space-y-10">
      <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white">
        <CardHeader className="bg-slate-900 text-white p-10 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-10">
            <Bot className="h-48 w-48 rotate-12" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <Badge className="bg-primary/20 text-primary border-none font-black text-[10px] uppercase tracking-widest px-4 py-1">Agronomist Agent v4.2</Badge>
              <CardTitle className="text-4xl font-black tracking-tight flex items-center gap-4">
                <Sparkles className="h-10 w-10 text-primary" />
                Senior Detection Agent
              </CardTitle>
              <CardDescription className="text-slate-400 font-medium italic text-lg">"Submit crop evidence for zero-latency pathogen analysis."</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <span className="h-3 w-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Grid Connected</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-10 md:p-12 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Input Section */}
            <div className="lg:col-span-7 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-4">Crop Name</label>
                  <Input
                    placeholder="e.g. Wheat, Tomato"
                    value={cropType}
                    onChange={(e) => setCropType(e.target.value)}
                    className="rounded-2xl h-14 bg-muted/30 border-none font-black text-lg focus-visible:ring-primary shadow-inner"
                  />
                </div>
                <div className="flex items-end pb-1">
                  <Button 
                    variant={isListening ? "destructive" : "secondary"}
                    onClick={toggleListening}
                    className={cn("h-14 w-full rounded-2xl font-black gap-3 shadow-lg transition-all", isListening && "animate-pulse")}
                  >
                    {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                    {isListening ? "Listening..." : "Describe via Voice"}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-4">Symptoms Observation</label>
                <Textarea
                  placeholder="Describe lesions, pests, or color changes..."
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  className="rounded-[2rem] bg-muted/30 border-none min-h-[180px] font-medium p-8 focus-visible:ring-primary shadow-inner text-xl leading-relaxed"
                />
              </div>

              <Button 
                onClick={handleDiagnose}
                disabled={loading}
                className="w-full h-20 text-2xl font-black bg-primary hover:bg-primary/90 rounded-[2.5rem] shadow-2xl shadow-primary/20 transition-all active:scale-[0.98] group"
              >
                {loading ? <Loader2 className="h-8 w-8 animate-spin mr-4" /> : <Send className="h-8 w-8 mr-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                Run Precision Analysis
              </Button>
            </div>

            {/* Media Section */}
            <div className="lg:col-span-5 space-y-6">
              <div className="relative group bg-muted/30 border-2 border-dashed border-border rounded-[3rem] p-8 text-center hover:bg-primary/5 transition-all cursor-pointer overflow-hidden min-h-[400px] flex flex-col items-center justify-center shadow-inner">
                {isCameraActive ? (
                  <div className="relative w-full h-full flex flex-col items-center gap-6">
                    <video ref={videoRef} className="w-full aspect-square rounded-[2rem] object-cover shadow-2xl border-4 border-white" autoPlay muted playsInline />
                    <div className="flex gap-4">
                      <Button onClick={capturePhoto} className="h-16 w-16 rounded-full bg-white text-primary shadow-xl hover:scale-110 active:scale-95">
                        <Camera className="h-8 w-8" />
                      </Button>
                      <Button onClick={() => setIsCameraActive(false)} variant="destructive" className="h-16 w-16 rounded-full shadow-xl">
                        <X className="h-8 w-8" />
                      </Button>
                    </div>
                  </div>
                ) : photo ? (
                  <div className="relative w-full h-full">
                    <img src={photo} alt="Preview" className="h-[340px] w-full object-cover rounded-[2.5rem] shadow-xl border-4 border-white" />
                    <div className="absolute top-4 right-4 flex gap-2">
                      <Button variant="secondary" size="icon" className="h-12 w-12 rounded-full shadow-lg" onClick={() => setPhoto(null)}>
                        <RefreshCw className="h-5 w-5" />
                      </Button>
                      <Button variant="destructive" size="icon" className="h-12 w-12 rounded-full shadow-lg" onClick={() => setPhoto(null)}>
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-8 py-10">
                    <div className="flex gap-6">
                      <Button onClick={() => setIsCameraActive(true)} variant="outline" className="h-24 w-24 rounded-[2rem] border-2 border-primary/20 bg-white shadow-xl hover:bg-primary/5 hover:scale-105 transition-all">
                        <Camera className="h-10 w-10 text-primary" />
                      </Button>
                      <div className="h-24 w-24 rounded-[2rem] border-2 border-dashed border-border bg-white flex items-center justify-center relative shadow-sm hover:scale-105 transition-all">
                        <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-20" onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => setPhoto(reader.result as string);
                            reader.readAsDataURL(file);
                          }
                        }} />
                        <Leaf className="h-10 w-10 text-slate-300" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Field Evidence Intake</p>
                      <p className="text-sm font-medium text-slate-400 italic">Capture photo for visual verification.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Result Area */}
          <AnimatePresence mode="wait">
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                className="pt-12 border-t border-slate-100"
              >
                <div className="flex flex-col gap-10">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-4">
                        <h3 className="text-4xl font-black tracking-tight text-slate-900">{result.pathogenIdentification}</h3>
                        <Badge className="bg-primary/10 text-primary border-none px-4 py-1.5 font-black text-[10px] uppercase tracking-widest shadow-sm">AI Diagnosis</Badge>
                      </div>
                      <p className="text-xl font-medium text-slate-500 italic flex items-center gap-2">
                        <MessageCircle className="h-5 w-5 text-primary" /> Scientific Analysis Complete
                      </p>
                    </div>
                    <Button 
                      onClick={() => speakResult(result)} 
                      disabled={isSpeaking}
                      className={cn("h-16 w-16 rounded-3xl transition-all shadow-xl", isSpeaking ? "bg-primary text-white animate-pulse" : "bg-muted text-slate-600 hover:bg-primary hover:text-white")}
                    >
                      {isSpeaking ? <Activity className="h-8 w-8" /> : <Volume2 className="h-8 w-8" />}
                    </Button>
                  </div>

                  <div className="bg-slate-50 rounded-[3rem] p-10 md:p-12 border-l-[12px] border-primary/20 space-y-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5"><BrainCircuit className="h-32 w-32" /></div>
                    
                    <div className="space-y-4 relative z-10">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-3">
                        <Bot className="h-5 w-5 text-primary" /> Diagnosis & Reasoning
                      </h4>
                      <p className="text-2xl font-medium text-slate-700 leading-relaxed italic">"{result.diagnosis}"</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-10">
                      <div className="space-y-6">
                        <h4 className="text-[10px] font-black text-destructive uppercase tracking-[0.2em] flex items-center gap-3">
                          <FlaskConical className="h-5 w-5" /> Professional Neutralizer
                        </h4>
                        <div className="p-8 rounded-[2.5rem] bg-destructive/5 border border-destructive/10">
                          <ul className="space-y-6">
                            {result.suggestedChemicalRemedies.map((rem, i) => (
                              <li key={i} className="text-lg font-bold text-slate-900 leading-relaxed flex items-start gap-4">
                                <div className="h-3 w-3 rounded-full bg-destructive mt-2 shrink-0 shadow-lg shadow-destructive/20" />
                                {rem}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-3">
                          <Zap className="h-5 w-5" /> Heritage Wisdom (Desi Nuskha)
                        </h4>
                        <div className="p-8 rounded-[2.5rem] bg-primary/5 border border-primary/10">
                          <ul className="space-y-6">
                            {result.suggestedTraditionalRemedies.map((rem, i) => (
                              <li key={i} className="text-lg font-bold text-primary italic leading-relaxed flex items-start gap-4">
                                <div className="h-3 w-3 rounded-full bg-primary mt-2 shrink-0 shadow-lg shadow-primary/20" />
                                "{rem}"
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-8 py-10">
                    <div className="flex items-center gap-6 text-sm text-slate-500 bg-muted/30 p-8 rounded-[2.5rem] border border-border font-bold shadow-sm max-w-3xl">
                      <Info className="h-10 w-10 shrink-0 text-primary" />
                      <p className="leading-relaxed">This analysis is an AI synthesis. For a certified protocol or if you are not satisfied with the result, please request expert validation below.</p>
                    </div>
                    <Button 
                      onClick={handleSendToExpert}
                      disabled={isSentToExpert}
                      className={cn(
                        "w-full max-w-md h-20 rounded-[2.5rem] font-black gap-4 transition-all text-xl shadow-2xl",
                        isSentToExpert ? "bg-green-50 text-green-600 border-4 border-green-200" : "bg-slate-900 text-white hover:bg-slate-800"
                      )}
                    >
                      {isSentToExpert ? <CheckCircle2 className="h-8 w-8" /> : <UserCheck className="h-8 w-8" />}
                      {isSentToExpert ? "Expert Request Logged" : "Not Satisfied? Ask Expert"}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
      <canvas ref={canvasRef} className="hidden" />
      <audio ref={audioRef} className="hidden" aria-hidden="true" />
    </div>
  );
}
