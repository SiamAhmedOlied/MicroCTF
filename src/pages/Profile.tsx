import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SignedIn, SignedOut, SignInButton, UserProfile } from "@clerk/clerk-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { Trophy, Target, Flag, Calendar } from "lucide-react";

const Profile = () => {
  document.title = "Profile | MicroCTF";
  const { profile } = useAuth();

  const { data: userStats } = useQuery({
    queryKey: ["user-stats", profile?.id],
    queryFn: async () => {
      if (!profile?.id) return null;
      
      const [submissionsResult, challengesResult] = await Promise.all([
        supabase
          .from("submissions")
          .select("*, challenges(*)")
          .eq("user_id", profile.id)
          .eq("is_correct", true)
          .order("submitted_at", { ascending: false }),
        supabase
          .from("challenges")
          .select("category")
          .eq("is_active", true)
      ]);
      
      if (submissionsResult.error) throw submissionsResult.error;
      if (challengesResult.error) throw challengesResult.error;
      
      const solvedSubmissions = submissionsResult.data || [];
      const allChallenges = challengesResult.data || [];
      
      // Calculate category stats
      const categoryStats = allChallenges.reduce((acc, challenge) => {
        const category = challenge.category;
        acc[category] = acc[category] || { total: 0, solved: 0 };
        acc[category].total += 1;
        return acc;
      }, {} as Record<string, { total: number; solved: number }>);
      
      solvedSubmissions.forEach((submission) => {
        const category = submission.challenges.category;
        if (categoryStats[category]) {
          categoryStats[category].solved += 1;
        }
      });
      
      return {
        submissions: solvedSubmissions,
        totalChallenges: allChallenges.length,
        solvedChallenges: solvedSubmissions.length,
        totalPoints: profile.total_points || 0,
        categoryStats,
      };
    },
    enabled: !!profile?.id,
  });

  return (
    <main className="container py-10 animate-fade-in">
      <div className="flex items-center space-x-2 mb-6">
        <Trophy className="w-6 h-6 text-primary" />
        <h1 className="font-display text-3xl">Your Profile</h1>
      </div>
      
      <SignedOut>
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Trophy className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Sign In Required</h3>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              Please sign in to view your profile and track your progress.
            </p>
            <SignInButton mode="modal">
              <div className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors cursor-pointer">
                Sign In
              </div>
            </SignInButton>
          </CardContent>
        </Card>
      </SignedOut>
      
      <SignedIn>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* User Profile Card */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Manage your account preferences and settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UserProfile />
              </CardContent>
            </Card>
          </div>
          
          {/* Stats Sidebar */}
          <div className="space-y-6">
            {/* Overall Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Points</span>
                  <Badge variant="secondary" className="font-mono">
                    {userStats?.totalPoints || 0}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Challenges Solved</span>
                  <Badge variant="secondary" className="font-mono">
                    {userStats?.solvedChallenges || 0}/{userStats?.totalChallenges || 0}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Success Rate</span>
                  <Badge variant="secondary" className="font-mono">
                    {userStats?.totalChallenges 
                      ? Math.round((userStats.solvedChallenges / userStats.totalChallenges) * 100)
                      : 0}%
                  </Badge>
                </div>
              </CardContent>
            </Card>
            
            {/* Category Progress */}
            {userStats?.categoryStats && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Flag className="w-5 h-5" />
                    Category Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(userStats.categoryStats).map(([category, stats]) => (
                    <div key={category} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{category}</span>
                        <span className="text-muted-foreground">
                          {stats.solved}/{stats.total}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${stats.total > 0 ? (stats.solved / stats.total) * 100 : 0}%`
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
            
            {/* Recent Solves */}
            {userStats?.submissions && userStats.submissions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Recent Solves
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {userStats.submissions.slice(0, 5).map((submission) => (
                    <div key={submission.id} className="flex items-center justify-between text-sm">
                      <span className="truncate">{submission.challenges.title}</span>
                      <Badge variant="outline" className="text-xs">
                        +{submission.points_awarded}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </SignedIn>
    </main>
  );
};

export default Profile;
