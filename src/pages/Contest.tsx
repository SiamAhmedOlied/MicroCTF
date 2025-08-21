import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Trophy, Users } from "lucide-react";
import { format } from "date-fns";

const Contest = () => {
  document.title = "Contest | MicroCTF";
  
  const { data: contests, isLoading } = useQuery({
    queryKey: ["contests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contests")
        .select("*")
        .eq("is_active", true)
        .order("start_time", { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <main className="container py-10">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-48 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container py-10 animate-fade-in">
      <div className="flex items-center space-x-2 mb-6">
        <Trophy className="w-6 h-6 text-primary" />
        <h1 className="font-display text-3xl">Active Contests</h1>
      </div>
      
      {!contests || contests.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Trophy className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Active Contests</h3>
            <p className="text-muted-foreground text-center max-w-md">
              There are currently no active contests. Check back later for exciting competitions and challenges!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {contests.map((contest, index) => {
            const now = new Date();
            const startTime = new Date(contest.start_time);
            const endTime = new Date(contest.end_time);
            const isActive = now >= startTime && now <= endTime;
            const isUpcoming = now < startTime;
            const isEnded = now > endTime;
            
            return (
              <Card 
                key={contest.id} 
                className={`hover:shadow-[var(--shadow-elegant)] transition-all duration-300 ${
                  isActive ? "border-primary shadow-sm" : ""
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <span>{contest.name}</span>
                        {isActive && (
                          <Badge variant="default" className="animate-pulse">
                            Live
                          </Badge>
                        )}
                        {isUpcoming && (
                          <Badge variant="secondary">Upcoming</Badge>
                        )}
                        {isEnded && (
                          <Badge variant="outline">Ended</Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {contest.description || "An exciting CTF competition awaits!"}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <div className="text-sm">
                        <p className="font-medium">Starts</p>
                        <p className="text-muted-foreground">
                          {format(startTime, "MMM dd, yyyy")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <div className="text-sm">
                        <p className="font-medium">Duration</p>
                        <p className="text-muted-foreground">
                          {Math.ceil((endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60 * 24))} days
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <div className="text-sm">
                        <p className="font-medium">Participants</p>
                        <p className="text-muted-foreground">Join to compete!</p>
                      </div>
                    </div>
                  </div>
                  
                  {isActive && (
                    <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-md">
                      <p className="text-sm text-primary font-medium">
                        🔥 Contest is live! Start solving challenges now!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </main>
  );
};

export default Contest;