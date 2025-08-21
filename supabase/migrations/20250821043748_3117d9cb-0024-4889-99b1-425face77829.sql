-- Create user profiles table synced with Clerk
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE, -- Clerk user ID
  email TEXT NOT NULL,
  username TEXT,
  display_name TEXT,
  avatar_url TEXT,
  total_points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create challenges table
CREATE TABLE public.challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Web', 'Crypto', 'Reverse', 'Forensics', 'OSINT', 'Network', 'Stego', 'Misc')),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard', 'Expert')),
  points INTEGER NOT NULL,
  flag TEXT NOT NULL,
  hint TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create submissions table
CREATE TABLE public.submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  submitted_flag TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT false,
  points_awarded INTEGER DEFAULT 0,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, challenge_id, is_correct) -- Only one correct submission per user per challenge
);

-- Create contests table
CREATE TABLE public.contests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT false,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contests ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (user_id = auth.jwt() ->> 'sub');

-- Challenges policies  
CREATE POLICY "Everyone can view active challenges" ON public.challenges
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage challenges" ON public.challenges
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.jwt() ->> 'sub' 
      AND (auth.jwt() -> 'public_metadata' ->> 'isAdmin')::boolean = true
    )
  );

-- Submissions policies
CREATE POLICY "Users can view their own submissions" ON public.submissions
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Users can create submissions" ON public.submissions
  FOR INSERT WITH CHECK (
    user_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.jwt() ->> 'sub'
    )
  );

-- Contests policies
CREATE POLICY "Everyone can view active contests" ON public.contests
  FOR SELECT USING (is_active = true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_challenges_updated_at
  BEFORE UPDATE ON public.challenges
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to update user points
CREATE OR REPLACE FUNCTION public.update_user_points()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_correct = true AND OLD.is_correct = false THEN
    UPDATE public.profiles 
    SET total_points = total_points + NEW.points_awarded
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_points_on_correct_submission
  AFTER UPDATE ON public.submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_points();

-- Insert sample challenges
INSERT INTO public.challenges (title, description, category, difficulty, points, flag, hint) VALUES
('Welcome to MicroCTF', 'Your first challenge! Find the flag in this description. The flag format is microctf{...}', 'Misc', 'Easy', 50, 'microctf{welcome_to_the_game}', 'Look carefully at the description text.'),
('Base64 Basics', 'Decode this: bWljcm9jdGZ7YmFzZTY0X2lzX2Vhc3l9', 'Crypto', 'Easy', 75, 'microctf{base64_is_easy}', 'This looks like base64 encoding.'),
('Hidden in Plain Sight', 'Sometimes the most obvious place is the best hiding spot. Check the page source!', 'Web', 'Easy', 100, 'microctf{inspect_element_ftw}', 'Right-click and inspect the page source.'),
('Caesar Cipher', 'Decrypt this message: zvpebpgs{pnrfne_fuvsg_13}', 'Crypto', 'Medium', 150, 'microctf{caesar_shift_13}', 'Try different shift values, or maybe ROT13?');

-- Enable realtime for leaderboard updates
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER TABLE public.submissions REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.profiles;
ALTER publication supabase_realtime ADD TABLE public.submissions;