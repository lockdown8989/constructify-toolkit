-- Fix search_path security warnings by updating function definitions
-- This sets the search_path to 'public' for security reasons

-- Fix update_shift_pattern_assignments_updated_at function
CREATE OR REPLACE FUNCTION public.update_shift_pattern_assignments_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Fix generate_pin_code function
CREATE OR REPLACE FUNCTION public.generate_pin_code()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
END;
$function$;

-- Fix update_chats_updated_at function
CREATE OR REPLACE FUNCTION public.update_chats_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Fix update_chat_last_message function
CREATE OR REPLACE FUNCTION public.update_chat_last_message()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE chats 
  SET last_message_at = NEW.created_at, updated_at = now()
  WHERE id = NEW.chat_id;
  RETURN NEW;
END;
$function$;