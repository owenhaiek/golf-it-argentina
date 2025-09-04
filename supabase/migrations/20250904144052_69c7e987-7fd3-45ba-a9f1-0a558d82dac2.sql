-- Fix function search path security warnings
-- Set secure search_path for all database functions

-- Fix authenticate_course_manager function
CREATE OR REPLACE FUNCTION public.authenticate_course_manager(manager_email text, manager_password text)
 RETURNS TABLE(manager_id uuid, course_id uuid, name text, email text, course_name text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  stored_hash TEXT;
  manager_record RECORD;
BEGIN
  -- Get the stored password hash and manager details
  SELECT cm.id, cm.course_id, cm.name, cm.email, cm.password_hash, cm.is_active, gc.name as course_name
  INTO manager_record
  FROM public.course_managers cm
  JOIN public.golf_courses gc ON cm.course_id = gc.id
  WHERE cm.email = manager_email AND cm.is_active = true;
  
  -- Check if manager exists
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- In a real implementation, you would use proper password hashing (bcrypt, etc.)
  -- For this demo, we'll do a simple comparison (NOT recommended for production)
  IF manager_record.password_hash = crypt(manager_password, manager_record.password_hash) THEN
    RETURN QUERY SELECT 
      manager_record.id,
      manager_record.course_id,
      manager_record.name,
      manager_record.email,
      manager_record.course_name;
  END IF;
END;
$function$;

-- Fix approve_course_manager function
CREATE OR REPLACE FUNCTION public.approve_course_manager(pending_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  pending_record RECORD;
BEGIN
  -- Get the pending registration
  SELECT * INTO pending_record
  FROM public.pending_course_managers
  WHERE id = pending_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Insert into course_managers table
  INSERT INTO public.course_managers (course_id, name, email, password_hash, phone)
  VALUES (
    pending_record.course_id,
    pending_record.name,
    pending_record.email,
    pending_record.password_hash,
    pending_record.phone
  );
  
  -- Update the pending record status
  UPDATE public.pending_course_managers
  SET status = 'approved'
  WHERE id = pending_id;
  
  RETURN TRUE;
END;
$function$;

-- Fix reject_course_manager function
CREATE OR REPLACE FUNCTION public.reject_course_manager(pending_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  UPDATE public.pending_course_managers
  SET status = 'rejected'
  WHERE id = pending_id AND status = 'pending';
  
  RETURN FOUND;
END;
$function$;