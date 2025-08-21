import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import ChallengeCard from "@/components/ChallengeCard";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { SignInButton } from "@clerk/clerk-react";

const Challenges = () => {
  document.title = "Challenges | MicroCTF";
  const { user, profile } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: challenges, isLoading: challengesLoading } = useQuery({
    queryKey: ["challenges"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("challenges")
        .select("*")
        .eq("is_active", true)
        .order("points", { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  const { data: userSubmissions } = useQuery({
    queryKey: ["user-submissions", profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      
      const { data, error } = await supabase
        .from("submissions")
        .select("*")
        .eq("user_id", profile.id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.id,
  });

  if (!user) {
    return (
      <main className="container py-10 animate-fade-in">
        <h1 className="font-display text-3xl mb-6">Challenges</h1>
        <div className="rounded-lg border bg-card p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">Sign in to View Challenges</h2>
          <p className="text-muted-foreground mb-6">
            Join MicroCTF to access our collection of cybersecurity challenges and compete on the leaderboard!
          </p>
          <SignInButton mode="modal">
            <Button variant="neon" size="lg">
              Sign In to Start
            </Button>
          </SignInButton>
        </div>
      </main>
    );
  }

  if (challengesLoading) {
    return (
      <main className="container py-10">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-48 mb-6"></div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  const categories = [...new Set(challenges?.map(c => c.category) || [])];
  const filteredChallenges = selectedCategory 
    ? challenges?.filter(c => c.category === selectedCategory)
    : challenges;

  const solvedCount = userSubmissions?.filter(s => s.is_correct).length || 0;
  const totalPoints = userSubmissions?.reduce((sum, s) => s.is_correct ? sum + s.points_awarded : sum, 0) || 0;

  return (
    <main className="container py-10 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl">Challenges</h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>Solved: {solvedCount}/{challenges?.length || 0}</span>
          <span>Points: {totalPoints}</span>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-6">
        <Button
          variant={selectedCategory === null ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedCategory(null)}
        >
          All Categories
        </Button>
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </Button>
        ))}
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredChallenges?.map((challenge, index) => (
          <div
            key={challenge.id}
            className="animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <ChallengeCard 
              challenge={challenge} 
              userSubmissions={userSubmissions || []}
            />
          </div>
        ))}
      </div>

      {(!filteredChallenges || filteredChallenges.length === 0) && (
        <div className="text-center py-16">
          <p className="text-muted-foreground">
            {selectedCategory 
              ? `No challenges found in the ${selectedCategory} category.`
              : "No challenges available at the moment."
            }
          </p>
        </div>
      )}
    </main>
  );
};

export default Challenges;
