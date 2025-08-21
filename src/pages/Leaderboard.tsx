import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, Crown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useRealtimeLeaderboard } from "@/hooks/useRealtimeLeaderboard";

const Leaderboard = () => {
  document.title = "Leaderboard | MicroCTF";
  const { profile } = useAuth();
  useRealtimeLeaderboard(); // Enable real-time updates

  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .gt("total_points", 0)
        .order("total_points", { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data;
    },
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2: return <Medal className="w-5 h-5 text-gray-400" />;
      case 3: return <Award className="w-5 h-5 text-orange-600" />;
      default: return <Trophy className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return "border-yellow-500/50 bg-yellow-500/5";
      case 2: return "border-gray-400/50 bg-gray-400/5";
      case 3: return "border-orange-600/50 bg-orange-600/5";
      default: return "";
    }
  };

  if (isLoading) {
    return (
      <main className="container py-10">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-48 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main id="leaderboard" className="container py-10 animate-fade-in" aria-live="polite">
      <div className="flex items-center space-x-2 mb-6">
        <Trophy className="w-6 h-6 text-primary" />
        <h1 className="font-display text-3xl">Leaderboard</h1>
      </div>
      
      {!leaderboard || leaderboard.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Trophy className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Rankings Yet</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Be the first to solve challenges and claim your spot on the leaderboard!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {leaderboard.map((user, index) => {
            const rank = index + 1;
            const isCurrentUser = profile?.id === user.id;
            
            return (
              <Card
                key={user.id}
                className={`transition-all duration-300 hover:shadow-[var(--shadow-elegant)] ${
                  getRankColor(rank)
                } ${
                  isCurrentUser ? "ring-2 ring-primary/50" : ""
                }`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getRankIcon(rank)}
                      <span className="font-bold text-xl">#{rank}</span>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={user.display_name || user.username || "User"}
                          className="w-10 h-10 rounded-full border-2 border-border"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border-2 border-border">
                          <span className="font-semibold text-sm">
                            {(user.display_name || user.username || "U")[0].toUpperCase()}
                          </span>
                        </div>
                      )}
                      
                      <div>
                        <h3 className="font-semibold">
                          {user.display_name || user.username || "Anonymous"}
                          {isCurrentUser && (
                            <Badge variant="secondary" className="ml-2">You</Badge>
                          )}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <Trophy className="w-4 h-4 text-muted-foreground" />
                      <span className="font-bold text-lg">{user.total_points}</span>
                      <span className="text-sm text-muted-foreground">pts</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </main>
  );
};

export default Leaderboard;
