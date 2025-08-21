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
        .single();
      
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
      return data;
    },
    enabled: !!user?.id,
  });

  // Create or update profile
  const createOrUpdateProfile = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("No user found");

      // First try to get existing profile
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      const profileData = {
        ...(existingProfile && { id: existingProfile.id }),
        user_id: user.id,
        email: user.emailAddresses[0]?.emailAddress || "",
        username: user.username || "",
        display_name: user.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : user.username || "",
        avatar_url: user.imageUrl || "",
      };

      const { data, error } = await supabase
        .from("profiles")
        .upsert(profileData, { 
          onConflict: "user_id",
          ignoreDuplicates: false 
        })
        .select()
        .single();

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