import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { challengeId, submittedFlag, userId } = await req.json()

    if (!challengeId || !submittedFlag || !userId) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Missing challengeId, submittedFlag, or userId' 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    console.log('Processing flag submission for user:', userId, 'challenge:', challengeId)

    // Get user profile using Clerk user ID
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('id, total_points')
      .eq('user_id', userId)
      .maybeSingle()

    if (profileError || !profile) {
      console.error('Profile error:', profileError)
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'User profile not found' 
        }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Get challenge details
    const { data: challenge, error: challengeError } = await supabaseClient
      .from('challenges')
      .select('*')
      .eq('id', challengeId)
      .eq('is_active', true)
      .single()

    if (challengeError || !challenge) {
      console.error('Challenge error:', challengeError)
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Challenge not found or inactive' 
        }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Check if user already solved this challenge
    const { data: existingSolve } = await supabaseClient
      .from('submissions')
      .select('id')
      .eq('user_id', profile.id)
      .eq('challenge_id', challengeId)
      .eq('is_correct', true)
      .maybeSingle()

    if (existingSolve) {
      return new Response(
        JSON.stringify({ 
          success: false,
          message: 'You have already solved this challenge!' 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Check if flag is correct
    const isCorrect = submittedFlag.trim() === challenge.flag.trim()

    // Insert submission
    const { error: submissionError } = await supabaseClient
      .from('submissions')
      .insert({
        user_id: profile.id,
        challenge_id: challengeId,
        submitted_flag: submittedFlag.trim(),
        is_correct: isCorrect,
        points_awarded: isCorrect ? challenge.points : 0,
      })

    if (submissionError) {
      console.error('Submission error:', submissionError)
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Failed to save submission' 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // If correct, update user points
    if (isCorrect) {
      const { error: updateError } = await supabaseClient
        .from('profiles')
        .update({ 
          total_points: profile.total_points + challenge.points 
        })
        .eq('id', profile.id)

      if (updateError) {
        console.error('Points update error:', updateError)
      }
    }

    return new Response(
      JSON.stringify({
        success: isCorrect,
        message: isCorrect 
          ? `Congratulations! You earned ${challenge.points} points.`
          : 'Incorrect flag. Keep trying!',
        pointsAwarded: isCorrect ? challenge.points : 0,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Internal server error' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})