
-- GDPR Compliance Updates for Supabase

-- 1. Create data processing log table for audit trails
CREATE TABLE IF NOT EXISTS public.data_processing_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- 'access', 'update', 'delete', 'export', 'anonymize'
  table_name TEXT NOT NULL,
  record_id UUID,
  processed_data JSONB,
  legal_basis TEXT NOT NULL, -- 'consent', 'contract', 'legal_obligation', 'vital_interests', 'public_task', 'legitimate_interests'
  processor_id UUID REFERENCES auth.users(id),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on data processing log
ALTER TABLE public.data_processing_log ENABLE ROW LEVEL SECURITY;

-- RLS policies for data processing log
CREATE POLICY "Users can view their own processing log" ON public.data_processing_log
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all processing logs" ON public.data_processing_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'hr')
    )
  );

CREATE POLICY "System can insert processing logs" ON public.data_processing_log
  FOR INSERT WITH CHECK (true);

-- 2. Create consent management table
CREATE TABLE IF NOT EXISTS public.user_consent (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL, -- 'marketing', 'analytics', 'functional', 'necessary'
  consent_given BOOLEAN NOT NULL DEFAULT false,
  consent_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  consent_withdrawn_date TIMESTAMP WITH TIME ZONE,
  ip_address INET,
  user_agent TEXT,
  privacy_policy_version TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, consent_type)
);

-- Enable RLS on consent table
ALTER TABLE public.user_consent ENABLE ROW LEVEL SECURITY;

-- RLS policies for consent
CREATE POLICY "Users can manage their own consent" ON public.user_consent
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Admins can view all consent records" ON public.user_consent
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'hr')
    )
  );

-- 3. Create data retention policy table
CREATE TABLE IF NOT EXISTS public.data_retention_policy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL UNIQUE,
  retention_period_days INTEGER NOT NULL,
  deletion_criteria JSONB,
  last_cleanup_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default retention policies
INSERT INTO public.data_retention_policy (table_name, retention_period_days, deletion_criteria) VALUES
  ('attendance', 2555, '{"after_employment_end": true}'), -- 7 years for payroll/tax purposes
  ('payroll', 2555, '{"after_employment_end": true}'), -- 7 years for legal compliance
  ('profiles', 1095, '{"after_account_deletion": true}'), -- 3 years after account deletion
  ('notifications', 365, '{"read": true}'), -- 1 year for read notifications
  ('auth_events', 730, '{"all": true}'), -- 2 years for security logs
  ('data_processing_log', 2555, '{"all": true}') -- 7 years for audit trails
ON CONFLICT (table_name) DO NOTHING;

-- 4. Update profiles table with GDPR fields
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS data_processing_consent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_privacy_policy_accepted TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS privacy_policy_version TEXT,
ADD COLUMN IF NOT EXISTS data_retention_override INTEGER, -- Custom retention period in days
ADD COLUMN IF NOT EXISTS anonymization_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS deletion_requested_date TIMESTAMP WITH TIME ZONE;

-- 5. Create function to anonymize user data
CREATE OR REPLACE FUNCTION public.anonymize_user_data(target_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  employee_record_id UUID;
  anonymized_count INTEGER := 0;
BEGIN
  -- Log the anonymization attempt
  INSERT INTO data_processing_log (user_id, action_type, table_name, legal_basis, processed_data)
  VALUES (target_user_id, 'anonymize', 'all_tables', 'user_request', 
          jsonb_build_object('anonymization_date', NOW()));

  -- Find employee record if exists
  SELECT id INTO employee_record_id 
  FROM employees 
  WHERE user_id = target_user_id;
  
  -- Anonymize profile data
  UPDATE profiles SET
    first_name = 'Anonymized',
    last_name = 'User',
    email = 'anonymized_' || target_user_id || '@deleted.local',
    position = 'Anonymized',
    department = 'Anonymized',
    avatar_url = NULL,
    anonymization_date = NOW()
  WHERE id = target_user_id;
  
  -- Anonymize employee data if exists
  IF employee_record_id IS NOT NULL THEN
    UPDATE employees SET
      name = 'Anonymized User',
      email = 'anonymized_' || target_user_id || '@deleted.local',
      avatar = NULL,
      avatar_url = NULL
    WHERE id = employee_record_id;
  END IF;
  
  -- Keep attendance/payroll data but anonymize personal identifiers
  -- This maintains legal compliance while protecting privacy
  
  GET DIAGNOSTICS anonymized_count = ROW_COUNT;
  
  RETURN json_build_object(
    'success', true,
    'user_id', target_user_id,
    'anonymized_records', anonymized_count,
    'anonymization_date', NOW(),
    'message', 'User data anonymized successfully while maintaining legal compliance'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error during user anonymization: %', SQLERRM;
END;
$$;

-- 6. Create function to export user data (GDPR Article 20 - Data Portability)
CREATE OR REPLACE FUNCTION public.export_user_data(target_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_data JSON;
  employee_id UUID;
BEGIN
  -- Log the data export request
  INSERT INTO data_processing_log (user_id, action_type, table_name, legal_basis)
  VALUES (target_user_id, 'export', 'all_tables', 'user_request');
  
  -- Get employee ID
  SELECT id INTO employee_id FROM employees WHERE user_id = target_user_id;
  
  -- Build comprehensive user data export
  SELECT json_build_object(
    'export_date', NOW(),
    'user_id', target_user_id,
    'profile', (
      SELECT row_to_json(p) FROM (
        SELECT first_name, last_name, email, position, department, 
               data_processing_consent, marketing_consent, 
               last_privacy_policy_accepted, privacy_policy_version
        FROM profiles WHERE id = target_user_id
      ) p
    ),
    'employee_data', (
      SELECT row_to_json(e) FROM (
        SELECT name, job_title, department, site, salary, start_date,
               employment_type, annual_leave_days, sick_leave_days
        FROM employees WHERE user_id = target_user_id
      ) e
    ),
    'consent_records', (
      SELECT json_agg(row_to_json(c)) FROM (
        SELECT consent_type, consent_given, consent_date, 
               consent_withdrawn_date, privacy_policy_version
        FROM user_consent WHERE user_id = target_user_id
      ) c
    ),
    'attendance_summary', (
      SELECT json_build_object(
        'total_records', COUNT(*),
        'date_range', json_build_object(
          'earliest', MIN(date),
          'latest', MAX(date)
        ),
        'total_working_hours', SUM(working_minutes)/60.0
      ) FROM attendance WHERE employee_id = employee_id
    ),
    'notifications_count', (
      SELECT COUNT(*) FROM notifications WHERE user_id = target_user_id
    ),
    'data_processing_log', (
      SELECT json_agg(row_to_json(l)) FROM (
        SELECT action_type, table_name, legal_basis, created_at
        FROM data_processing_log WHERE user_id = target_user_id
        ORDER BY created_at DESC LIMIT 100
      ) l
    )
  ) INTO user_data;
  
  RETURN user_data;
END;
$$;

-- 7. Create trigger to log data changes for audit
CREATE OR REPLACE FUNCTION public.log_data_processing()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  affected_user_id UUID;
  action_type_val TEXT;
BEGIN
  -- Determine action type
  action_type_val := CASE TG_OP
    WHEN 'INSERT' THEN 'create'
    WHEN 'UPDATE' THEN 'update'
    WHEN 'DELETE' THEN 'delete'
  END;
  
  -- Get user ID from the record
  IF TG_OP = 'DELETE' THEN
    affected_user_id := COALESCE(OLD.user_id, OLD.id);
  ELSE
    affected_user_id := COALESCE(NEW.user_id, NEW.id);
  END IF;
  
  -- Skip logging for the log table itself to avoid recursion
  IF TG_TABLE_NAME != 'data_processing_log' AND affected_user_id IS NOT NULL THEN
    INSERT INTO data_processing_log (
      user_id, action_type, table_name, record_id, 
      processed_data, legal_basis, processor_id, ip_address
    ) VALUES (
      affected_user_id, action_type_val, TG_TABLE_NAME,
      CASE WHEN TG_OP = 'DELETE' THEN OLD.id ELSE NEW.id END,
      CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE row_to_json(NEW) END,
      'legitimate_interests', -- Default legal basis for system operations
      auth.uid(), NULL -- IP address would need to be passed from application
    );
  END IF;
  
  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$;

-- Apply audit triggers to key tables
DROP TRIGGER IF EXISTS audit_profiles ON public.profiles;
CREATE TRIGGER audit_profiles
  AFTER INSERT OR UPDATE OR DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION log_data_processing();

DROP TRIGGER IF EXISTS audit_employees ON public.employees;
CREATE TRIGGER audit_employees
  AFTER INSERT OR UPDATE OR DELETE ON public.employees
  FOR EACH ROW EXECUTE FUNCTION log_data_processing();

-- 8. Create function for data retention cleanup
CREATE OR REPLACE FUNCTION public.cleanup_expired_data()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  policy_record RECORD;
  cleanup_count INTEGER := 0;
  total_cleaned INTEGER := 0;
  cleanup_summary JSON := '[]'::JSON;
BEGIN
  FOR policy_record IN 
    SELECT * FROM data_retention_policy WHERE is_active = true
  LOOP
    -- This is a simplified example - actual implementation would be more complex
    -- based on specific retention criteria for each table
    
    CASE policy_record.table_name
      WHEN 'notifications' THEN
        DELETE FROM notifications 
        WHERE created_at < NOW() - INTERVAL '1 day' * policy_record.retention_period_days
        AND read = true;
        GET DIAGNOSTICS cleanup_count = ROW_COUNT;
        
      WHEN 'auth_events' THEN
        DELETE FROM auth_events 
        WHERE created_at < NOW() - INTERVAL '1 day' * policy_record.retention_period_days;
        GET DIAGNOSTICS cleanup_count = ROW_COUNT;
        
      ELSE
        cleanup_count := 0;
    END CASE;
    
    total_cleaned := total_cleaned + cleanup_count;
    
    -- Update last cleanup date
    UPDATE data_retention_policy 
    SET last_cleanup_date = NOW() 
    WHERE id = policy_record.id;
    
    -- Log cleanup activity
    INSERT INTO data_processing_log (
      user_id, action_type, table_name, legal_basis, processed_data
    ) VALUES (
      NULL, 'delete', policy_record.table_name, 'legal_obligation',
      jsonb_build_object('cleanup_count', cleanup_count, 'retention_days', policy_record.retention_period_days)
    );
  END LOOP;
  
  RETURN json_build_object(
    'success', true,
    'total_records_cleaned', total_cleaned,
    'cleanup_date', NOW(),
    'policies_processed', (SELECT COUNT(*) FROM data_retention_policy WHERE is_active = true)
  );
END;
$$;

-- 9. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.data_processing_log TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_consent TO authenticated;
GRANT SELECT ON public.data_retention_policy TO authenticated;
GRANT EXECUTE ON FUNCTION public.export_user_data(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.anonymize_user_data(UUID) TO authenticated;

-- Admin permissions
GRANT ALL ON public.data_processing_log TO service_role;
GRANT ALL ON public.user_consent TO service_role;
GRANT ALL ON public.data_retention_policy TO service_role;
