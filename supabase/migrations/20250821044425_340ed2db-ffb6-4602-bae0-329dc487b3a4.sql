-- Fix security warnings by setting search_path on functions
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_user_points()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NEW.is_correct = true AND OLD.is_correct = false THEN
    UPDATE public.profiles 
    SET total_points = total_points + NEW.points_awarded
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$;