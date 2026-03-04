
'use client';

import React, { useState } from "react";
import { 
  MessageCircle, 
  ThumbsUp, 
  MapPin, 
  Plus, 
  ImageIcon,
  Loader2,
  CheckCircle2,
  Send
} from "lucide-react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/hooks/use-translation";
import { useFirestore, useCollection, useUser, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, addDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

export function KisanNetwork() {
  const { t } = useTranslation();
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [content, setContent] = useState("");

  const postsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "posts"), orderBy("createdAt", "desc"));
  }, [firestore]);

  const { data: posts, isLoading } = useCollection(postsQuery);

  const handlePost = async () => {
    if (!content.trim() || !user) return;
    await addDoc(collection(firestore, "posts"), {
      authorId: user.uid,
      authorName: user.displayName || "Kisan",
      content,
      createdAt: new Date().toISOString(),
      reactions: { "🌾": 0 }
    });
    setContent("");
    toast({ title: t("publish") });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <Card className="glass-card p-10 rounded-[2.5rem] border-none shadow-xl">
        <div className="flex gap-6">
          <Avatar className="h-14 w-14 border-2 border-primary/20">
            <AvatarImage src={`https://picsum.photos/seed/${user?.uid}/80/80`} />
          </Avatar>
          <div className="flex-1 space-y-6">
            <Textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share an update..."
              className="bg-muted/30 border-none rounded-[2rem] p-6 min-h-[140px] text-lg"
            />
            <div className="flex justify-between items-center">
              <Button variant="ghost" className="rounded-full gap-2">
                <ImageIcon className="h-5 w-5 text-primary" /> {t("add_photo")}
              </Button>
              <Button onClick={handlePost} disabled={!content.trim()} className="rounded-full px-10 h-12 font-black">{t("publish")}</Button>
            </div>
          </div>
        </div>
      </Card>

      <div className="space-y-6">
        {isLoading ? <Loader2 className="animate-spin" /> : posts?.map((post) => (
          <Card key={post.id} className="glass-card rounded-[2.5rem] border-none overflow-hidden shadow-xl">
            <CardHeader className="p-8 flex flex-row items-center gap-5">
              <Avatar className="h-12 w-12">
                <AvatarImage src={`https://picsum.photos/seed/${post.authorId}/80/80`} />
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-black text-lg">{post.authorName}</span>
                  {post.isVerified && <Badge className="bg-amber-500">{t("verified_expert")}</Badge>}
                </div>
                <p className="text-[10px] uppercase font-black text-muted-foreground">{post.authorLocation || "Local Village"}</p>
              </div>
            </CardHeader>
            <CardContent className="px-10 py-0">
              <p className="text-lg leading-relaxed text-slate-700">{post.content}</p>
            </CardContent>
            <CardFooter className="p-8 mt-6 border-t bg-slate-50/50 flex justify-between">
              <Button variant="ghost" className="gap-2 font-black text-xs uppercase">
                <ThumbsUp className="h-4 w-4" /> {t("save")}
              </Button>
              <Button variant="ghost" className="gap-2 font-black text-xs uppercase">
                <MessageCircle className="h-4 w-4" /> {t("discussion")}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
