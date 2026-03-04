
'use client';

import React, { useState } from "react";
import { 
  MessageSquare, 
  ThumbsUp, 
  MapPin, 
  Plus, 
  ImageIcon,
  Loader2,
  CheckCircle2,
  Send,
  Heart,
  Share2,
  Award,
  ShieldCheck,
  Star,
  X,
  MoreHorizontal
} from "lucide-react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetDescription
} from "@/components/ui/sheet";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useTranslation } from "@/hooks/use-translation";
import { useFirestore, useCollection, useUser, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, doc, increment } from "firebase/firestore";
import { addDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import { useAppState } from "@/lib/app-state";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function KisanNetwork() {
  const { t } = useTranslation();
  const firestore = useFirestore();
  const { user } = useUser();
  const { role, name, city } = useAppState();
  const { toast } = useToast();
  
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("General");
  const [photo, setPhoto] = useState<string | null>(null);
  const [isPosting, setIsSubmitting] = useState(false);

  const postsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "posts"), orderBy("createdAt", "desc"));
  }, [firestore]);

  const { data: posts, isLoading } = useCollection(postsQuery);

  const handlePost = async () => {
    if (!content.trim() || !user || !firestore) return;
    setIsSubmitting(true);
    
    const postData = {
      authorId: user.uid,
      authorName: name || "Kisan",
      authorLocation: city || "Local Hub",
      content,
      category,
      imageUrl: photo,
      likesCount: 0,
      reactions: { "🌾": 0, "👍": 0, "🙏": 0 },
      isVerified: false,
      expertise: role === 'Expert' ? 'Agri-Scientist' : 'Field Professional',
      createdAt: new Date().toISOString()
    };

    try {
      await addDocumentNonBlocking(collection(firestore, "posts"), postData);
      setContent("");
      setPhoto(null);
      setCategory("General");
      toast({ title: "Update Published", description: "Your post is now visible across the national agricultural grid." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReaction = (postId: string, reaction: string) => {
    if (!firestore) return;
    const postRef = doc(firestore, "posts", postId);
    updateDocumentNonBlocking(postRef, {
      [`reactions.${reaction}`]: increment(1)
    });
  };

  const handleVerify = (postId: string) => {
    if (!firestore || role !== 'Expert') return;
    const postRef = doc(firestore, "posts", postId);
    updateDocumentNonBlocking(postRef, { isVerified: true });
    toast({ title: "Post Verified", description: "Marked as trusted agricultural intelligence." });
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
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      <div className="space-y-4">
        <h2 className="text-4xl font-black tracking-tighter flex items-center gap-3">
          <Award className="h-10 w-10 text-primary" />
          Kisan Intelligence Network
        </h2>
        <p className="text-muted-foreground font-medium">Collaborative insight sharing for the verified agricultural community.</p>
      </div>

      {/* Post Creation */}
      <Card className="glass-card p-10 rounded-[3rem] border-none shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Share2 className="h-32 w-32 rotate-12" />
        </div>
        <div className="flex gap-8 relative z-10">
          <Avatar className="h-16 w-16 border-4 border-white shadow-xl shrink-0">
            <AvatarImage src={`https://picsum.photos/seed/${user?.uid}/80/80`} />
            <AvatarFallback>{name?.[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-6">
            <div className="flex flex-wrap gap-4">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-48 rounded-xl bg-white/50 border-none font-bold">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="General">General Update</SelectItem>
                  <SelectItem value="Success Story">Success Story</SelectItem>
                  <SelectItem value="Issue Alert">Issue Alert</SelectItem>
                  <SelectItem value="Product Feedback">Product Feedback</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share an insight or field experience..."
              className="bg-white/50 border-none rounded-[2rem] p-8 min-h-[160px] text-xl font-medium shadow-inner focus-visible:ring-primary"
            />

            {photo && (
              <div className="relative w-full aspect-video rounded-[2rem] overflow-hidden group shadow-lg">
                <img src={photo} className="w-full h-full object-cover" alt="Preview" />
                <Button 
                  onClick={() => setPhoto(null)} 
                  variant="destructive" 
                  size="icon" 
                  className="absolute top-4 right-4 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            <div className="flex justify-between items-center pt-4">
              <div className="flex gap-2">
                <Button variant="outline" className="rounded-full gap-2 font-black text-xs uppercase px-6 h-12 bg-white/50 border-none relative">
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handlePhotoUpload} />
                  <ImageIcon className="h-5 w-5 text-primary" /> {t("add_photo")}
                </Button>
              </div>
              <Button 
                onClick={handlePost} 
                disabled={!content.trim() || isPosting} 
                className="rounded-full px-12 h-14 font-black text-lg shadow-xl shadow-primary/20"
              >
                {isPosting ? <Loader2 className="animate-spin" /> : t("publish")}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Feed */}
      <div className="space-y-8">
        {isLoading ? (
          <div className="py-20 text-center"><Loader2 className="animate-spin h-12 w-12 mx-auto text-primary" /></div>
        ) : !posts?.length ? (
          <div className="text-center py-20 opacity-30">
            <MessageSquare className="h-20 w-20 mx-auto mb-4" />
            <p className="font-black uppercase tracking-widest text-xs">No entries in the grid</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {posts.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Card className={cn(
                  "glass-card rounded-[3rem] border-none overflow-hidden shadow-xl transition-all duration-500",
                  post.isVerified && "ring-4 ring-amber-400 shadow-amber-200/50"
                )}>
                  <CardHeader className="p-8 flex flex-row items-center gap-6">
                    <Avatar className="h-14 w-14 shadow-lg">
                      <AvatarImage src={`https://picsum.photos/seed/${post.authorId}/80/80`} />
                      <AvatarFallback>{post.authorName?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-black text-xl tracking-tight">{post.authorName}</span>
                        {post.isVerified && (
                          <Badge className="bg-amber-500 text-white font-black text-[9px] uppercase tracking-widest px-3">
                            <ShieldCheck className="h-3 w-3 mr-1" /> {t("verified_expert")}
                          </Badge>
                        )}
                        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10 text-[9px] font-black uppercase">
                          {post.category}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{post.authorLocation}</span>
                        <span className="text-[10px]">•</span>
                        <span className="text-[10px] font-black uppercase tracking-widest">{post.expertise}</span>
                      </div>
                    </div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full h-10 w-10"><MoreHorizontal className="h-5 w-5" /></Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-48 p-2 rounded-2xl">
                        {role === 'Expert' && !post.isVerified && (
                          <Button onClick={() => handleVerify(post.id)} variant="ghost" className="w-full justify-start font-bold text-xs gap-2 text-amber-600">
                            <ShieldCheck className="h-4 w-4" /> Verify Insight
                          </Button>
                        )}
                        <Button variant="ghost" className="w-full justify-start font-bold text-xs gap-2 text-destructive">
                          Report Post
                        </Button>
                      </PopoverContent>
                    </Popover>
                  </CardHeader>

                  <CardContent className="px-10 py-0 space-y-6">
                    <p className="text-xl leading-relaxed text-slate-700 font-medium">{post.content}</p>
                    {post.imageUrl && (
                      <div className="rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white">
                        <img src={post.imageUrl} className="w-full max-h-[500px] object-cover" alt="Post content" />
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="p-8 mt-8 border-t bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4">
                      <div className="flex -space-x-2">
                        {Object.entries(post.reactions || {}).map(([emoji, count]: any) => (
                          count > 0 && (
                            <div key={emoji} className="bg-white px-3 py-1.5 rounded-full border shadow-sm text-xs font-bold flex items-center gap-1.5 animate-in zoom-in">
                              <span>{emoji}</span>
                              <span className="text-[10px]">{count}</span>
                            </div>
                          )
                        ))}
                      </div>
                      
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" className="rounded-full gap-2 font-black text-xs uppercase h-11 hover:bg-primary/10 hover:text-primary transition-all">
                            <Heart className="h-4 w-4" /> React
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-fit p-2 flex gap-2 rounded-full shadow-2xl border-none bg-slate-900/90 backdrop-blur-xl">
                          {["🌾", "👍", "🙏", "❤️"].map((emoji) => (
                            <button
                              key={emoji}
                              onClick={() => handleReaction(post.id, emoji)}
                              className="h-10 w-10 flex items-center justify-center text-xl hover:scale-125 transition-transform"
                            >
                              {emoji}
                            </button>
                          ))}
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="flex items-center gap-3">
                      <CommentDrawer postId={post.id} postAuthor={post.authorName} />
                      <Button variant="ghost" className="rounded-full gap-2 font-black text-xs uppercase h-11">
                        <Share2 className="h-4 w-4" /> Share
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Ratings & Feedback Section */}
      <div className="pt-12 border-t space-y-10">
        <div className="space-y-2">
          <h3 className="text-2xl font-black flex items-center gap-3">
            <Star className="h-7 w-7 text-amber-500" />
            Grid Experience & Feedback
          </h3>
          <p className="text-muted-foreground font-medium">Rate Mandi-Link agencies or professional seed performance.</p>
        </div>
        <FeedbackSection />
      </div>
    </div>
  );
}

function CommentDrawer({ postId, postAuthor }: { postId: string, postAuthor: string }) {
  const firestore = useFirestore();
  const { user } = useUser();
  const { name } = useAppState();
  const [comment, setComment] = useState("");
  
  const commentsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "posts", postId, "comments"), orderBy("createdAt", "asc"));
  }, [firestore, postId]);

  const { data: comments } = useCollection(commentsQuery);

  const handleAddComment = () => {
    if (!comment.trim() || !user || !firestore) return;
    addDocumentNonBlocking(collection(firestore, "posts", postId, "comments"), {
      postId,
      authorId: user.uid,
      authorName: name || "Kisan",
      content: comment,
      createdAt: new Date().toISOString()
    });
    setComment("");
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" className="rounded-full gap-2 font-black text-xs uppercase h-11 bg-primary/5 text-primary hover:bg-primary/10">
          <MessageSquare className="h-4 w-4" /> Discussion ({comments?.length || 0})
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col rounded-l-[3rem] border-none shadow-2xl overflow-hidden">
        <SheetHeader className="p-8 bg-slate-900 text-white">
          <SheetTitle className="text-2xl font-black text-white">Post Discussion</SheetTitle>
          <SheetDescription className="text-slate-400 font-medium italic">Sharing advice on {postAuthor}'s post</SheetDescription>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
          {!comments?.length ? (
            <div className="text-center py-20 opacity-20 italic font-medium">Be the first to share advice...</div>
          ) : comments.map((c) => (
            <div key={c.id} className="flex gap-4 items-start animate-in slide-in-from-right-4">
              <Avatar className="h-10 w-10 shrink-0">
                <AvatarImage src={`https://picsum.photos/seed/${c.authorId}/40/40`} />
                <AvatarFallback>{c.authorName[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex justify-between items-center">
                  <p className="text-[10px] font-black uppercase text-primary">{c.authorName}</p>
                  <p className="text-[8px] text-muted-foreground uppercase font-bold">{new Date(c.createdAt).toLocaleTimeString()}</p>
                </div>
                <div className="p-4 rounded-2xl bg-muted/50 text-sm font-medium leading-relaxed">
                  {c.content}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-8 bg-white border-t border-border flex gap-3">
          <Input 
            value={comment} 
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write a helpful response..." 
            className="rounded-xl h-12 bg-muted/30 border-none font-medium"
            onKeyPress={(e) => e.key === "Enter" && handleAddComment()}
          />
          <Button size="icon" onClick={handleAddComment} className="rounded-xl h-12 w-12 shrink-0">
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function FeedbackSection() {
  const firestore = useFirestore();
  const { user } = useUser();
  const { name } = useAppState();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const feedbackQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "feedback"), orderBy("createdAt", "desc"));
  }, [firestore]);

  const { data: feedbacks } = useCollection(feedbackQuery);

  const handleSubmitFeedback = async () => {
    if (!comment.trim() || !user || !firestore) return;
    setIsSubmitting(true);
    await addDocumentNonBlocking(collection(firestore, "feedback"), {
      authorId: user.uid,
      authorName: name || "Anonymous Kisan",
      rating,
      comment,
      createdAt: new Date().toISOString()
    });
    setComment("");
    setRating(5);
    setIsSubmitting(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
      <Card className="lg:col-span-5 p-8 rounded-[2.5rem] border-none shadow-xl bg-white h-fit">
        <h4 className="text-xl font-black mb-6">Submit Your Rating</h4>
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            {[1, 2, 3, 4, 5].map((s) => (
              <button key={s} onClick={() => setRating(s)} className="transition-transform active:scale-90">
                <Star className={cn("h-8 w-8", s <= rating ? "fill-amber-400 text-amber-400" : "text-slate-200")} />
              </button>
            ))}
            <span className="text-xl font-black ml-4 text-amber-500">{rating}/5</span>
          </div>
          <Textarea 
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with a logistics provider or a verified crop protocol..."
            className="rounded-2xl min-h-[120px] bg-muted/30 border-none font-medium"
          />
          <Button onClick={handleSubmitFeedback} disabled={isSubmitting} className="w-full h-14 rounded-2xl font-black text-lg shadow-lg">
            {isSubmitting ? <Loader2 className="animate-spin" /> : "Post Review"}
          </Button>
        </div>
      </Card>

      <div className="lg:col-span-7 space-y-6">
        {feedbacks?.map((f) => (
          <div key={f.id} className="p-6 rounded-[2rem] bg-white shadow-md border border-slate-50 flex gap-6 items-start animate-in fade-in">
            <Avatar className="h-12 w-12 border-2 border-slate-100">
              <AvatarImage src={`https://picsum.photos/seed/${f.authorId}/40/40`} />
              <AvatarFallback>{f.authorName[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-black text-slate-900">{f.authorName}</p>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase">{new Date(f.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-0.5">
                  {Array(f.rating).fill(0).map((_, i) => <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />)}
                </div>
              </div>
              <p className="text-sm font-medium italic text-slate-600 leading-relaxed">"{f.comment}"</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Input({ className, ...props }: any) {
  return <input className={cn("flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm", className)} {...props} />;
}
