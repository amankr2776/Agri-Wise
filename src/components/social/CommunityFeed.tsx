
"use client";

import React, { useState } from "react";
import { MessageSquare, ThumbsUp, ThumbsDown, Share2, MapPin, AlertCircle, Plus, Image as ImageIcon } from "lucide-react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const MOCK_POSTS = [
  { id: 1, author: "Rajesh Kumar", role: "Farmer", content: "I found this new organic fertilizer mixture works great for potatoes in cold weather. Any thoughts?", type: "Nuskha", likes: 24, dislikes: 2, comments: 5, location: "Shimla" },
  { id: 2, author: "Suresh P.", role: "Expert", content: "Seeing early signs of Locust migration in the western borders. Please keep your fields checked!", type: "Alert", likes: 89, dislikes: 1, comments: 34, location: "Barmer", isPestAlert: true },
  { id: 3, author: "Anita Devi", role: "Farmer", content: "Harvesting my organic wheat today. Yield looks 20% higher than last year!", type: "Update", likes: 156, dislikes: 0, comments: 22, location: "Amritsar" },
];

export function CommunityFeed() {
  const [posts, setPosts] = useState(MOCK_POSTS);

  const handleVote = (id: number, up: boolean) => {
    setPosts(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, likes: up ? p.likes + 1 : p.likes, dislikes: !up ? p.dislikes + 1 : p.dislikes };
      }
      return p;
    }));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="border-primary/20 bg-white">
        <CardContent className="p-4 space-y-4">
          <div className="flex gap-3">
            <Avatar>
              <AvatarImage src="https://picsum.photos/seed/user1/40/40" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <Input placeholder="Share an update or a farming tip..." className="bg-muted/30 border-none" />
          </div>
          <div className="flex justify-between items-center border-t pt-3">
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="text-xs h-8">
                <ImageIcon className="h-4 w-4 mr-1 text-primary" /> Photo
              </Button>
              <Button variant="ghost" size="sm" className="text-xs h-8">
                <MapPin className="h-4 w-4 mr-1 text-primary" /> Location
              </Button>
              <Button variant="ghost" size="sm" className="text-xs h-8 text-red-500 hover:text-red-600">
                <AlertCircle className="h-4 w-4 mr-1" /> Pest Alert
              </Button>
            </div>
            <Button size="sm" className="bg-primary px-6">Post</Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {posts.map((p) => (
          <Card key={p.id} className={`${p.isPestAlert ? 'border-red-200 bg-red-50/20' : ''}`}>
            <CardHeader className="flex flex-row items-center gap-3 p-4">
              <Avatar>
                <AvatarImage src={`https://picsum.photos/seed/u${p.id}/40/40`} />
                <AvatarFallback>{p.author[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm">{p.author}</span>
                  <Badge variant="secondary" className="text-[10px] h-4">{p.role}</Badge>
                </div>
                <div className="flex items-center text-[10px] text-muted-foreground">
                  <MapPin className="h-2 w-2 mr-1" /> {p.location} • 2h ago
                </div>
              </div>
              <Badge variant={p.type === 'Alert' ? 'destructive' : 'outline'} className="text-[10px]">
                {p.type}
              </Badge>
            </CardHeader>
            <CardContent className="px-4 py-2">
              <p className="text-sm leading-relaxed">{p.content}</p>
              {p.isPestAlert && (
                <div className="mt-3 p-3 bg-red-100 rounded-lg border border-red-200 flex items-center gap-3">
                  <AlertCircle className="h-8 w-8 text-red-600 animate-pulse" />
                  <div className="text-xs text-red-800">
                    <span className="font-bold">Crowdsourced Alert:</span> Possible pest outbreak reported in your vicinity.
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="p-2 border-t flex items-center justify-around gap-2">
              <div className="flex items-center">
                <Button variant="ghost" size="sm" onClick={() => handleVote(p.id, true)} className="h-8 text-xs text-muted-foreground hover:text-primary">
                  <ThumbsUp className="h-4 w-4 mr-1" /> {p.likes}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleVote(p.id, false)} className="h-8 text-xs text-muted-foreground hover:text-red-500">
                  <ThumbsDown className="h-4 w-4 mr-1" /> {p.dislikes}
                </Button>
              </div>
              <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground">
                <MessageSquare className="h-4 w-4 mr-1" /> {p.comments}
              </Button>
              <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground">
                <Share2 className="h-4 w-4 mr-1" /> Share
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
