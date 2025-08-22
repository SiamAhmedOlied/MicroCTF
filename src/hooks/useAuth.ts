import { useUser } from "@clerk/clerk-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useAuth = () => {
  const { user, isLoaded } = useUser();
  const queryClient = useQueryClient();

  // Get user profile from Supabase
  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
       const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
      return data;
    },
    enabled: !!user?.id,
  });

  // Create or update profile using edge function
  const createOrUpdateProfile = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("No user found");

      const { data, error } = await supabase.functions.invoke("sync-user-profile", {
        body: {
          userId: user.id,
          email: user.emailAddresses[0]?.emailAddress || "",
          username: user.username || "",
          displayName: user.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : user.username || "",
          avatarUrl: user.imageUrl || "",
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
    },
  });

  // Auto-create profile when user is loaded and no profile exists
  const shouldCreateProfile = isLoaded && user && !profile;
  
  if (shouldCreateProfile && !createOrUpdateProfile.isPending) {
    createOrUpdateProfile.mutate();
  }

  return {
    user,
    profile,
    isLoaded,
    createOrUpdateProfile,
  };
};