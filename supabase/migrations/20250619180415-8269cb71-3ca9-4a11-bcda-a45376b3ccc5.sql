
-- Fix foreign key constraints that prevent manual user deletion from Supabase
-- This will allow manual deletion while preserving data integrity

-- First, let's check what foreign key constraints exist on auth.users
-- and modify them to allow cascading deletes or make them nullable

-- Update the open_shifts table to handle user deletion gracefully
-- Remove the strict foreign key constraint and make it nullable
ALTER TABLE open_shifts DROP CONSTRAINT IF EXISTS open_shifts_created_by_fkey;

-- Add a new constraint that allows NULL values when users are deleted
ALTER TABLE open_shifts ALTER COLUMN created_by DROP NOT NULL;

-- Add a new foreign key constraint with CASCADE DELETE
ALTER TABLE open_shifts ADD CONSTRAINT open_shifts_created_by_fkey 
    FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Do the same for other tables that might reference auth.users directly
-- Check schedules table
ALTER TABLE schedules DROP CONSTRAINT IF EXISTS schedules_published_by_fkey;
ALTER TABLE schedules DROP CONSTRAINT IF EXISTS schedules_approved_by_fkey;
ALTER TABLE schedules DROP CONSTRAINT IF EXISTS schedules_manager_id_fkey;
ALTER TABLE schedules DROP CONSTRAINT IF EXISTS schedules_last_dragged_by_fkey;

-- Make these columns nullable and add cascade constraints
ALTER TABLE schedules ALTER COLUMN published_by DROP NOT NULL;
ALTER TABLE schedules ALTER COLUMN approved_by DROP NOT NULL;
ALTER TABLE schedules ALTER COLUMN manager_id DROP NOT NULL;
ALTER TABLE schedules ALTER COLUMN last_dragged_by DROP NOT NULL;

-- Add new constraints with SET NULL on delete
ALTER TABLE schedules ADD CONSTRAINT schedules_published_by_fkey 
    FOREIGN KEY (published_by) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE schedules ADD CONSTRAINT schedules_approved_by_fkey 
    FOREIGN KEY (approved_by) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE schedules ADD CONSTRAINT schedules_manager_id_fkey 
    FOREIGN KEY (manager_id) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE schedules ADD CONSTRAINT schedules_last_dragged_by_fkey 
    FOREIGN KEY (last_dragged_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Fix other tables that might have similar issues
-- Check open_shift_assignments
ALTER TABLE open_shift_assignments DROP CONSTRAINT IF EXISTS open_shift_assignments_assigned_by_fkey;
ALTER TABLE open_shift_assignments ALTER COLUMN assigned_by DROP NOT NULL;
ALTER TABLE open_shift_assignments ADD CONSTRAINT open_shift_assignments_assigned_by_fkey 
    FOREIGN KEY (assigned_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Check shift_applications
ALTER TABLE shift_applications DROP CONSTRAINT IF EXISTS shift_applications_reviewed_by_fkey;
ALTER TABLE shift_applications ALTER COLUMN reviewed_by DROP NOT NULL;
ALTER TABLE shift_applications ADD CONSTRAINT shift_applications_reviewed_by_fkey 
    FOREIGN KEY (reviewed_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Check other tables with similar patterns
ALTER TABLE document_assignments DROP CONSTRAINT IF EXISTS document_assignments_assigned_by_fkey;
ALTER TABLE document_assignments ALTER COLUMN assigned_by DROP NOT NULL;
ALTER TABLE document_assignments ADD CONSTRAINT document_assignments_assigned_by_fkey 
    FOREIGN KEY (assigned_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_uploaded_by_fkey;
ALTER TABLE documents ALTER COLUMN uploaded_by DROP NOT NULL;
ALTER TABLE documents ADD CONSTRAINT documents_uploaded_by_fkey 
    FOREIGN KEY (uploaded_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Check schedule_publications
ALTER TABLE schedule_publications DROP CONSTRAINT IF EXISTS schedule_publications_published_by_fkey;
ALTER TABLE schedule_publications ALTER COLUMN published_by DROP NOT NULL;
ALTER TABLE schedule_publications ADD CONSTRAINT schedule_publications_published_by_fkey 
    FOREIGN KEY (published_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Check other audit/tracking tables
ALTER TABLE availability_requests DROP CONSTRAINT IF EXISTS availability_requests_reviewer_id_fkey;
ALTER TABLE availability_requests ALTER COLUMN reviewer_id DROP NOT NULL;
ALTER TABLE availability_requests ADD CONSTRAINT availability_requests_reviewer_id_fkey 
    FOREIGN KEY (reviewer_id) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE schedule_conflicts DROP CONSTRAINT IF EXISTS schedule_conflicts_resolved_by_fkey;
ALTER TABLE schedule_conflicts ALTER COLUMN resolved_by DROP NOT NULL;
ALTER TABLE schedule_conflicts ADD CONSTRAINT schedule_conflicts_resolved_by_fkey 
    FOREIGN KEY (resolved_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE schedule_conflicts_log DROP CONSTRAINT IF EXISTS schedule_conflicts_log_resolved_by_fkey;
ALTER TABLE schedule_conflicts_log ALTER COLUMN resolved_by DROP NOT NULL;
ALTER TABLE schedule_conflicts_log ADD CONSTRAINT schedule_conflicts_log_resolved_by_fkey 
    FOREIGN KEY (resolved_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Check labor_analytics
ALTER TABLE labor_analytics DROP CONSTRAINT IF EXISTS labor_analytics_calculated_by_fkey;
ALTER TABLE labor_analytics ALTER COLUMN calculated_by DROP NOT NULL;
ALTER TABLE labor_analytics ADD CONSTRAINT labor_analytics_calculated_by_fkey 
    FOREIGN KEY (calculated_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Check attendance table for overtime approval fields
ALTER TABLE attendance DROP CONSTRAINT IF EXISTS attendance_overtime_approved_by_fkey;
ALTER TABLE attendance ALTER COLUMN overtime_approved_by DROP NOT NULL;
ALTER TABLE attendance ADD CONSTRAINT attendance_overtime_approved_by_fkey 
    FOREIGN KEY (overtime_approved_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Check payroll_history
ALTER TABLE payroll_history DROP CONSTRAINT IF EXISTS payroll_history_processed_by_fkey;
ALTER TABLE payroll_history ALTER COLUMN processed_by DROP NOT NULL;
ALTER TABLE payroll_history ADD CONSTRAINT payroll_history_processed_by_fkey 
    FOREIGN KEY (processed_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Verify the changes
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    rc.delete_rule
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND ccu.table_name = 'users'
AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;
