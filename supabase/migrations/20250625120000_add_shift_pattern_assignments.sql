
-- Create a dedicated table for shift pattern employee assignments
CREATE TABLE IF NOT EXISTS shift_pattern_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_pattern_id uuid NOT NULL REFERENCES shift_patterns(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  assigned_at timestamp with time zone DEFAULT now(),
  assigned_by uuid REFERENCES auth.users(id),
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(shift_pattern_id, employee_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_shift_pattern_assignments_pattern_id ON shift_pattern_assignments(shift_pattern_id);
CREATE INDEX IF NOT EXISTS idx_shift_pattern_assignments_employee_id ON shift_pattern_assignments(employee_id);
CREATE INDEX IF NOT EXISTS idx_shift_pattern_assignments_active ON shift_pattern_assignments(is_active);

-- Add RLS policies
ALTER TABLE shift_pattern_assignments ENABLE ROW LEVEL SECURITY;

-- Policy for managers to view all assignments
CREATE POLICY "Managers can view all shift pattern assignments" ON shift_pattern_assignments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'employer', 'hr', 'manager')
    )
  );

-- Policy for employees to view their own assignments
CREATE POLICY "Employees can view their own assignments" ON shift_pattern_assignments
  FOR SELECT USING (
    employee_id IN (
      SELECT id FROM employees WHERE user_id = auth.uid()
    )
  );

-- Policy for managers to insert assignments
CREATE POLICY "Managers can create shift pattern assignments" ON shift_pattern_assignments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'employer', 'hr', 'manager')
    )
  );

-- Policy for managers to update assignments
CREATE POLICY "Managers can update shift pattern assignments" ON shift_pattern_assignments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'employer', 'hr', 'manager')
    )
  );

-- Policy for managers to delete assignments
CREATE POLICY "Managers can delete shift pattern assignments" ON shift_pattern_assignments
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'employer', 'hr', 'manager')
    )
  );

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_shift_pattern_assignments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_shift_pattern_assignments_updated_at
  BEFORE UPDATE ON shift_pattern_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_shift_pattern_assignments_updated_at();
