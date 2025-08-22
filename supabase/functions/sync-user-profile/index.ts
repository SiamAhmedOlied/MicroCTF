import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProfileData {
  userId: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { userId, email, username, displayName, avatarUrl }: ProfileData = await req.json();

    console.log('Syncing profile for user:', userId);

    // Check if profile exists
    const { data: existingProfile } = await supabaseClient
      .from('profiles')
      .select('id, user_id')
      .eq('user_id', userId)
      .maybeSingle();

    const profileData = {
      user_id: userId,
      email: email,
      username: username,
      display_name: displayName,
      avatar_url: avatarUrl,
    };

    let result;

    if (existingProfile) {
      // Update existing profile
      const { data, error } = await supabaseClient
        .from('profiles')
        .update(profileData)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        throw error;
      }
      result = data;
      console.log('Profile updated for user:', userId);
    } else {
      // Create new profile
      const { data, error } = await supabaseClient
        .from('profiles')
        .insert(profileData)
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        throw error;
      }
      result = data;
      console.log('Profile created for user:', userId);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in sync-user-profile function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to sync user profile', 
        details: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});