-- Fix the security definer view issue by removing it and using proper query patterns instead
DROP VIEW IF EXISTS schedules_with_employee_details;

-- Instead, we'll fix the queries directly by using explicit foreign key references
-- The indexes we created will help with performance