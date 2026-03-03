'use client';

import React, { useState } from "react";
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
  Map as MapIcon
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
import { cn } from "@/lib/utils";

const POSTS = [
  { 
    id: 1, 
    author: "Sukhdev Singh", 
    role: "Farmer", 
    type: "Pest Alert", 
    content: "Large clusters of Mustard Aphids spotted in Block B. Spreading quickly due to heavy fog. Check your fields!", 
    likes: 42, 
    comments: 18, 
    location: "Bathinda",
    coords: "30.21, 74.94",
    time: "45m ago"
  },
  { 
    id: 2, 
    author: "Dr. Arvind S.", 
    role: "Expert", 
    type: "Update", 
    content: "New fertilizer subsidy list for Kharif season 2024 is out. Link in bio to check your eligibility.", 
    likes: 156, 
    comments: 5, 
    location: "National",
    time: "3h ago"
  },
  { 
    id: 3, 
    author: "Amit Patel", 
    role: "Farmer", 
    type: "Question", 
    content: "What is the best way to control stem borer in early stage maize without heavy chemicals?", 
    likes: 12, 
    comments: 34, 
    location: "Ahmedabad",
    time: "5h ago"
  },
];

export function KisanNetwork() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [postContent, setPostContent] = useState("");
  const [postType, setPostType] = useState("Update");

  const filteredPosts = activeFilter === "All" ? POSTS : POSTS.filter(p => p.type.includes(activeFilter));

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Create Post */}
      <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
        <CardContent className="p-6 space-y-4">
          <div className="flex gap-4">
            <Avatar className="h-12 w-12 border-2 border-primary/20">
              <AvatarImage src="https://picsum.photos/seed/farmer1/40/40" />
              <AvatarFallback>RK</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-4">
              <Textarea 
                placeholder="Share a tip, ask a question, or report a pest..."
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                className="bg-muted/50 border-none rounded-2xl resize-none min-h-[100px] focus-visible:ring-primary/20"
              />
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Select value={postType} onValueChange={setPostType}>
                    <SelectTrigger className="w-[140px] rounded-full h-9 bg-muted border-none text-xs font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Update">General Update</SelectItem>
                      <SelectItem value="Pest Alert">Pest Alert</SelectItem>
                      <SelectItem value="Question">Question</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="ghost" size="sm" className="rounded-full h-9 text-xs gap-1">
                    <ImageIcon className="h-4 w-4 text-primary" /> Photo
                  </Button>
                </div>
                <Button className="rounded-full px-8 h-9 font-bold shadow-lg shadow-primary/20">Post</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {["All", "Update", "Pest Alert", "Question"].map((f) => (
            <Button
              key={f}
              onClick={() => setActiveFilter(f)}
              variant={activeFilter === f ? "default" : "outline"}
              className={cn(
                "rounded-full px-6 h-9 font-bold text-xs whitespace-nowrap",
                activeFilter === f ? "" : "border-border text-muted-foreground"
              )}
            >
              {f === "All" ? <Users className="h-3.5 w-3.5 mr-1.5" /> : null}
              {f}
            </Button>
          ))}
        </div>
        <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 border border-border">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Post Feed */}
      <div className="space-y-4 pb-12">
        {filteredPosts.map((post) => (
          <Card key={post.id} className={cn(
            "border-none shadow-sm rounded-3xl overflow-hidden hover:shadow-md transition-shadow",
            post.type === 'Pest Alert' ? 'ring-1 ring-destructive/20 bg-destructive/5' : ''
          )}>
            <CardHeader className="p-6 flex flex-row items-center gap-4">
              <Avatar className="h-10 w-10 border border-primary/20">
                <AvatarImage src={`https://picsum.photos/seed/user${post.id}/40/40`} />
                <AvatarFallback>{post.author[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold">{post.author}</span>
                  <Badge variant="secondary" className="text-[8px] uppercase font-bold px-1.5 h-4">
                    {post.role}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-medium mt-0.5">
                  <span className="flex items-center gap-1"><MapPin className="h-2.5 w-2.5" /> {post.location}</span>
                  <span>•</span>
                  <span>{post.time}</span>
                </div>
              </div>
              <Badge variant={post.type === 'Pest Alert' ? 'destructive' : 'outline'} className="text-[10px] uppercase font-bold">
                {post.type}
              </Badge>
              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="px-6 py-0">
              <p className="text-sm leading-relaxed text-slate-700">{post.content}</p>
              {post.type === 'Pest Alert' && (
                <div className="mt-4 p-4 bg-destructive/10 rounded-2xl border border-destructive/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-destructive animate-pulse" />
                    <div className="text-[10px] font-bold text-destructive uppercase tracking-widest">
                      Confirmed Outbreak
                    </div>
                  </div>
                  <div className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                    <MapIcon className="h-3 w-3" /> Coords: {post.coords}
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="p-6 mt-4 border-t flex justify-between">
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" className="rounded-full h-9 text-xs gap-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10">
                  <ThumbsUp className="h-4 w-4" /> {post.likes}
                </Button>
                <Button variant="ghost" size="sm" className="rounded-full h-9 text-xs gap-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10">
                  <MessageCircle className="h-4 w-4" /> {post.comments}
                </Button>
              </div>
              <Button variant="ghost" size="sm" className="rounded-full h-9 text-xs gap-1.5 text-muted-foreground">
                <Share2 className="h-4 w-4" /> Share
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* FAB (Floating Action Button) for Mobile */}
      <Button className="fixed bottom-6 right-6 md:hidden h-14 w-14 rounded-full shadow-2xl shadow-primary/50">
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
}
