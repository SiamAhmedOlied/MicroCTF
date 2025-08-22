import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Lock, Lightbulb, Trophy, Flag } from "lucide-react";

interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  points: number;
  hint?: string;
  is_active: boolean;
}

interface ChallengeCardProps {
  challenge: Challenge;
  userSubmissions?: any[];
}

const ChallengeCard = ({ challenge, userSubmissions }: ChallengeCardProps) => {
  const [flag, setFlag] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const isAlreadySolved = userSubmissions?.some(
    (sub) => sub.challenge_id === challenge.id && sub.is_correct
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy": return "bg-green-500/10 text-green-400 border-green-500/20";
      case "medium": return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      case "hard": return "bg-red-500/10 text-red-400 border-red-500/20";
      case "expert": return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      Web: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      Crypto: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      Reverse: "bg-orange-500/10 text-orange-400 border-orange-500/20",
      Forensics: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      OSINT: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
      Network: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
      Stego: "bg-pink-500/10 text-pink-400 border-pink-500/20",
      Misc: "bg-gray-500/10 text-gray-400 border-gray-500/20",
    };
    return colors[category as keyof typeof colors] || "bg-muted text-muted-foreground";
  };

  const submitFlag = async () => {
    if (!profile) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to submit flags.",
        variant: "destructive",
      });
      return;
    }

    if (!flag.trim()) {
      toast({
        title: "Invalid Flag",
        description: "Please enter a flag.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke("submit-flag", {
        body: {
          challengeId: challenge.id,
          submittedFlag: flag.trim(),
          userId: profile.user_id,
        },
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "🎉 Correct Flag!",
          description: `You earned ${data.pointsAwarded} points!`,
        });
        queryClient.invalidateQueries({ queryKey: ["challenges"] });
        queryClient.invalidateQueries({ queryKey: ["user-submissions"] });
        queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
        setFlag("");
      } else {
        toast({
          title: "❌ Incorrect Flag",
          description: data.message || "Try again!",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit flag.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className={`hover:shadow-[var(--shadow-elegant)] transition-all duration-300 ${
      isAlreadySolved ? "border-green-500/50 bg-green-500/5" : ""
    }`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              {challenge.title}
              {isAlreadySolved && (
                <Trophy className="w-4 h-4 text-green-500" />
              )}
            </CardTitle>
            <CardDescription className="mt-2">
              {challenge.description}
            </CardDescription>
          </div>
          <div className="flex flex-col gap-2 ml-4">
            <Badge className={getDifficultyColor(challenge.difficulty)}>
              {challenge.difficulty}
            </Badge>
            <Badge className={getCategoryColor(challenge.category)}>
              {challenge.category}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Trophy className="w-4 h-4" />
            <span>{challenge.points} points</span>
          </div>
          {challenge.hint && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHint(!showHint)}
              className="text-muted-foreground hover:text-foreground"
            >
              <Lightbulb className="w-4 h-4 mr-1" />
              Hint
            </Button>
          )}
        </div>

        {showHint && challenge.hint && (
          <div className="mb-4 p-3 bg-muted/50 rounded-md border-l-4 border-yellow-500">
            <p className="text-sm">{challenge.hint}</p>
          </div>
        )}

        {isAlreadySolved ? (
          <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-md">
            <Trophy className="w-4 h-4 text-green-500" />
            <span className="text-sm text-green-500 font-medium">Challenge Solved!</span>
          </div>
        ) : (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="neon" className="w-full">
                <Flag className="w-4 h-4 mr-2" />
                Submit Flag
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{challenge.title}</DialogTitle>
                <DialogDescription>
                  Submit the flag you found for this challenge.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="flag">Flag</Label>
                  <Input
                    id="flag"
                    placeholder="microctf{...}"
                    value={flag}
                    onChange={(e) => setFlag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        submitFlag();
                      }
                    }}
                  />
                </div>
                <Button
                  onClick={submitFlag}
                  disabled={isSubmitting}
                  className="w-full"
                  variant="neon"
                >
                  {isSubmitting ? "Submitting..." : "Submit Flag"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
};

export default ChallengeCard;