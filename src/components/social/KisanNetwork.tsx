'use client';

import React, { useState, useMemo } from "react";
import { 
  MessageCircle, 
  ThumbsUp, 
  Share2, 
  MapPin, 
  AlertCircle, 
  Plus, 
  Image as ImageIcon,
  MoreHorizontal,
  Filter,
  Users,
  Award,
  Heart,
  Star,
  Send,
  Loader2,
  CheckCircle2
} from "lucide-react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useFirestore, useCollection, useUser, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, addDoc, doc, updateDoc, serverTimestamp, increment } from "firebase/firestore";
import { updateDocumentNonBlocking, addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useAppState } from "@/lib/app-state";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

export function KisanNetwork() {
  const firestore = useFirestore();
  const { user } = useUser();
  const { role } = useAppState();
  const { toast } = useToast();
  
  const [activeFilter, setActiveFilter] = useState("All");
  const [postContent, setPostContent] = useState("");
  const [postCategory, setPostCategory] = useState("General Update");
  const [isPosting, setIsPosting] = useState(false);

  const postsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "posts"), orderBy("createdAt", "desc"));
  }, [firestore]);

  const { data: posts, isLoading } = useCollection(postsQuery);

  const filteredPosts = useMemo(() => {
    if (!posts) return [];
    if (activeFilter === "All") return posts;
    return posts.filter(p => p.category === activeFilter);
  }, [posts, activeFilter]);

  const handleCreatePost = async () => {
    if (!postContent.trim() || !firestore || !user) return;
    setIsPosting(true);
    
    const postData = {
      authorId: user.uid,
      authorName: user.displayName || "Kisan Mitra",
      authorRole: role || "Farmer",
      authorExpertise: role === "Expert" ? "Certified Scientist" : (role === "Farmer" ? "Rice Specialist" : ""),
      authorLocation: "Ludhiana, Punjab", // Mocked for now
      content: postContent,
      category: postCategory,
      likesCount: 0,
      isVerified: false,
      reactions: { "🌾": 0, "👍": 0, "🙏": 0 },
      createdAt: new Date().toISOString()
    };

    addDocumentNonBlocking(collection(firestore, "posts"), postData);
    setPostContent("");
    setIsPosting(false);
    toast({ title: "Post Shared", description: "Your update is now visible to the community." });
  };

  const handleVerifyPost = (postId: string) => {
    if (!firestore || role !== "Expert") return;
    const postRef = doc(firestore, "posts", postId);
    updateDocumentNonBlocking(postRef, { isVerified: true });
    toast({ title: "Expert Verified", description: "Post marked as trusted agricultural advice." });
  };

  const handleReaction = (postId: string, reaction: string) => {
    if (!firestore) return;
    const postRef = doc(firestore, "posts", postId);
    updateDocumentNonBlocking(postRef, {
      [`reactions.${reaction}`]: increment(1)
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Create Post */}
      <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white p-6 md:p-10">
        <div className="flex gap-6">
          <Avatar className="h-14 w-14 border-2 border-primary/20 shadow-md">
            <AvatarImage src={`https://picsum.photos/seed/${user?.uid}/80/80`} />
            <AvatarFallback>{user?.displayName?.[0] || "K"}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-6">
            <Textarea 
              placeholder="Share a field photo, success story, or ask for help..."
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              className="bg-muted/30 border-none rounded-[2rem] p-6 resize-none min-h-[140px] focus-visible:ring-primary/20 text-lg font-medium"
            />
            <div className="flex items-center justify-between">
              <div className="flex gap-3">
                <Select value={postCategory} onValueChange={setPostCategory}>
                  <SelectTrigger className="w-[180px] rounded-full h-11 bg-muted border-none text-xs font-black uppercase tracking-widest shadow-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General Update">General Update</SelectItem>
                    <SelectItem value="Success Story">Success Story</SelectItem>
                    <SelectItem value="Issue Alert">Issue Alert</SelectItem>
                    <SelectItem value="Product Feedback">Product Feedback</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="sm" className="rounded-full h-11 px-5 text-xs font-black uppercase tracking-widest gap-2 bg-muted/50 hover:bg-primary/10">
                  <ImageIcon className="h-4 w-4 text-primary" /> 
                  <span className="hidden sm:inline">Add Photo</span>
                </Button>
              </div>
              <Button 
                onClick={handleCreatePost}
                disabled={isPosting || !postContent.trim()}
                className="rounded-full px-10 h-11 font-black uppercase tracking-widest shadow-lg shadow-primary/20 transition-all hover:scale-105"
              >
                {isPosting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Publish"}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Filters & Community Stats */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide w-full md:w-auto">
          {["All", "Success Story", "Issue Alert", "Product Feedback"].map((f) => (
            <Button
              key={f}
              onClick={() => setActiveFilter(f)}
              variant={activeFilter === f ? "default" : "outline"}
              className={cn(
                "rounded-full px-8 h-10 font-black text-[10px] uppercase tracking-widest whitespace-nowrap transition-all",
                activeFilter === f ? "shadow-lg shadow-primary/20" : "border-border text-muted-foreground hover:bg-muted"
              )}
            >
              {f === "All" && <Users className="h-3 w-3 mr-2" />}
              {f}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="h-8 px-4 rounded-full border-primary/20 text-primary font-black uppercase text-[9px]">
            {filteredPosts.length} Discussions
          </Badge>
          <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 border border-border shadow-sm">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Post Feed */}
      <div className="space-y-6 pb-20">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-50">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="font-black uppercase text-[10px] tracking-widest">Syncing Network...</p>
          </div>
        ) : filteredPosts.map((post) => (
          <PostCard 
            key={post.id} 
            post={post} 
            role={role} 
            onReaction={handleReaction}
            onVerify={handleVerifyPost}
          />
        ))}
        {!isLoading && filteredPosts.length === 0 && (
          <div className="text-center py-40 bg-muted/20 rounded-[4rem] border-2 border-dashed border-border/50">
            <MessageCircle className="h-16 w-16 text-muted-foreground/30 mx-auto mb-6" />
            <h3 className="text-2xl font-black">Community Silent</h3>
            <p className="text-muted-foreground mt-2 font-medium">Be the first to share an agricultural update.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function PostCard({ post, role, onReaction, onVerify }: { post: any, role: string | null, onReaction: any, onVerify: any }) {
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);

  return (
    <Card className={cn(
      "border-none shadow-xl rounded-[2.5rem] overflow-hidden transition-all duration-300 bg-white",
      post.isVerified ? "verified-expert-glow" : "hover:shadow-2xl"
    )}>
      <CardHeader className="p-8 flex flex-row items-center gap-5">
        <Avatar className="h-14 w-14 border-2 border-primary/10 shadow-sm">
          <AvatarImage src={`https://picsum.photos/seed/${post.authorId}/80/80`} />
          <AvatarFallback>{post.authorName[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <span className="font-black text-lg tracking-tight">{post.authorName}</span>
            {post.isVerified && (
              <Badge className="bg-amber-500 text-white border-none font-black text-[8px] uppercase px-2 py-0.5 flex items-center gap-1">
                <CheckCircle2 className="h-2.5 w-2.5" /> Expert Certified
              </Badge>
            )}
            <Badge variant="secondary" className="text-[8px] font-black uppercase tracking-widest px-2 h-4">
              {post.authorRole}
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-black uppercase tracking-tighter mt-1 opacity-60">
            <span className="flex items-center gap-1"><MapPin className="h-2.5 w-2.5" /> {post.authorLocation}</span>
            <span>•</span>
            <span>{post.authorExpertise || "Kisan Mitra"}</span>
            <span>•</span>
            <span>{post.createdAt ? formatDistanceToNow(new Date(post.createdAt)) + " ago" : "Just now"}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge variant={post.category === 'Issue Alert' ? 'destructive' : 'outline'} className="text-[9px] font-black uppercase tracking-widest px-3 py-1">
            {post.category}
          </Badge>
          {role === "Expert" && !post.isVerified && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onVerify(post.id)}
              className="h-7 text-[8px] font-black uppercase border-amber-500 text-amber-600 hover:bg-amber-50"
            >
              Verify Protocol
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="px-10 py-0 space-y-6">
        <p className="text-lg leading-relaxed text-slate-700 font-medium">{post.content}</p>
        
        {post.imageUrl && (
          <div className="relative aspect-video rounded-[2rem] overflow-hidden shadow-inner border border-border/50">
            <img src={post.imageUrl} className="w-full h-full object-cover" alt="Field Photo" />
          </div>
        )}

        {/* Reaction Bar */}
        <div className="flex items-center gap-3 pt-2">
          {Object.entries(post.reactions || {}).map(([emoji, count]: [any, any]) => (
            <Button 
              key={emoji}
              variant="ghost" 
              size="sm" 
              onClick={() => onReaction(post.id, emoji)}
              className="h-8 rounded-full bg-muted/50 hover:bg-primary/10 px-3 gap-2 border border-transparent hover:border-primary/20"
            >
              <span className="text-sm">{emoji}</span>
              <span className="text-[10px] font-black">{count}</span>
            </Button>
          ))}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-muted/30">
                <Plus className="h-4 w-4 text-muted-foreground" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-fit p-2 rounded-full flex gap-2 shadow-2xl border-none">
              {["🌾", "👍", "🙏", "❤️", "🚜", "🌱"].map(e => (
                <Button key={e} variant="ghost" size="icon" className="h-10 w-10 text-xl hover:scale-125 transition-transform" onClick={() => onReaction(post.id, e)}>
                  {e}
                </Button>
              ))}
            </PopoverContent>
          </Popover>
        </div>
      </CardContent>

      <CardFooter className="p-8 mt-6 border-t bg-slate-50/50 flex justify-between">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsLiked(!isLiked)}
            className={cn(
              "rounded-full h-10 px-6 text-xs font-black uppercase tracking-widest gap-2 transition-all",
              isLiked ? "bg-primary text-white scale-105 shadow-md" : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
            )}
          >
            <Heart className={cn("h-4 w-4", isLiked && "fill-current animate-pulse-engagement")} /> 
            {isLiked ? (post.likesCount || 0) + 1 : (post.likesCount || 0)} Likes
          </Button>

          <Dialog open={showComments} onOpenChange={setShowComments}>
            <DialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="rounded-full h-10 px-6 text-xs font-black uppercase tracking-widest gap-2 text-muted-foreground hover:bg-primary/10 hover:text-primary"
              >
                <MessageCircle className="h-4 w-4" /> Comments
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
              <CommentDrawer postId={post.id} postAuthor={post.authorName} />
            </DialogContent>
          </Dialog>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 text-muted-foreground">
          <Share2 className="h-5 w-5" />
        </Button>
      </CardFooter>
    </Card>
  );
}

function CommentDrawer({ postId, postAuthor }: { postId: string, postAuthor: string }) {
  const firestore = useFirestore();
  const { user } = useUser();
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const commentsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "posts", postId, "comments"), orderBy("createdAt", "asc"));
  }, [firestore, postId]);

  const { data: comments, isLoading } = useCollection(commentsQuery);

  const handleAddComment = async () => {
    if (!comment.trim() || !firestore || !user) return;
    setIsSubmitting(true);
    
    await addDoc(collection(firestore, "posts", postId, "comments"), {
      authorId: user.uid,
      authorName: user.displayName || "Kisan Mitra",
      content: comment,
      createdAt: new Date().toISOString()
    });

    setComment("");
    setIsSubmitting(false);
  };

  return (
    <div className="flex flex-col h-[600px] bg-white">
      <DialogHeader className="p-8 border-b bg-slate-50/50">
        <DialogTitle className="text-xl font-black flex items-center gap-3">
          <MessageCircle className="h-6 w-6 text-primary" />
          Comments for {postAuthor}
        </DialogTitle>
        <DialogDescription className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1">
          Community Insights & Advice
        </DialogDescription>
      </DialogHeader>

      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>
        ) : comments?.map((c) => (
          <div key={c.id} className="flex gap-4 group">
            <Avatar className="h-10 w-10">
              <AvatarImage src={`https://picsum.photos/seed/${c.authorId}/40/40`} />
              <AvatarFallback>{c.authorName[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 bg-muted/30 p-4 rounded-[1.5rem] space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-black text-xs text-primary">{c.authorName}</span>
                <span className="text-[8px] font-black uppercase text-muted-foreground opacity-50">{formatDistanceToNow(new Date(c.createdAt))} ago</span>
              </div>
              <p className="text-sm font-medium text-slate-700 leading-relaxed">{c.content}</p>
            </div>
          </div>
        ))}
        {!isLoading && comments?.length === 0 && (
          <div className="text-center py-20 opacity-30">
            <MessageCircle className="h-12 w-12 mx-auto mb-4" />
            <p className="font-black uppercase text-[10px]">No comments yet</p>
          </div>
        )}
      </div>

      <div className="p-8 border-t bg-white flex gap-4">
        <Textarea 
          placeholder="Share your advice or ask a follow-up..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="bg-muted/30 border-none rounded-2xl resize-none h-14 min-h-[56px] focus-visible:ring-primary/20 text-sm font-medium"
        />
        <Button 
          onClick={handleAddComment}
          disabled={isSubmitting || !comment.trim()}
          size="icon"
          className="h-14 w-14 rounded-2xl shadow-lg shadow-primary/20 shrink-0"
        >
          {isSubmitting ? <Loader2 className="animate-spin" /> : <Send className="h-5 w-5" />}
        </Button>
      </div>
    </div>
  );
}